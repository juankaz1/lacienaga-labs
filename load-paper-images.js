// ============================================================================
// Carga de Imágenes de Papers desde images_papers/
// ============================================================================

/**
 * Mapeo de slugs a códigos de carpetas
 */
const PAPER_FOLDER_MAP = {
    'local-thermodynamics-p-granules-condensates': 'A1 - Local thermodynamics govern formation and dissolution of Caenorhabditis elegans P granule condensates',
    'temperature-drives-p-granule-formation': 'A2 - Temperature drives P granule formation in Caenorhabditis elegans',
    'immunogenicity-safety-rbd-vaccine-sars-cov2': 'A3 - Immunogenicity and safety of a RBD vaccine against SARS-CoV-2 in a murine model',
    'caracterizacion-arquitecturas-circuitos-geneticos': 'J1 - Caracterizacion de arquitecturas de circuitos geneticos desde modelos analticos y estocasticos',
    'soluciones-analiticas-sistemas-expresion-genes-feedback': 'J2 - Soluciones analticas a sistemas de expresion de genes con feedback negativo',
    'diversidad-hongos-micorrizicos-lianas-cordoba': 'R1 - DIVERSIDAD DE HONGOS MICORRÍZICOS EN LIANAS Y EN LA RIZÓSFERA DE LOS FORÓFITOS EN UN RELICTO DE BOSQUE EN CÓRDOBA, COLOMBIA'
};

/**
 * Carpetas que sí tienen figs.txt (para evitar 404 ruidosos en consola)
 * Según tu estructura actual: A1 y A3.
 */
const FOLDERS_WITH_FIGS_TXT = new Set([
    'A1 - Local thermodynamics govern formation and dissolution of Caenorhabditis elegans P granule condensates',
    'A3 - Immunogenicity and safety of a RBD vaccine against SARS-CoV-2 in a murine model'
]);

/**
 * Carga las imágenes de un paper desde su carpeta
 */
async function loadPaperImages(slug) {
    const folderName = PAPER_FOLDER_MAP[slug];
    if (!folderName) return [];

    try {
        const basePath = `images_papers/${encodeURIComponent(folderName)}/`;
        
        // Lista de imágenes conocidas
        const imageFiles = await getImageFilesForPaper(folderName);
        
        // Cargar archivo figs.txt si existe
        const captions = await loadFigCaptions(folderName);
        
        return imageFiles.map((file, index) => {
            const figNumber = extractFigNumber(file);
            const caption = captions[figNumber] || '';

            return {
                url: `${basePath}${encodeURIComponent(file)}`,
                image_url: `${basePath}${encodeURIComponent(file)}`,
                caption: caption,
                alt_text: `Figure ${figNumber}`,
                display_order: index
            };
        });
    } catch (error) {
        console.error(`Error cargando imágenes para ${slug}:`, error);
        return [];
    }
}

/**
 * Obtiene los archivos de imagen para un paper
 * Lista estática basada en la estructura conocida
 */
function getImageFilesForPaper(folderName) {
    // Mapeo de carpetas a archivos de imagen conocidos
    const imageMap = {
        'A1 - Local thermodynamics govern formation and dissolution of Caenorhabditis elegans P granule condensates': [
            'pnas.2102772118fig01.jpg',
            'pnas.2102772118fig02.jpg',
            'pnas.2102772118fig03.jpg',
            'pnas.2102772118fig04.jpg',
            'pnas.2102772118fig05.jpg'
        ],
        'A2 - Temperature drives P granule formation in Caenorhabditis elegans': [
            'Fig1.png', 'Fig2.png', 'Fig3.png', 'Fig4.png', 'Fig5.png',
            'Fig6.png', 'Fig7.png', 'Fig8.png', 'Fig9.png', 'Fig10.png',
            'Fig11.png', 'Fig12.png', 'Fig13.png', 'Fig14.png', 'Fig15.png'
        ],
        'A3 - Immunogenicity and safety of a RBD vaccine against SARS-CoV-2 in a murine model': [
            'Fig1.jpg',
            'Fig2.jpg'
        ],
        'J1 - Caracterizacion de arquitecturas de circuitos geneticos desde modelos analticos y estocasticos': [
            'f1.png', 'f2.png', 'f3.png', 'f4.png', 'f5.png', 'f6.png', 'f7.png', 'f8.png',
            'f9.png', 'f10.png', 'f11.png', 'f12.png', 'f13.png', 'f14.png', 'f15.png', 'f16.png'
        ],
        'J2 - Soluciones analticas a sistemas de expresion de genes con feedback negativo': [
            'Fig1.png',
            'Fig2.png',
            'Fig3.png',
            'Fig4.png'
        ],
        'R1 - DIVERSIDAD DE HONGOS MICORRÍZICOS EN LIANAS Y EN LA RIZÓSFERA DE LOS FORÓFITOS EN UN RELICTO DE BOSQUE EN CÓRDOBA, COLOMBIA': [
            'Fig1.png', 'Fig2.png', 'Fig3.png', 'Fig4.png', 'Fig5.png',
            'Fig6.png', 'Fig7.png', 'Fig8.png', 'Fig9.png', 'Fig10.png', 'Fig11.png'
        ]
    };
    
    return imageMap[folderName] || [];
}

/**
 * Carga los captions desde figs.txt
 */
async function loadFigCaptions(folderName) {
    if (!FOLDERS_WITH_FIGS_TXT.has(folderName)) return {};
    try {
        const encodedFolder = encodeURIComponent(folderName);
        const response = await fetch(`images_papers/${encodedFolder}/figs.txt`);
        if (!response.ok) return {};
        
        const text = await response.text();
        return parseFigCaptions(text);
    } catch (error) {
        // Si no existe el archivo, retornar objeto vacío
        return {};
    }
}

/**
 * Parsea el texto de figs.txt
 * Formato: "Fig1\n\ntexto\n\n\n\nFig2\n\ntexto..."
 */
function parseFigCaptions(text) {
    const captions = {};
    const lines = text.split('\n');
    let currentFig = null;
    let currentText = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Detectar inicio de figura (Fig1, Fig2, etc.)
        // Puede estar en una línea sola o seguida de texto
        const figMatch = line.match(/^Fig(\d+)/i);
        if (figMatch) {
            // Guardar figura anterior si existe
            if (currentFig) {
                const captionText = currentText.join(' ').trim();
                captions[`Fig${currentFig}`] = captionText;
            }
            // Iniciar nueva figura
            currentFig = figMatch[1];
            currentText = [];
            
            // Si hay texto después de "Fig1" en la misma línea, agregarlo
            const textAfterFig = line.replace(/^Fig\d+/i, '').trim();
            if (textAfterFig) {
                currentText.push(textAfterFig);
            }
        } else if (currentFig) {
            // Agregar línea a la figura actual (incluso si está vacía, para preservar saltos de línea)
            const trimmedLine = line.trim();
            if (trimmedLine) {
                currentText.push(trimmedLine);
            } else if (currentText.length > 0) {
                // Si hay una línea vacía pero ya hay texto, agregar un espacio
                currentText.push(' ');
            }
        }
    }
    
    // Guardar última figura
    if (currentFig) {
        const captionText = currentText.join(' ').trim();
        captions[`Fig${currentFig}`] = captionText;
    }
    
    return captions;
}

/**
 * Extrae el número de figura del nombre del archivo
 * Retorna en formato "Fig1", "Fig2", etc. para coincidir con los captions
 */
function extractFigNumber(filename) {
    // Para archivos como "pnas.2102772118fig01.jpg" -> "Fig1"
    const pnasMatch = filename.match(/fig(\d+)/i);
    if (pnasMatch) {
        const num = parseInt(pnasMatch[1], 10);
        return `Fig${num}`;
    }
    
    // Para archivos como "Fig1.png" -> "Fig1"
    const figMatch = filename.match(/Fig(\d+)/i);
    if (figMatch) {
        return `Fig${figMatch[1]}`;
    }
    
    // Para archivos como "f1.png" -> "Fig1"
    const fMatch = filename.match(/f(\d+)/i);
    if (fMatch) {
        return `Fig${fMatch[1]}`;
    }
    
    // Default
    return 'Fig1';
}

// Exportar para uso en otros scripts
window.loadPaperImages = loadPaperImages;
window.parseFigCaptions = parseFigCaptions;

