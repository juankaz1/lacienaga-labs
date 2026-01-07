// ============================================================================
// Blog de Papers Científicos - La Ciénaga Labs
// ============================================================================

// Configuración de Supabase
// NOTA IMPORTANTE (GitHub Pages):
// - NO existe "secreto" en el frontend: cualquier key embebida en JS será pública.
// - Debes usar una key pública (anon o publishable) + RLS en Supabase.
// - NUNCA uses service_role en el frontend.
//
// Este archivo lee la config desde window (definida por `supabase-config.js`).
// Si no existe, se queda en modo "datos de ejemplo".
// Evitar contaminar el scope global con nombres genéricos (pueden chocar con otros scripts).
const LCL_SUPABASE_URL = window.SUPABASE_URL || 'TU_SUPABASE_URL';
const LCL_SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'TU_SUPABASE_ANON_KEY';

// Inicializar cliente Supabase
// Usar window.supabaseClient para evitar conflictos con variables globales
if (
    !window.supabaseClient &&
    LCL_SUPABASE_URL &&
    LCL_SUPABASE_URL !== 'TU_SUPABASE_URL' &&
    LCL_SUPABASE_ANON_KEY &&
    LCL_SUPABASE_ANON_KEY !== 'TU_SUPABASE_ANON_KEY' &&
    window.supabase
) {
    window.supabaseClient = window.supabase.createClient(LCL_SUPABASE_URL, LCL_SUPABASE_ANON_KEY);
}

// Variable local para uso en este archivo
// IMPORTANTE: NO usar el nombre "supabase" aquí porque la librería @supabase/supabase-js
// expone un identificador global "supabase" y causaría: Identifier 'supabase' has already been declared
const sb = window.supabaseClient;

// Idioma preferido del usuario (por defecto español)
let userLanguage = localStorage.getItem('preferredLanguage') || 'es';

// ============================================================================
// Funciones de Utilidad
// ============================================================================

/**
 * Obtiene el contenido del paper según el idioma del usuario
 */
function getPaperContent(paper, lang) {
    const isOriginalLanguage = paper.language === lang;
    
    if (isOriginalLanguage) {
        return {
            title: paper.title,
            abstract: paper.abstract,
            full_text: paper.full_text,
            hasTranslation: !!(paper.title_translated || paper.abstract_translated),
            originalLanguage: paper.language
        };
    }
    
    // Usuario quiere idioma diferente al original
    const hasTranslation = !!(paper.title_translated || paper.abstract_translated);
    
    if (hasTranslation) {
        return {
            title: paper.title_translated || paper.title,
            abstract: paper.abstract_translated || paper.abstract,
            full_text: paper.full_text_translated || paper.full_text,
            hasTranslation: true,
            originalLanguage: paper.language
        };
    } else {
        // No hay traducción, mostrar original con advertencia
        return {
            title: paper.title,
            abstract: paper.abstract,
            full_text: paper.full_text,
            hasTranslation: false,
            originalLanguage: paper.language,
            showOriginalWarning: true
        };
    }
}

/**
 * Formatea la fecha para mostrar
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Formatea tiempo relativo (ej: "Hace 2 días")
 */
function timeAgo(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Hace unos momentos';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    if (diffInSeconds < 31536000) return `Hace ${Math.floor(diffInSeconds / 2592000)} meses`;
    return `Hace ${Math.floor(diffInSeconds / 31536000)} años`;
}

/**
 * Genera slug desde texto
 */
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

// ============================================================================
// Carga de Datos desde Supabase
// ============================================================================

/**
 * Carga todos los papers publicados
 */
async function loadPapers() {
    if (!sb) {
        console.warn('Supabase no configurado. Usando datos de ejemplo.');
        return getExamplePapers();
    }

    try {
        const { data, error } = await sb
            .from('papers')
            .select(`
                *,
                paper_authors (
                    author_order,
                    authors (
                        id,
                        name,
                        slug
                    )
                ),
                paper_images (
                    id,
                    image_url,
                    caption,
                    alt_text,
                    display_order
                )
            `)
            .eq('status', 'published')
            .order('published_at', { ascending: false });

        if (error) throw error;

        // Procesar datos
        return data.map(paper => ({
            ...paper,
            authors: paper.paper_authors
                .sort((a, b) => a.author_order - b.author_order)
                .map(pa => pa.authors),
            images: paper.paper_images.sort((a, b) => a.display_order - b.display_order)
        }));
    } catch (error) {
        console.error('Error cargando papers:', error);
        return getExamplePapers();
    }
}

/**
 * Carga comentarios de un paper
 */
async function loadComments(paperId) {
    if (!sb) return [];

    try {
        const { data, error } = await sb
            .from('comments')
            .select('*')
            .eq('paper_id', paperId)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error cargando comentarios:', error);
        return [];
    }
}

/**
 * Envía un nuevo comentario
 */
async function submitComment(paperId, commentData) {
    if (!sb) {
        console.warn('Supabase no configurado. Comentario no enviado.');
        return { success: false, error: 'Backend no configurado' };
    }

    try {
        const { data, error } = await sb
            .from('comments')
            .insert({
                paper_id: paperId,
                author_name: commentData.name,
                author_email: commentData.email,
                author_website: commentData.website || null,
                content: commentData.content,
                image_url: commentData.image_url || null,
                status: 'approved' // Se publica inmediatamente
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error enviando comentario:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Likes (1 por navegador): generar/leer client_id local
 */
function getClientId() {
    const key = 'lcl_client_id';
    let id = localStorage.getItem(key);
    if (id) return id;
    const newId = (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(key, newId);
    return newId;
}

async function getLikeCount(paperId) {
    if (!sb) return 0;
    const { count, error } = await sb
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('paper_id', paperId);
    if (error) return 0;
    return count || 0;
}

async function getCommentCount(paperId) {
    if (!sb) return 0;
    const { count, error } = await sb
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('paper_id', paperId)
        .eq('status', 'approved');
    if (error) return 0;
    return count || 0;
}

async function refreshReactionsForPaper(paperId) {
    const card = document.querySelector(`.paper-card[data-paper-id="${paperId}"]`);
    if (!card) return;
    const likeCountEl = card.querySelector('.reaction-btn.like .reaction-count');
    const commentCountEl = card.querySelector('.reaction-btn.comment .reaction-count');
    if (likeCountEl) likeCountEl.textContent = String(await getLikeCount(paperId));
    if (commentCountEl) commentCountEl.textContent = String(await getCommentCount(paperId));
}

async function likePaper(event, paperId) {
    event?.stopPropagation?.();
    if (!sb) {
        alert('Likes no disponibles: backend no configurado');
        return;
    }
    const clientId = getClientId();
    const btn = document.querySelector(`.paper-card[data-paper-id="${paperId}"] .reaction-btn.like`);
    try {
        const { error } = await sb.from('likes').insert({
            paper_id: paperId,
            client_id: clientId
        });
        // Si ya existe el like (unique), PostgREST puede devolver 409; lo tratamos como OK.
        if (error && !String(error.message || '').toLowerCase().includes('duplicate')) {
            throw error;
        }
        if (btn) btn.classList.add('liked');
        await refreshReactionsForPaper(paperId);
    } catch (e) {
        console.error('Error dando like:', e);
        alert('No se pudo registrar el like. Intenta de nuevo.');
    }
}

// ============================================================================
// Datos de Ejemplo (para desarrollo sin Supabase)
// ============================================================================

function getExamplePapers() {
    return [
        {
            id: '1',
            language: 'en',
            title: 'Local thermodynamics govern formation and dissolution of Caenorhabditis elegans P granule condensates',
            title_translated: null,
            abstract: 'Membraneless compartments, also known as condensates, provide chemically distinct environments and thus spatially organize the cell. A well-studied example of condensates is P granules in the roundworm Caenorhabditis elegans that play an important role in the development of the germline. P granules are RNA-rich protein condensates that share the key properties of liquid droplets such as a spherical shape, the ability to fuse, and fast diffusion of their molecular components. An outstanding question is to what extent phase separation at thermodynamic equilibrium is appropriate to describe the formation of condensates in an active cellular environment. To address this question, we investigate the response of P granule condensates in living cells to temperature changes. We observe that P granules dissolve upon increasing the temperature and recondense upon lowering the temperature in a reversible manner. Strikingly, this temperature response can be captured by in vivo phase diagrams that are well described by a Flory–Huggins model at thermodynamic equilibrium. This finding is surprising due to active processes in a living cell. To address the impact of such active processes on intracellular phase separation, we discuss temperature heterogeneities. We show that, for typical estimates of the density of active processes, temperature represents a well-defined variable and that mesoscopic volume elements are at local thermodynamic equilibrium. Our findings provide strong evidence that P granule assembly and disassembly are governed by phase separation based on local thermal equilibria where the nonequilibrium nature of the cytoplasm is manifested on larger scales.',
            abstract_translated: 'Los compartimentos sin membrana, también conocidos como condensados, proporcionan entornos químicamente distintos y organizan espacialmente la célula. Un ejemplo bien estudiado de condensados son los gránulos P en el nematodo Caenorhabditis elegans que juegan un papel importante en el desarrollo de la línea germinal. Los gránulos P son condensados de proteínas ricos en ARN que comparten las propiedades clave de las gotas líquidas como una forma esférica, la capacidad de fusionarse y la difusión rápida de sus componentes moleculares. Una pregunta pendiente es hasta qué punto la separación de fases en equilibrio termodinámico es apropiada para describir la formación de condensados en un ambiente celular activo. Para abordar esta pregunta, investigamos la respuesta de los condensados de gránulos P en células vivas a los cambios de temperatura. Observamos que los gránulos P se disuelven al aumentar la temperatura y se recondensan al bajar la temperatura de manera reversible. Sorprendentemente, esta respuesta a la temperatura puede ser capturada por diagramas de fases in vivo que están bien descritos por un modelo de Flory-Huggins en equilibrio termodinámico. Este hallazgo es sorprendente debido a los procesos activos en una célula viva. Para abordar el impacto de tales procesos activos en la separación de fases intracelular, discutimos las heterogeneidades de temperatura. Mostramos que, para estimaciones típicas de la densidad de procesos activos, la temperatura representa una variable bien definida y que los elementos de volumen mesoscópicos están en equilibrio termodinámico local. Nuestros hallazgos proporcionan evidencia sólida de que el ensamblaje y desensamblaje de gránulos P están gobernados por la separación de fases basada en equilibrios térmicos locales donde la naturaleza de no equilibrio del citoplasma se manifiesta en escalas más grandes.',
            slug: 'local-thermodynamics-p-granules-condensates',
            doi: '10.1073/pnas.2102772118',
            journal: 'PNAS',
            publication_date: '2021-09-10',
            source_url: 'https://www.pnas.org/doi/full/10.1073/pnas.2102772118',
            pdf_url: 'https://www.pnas.org/doi/full/10.1073/pnas.2102772118',
            featured_image_url: null,
            published_at: '2021-09-10T00:00:00Z',
            authors: [
                { name: 'Andrés Felipe Diaz Delgadillo', slug: 'andres-felipe-diaz-delgadillo' }
            ],
            images: []
        },
        {
            id: '3',
            language: 'en',
            title: 'Temperature Drives P granule Formation in Caenorhabditis elegans',
            title_translated: null,
            abstract: 'Ectotherms are living creatures whose body temperature varies with the environment in which they live. Their physiology and metabolism have to rapidly respond to environmental changes in order to stay viable at across their tolerable thermal range. In nematodes such as Caenorhabditis elegans, temperature is an important factor that defines the fertility of the worm. A feature that delimits an ectotherm\'s thermal range is the maximum temperature at which its germ line can produce gametes. How germ cells withstand high environmental stressors such as limiting temperatures is not well understood, especially when considering the thermodynamical principles that dominate the biochemical processes of the cytoplasm. Previous studies in C. elegans have shown that the thermodynamic effects of temperature on the cell cycle rate in nematodes follows an Arrhenius relationship and defines the thermal range where worms can be fertile. At the limits of this relationship a breakdown of the Arrhenius trend is observed. It was hypothesized that some type of discontinuous phase transition occurred in the embryonic cells of C. elegans. However, it remains unknown if there is the physiological link between a drop off in fertility and the embryonic breakdown of the Arrhenius trend. This work finds the link between a temperature driven phase separation of P granules and fertility. P granules are important for germ line development and the fertility of C. elegans. Here it is shown that P granules mix with the cytoplasm upon a temperature quench of 27ºC to T=18ºC and de-mix from the cytoplasm forming droplets upon a temperature downshift of temperature from 18ºC to 27ºC. P granules also show a reversible behavior mixing and de-mixing with changes in temperature in vivo, having a strong dependence of these liquid-like compartments with entropy. These results were further confirmed using a minimally reconstituted, in vitro P granule system and showed that PGL-3, a constitutive component of P granules, can phase separate and form liquid compartments in a similar way as happens in vivo. Additionally, here it is shown that P granule phase separation does not require the chemical activity of other cytoplasmic factors to drive the phase separation of compartments in vivo and in vitro, instead their formation is strongly driven to mix and de-mix with changes in temperature. Furthermore, a binary phase diagram was constructed in order to compare the response of P granules in vivo and in vitro, showing that P granules form and function as a temperature driven liquid phase separation. Altogether, this indicates that P granules in vivo and PGL-3 liquid-like compartments in vitro, share the same temperature of mixing and de-mixing which coincides with the fertile temperature range over which Caenorhabditis elegans can reproduce. This suggests that P granule phase separation could define the thermal range of the worm.',
            abstract_translated: 'Los ectotermos son criaturas vivas cuya temperatura corporal varía con el ambiente en el que viven. Su fisiología y metabolismo deben responder rápidamente a los cambios ambientales para mantenerse viables en todo su rango térmico tolerable. En nematodos como Caenorhabditis elegans, la temperatura es un factor importante que define la fertilidad del gusano. Una característica que delimita el rango térmico de un ectotermo es la temperatura máxima a la que su línea germinal puede producir gametos. Cómo las células germinales resisten factores estresantes ambientales altos como temperaturas limitantes no se entiende bien, especialmente cuando se consideran los principios termodinámicos que dominan los procesos bioquímicos del citoplasma. Estudios previos en C. elegans han mostrado que los efectos termodinámicos de la temperatura en la tasa del ciclo celular en nematodos sigue una relación de Arrhenius y define el rango térmico donde los gusanos pueden ser fértiles. En los límites de esta relación se observa una ruptura de la tendencia de Arrhenius. Se hipotetizó que algún tipo de transición de fase discontinua ocurrió en las células embrionarias de C. elegans. Sin embargo, permanece desconocido si hay un vínculo fisiológico entre una caída en la fertilidad y la ruptura embrionaria de la tendencia de Arrhenius. Este trabajo encuentra el vínculo entre una separación de fases de gránulos P impulsada por temperatura y la fertilidad. Los gránulos P son importantes para el desarrollo de la línea germinal y la fertilidad de C. elegans. Aquí se muestra que los gránulos P se mezclan con el citoplasma tras un enfriamiento de temperatura de 27ºC a T=18ºC y se desmezclan del citoplasma formando gotas tras una disminución de temperatura de 18ºC a 27ºC. Los gránulos P también muestran un comportamiento reversible mezclándose y desmezclándose con cambios en la temperatura in vivo, teniendo una fuerte dependencia de estos compartimentos tipo líquido con la entropía. Estos resultados fueron confirmados adicionalmente usando un sistema de gránulos P mínimamente reconstituido in vitro y mostraron que PGL-3, un componente constitutivo de los gránulos P, puede separarse en fases y formar compartimentos líquidos de manera similar a como sucede in vivo. Adicionalmente, aquí se muestra que la separación de fases de gránulos P no requiere la actividad química de otros factores citoplasmáticos para impulsar la separación de fases de compartimentos in vivo e in vitro, en su lugar su formación está fuertemente impulsada a mezclarse y desmezclarse con cambios en la temperatura. Además, se construyó un diagrama de fases binario para comparar la respuesta de los gránulos P in vivo e in vitro, mostrando que los gránulos P se forman y funcionan como una separación de fases líquida impulsada por temperatura. En conjunto, esto indica que los gránulos P in vivo y los compartimentos tipo líquido PGL-3 in vitro, comparten la misma temperatura de mezcla y desmezcla que coincide con el rango de temperatura fértil sobre el cual Caenorhabditis elegans puede reproducirse. Esto sugiere que la separación de fases de gránulos P podría definir el rango térmico del gusano.',
            slug: 'temperature-drives-p-granule-formation',
            doi: null,
            journal: 'Tesis Doctoral - Technischen Universität Dresden',
            publication_date: '2015-09-01',
            source_url: 'https://nbn-resolving.org/urn:nbn:de:bsz:14-qucosa-215714',
            pdf_url: 'https://nbn-resolving.org/urn:nbn:de:bsz:14-qucosa-215714',
            featured_image_url: null,
            published_at: '2015-09-01T00:00:00Z',
            authors: [
                { name: 'Andrés Felipe Diaz Delgadillo', slug: 'andres-felipe-diaz-delgadillo' }
            ],
            images: []
        },
        {
            id: '4',
            language: 'en',
            title: 'Immunogenicity and safety of a RBD vaccine against SARS-CoV-2 in a murine model',
            title_translated: null,
            abstract: 'Introduction: Although more than half of the world\'s population is already vaccinated, the appearance of new variants of concern puts public health at risk due to the generation of new immunogens against the virus as a crucial and relevant strategy in the control of these new variants. Methods: A preclinical study used a potential vaccine candidate (RBD, SARS-CoV-2). Four groups of BALB/c mice were used, a control group, an adjuvant group, a group inoculated with one dose of RBD subunit protein, and the fourth group inoculated with two doses of RBD subunit protein. Results: No inflammatory or cellular changes were shown in the mice\'s anatomopathological evaluation. Higher kinetics and 75% seroconversion were obtained in the mice inoculated with two doses of RBD (P < 0.0001). Conclusions: The application of two doses of the RBD vaccine candidate in BALB/c mice proved safe and immunogenic against SARS-CoV-2.',
            abstract_translated: 'Introducción: Aunque más de la mitad de la población mundial ya está vacunada, la aparición de nuevas variantes de preocupación pone en riesgo la salud pública debido a la generación de nuevos inmunógenos contra el virus como una estrategia crucial y relevante en el control de estas nuevas variantes. Métodos: Un estudio preclínico utilizó un candidato a vacuna potencial (RBD, SARS-CoV-2). Se utilizaron cuatro grupos de ratones BALB/c, un grupo control, un grupo adyuvante, un grupo inoculado con una dosis de proteína de subunidad RBD, y el cuarto grupo inoculado con dos dosis de proteína de subunidad RBD. Resultados: No se mostraron cambios inflamatorios o celulares en la evaluación anatomopatológica de los ratones. Se obtuvieron cinéticas más altas y 75% de seroconversión en los ratones inoculados con dos dosis de RBD (P < 0.0001). Conclusiones: La aplicación de dos dosis del candidato a vacuna RBD en ratones BALB/c demostró ser segura e inmunogénica contra SARS-CoV-2.',
            slug: 'immunogenicity-safety-rbd-vaccine-sars-cov2',
            doi: null,
            journal: 'Travel Medicine and Infectious Disease',
            publication_date: '2022-09-01',
            source_url: 'https://www.sciencedirect.com/science/article/pii/S1477893922001739',
            pdf_url: 'https://www.sciencedirect.com/science/article/pii/S1477893922001739',
            featured_image_url: null,
            published_at: '2022-09-01T00:00:00Z',
            authors: [
                { name: 'Andrés Felipe Diaz Delgadillo', slug: 'andres-felipe-diaz-delgadillo' }
            ],
            images: []
        },
        {
            id: '5',
            language: 'es',
            title: 'Caracterización de arquitecturas de circuitos genéticos desde modelos analíticos y estocásticos',
            title_translated: 'Characterization of genetic circuit architectures from analytical and stochastic models',
            abstract: 'Diseñar un nuevo circuito genético requiere determinar no solo la respuesta de cada una de sus partes, sino también la escogencia de una implementación biológica. En este trabajo analizamos tres de las más simples y comunes arquitecturas de regulación genética en términos de sus tiempos de estabilización, rangos de producción y ruido intrínseco a partir de descripciones analíticas y simulaciones estocásticas. Planteamos un marco de trabajo para la comparación de los modelos y los ilustramos para un rango posible de parámetros para los diferentes circuitos. Proponemos una nueva forma para comprobar soluciones deterministas de los sistemas basada en álgebra de convoluciones, y un acercamiento analítico a la solución completa del comportamiento estocástico de los mismos. Este estudio sirve como base, e ilustra algunas consideraciones necesarias, para la escogencia de la arquitectura más viable de acuerdo a requerimientos específicos de un circuito genético.',
            abstract_translated: 'Designing a new genetic circuit requires determining not only the response of each of its parts, but also the choice of a biological implementation. In this paper we analyze three of the simplest and most common genetic regulation architectures in terms of their stabilization times, production ranges and intrinsic noise from analytical descriptions and stochastic simulations. We propose a framework for comparing the models and illustrate them for a possible range of parameters for the different circuits. We propose a new way to check deterministic solutions of systems based on convolution algebra, and an analytical approach to the complete solution of the stochastic behavior of them. This study serves as the basis, and illustrates some necessary considerations, for the choice of the most viable architecture according to specific requirements of a genetic circuit.',
            slug: 'caracterizacion-arquitecturas-circuitos-geneticos',
            doi: null,
            journal: 'Tesis de Maestría',
            publication_date: '2019-09-01',
            source_url: 'https://hdl.handle.net/1992/44222',
            pdf_url: 'https://hdl.handle.net/1992/44222',
            featured_image_url: null,
            published_at: '2019-09-01T00:00:00Z',
            authors: [
                { name: 'Juan Carlos Linares Rugeles', slug: 'juan-carlos-linares-rugeles' }
            ],
            images: []
        },
        {
            id: '6',
            language: 'es',
            title: 'Soluciones analíticas a sistemas de expresión de genes con feedback negativo',
            title_translated: 'Analytical solutions to gene expression systems with negative feedback',
            abstract: 'El análisis de sistemas de expresión de genes en organismos unicelulares es un tema de importancia, puesto que es la vía de estudio teórico que se tiene del funcionamiento interno de estos organismos. Se generan modelos computacionales y predicciones en múltiples laboratorios a lo largo de todo el globo terráqueo en base a estos sistemas. Sin embargo, aparte de la experimentación y el modelamiento computacional es un área de estudio que se ha visto un poco trancada por la falta de formalización matemática y desarrollo teórico cuantificable. Aquí es donde se hace útil el uso de métodos de cuantificación y de estudio de procesos aleatorios como por ejemplo los propuestos por la teoría de la información y el método de la ecuación maestra. El desarrollo del método bajo el orden de exactitud que se desee (por medio de las aproximaciones en las expansiones en series) lo convierte en una herramienta innovadora y eficaz para el estudio analítico de sistemas de expresión genética. Una de las características importantes a notar es que no solo se puede minimizar el error por medio del número de términos que se escojan en las expansiones en series, sino que también se pueden definir de manera exacta rangos de validez para las aproximaciones que se hacen.',
            abstract_translated: 'The analysis of gene expression systems in unicellular organisms is a topic of importance, as it is the theoretical study pathway available for understanding the internal functioning of these organisms. Computational models and predictions are generated in multiple laboratories around the globe based on these systems. However, apart from experimentation and computational modeling, this is an area of study that has been somewhat stalled by the lack of mathematical formalization and quantifiable theoretical development. This is where the use of quantification methods and the study of random processes becomes useful, such as those proposed by information theory and the master equation method. The development of the method under the desired order of accuracy (through approximations in series expansions) makes it an innovative and effective tool for the analytical study of gene expression systems. One of the important characteristics to note is that not only can the error be minimized through the number of terms chosen in the series expansions, but exact validity ranges can also be defined for the approximations made.',
            slug: 'soluciones-analiticas-sistemas-expresion-genes-feedback',
            doi: null,
            journal: 'Tesis',
            publication_date: '2016-09-01',
            source_url: 'https://hdl.handle.net/1992/17891',
            pdf_url: 'https://hdl.handle.net/1992/17891',
            featured_image_url: null,
            published_at: '2016-09-01T00:00:00Z',
            authors: [
                { name: 'Juan Carlos Linares Rugeles', slug: 'juan-carlos-linares-rugeles' }
            ],
            images: []
        },
        {
            id: '7',
            language: 'es',
            title: 'Diversidad de hongos micorrízicos en lianas y en la rizósfera de los forófitos en un relicto de bosque en Córdoba, Colombia',
            title_translated: 'Diversity of mycorrhizal fungi in lianas and in the rhizosphere of phorophytes in a forest relic in Córdoba, Colombia',
            abstract: 'Las micorrizas son una asociación simbiótica que se presenta en el 90% de las plantas entre un hongo y la raíz de estas, entre sus ventajas evolutivas y ecológicas se encuentran la resistencia a patógenos, la facilitación de la absorción de nutrientes y el intercambio hídrico, por otra parte las lianas son un tipo de planta cuyo crecimiento está directamente relacionado a otra planta como mecanismo de sostén, para lo cual disponen de modificaciones morfológicas en sus hojas y tallo, el objetivo de este estudio es conocer y comparar la diversidad asociada a la rizosfera de lianas del género Schnella y su forófito en un relicto de bosque de Córdoba.',
            abstract_translated: 'Mycorrhizae are a symbiotic association found in 90% of plants between a fungus and their roots. Among their evolutionary and ecological advantages are resistance to pathogens, facilitation of nutrient absorption, and water exchange. On the other hand, lianas are a type of plant whose growth is directly related to another plant as a support mechanism, for which they have morphological modifications in their leaves and stems. The objective of this study is to understand and compare the diversity associated with the rhizosphere of lianas of the genus Schnella and their host plants in a forest relic in Córdoba.',
            slug: 'diversidad-hongos-micorrizicos-lianas-cordoba',
            doi: null,
            journal: 'Tesis de Grado',
            publication_date: '2024-08-01',
            source_url: 'https://repositorio.unicordoba.edu.co/handle/ucordoba/8636',
            pdf_url: 'https://repositorio.unicordoba.edu.co/handle/ucordoba/8636',
            featured_image_url: null,
            published_at: '2024-08-01T00:00:00Z',
            authors: [
                { name: 'Ramón Orlando Alvarez Burgos', slug: 'ramon-orlando-alvarez-burgos' }
            ],
            images: []
        }
    ];
}

// ============================================================================
// Renderizado de UI
// ============================================================================

/**
 * Renderiza el preview de papers (2 más recientes)
 */
function renderPreview(papers) {
    const previewGrid = document.getElementById('blog-preview-grid');
    if (!previewGrid) return;

    const previewPapers = papers.slice(0, 2);
    previewGrid.innerHTML = previewPapers.map(paper => renderPaperCard(paper, true)).join('');
    
    // Setup clickeable cards y botones leer más para preview
    setTimeout(() => {
        setupClickableCards();
        setupReadMoreButtons();
    }, 100);
}

/**
 * Renderiza todos los papers (SIN los 2 del preview para evitar duplicados)
 */
function renderAllPapers(papers) {
    const blogGrid = document.getElementById('blog-grid');
    if (!blogGrid) return;

    // Renderizar solo los papers que NO están en el preview (desde el índice 2 en adelante)
    const remainingPapers = papers.slice(2);
    blogGrid.innerHTML = remainingPapers.map(paper => renderPaperCard(paper, false)).join('');
    
    // Setup clickeable cards para vista completa
    setTimeout(() => {
        setupClickableCards();
        setupReadMoreButtons();
    }, 100);
}

/**
 * Renderiza una tarjeta de paper
 */
function renderPaperCard(paper, isPreview = false) {
    // En la página general, mantener SIEMPRE el contenido en el idioma original del paper
    // (las traducciones se usan en la vista de detalle con el selector ES/EN).
    const content = {
        title: paper.title,
        abstract: paper.abstract
    };
    const authorsText = paper.authors.map(a => a.name).join(', ');
    const dateText = formatDate(paper.publication_date);
    const paperUrl = `blog.html?slug=${paper.slug}`;
    const sourceUrl = paper.source_url || paper.pdf_url || (paper.doi ? `https://doi.org/${paper.doi}` : '#');
    
    // Imágenes del paper (siempre mostrar 4 en grid)
    const previewImages = paper.images && paper.images.length > 0 
        ? paper.images.slice(0, 4) 
        : [];

    return `
        <article class="paper-card ${isPreview ? 'paper-card-preview' : ''} paper-card-clickable" 
                 data-paper-id="${paper.id}" 
                 data-paper-url="${paperUrl}">
            <!-- Header -->
            <div class="paper-header">
                <div class="paper-title-container">
                    <h3 class="paper-title">
                        <span class="paper-title-text">${content.title}</span>
                        <a href="${sourceUrl}" target="_blank" rel="noopener" class="paper-link-icon" 
                           title="Ver publicación original" onclick="event.stopPropagation();">
                            🔗
                        </a>
                    </h3>
                </div>
                <div class="paper-meta">
                    <div class="paper-meta-left">
                        <span class="paper-authors">👤 Por: ${authorsText}</span>
                        <span class="paper-date">📅 ${dateText}</span>
                        ${paper.images && paper.images.length > 0 ? `
                            <span class="paper-image-count">📷 ${paper.images.length} ${paper.images.length === 1 ? 'imagen' : 'imágenes'}</span>
                        ` : ''}
                    </div>
                </div>
            </div>

            <!-- Imágenes pequeñas (siempre grid de 4 en preview) -->
            ${previewImages.length > 0 ? `
                <div class="paper-images-container">
                    <div class="paper-images-grid">
                        ${previewImages.slice(0, 4).map((img, index) => `
                            <div class="paper-image-thumbnail" data-image-index="${index}" data-paper-id="${paper.id}">
                                <img src="${img.image_url || img.url}" 
                                     alt="${img.alt_text || content.title}" 
                                     class="thumbnail-image" 
                                     loading="lazy"
                                     onclick="event.stopPropagation(); expandImageFromPaper('${paper.id}', ${index});">
                                ${index === 3 && paper.images.length > 4 ? `
                                    <div class="more-images-overlay">
                                        +${paper.images.length - 4}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Reacciones -->
            <div class="paper-reactions">
                <button class="reaction-btn like" title="Me gusta" onclick="likePaper(event, '${paper.id}')">
                    ❤️ <span class="reaction-count">0</span>
                </button>
                <button class="reaction-btn comment" title="Comentarios" onclick="event.stopPropagation();">
                    💬 <span class="reaction-count">0</span>
                </button>
            </div>

            <!-- Resumen con truncado -->
            <div class="paper-abstract" data-paper-id="${paper.id}">
                <p class="abstract-text abstract-truncated">
                    ${content.abstract.substring(0, 200)}${content.abstract.length > 200 ? '...' : ''}
                </p>
                <p class="abstract-full-text" style="display: none;">${content.abstract}</p>
                <button class="read-more-btn" onclick="event.stopPropagation(); toggleReadMore('${paper.id}')">
                    Leer más
                </button>
            </div>

            <!-- Comentarios Preview (en ambas vistas, pero cargar solo en vista completa) -->
            <div class="paper-comments-preview" data-paper-id="${paper.id}" data-paper-slug="${paper.slug}">
                <h4 class="comments-title">💬 Comentarios</h4>
                <div class="comments-list-preview">
                    ${sb ? '<p class="loading-comments">Cargando comentarios...</p>' : '<p class="no-comments">Comentarios disponibles al activar el backend</p>'}
                </div>
                
                <!-- Formulario de comentario -->
                <div class="comment-form-container">
                    <form class="comment-form" onsubmit="event.stopPropagation(); submitCardComment(event, '${paper.id}'); return false;">
                        <div class="comment-meta-row">
                            <input class="comment-name-input" type="text" placeholder="Nombre" required maxlength="100">
                            <input class="comment-email-input" type="email" placeholder="Email (no se publica)" required>
                        </div>
                        <div class="comment-input-group">
                            <textarea 
                                class="comment-text-input" 
                                placeholder="Escribe un comentario..." 
                                rows="2"
                                required></textarea>
                        </div>
                        <div class="comment-form-actions">
                            <button type="submit" class="comment-submit-btn">Publicar</button>
                        </div>
                    </form>
                </div>
            </div>
        </article>
    `;
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Maneja el click en "Ver más publicaciones"
 */
function setupExpandButton() {
    const expandBtn = document.getElementById('blog-expand-btn');
    const blogFull = document.getElementById('blog-full');
    const expandIcon = expandBtn?.querySelector('.expand-icon');

    if (!expandBtn || !blogFull) return;

    expandBtn.addEventListener('click', () => {
        const isExpanded = blogFull.style.display !== 'none';
        
        if (isExpanded) {
            // Ocultar: mostrar botón "Ver más" con triángulo hacia abajo
            blogFull.style.display = 'none';
            expandBtn.innerHTML = 'Ver más publicaciones <span class="expand-icon">▼</span>';
            expandBtn.classList.remove('expanded');
        } else {
            // Expandir: mostrar botón "Ocultar" con triángulo hacia arriba
            blogFull.style.display = 'block';
            expandBtn.innerHTML = 'Ocultar publicaciones <span class="expand-icon">▲</span>';
            expandBtn.classList.add('expanded');
            
            // Scroll suave a la sección expandida
            setTimeout(() => {
                blogFull.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    });
}

/**
 * Inicializa el blog
 */
async function initBlog() {
    console.log('[initBlog] Iniciando blog...');
    
    // Verificar que los elementos del DOM existan
    const previewGrid = document.getElementById('blog-preview-grid');
    const blogGrid = document.getElementById('blog-grid');
    const expandBtn = document.getElementById('blog-expand-btn');
    
    console.log('[initBlog] Elementos del DOM:', {
        previewGrid: !!previewGrid,
        blogGrid: !!blogGrid,
        expandBtn: !!expandBtn
    });
    
    if (!previewGrid || !blogGrid) {
        // Esto pasa en páginas que reutilizan `blog.js` pero no tienen la sección del listado (ej: blog.html).
        // No es un error: simplemente no inicializamos la UI del listado aquí.
        return;
    }
    
    // Cargar papers
    console.log('[initBlog] Cargando papers...');
    const papers = await loadPapers();
    console.log('[initBlog] Papers cargados:', papers.length);
    
    if (papers.length === 0) {
        console.warn('[initBlog] No se encontraron papers');
        return;
    }

    // Cargar imágenes para cada paper primero
    const papersWithImages = await Promise.all(papers.map(async (paper) => {
        if (window.loadPaperImages) {
            try {
                const images = await window.loadPaperImages(paper.slug);
                paper.images = images;
            } catch (error) {
                console.error(`Error cargando imágenes para ${paper.slug}:`, error);
                paper.images = [];
            }
        }
        return paper;
    }));
    
    // Guardar papers globalmente para uso en toggleReadMore
    window.allPapers = papersWithImages;
    
    // Renderizar preview
    renderPreview(papersWithImages);
    
    // Renderizar todos los papers (sin los del preview)
    renderAllPapers(papersWithImages);

    // Cargar comentarios para cada paper (incluyendo preview).
    // Ya NO hay duplicados porque el preview muestra 2 y la sección expandida muestra el resto.
    if (sb) {
        papersWithImages.forEach(async (paper) => {
            const containers = document.querySelectorAll(
                `.paper-comments-preview[data-paper-id="${paper.id}"] .comments-list-preview`
            );
            if (!containers || containers.length === 0) return;
            const comments = await loadComments(paper.id);
            containers.forEach(c => renderCommentsPreview(comments, c));
        });
    }

    // Setup botón expandir
    setupExpandButton();
    
    // Setup botones leer más/menos
    setTimeout(() => {
        setupReadMoreButtons();
    }, 200);

    // Cargar conteos de likes/comentarios (best-effort)
    if (sb) {
        papersWithImages.forEach(p => {
            refreshReactionsForPaper(p.id).catch(() => {});
        });
    }
}

/**
 * Hace las tarjetas clickeables
 */
function setupClickableCards() {
    document.querySelectorAll('.paper-card-clickable').forEach(card => {
        card.addEventListener('click', (e) => {
            // No navegar si el click fue en elementos interactivos internos
            // (formularios de comentarios, inputs, labels, etc.)
            if (
                e.target.closest(
                    'button, a, .paper-link-icon, input, textarea, label, select, option, form,' +
                    ' .comment-form-container, .comment-form, .paper-comments-preview'
                )
            ) {
                return;
            }
            const url = card.dataset.paperUrl;
            if (url) {
                window.location.href = url;
            }
        });
        
        // Cursor pointer
        card.style.cursor = 'pointer';
    });
}

/**
 * Expande una imagen desde un paper específico (con carrusel)
 */
function expandImageFromPaper(paperId, startIndex = 0) {
    const paper = window.allPapers?.find(p => p.id === paperId);
    if (!paper || !paper.images || paper.images.length === 0) return;
    
    // Cerrar modal existente si hay
    closeImageModal();
    
    // Guardar estado del carrusel
    let currentIndex = startIndex;
    const totalImages = paper.images.length;
    
    // Crear modal con carrusel
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="image-modal-content">
            <button class="image-modal-close" onclick="closeImageModal()">&times;</button>
            <div class="image-modal-carousel">
                ${totalImages > 1 ? `
                    <button class="image-modal-nav image-modal-prev" onclick="navigateImageModal('${paperId}', -1)">◀</button>
                    <button class="image-modal-nav image-modal-next" onclick="navigateImageModal('${paperId}', 1)">▶</button>
                ` : ''}
                <div class="image-modal-image-container">
                    <img src="${paper.images[startIndex].image_url || paper.images[startIndex].url}" 
                         alt="${paper.images[startIndex].alt_text || ''}" 
                         class="image-modal-image"
                         id="modal-image-${paperId}">
                </div>
                <div class="image-modal-info">
                    <span class="image-modal-counter" id="modal-counter-${paperId}">${startIndex + 1} / ${totalImages}</span>
                    <p class="image-modal-caption" id="modal-caption-${paperId}">
                        ${paper.images[startIndex].caption || 'Sin descripción disponible'}
                    </p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Guardar referencia al paper en el modal
    modal.dataset.paperId = paperId;
    modal.dataset.currentIndex = startIndex;
    
    // Cerrar al hacer click fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('image-modal-content')) {
            closeImageModal();
        }
    });
    
    // Cerrar con ESC
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeImageModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
    
    // Navegación con teclado
    const keyNavHandler = (e) => {
        if (e.key === 'ArrowLeft') {
            navigateImageModal(paperId, -1);
        } else if (e.key === 'ArrowRight') {
            navigateImageModal(paperId, 1);
        }
    };
    document.addEventListener('keydown', keyNavHandler);
    modal.dataset.keyHandler = 'true';
}

/**
 * Navega entre imágenes en el modal
 */
function navigateImageModal(paperId, direction) {
    const modal = document.querySelector('.image-modal');
    if (!modal) return;
    
    const paper = window.allPapers?.find(p => p.id === paperId);
    if (!paper || !paper.images) return;
    
    let currentIndex = parseInt(modal.dataset.currentIndex || 0);
    const totalImages = paper.images.length;
    
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = totalImages - 1;
    if (currentIndex >= totalImages) currentIndex = 0;
    
    modal.dataset.currentIndex = currentIndex;
    
    // Actualizar imagen
    const img = document.getElementById(`modal-image-${paperId}`);
    const caption = document.getElementById(`modal-caption-${paperId}`);
    const counter = document.getElementById(`modal-counter-${paperId}`);
    
    if (img) {
        img.src = paper.images[currentIndex].image_url || paper.images[currentIndex].url;
        img.alt = paper.images[currentIndex].alt_text || '';
    }
    
    if (counter) {
        counter.textContent = `${currentIndex + 1} / ${totalImages}`;
    }
    
    if (caption) {
        const captionText = paper.images[currentIndex].caption || 'Sin descripción disponible';
        caption.textContent = captionText;
        caption.style.display = 'block';
        
        // Debug
        if (captionText && captionText !== 'Sin descripción disponible') {
            console.log(`[navigateImageModal] Caption actualizado para imagen ${currentIndex + 1}: "${captionText.substring(0, 50)}..."`);
        }
    }
}

function closeImageModal() {
    const modal = document.querySelector('.image-modal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Expande una imagen simple (compatibilidad)
 */
function expandImage(imageUrl, caption) {
    // Para compatibilidad, usar el primer paper que tenga esta imagen
    const paper = window.allPapers?.find(p => 
        p.images && p.images.some(img => (img.image_url || img.url) === imageUrl)
    );
    
    if (paper) {
        const index = paper.images.findIndex(img => (img.image_url || img.url) === imageUrl);
        if (index >= 0) {
            expandImageFromPaper(paper.id, index);
            return;
        }
    }
    
    // Fallback: modal simple
    closeImageModal();
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="image-modal-content">
            <button class="image-modal-close" onclick="closeImageModal()">&times;</button>
            <img src="${imageUrl}" alt="Imagen expandida" class="image-modal-image">
            ${caption ? `<p class="image-modal-caption">${caption}</p>` : ''}
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeImageModal();
        }
    });
}

/**
 * Toggle leer más/menos
 */
function toggleReadMore(paperId) {
    const abstractContainer = document.querySelector(`.paper-abstract[data-paper-id="${paperId}"]`);
    if (!abstractContainer) return;
    
    const abstractText = abstractContainer.querySelector('.abstract-text');
    const abstractFull = abstractContainer.querySelector('.abstract-full-text');
    const readMoreBtn = abstractContainer.querySelector('.read-more-btn');
    
    if (!abstractText || !readMoreBtn) return;
    
    const isExpanded = abstractText.classList.contains('abstract-expanded');
    
    if (isExpanded) {
        // Contraer
        abstractText.classList.remove('abstract-expanded');
        abstractText.style.display = 'block';
        if (abstractFull) {
            abstractFull.style.display = 'none';
        }
        readMoreBtn.textContent = 'Leer más';
    } else {
        // Expandir
        abstractText.classList.add('abstract-expanded');
        abstractText.style.display = 'none';
        if (abstractFull) {
            abstractFull.style.display = 'block';
        }
        readMoreBtn.textContent = 'Leer menos';
    }
}

/**
 * Setup botones leer más/menos
 */
function setupReadMoreButtons() {
    // Los botones ya tienen onclick, pero podemos agregar lógica adicional si es necesario
    document.querySelectorAll('.read-more-btn').forEach(btn => {
        // Ya está configurado con onclick en el HTML
    });
}

/**
 * Envía un comentario
 */
async function submitCardComment(event, paperId) {
    event.preventDefault();
    const form = event.target;
    const nameInput = form.querySelector('.comment-name-input');
    const emailInput = form.querySelector('.comment-email-input');
    const textInput = form.querySelector('.comment-text-input');
    const submitBtn = form.querySelector('.comment-submit-btn');
    
    const text = textInput.value.trim();
    const name = (nameInput?.value || '').trim();
    const email = (emailInput?.value || '').trim();
    
    if (!name || !email) {
        alert('Por favor ingresa nombre y email (el email no se publica).');
        return;
    }
    if (!text) {
        alert('Por favor escribe un comentario');
        return;
    }
    
    // Deshabilitar botón
    submitBtn.disabled = true;
    submitBtn.textContent = 'Publicando...';
    
    try {
        const result = await submitComment(paperId, {
            name,
            email,
            website: null,
            content: text,
            image_url: null
        });

        if (!result.success) {
            throw new Error(result.error || 'Error desconocido');
        }

        // Limpiar formulario
        if (nameInput) nameInput.value = '';
        if (emailInput) emailInput.value = '';
        textInput.value = '';
        
        // Recargar comentarios
        const commentsPreview = document.querySelector(`.paper-comments-preview[data-paper-id="${paperId}"] .comments-list-preview`);
        if (commentsPreview) {
            const comments = await loadComments(paperId);
            renderCommentsPreview(comments, commentsPreview);
        }

        await refreshReactionsForPaper(paperId);
    } catch (error) {
        console.error('Error al publicar comentario:', error);
        alert('Error al publicar el comentario. Por favor intenta de nuevo.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publicar';
    }
}

// Exportar funciones globales
window.expandImage = expandImage;
window.expandImageFromPaper = expandImageFromPaper;
window.navigateImageModal = navigateImageModal;
window.closeImageModal = closeImageModal;
window.toggleReadMore = toggleReadMore;
window.submitCardComment = submitCardComment;
window.likePaper = likePaper;

/**
 * Renderiza preview de comentarios
 */
function renderCommentsPreview(comments, container) {
    if (!container) return;

    if (comments.length === 0) {
        container.innerHTML = '<p class="no-comments">Aún no hay comentarios. ¡Sé el primero en comentar!</p>';
        return;
    }

    const previewComments = comments.slice(0, 2); // Solo mostrar 2 en preview
    container.innerHTML = previewComments.map(comment => `
        <div class="comment-preview-item">
            <strong>${comment.author_name}:</strong>
            <span>${comment.content.substring(0, 100)}${comment.content.length > 100 ? '...' : ''}</span>
            <span class="comment-date">${timeAgo(comment.created_at)}</span>
        </div>
    `).join('');

    if (comments.length > 2) {
        const paperSlug =
            container.closest('.paper-comments-preview')?.dataset?.paperSlug ||
            container.closest('.paper-card')?.dataset?.paperUrl?.split('slug=')?.[1] ||
            '';
        const href = paperSlug ? `blog.html?slug=${paperSlug}` : '#';
        container.innerHTML += `
            <a href="${href}" class="view-all-comments-link" onclick="event.stopPropagation();">
                Ver todos los comentarios (${comments.length}) →
            </a>
        `;
    }
}

// ============================================================================
// Inicialización
// ============================================================================

// Inicializar cuando el DOM esté listo
console.log('[blog.js] Script cargado, estado del DOM:', document.readyState);

if (document.readyState === 'loading') {
    console.log('[blog.js] Esperando DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[blog.js] DOMContentLoaded - Inicializando blog...');
        initBlog().catch(error => {
            console.error('[blog.js] Error al inicializar blog:', error);
        });
    });
} else {
    console.log('[blog.js] DOM ya está listo - Inicializando blog inmediatamente...');
    initBlog().catch(error => {
        console.error('[blog.js] Error al inicializar blog:', error);
    });
}

// Exportar funciones para uso en blog.html
window.BlogUtils = {
    getPaperContent,
    formatDate,
    timeAgo,
    loadPapers,
    loadComments,
    submitComment,
    userLanguage
};

// Exportar getExamplePapers para uso en blog-detail.js
window.getExamplePapers = getExamplePapers;

