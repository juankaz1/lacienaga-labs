-- ============================================================================
-- Script de Inserción de Datos Iniciales - Blog de Papers Científicos
-- ============================================================================
-- Ejecutar este script DESPUÉS de ejecutar setup_supabase.sql
-- ============================================================================

-- ============================================================================
-- 1. INSERTAR AUTORES (3 integrantes)
-- ============================================================================

INSERT INTO authors (name, slug, email, bio) VALUES
('Andrés Felipe Diaz Delgadillo', 'andres-felipe-diaz-delgadillo', 'afdiaz@lacienagalabs.com', 'PhD / Dr. - CEO y Co-fundador de La Ciénaga Labs'),
('Juan Carlos Linares Rugeles', 'juan-carlos-linares-rugeles', NULL, 'MSc in Physics'),
('Ramón Orlando Alvarez Burgos', 'ramon-orlando-alvarez-burgos', NULL, 'BSc Biologist')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 2. INSERTAR PAPERS (6 papers)
-- ============================================================================

-- Paper 1: Local thermodynamics govern formation and dissolution of Caenorhabditis elegans P granule condensates
INSERT INTO papers (
    language, title, abstract, 
    title_translated, abstract_translated,
    slug, doi, journal, publication_date, 
    pdf_url, status, published_at
) VALUES (
    'en',
    'Local thermodynamics govern formation and dissolution of Caenorhabditis elegans P granule condensates',
    'Membraneless compartments, also known as condensates, provide chemically distinct environments and thus spatially organize the cell. A well-studied example of condensates is P granules in the roundworm Caenorhabditis elegans that play an important role in the development of the germline. P granules are RNA-rich protein condensates that share the key properties of liquid droplets such as a spherical shape, the ability to fuse, and fast diffusion of their molecular components. An outstanding question is to what extent phase separation at thermodynamic equilibrium is appropriate to describe the formation of condensates in an active cellular environment. To address this question, we investigate the response of P granule condensates in living cells to temperature changes. We observe that P granules dissolve upon increasing the temperature and recondense upon lowering the temperature in a reversible manner. Strikingly, this temperature response can be captured by in vivo phase diagrams that are well described by a Flory–Huggins model at thermodynamic equilibrium. This finding is surprising due to active processes in a living cell. To address the impact of such active processes on intracellular phase separation, we discuss temperature heterogeneities. We show that, for typical estimates of the density of active processes, temperature represents a well-defined variable and that mesoscopic volume elements are at local thermodynamic equilibrium. Our findings provide strong evidence that P granule assembly and disassembly are governed by phase separation based on local thermal equilibria where the nonequilibrium nature of the cytoplasm is manifested on larger scales.',
    NULL,
    NULL,
    'local-thermodynamics-p-granules-condensates',
    '10.1073/pnas.2102772118',
    'PNAS (Proceedings of the National Academy of Sciences)',
    '2021-09-10',
    'https://www.pnas.org/doi/full/10.1073/pnas.2102772118',
    'published',
    '2021-09-10'::timestamp
) ON CONFLICT (slug) DO NOTHING;

-- Paper 2: Temperature Drives P granule Formation in Caenorhabditis elegans
INSERT INTO papers (
    language, title, abstract,
    title_translated, abstract_translated,
    slug, doi, journal, publication_date,
    pdf_url, status, published_at
) VALUES (
    'en',
    'Temperature Drives P granule Formation in Caenorhabditis elegans',
    'Ectotherms are living creatures whose body temperature varies with the environment in which they live. Their physiology and metabolism have to rapidly respond to environmental changes in order to stay viable at across their tolerable thermal range (Lithgow et al. 1994). In nematodes such as Caenorhabditis elegans, temperature is an important factor that defines the fertility of the worm. A feature that delimits an ectotherm''s thermal range is the maximum temperature at which its germ line can produce gametes. How germ cells withstand high environmental stressors such as limiting temperatures is not well understood, especially when considering the thermodynamical principles that dominate the biochemical processes of the cytoplasm (Hyman and Brangwynne 2011). Previous studies in C. elegans have shown that the thermodynamic effects of temperature on the cell cycle rate in nematodes follows an Arrhenius relationship and defines the thermal range where worms can be fertile. At the limits of this relationship a breakdown of the Arrhenius trend is observed (Begasse et al. 2015a). It was hypothesized that some type of discontinuous phase transition occurred in the embryonic cells of C. elegans (Begasse et al 2015). However, it remains unknown if there is the physiological link between a drop off in fertility and the embryonic breakdown of the Arrhenius trend. This work finds the link between a temperature driven phase separation of P granules and fertility. P granules are important for germ line development and the fertility of C. elegans (Kawasaki et al. 1998b). Here it is shown that P granules mix with the cytoplasm upon a temperature quench of 27ºC to T=18ºC and de-mix from the cytoplasm forming droplets upon a temperature downshift of temperature from 18ºC to 27ºC. P granules also show a reversible behavior mixing and de-mixing with changes in temperature in vivo, having a strong dependence of these liquid-like compartments with entropy. These results were further confirmed using a minimally reconstituted, in vitro P granule system and showed that PGL-3, a constitutive component of P granules, can phase separate and form liquid compartments in a similar way as happens in vivo. Additionally, here it is shown that P granule phase separation does not require the chemical activity of other cytoplasmic factors to drive the phase separation of compartments in vivo and in vitro, instead their formation is strongly driven to mix and de-mix with changes in temperature. Furthermore, a binary phase diagram was constructed in order to compare the response of P granules in vivo and in vitro, showing that P granules form and function as a temperature driven liquid phaseseparation. Altogether, this indicates that P granules in vivo and PGL-3 liquid-like compartments in vitro, share the same temperature of mixing and de-mixing which coincides with the fertile temperature range over which Caenorhabditis elegans can reproduce. This suggests that P granule phase separation could define the thermal range of the worm.',
    NULL,
    NULL,
    'temperature-drives-p-granule-formation',
    NULL,
    'Tesis Doctoral - Technischen Universität Dresden',
    '2015-09-01',
    'https://nbn-resolving.org/urn:nbn:de:bsz:14-qucosa-215714',
    'published',
    '2015-09-01'::timestamp
) ON CONFLICT (slug) DO NOTHING;

-- Paper 3: Immunogenicity and safety of a RBD vaccine against SARS-CoV-2
INSERT INTO papers (
    language, title, abstract,
    title_translated, abstract_translated,
    slug, doi, journal, publication_date,
    pdf_url, status, published_at
) VALUES (
    'en',
    'Immunogenicity and safety of a RBD vaccine against SARS-CoV-2 in a murine model',
    'Introduction: Although more than half of the world''s population is already vaccinated, the appearance of new variants of concern puts public health at risk due to the generation of new immunogens against the virus as a crucial and relevant strategy in the control of these new variants. Methods: A preclinical study used a potential vaccine candidate (RBD, SARS-CoV-2). Four groups of BALB/c mice were used, a control group, an adjuvant group, a group inoculated with one dose of RBD subunit protein, and the fourth group inoculated with two doses of RBD subunit protein. Results: No inflammatory or cellular changes were shown in the mice''s anatomopathological evaluation. Higher kinetics and 75% seroconversion were obtained in the mice inoculated with two doses of RBD (P < 0.0001). Conclusions: The application of two doses of the RBD vaccine candidate in BALB/c mice proved safe and immunogenic against SARS-CoV-2.',
    NULL,
    NULL,
    'immunogenicity-safety-rbd-vaccine-sars-cov2',
    NULL,
    'Travel Medicine and Infectious Disease',
    '2022-09-01',
    'https://www.sciencedirect.com/science/article/pii/S1477893922001739',
    'published',
    '2022-09-01'::timestamp
) ON CONFLICT (slug) DO NOTHING;

-- Paper 4: Caracterización de arquitecturas de circuitos genéticos
INSERT INTO papers (
    language, title, abstract,
    title_translated, abstract_translated,
    slug, doi, journal, publication_date,
    pdf_url, status, published_at
) VALUES (
    'es',
    'Caracterización de arquitecturas de circuitos genéticos desde modelos analíticos y estocásticos',
    'Diseñar un nuevo circuito genético requiere determinar no solo la respuesta de cada una de sus partes, sino también la escogencia de una implementación biológica. En este trabajo analizamos tres de las más simples y comunes arquitecturas de regulación genética en términos de sus tiempos de estabilización, rangos de producción y ruido intrínseco a partir de descripciones analíticas y simulaciones estocásticas. Planteamos un marco de trabajo para la comparación de los modelos y los ilustramos para un rango posible de parámetros para los diferentes circuitos. Proponemos una nueva forma para comprobar soluciones deterministas de los sistemas basada en álgebra de convoluciones, y un acercamiento analítico a la solución completa del comportamiento estocástico de los mismos. Este estudio sirve como base, e ilustra algunas consideraciones necesarias, para la escogencia de la arquitectura más viable de acuerdo a requerimientos específicos de un circuito genético.',
    'Characterization of genetic circuit architectures from analytical and stochastic models',
    'Designing a new genetic circuit requires determining not only the response of each of its parts, but also the choice of a biological implementation. In this paper we analyze three of the simplest and most common genetic regulation architectures in terms of their stabilization times, production ranges and intrinsic noise from analytical descriptions and stochastic simulations. We propose a framework for comparing the models and illustrate them for a possible range of parameters for the different circuits. We propose a new way to check deterministic solutions of systems based on convolution algebra, and an analytical approach to the complete solution of the stochastic behavior of them. This study serves as the basis, and illustrates some necessary considerations, for the choice of the most viable architecture according to specific requirements of a genetic circuit.',
    'caracterizacion-arquitecturas-circuitos-geneticos',
    NULL,
    'Tesis de Maestría',
    '2019-09-01',
    'https://hdl.handle.net/1992/44222',
    'published',
    '2019-09-01'::timestamp
) ON CONFLICT (slug) DO NOTHING;

-- Paper 5: Soluciones analíticas a sistemas de expresión de genes con feedback negativo
INSERT INTO papers (
    language, title, abstract,
    title_translated, abstract_translated,
    slug, doi, journal, publication_date,
    pdf_url, status, published_at
) VALUES (
    'es',
    'Soluciones analíticas a sistemas de expresión de genes con feedback negativo',
    'El análisis de sistemas de expresión de genes en organismos unicelulares es un tema de importancia, puesto que es la vía de estudio teórico que se tiene del funcionamiento interno de estos organismos. Se generan modelos computacionales y predicciones en múltiples laboratorios a lo largo de todo el globo terráqueo en base a estos sistemas. Sin embargo, aparte de la experimentación y el modelamiento computacional es un área de estudio que se ha visto un poco trancada por la falta de formalización matemática y desarrollo teórico cuantificable. Aquí es donde se hace útil el uso de métodos de cuantificación y de estudio de procesos aleatorios como por ejemplo los propuestos por la teoría de la información y el método de la ecuación maestra. El desarrollo del método bajo el orden de exactitud que se desee (por medio de las aproximaciones en las expansiones en series) lo convierte en una herramienta innovadora y eficaz para el estudio analítico de sistemas de expresión genética. Una de las características importantes a notar es que no solo se puede minimizar el error por medio del número de términos que se escojan en las expansiones en series, sino que también se pueden definir de manera exacta rangos de validez para las aproximaciones que se hacen.',
    'Analytical solutions to gene expression systems with negative feedback',
    NULL,
    'soluciones-analiticas-sistemas-expresion-genes-feedback',
    NULL,
    'Tesis',
    '2016-09-01',
    'https://hdl.handle.net/1992/17891',
    'published',
    '2016-09-01'::timestamp
) ON CONFLICT (slug) DO NOTHING;

-- Paper 6: Diversidad de hongos micorrízicos
INSERT INTO papers (
    language, title, abstract,
    title_translated, abstract_translated,
    slug, doi, journal, publication_date,
    pdf_url, status, published_at
) VALUES (
    'es',
    'Diversidad de hongos micorrízicos en lianas y en la rizósfera de los forófitos en un relicto de bosque en Córdoba, Colombia',
    'Las micorrizas son una asociación simbiótica que se presenta en el 90% de las plantas entre un hongo y la raíz de estas, entre sus ventajas evolutivas y ecológicas se encuentran la resistencia a patógenos, la facilitación de la absorción de nutrientes y el intercambio hídrico, por otra parte las lianas son un tipo de planta cuyo crecimiento está directamente relacionado a otra planta como mecanismo de sostén, para lo cual disponen de modificaciones morfológicas en sus hojas y tallo, el objetivo de este estudio es conocer y comparar la diversidad asociada a la rizosfera de lianas del género Schnella y su forófito en un relicto de bosque de Córdoba.',
    'Diversity of mycorrhizal fungi in lianas and in the rhizosphere of phorophytes in a forest relic in Córdoba, Colombia',
    'Mycorrhizae are a symbiotic association found in 90% of plants between a fungus and their roots. Among their evolutionary and ecological advantages are resistance to pathogens, facilitation of nutrient absorption, and water exchange. On the other hand, lianas are a type of plant whose growth is directly related to another plant as a support mechanism, for which they have morphological modifications in their leaves and stems. The objective of this study is to understand and compare the diversity associated with the rhizosphere of lianas of the genus Schnella and their host plants in a forest relic in Córdoba.',
    'diversidad-hongos-micorrizicos-lianas-cordoba',
    NULL,
    'Tesis de Grado',
    '2024-08-01',
    'https://repositorio.unicordoba.edu.co/handle/ucordoba/8636',
    'published',
    '2024-08-01'::timestamp
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 3. RELACIONAR PAPERS CON AUTORES (paper_authors)
-- ============================================================================

-- Paper 1 → Andrés (orden 1)
INSERT INTO paper_authors (paper_id, author_id, author_order)
SELECT p.id, a.id, 1
FROM papers p, authors a
WHERE p.slug = 'local-thermodynamics-p-granules-condensates'
  AND a.slug = 'andres-felipe-diaz-delgadillo'
ON CONFLICT DO NOTHING;

-- Paper 2 → Andrés (orden 1)
INSERT INTO paper_authors (paper_id, author_id, author_order)
SELECT p.id, a.id, 1
FROM papers p, authors a
WHERE p.slug = 'temperature-drives-p-granule-formation'
  AND a.slug = 'andres-felipe-diaz-delgadillo'
ON CONFLICT DO NOTHING;

-- Paper 3 → Andrés (orden 1)
INSERT INTO paper_authors (paper_id, author_id, author_order)
SELECT p.id, a.id, 1
FROM papers p, authors a
WHERE p.slug = 'immunogenicity-safety-rbd-vaccine-sars-cov2'
  AND a.slug = 'andres-felipe-diaz-delgadillo'
ON CONFLICT DO NOTHING;

-- Paper 4 → Juan Carlos (orden 1)
INSERT INTO paper_authors (paper_id, author_id, author_order)
SELECT p.id, a.id, 1
FROM papers p, authors a
WHERE p.slug = 'caracterizacion-arquitecturas-circuitos-geneticos'
  AND a.slug = 'juan-carlos-linares-rugeles'
ON CONFLICT DO NOTHING;

-- Paper 5 → Juan Carlos (orden 1)
INSERT INTO paper_authors (paper_id, author_id, author_order)
SELECT p.id, a.id, 1
FROM papers p, authors a
WHERE p.slug = 'soluciones-analiticas-sistemas-expresion-genes-feedback'
  AND a.slug = 'juan-carlos-linares-rugeles'
ON CONFLICT DO NOTHING;

-- Paper 6 → Ramón (orden 1)
INSERT INTO paper_authors (paper_id, author_id, author_order)
SELECT p.id, a.id, 1
FROM papers p, authors a
WHERE p.slug = 'diversidad-hongos-micorrizicos-lianas-cordoba'
  AND a.slug = 'ramon-orlando-alvarez-burgos'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ✅ DATOS INSERTADOS
-- ============================================================================
-- Nota: Las imágenes se insertarán después usando las URLs de las carpetas locales
-- o subiéndolas a Supabase Storage
-- ============================================================================

