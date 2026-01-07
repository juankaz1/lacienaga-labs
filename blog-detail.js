(() => {
// ============================================================================
// Blog Detail Page - Página Individual de Paper
// ============================================================================

// Obtener slug de la URL
const urlParams = new URLSearchParams(window.location.search);
const paperSlug = urlParams.get('slug');

// Config Supabase (inyectada desde `supabase-config.js`)
// OJO: no usar el nombre SUPABASE_URL aquí porque `blog.js` también define uno en el scope global.
const LCL_SUPABASE_URL = window.SUPABASE_URL || 'TU_SUPABASE_URL';

// Idioma preferido del usuario
let userLanguage = localStorage.getItem('preferredLanguage') || 'es';

// ============================================================================
// Likes (1 por navegador) - mismo protocolo que en index
// ============================================================================

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
    const supabase = window.supabaseClient;
    if (!supabase) return 0;
    const { count, error } = await supabase
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('paper_id', paperId);
    if (error) return 0;
    return count || 0;
}

async function getCommentCount(paperId) {
    const supabase = window.supabaseClient;
    if (!supabase) return 0;
    const { count, error } = await supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('paper_id', paperId)
        .eq('status', 'approved');
    if (error) return 0;
    return count || 0;
}

async function refreshDetailReactions(paperId) {
    const likeCountEl = document.getElementById('detail-like-count');
    const commentCountEl = document.getElementById('detail-comment-count');
    if (likeCountEl) likeCountEl.textContent = String(await getLikeCount(paperId));
    if (commentCountEl) commentCountEl.textContent = String(await getCommentCount(paperId));
}

async function likeDetailPaper(event, paperId) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    const supabase = window.supabaseClient;
    if (!supabase) {
        alert('Likes no disponibles: backend no configurado');
        return;
    }
    const clientId = getClientId();
    const btn = document.getElementById('detail-like-btn');
    try {
        const { error } = await supabase.from('likes').insert({
            paper_id: paperId,
            client_id: clientId
        });
        // si ya existe el like, lo tratamos como OK
        if (error && !String(error.message || '').toLowerCase().includes('duplicate')) {
            throw error;
        }
        if (btn) btn.classList.add('liked');
        await refreshDetailReactions(paperId);
    } catch (e) {
        console.error('Error dando like:', e);
        alert('No se pudo registrar el like. Intenta de nuevo.');
    }
}

// ============================================================================
// Cargar Paper Individual
// ============================================================================

async function loadPaperDetail(slug) {
    if (!slug) {
        showError('No se especificó una publicación');
        return;
    }

    const supabase = window.supabaseClient;
    
    let paper;
    
    if (!supabase || LCL_SUPABASE_URL === 'TU_SUPABASE_URL') {
        // Usar datos de ejemplo
        paper = getExamplePaperBySlug(slug);
        if (!paper) {
            showError('Publicación no encontrada');
            return;
        }
    } else {
        try {
            const { data, error } = await supabase
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
                .eq('slug', slug)
                .eq('status', 'published')
                .single();

            if (error) throw error;
            if (!data) {
                showError('Publicación no encontrada');
                return;
            }

            // Procesar datos
            paper = {
                ...data,
                authors: data.paper_authors
                    .sort((a, b) => a.author_order - b.author_order)
                    .map(pa => pa.authors),
                images: data.paper_images.sort((a, b) => a.display_order - b.display_order)
            };
        } catch (error) {
            console.error('Error cargando paper:', error);
            showError('Error al cargar la publicación');
            return;
        }
    }
    
    // Cargar imágenes desde carpeta
    if (window.loadPaperImages) {
        try {
            const images = await window.loadPaperImages(slug);
            paper.images = images;
        } catch (error) {
            console.error('Error cargando imágenes:', error);
        }
    }
    
    renderPaperDetail(paper);
    
    // Inicializar carrusel después de renderizar
    if (paper.images && paper.images.length > 0) {
        setTimeout(() => {
            initCarousel(paper.images);
        }, 100);
    }
    
    // Cargar comentarios
    loadAndRenderComments(paper.id);
}

// ============================================================================
// Renderizado
// ============================================================================

function renderPaperDetail(paper) {
    const content = window.BlogUtils?.getPaperContent(paper, userLanguage) || getPaperContent(paper, userLanguage);
    const container = document.getElementById('paper-detail-container');
    
    if (!container) return;

    const authorsText = paper.authors.map(a => a.name).join(', ');
    const dateText = window.BlogUtils?.formatDate(paper.publication_date) || formatDate(paper.publication_date);

    container.innerHTML = `
        <div class="paper-detail-header">
            <a href="index.html#blog" class="back-link">← Volver a publicaciones</a>
            
            <!-- Selector de Idioma -->
            <div class="language-selector">
                <button class="lang-btn ${userLanguage === 'es' ? 'active' : ''}" data-lang="es">ES</button>
                <button class="lang-btn ${userLanguage === 'en' ? 'active' : ''}" data-lang="en">EN</button>
            </div>

            <h1 class="paper-detail-title">${content.title}</h1>

            <!-- Reacciones -->
            <div class="paper-reactions" style="border: none; padding: 0; margin: 1rem 0 0.5rem;">
                <button id="detail-like-btn" class="reaction-btn like" title="Me gusta" onclick="likeDetailPaper(event, '${paper.id}')">
                    ❤️ <span class="reaction-count" id="detail-like-count">0</span>
                </button>
                <div class="reaction-btn comment" style="cursor: default;">
                    💬 <span class="reaction-count" id="detail-comment-count">0</span>
                </div>
            </div>

            <div class="paper-detail-meta">
                <div class="meta-item">
                    <strong>Autores:</strong> ${authorsText}
                </div>
                <div class="meta-item">
                    <strong>Fecha:</strong> ${dateText}
                </div>
                ${paper.journal ? `
                    <div class="meta-item">
                        <strong>Revista:</strong> ${paper.journal}
                    </div>
                ` : ''}
                ${paper.doi ? `
                    <div class="meta-item">
                        <strong>DOI:</strong> 
                        <a href="https://doi.org/${paper.doi}" target="_blank" rel="noopener">${paper.doi}</a>
                    </div>
                ` : ''}
            </div>
        </div>

        <!-- Carrusel de Imágenes -->
        ${paper.images && paper.images.length > 0 ? `
            <div class="paper-detail-carousel" id="paper-carousel">
                <div class="carousel-main">
                    ${paper.images.map((img, index) => `
                        <img src="${img.image_url || img.url}" 
                             alt="${img.alt_text || content.title}" 
                             class="carousel-image ${index === 0 ? 'active' : ''}"
                             data-index="${index}"
                             onclick="openDetailImageModal(${index})">
                    `).join('')}
                    ${paper.images.length > 1 ? `
                        <button class="carousel-nav prev" onclick="changeCarouselImage(-1)">◀</button>
                        <button class="carousel-nav next" onclick="changeCarouselImage(1)">▶</button>
                        <div class="carousel-caption" id="carousel-caption">
                            ${paper.images[0].caption || ''}
                        </div>
                    ` : paper.images[0].caption ? `
                        <div class="carousel-caption" id="carousel-caption">
                            ${paper.images[0].caption}
                        </div>
                    ` : ''}
                </div>
            </div>
        ` : ''}

        <!-- Abstract en ambos idiomas -->
        <div class="paper-detail-abstract">
            <h3>Resumen</h3>
            <div class="abstract-content">
                ${paper.language === 'es' || paper.abstract_translated ? `
                    <div class="abstract-language active" data-lang="es">
                        <h4>Español</h4>
                        <p>${paper.language === 'es' ? paper.abstract : (paper.abstract_translated || paper.abstract)}</p>
                    </div>
                ` : ''}
                ${paper.language === 'en' || paper.abstract_translated ? `
                    <div class="abstract-language active" data-lang="en">
                        <h4>English</h4>
                        <p>${paper.language === 'en' ? paper.abstract : (paper.abstract_translated || paper.abstract)}</p>
                    </div>
                ` : ''}
            </div>
        </div>

        <!-- Significance (si existe) -->
        ${(paper.significance || paper.significance_translated) ? `
            <div class="paper-detail-abstract">
                <h3>Significance</h3>
                <div class="abstract-content">
                    ${paper.significance ? `
                        <div class="abstract-language active" data-lang="en">
                            <h4>English</h4>
                            <p>${paper.significance}</p>
                        </div>
                    ` : ''}
                    ${paper.significance_translated ? `
                        <div class="abstract-language active" data-lang="es">
                            <h4>Español</h4>
                            <p>${paper.significance_translated}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        ` : ''}

        <!-- Full Text (si existe) -->
        ${content.full_text ? `
            <div class="paper-detail-full-text">
                <h3>Texto Completo</h3>
                <div>${content.full_text}</div>
            </div>
        ` : ''}

        <!-- Acciones -->
        <div class="paper-detail-actions">
            ${paper.source_url || paper.pdf_url ? `
                <a href="${paper.source_url || paper.pdf_url}" target="_blank" rel="noopener" class="action-btn" style="background: #bceb00; color: #1f2937; border-color: #bceb00;">
                    🔗 Ver Publicación Original
                </a>
            ` : ''}
        </div>

        <!-- Comentarios -->
        <div class="comments-section" id="comments-section">
            <h3>💬 Comentarios</h3>
            <div id="comments-list">
                <p class="loading-comments">Cargando comentarios...</p>
            </div>
            
            <!-- Formulario de Comentarios -->
            <div class="comment-form">
                <h4>Deja un comentario</h4>
                <form id="comment-form" onsubmit="submitCommentForm(event)">
                    <div class="form-group">
                        <label for="comment-name">Nombre *</label>
                        <input type="text" id="comment-name" name="name" required maxlength="100">
                    </div>
                    <div class="form-group">
                        <label for="comment-email">Email *</label>
                        <input type="email" id="comment-email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="comment-content">Comentario *</label>
                        <textarea id="comment-content" name="content" required maxlength="5000"></textarea>
                    </div>
                    <button type="submit" class="form-submit" id="comment-submit">
                        Publicar Comentario
                    </button>
                </form>
            </div>
        </div>
    `;

    // Setup selector de idioma
    setupLanguageSelector(paper);

    // Cargar conteos de likes/comentarios
    refreshDetailReactions(paper.id).catch(() => {});
}

// ============================================================================
// Carrusel de Imágenes
// ============================================================================

let currentImageIndex = 0;
let paperImages = [];

function initCarousel(images) {
    paperImages = images || [];
    currentImageIndex = 0;
    
    // Si hay imágenes, inicializar el carrusel
    if (paperImages.length > 0 && document.getElementById('paper-carousel')) {
        // El carrusel ya está renderizado, solo necesitamos actualizar el índice
    }
}

function changeCarouselImage(direction) {
    if (paperImages.length === 0) return;
    
    currentImageIndex += direction;
    
    if (currentImageIndex < 0) {
        currentImageIndex = paperImages.length - 1;
    } else if (currentImageIndex >= paperImages.length) {
        currentImageIndex = 0;
    }
    
    // Actualizar imagen visible
    document.querySelectorAll('.carousel-image').forEach((img, index) => {
        img.classList.toggle('active', index === currentImageIndex);
    });
    
    // Actualizar caption
    const caption = document.getElementById('carousel-caption');
    if (caption && paperImages[currentImageIndex]) {
        const captionText = paperImages[currentImageIndex].caption || 'Sin descripción disponible';
        caption.textContent = captionText;
        caption.style.display = captionText && captionText !== 'Sin descripción disponible' ? 'block' : 'block';
        
        // Debug
        if (captionText && captionText !== 'Sin descripción disponible') {
            console.log(`[changeCarouselImage] Caption actualizado: "${captionText.substring(0, 50)}..."`);
        }
    }
}

// ============================================================================
// Comentarios
// ============================================================================

async function loadAndRenderComments(paperId) {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;

    try {
        const comments = window.BlogUtils?.loadComments 
            ? await window.BlogUtils.loadComments(paperId)
            : await loadComments(paperId);
        
        renderComments(comments);
    } catch (error) {
        console.error('Error cargando comentarios:', error);
        commentsList.innerHTML = '<p class="no-comments">Error al cargar comentarios</p>';
    }
}

function renderComments(comments) {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;

    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments">Aún no hay comentarios. ¡Sé el primero en comentar!</p>';
        return;
    }

    const timeAgo = window.BlogUtils?.timeAgo || timeAgo;
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-author">${comment.author_name}</span>
                <span class="comment-date">${timeAgo(comment.created_at)}</span>
            </div>
            <div class="comment-content">${escapeHtml(comment.content)}</div>
        </div>
    `).join('');
}

async function submitCommentForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = document.getElementById('comment-submit');
    const formData = new FormData(form);
    
    const commentData = {
        name: formData.get('name').trim(),
        email: formData.get('email').trim(),
        content: formData.get('content').trim()
    };

    // Validación
    if (!commentData.name || !commentData.email || !commentData.content) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }

    // Obtener paper ID del slug
    const paper = await getPaperBySlug(paperSlug);
    if (!paper) {
        alert('Error: No se pudo encontrar la publicación');
        return;
    }

    // Deshabilitar botón
    submitBtn.disabled = true;
    submitBtn.textContent = 'Publicando...';

    try {
        const result = window.BlogUtils?.submitComment 
            ? await window.BlogUtils.submitComment(paper.id, commentData)
            : await submitComment(paper.id, commentData);

        if (result.success) {
            // Limpiar formulario
            form.reset();
            alert('¡Comentario publicado exitosamente!');
            
            // Recargar comentarios
            await loadAndRenderComments(paper.id);
            await refreshDetailReactions(paper.id);
        } else {
            alert('Error al publicar comentario: ' + (result.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al publicar comentario');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publicar Comentario';
    }
}

// ============================================================================
// Selector de Idioma
// ============================================================================

function setupLanguageSelector(paper) {
    const langButtons = document.querySelectorAll('.lang-btn');

    function applyLanguageVisibility(lang) {
        // Para cada sección (abstract/significance), si hay ambos idiomas, mostrar solo el seleccionado.
        document.querySelectorAll('.abstract-content').forEach(section => {
            const blocks = section.querySelectorAll('.abstract-language');
            if (blocks.length <= 1) {
                blocks.forEach(b => b.classList.add('active'));
                return;
            }
            blocks.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
        });
    }
    
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            userLanguage = lang;
            localStorage.setItem('preferredLanguage', lang);
            
            // Actualizar botones
            langButtons.forEach(b => b.classList.toggle('active', b === btn));
            
            // Actualizar contenido según idioma
            const content = getPaperContent(paper, lang);
            document.querySelector('.paper-detail-title').textContent = content.title;

            // Mostrar/ocultar secciones según idioma
            applyLanguageVisibility(lang);
        });
    });

    // Estado inicial: respetar idioma preferido y ocultar el otro si existen ambos
    applyLanguageVisibility(userLanguage);
}

// ============================================================================
// Modal de imágenes (clic en carrusel) - reutiliza estilos .image-modal
// ============================================================================

function openDetailImageModal(startIndex = 0) {
    // Cerrar si existe
    const existing = document.querySelector('.image-modal');
    if (existing) existing.remove();

    if (!paperImages || paperImages.length === 0) return;

    let current = Math.max(0, Math.min(startIndex, paperImages.length - 1));

    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.dataset.currentIndex = String(current);
    modal.innerHTML = `
        <div class="image-modal-content">
            <button class="image-modal-close" onclick="closeDetailImageModal()">&times;</button>
            <div class="image-modal-carousel">
                ${paperImages.length > 1 ? `
                    <button class="image-modal-nav image-modal-prev" onclick="navigateDetailImageModal(-1)">◀</button>
                    <button class="image-modal-nav image-modal-next" onclick="navigateDetailImageModal(1)">▶</button>
                ` : ''}
                <div class="image-modal-image-container">
                    <img src="${paperImages[current].image_url || paperImages[current].url}"
                         alt="${paperImages[current].alt_text || ''}"
                         class="image-modal-image"
                         id="detail-modal-image">
                </div>
                <div class="image-modal-info">
                    <span class="image-modal-counter" id="detail-modal-counter">${current + 1} / ${paperImages.length}</span>
                    <p class="image-modal-caption" id="detail-modal-caption">${paperImages[current].caption || 'Sin descripción disponible'}</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // click fuera cierra
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeDetailImageModal();
    });

    // esc cierra + flechas navegan
    const keyHandler = (e) => {
        if (e.key === 'Escape') closeDetailImageModal();
        if (e.key === 'ArrowLeft') navigateDetailImageModal(-1);
        if (e.key === 'ArrowRight') navigateDetailImageModal(1);
    };
    document.addEventListener('keydown', keyHandler);
    modal._keyHandler = keyHandler;
}

function navigateDetailImageModal(direction) {
    const modal = document.querySelector('.image-modal');
    if (!modal || !paperImages || paperImages.length === 0) return;
    let current = parseInt(modal.dataset.currentIndex || '0', 10);
    current += direction;
    if (current < 0) current = paperImages.length - 1;
    if (current >= paperImages.length) current = 0;
    modal.dataset.currentIndex = String(current);

    const img = document.getElementById('detail-modal-image');
    const counter = document.getElementById('detail-modal-counter');
    const caption = document.getElementById('detail-modal-caption');

    if (img) {
        img.src = paperImages[current].image_url || paperImages[current].url;
        img.alt = paperImages[current].alt_text || '';
    }
    if (counter) counter.textContent = `${current + 1} / ${paperImages.length}`;
    if (caption) caption.textContent = paperImages[current].caption || 'Sin descripción disponible';
}

function closeDetailImageModal() {
    const modal = document.querySelector('.image-modal');
    if (!modal) return;
    const keyHandler = modal._keyHandler;
    if (keyHandler) document.removeEventListener('keydown', keyHandler);
    modal.remove();
}

// ============================================================================
// Utilidades
// ============================================================================

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

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    const container = document.getElementById('paper-detail-container');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem;">
                <h2 style="color: var(--primary-purple); margin-bottom: 1rem;">Error</h2>
                <p style="color: var(--text-gray); margin-bottom: 2rem;">${message}</p>
                <a href="index.html#blog" class="action-btn">Volver a Publicaciones</a>
            </div>
        `;
    }
}

async function getPaperBySlug(slug) {
    // Implementación similar a loadPaperDetail pero retorna el paper
    const supabase = window.supabaseClient;
    if (!supabase || LCL_SUPABASE_URL === 'TU_SUPABASE_URL') {
        return getExamplePaperBySlug(slug);
    }
    
    const { data } = await supabase
        .from('papers')
        .select('*')
        .eq('slug', slug)
        .single();
    
    return data;
}

function getExamplePaperBySlug(slug) {
    const examples = getExamplePapers();
    return examples.find(p => p.slug === slug);
}

function getExamplePapers() {
    // Reutilizar de blog.js si está disponible
    if (window.getExamplePapers) {
        return window.getExamplePapers();
    }
    return [];
}

async function loadComments(paperId) {
    const supabase = window.supabaseClient;
    if (!supabase) return [];
    const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('paper_id', paperId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
    return data || [];
}

async function submitComment(paperId, commentData) {
    const supabase = window.supabaseClient;
    if (!supabase) {
        return { success: false, error: 'Backend no configurado' };
    }
    const { data, error } = await supabase
        .from('comments')
        .insert({
            paper_id: paperId,
            author_name: commentData.name,
            author_email: commentData.email,
            author_website: commentData.website || null,
            content: commentData.content,
            status: 'approved'
        })
        .select()
        .single();
    
    if (error) throw error;
    return { success: true, data };
}

// ============================================================================
// Inicialización
// ============================================================================

if (paperSlug) {
    loadPaperDetail(paperSlug);
} else {
    showError('No se especificó una publicación');
}

// Exponer funciones globales para el carrusel
window.changeCarouselImage = changeCarouselImage;
window.submitCommentForm = submitCommentForm;
window.likeDetailPaper = likeDetailPaper;
window.openDetailImageModal = openDetailImageModal;
window.navigateDetailImageModal = navigateDetailImageModal;
window.closeDetailImageModal = closeDetailImageModal;

})();

