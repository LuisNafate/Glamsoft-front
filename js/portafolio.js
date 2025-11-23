// ===================================
// PORTAFOLIO - GALERÍA DE IMÁGENES
// ===================================

/**
 * Obtener parámetro de URL
 */
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * Cargar imágenes del álbum específico
 */
async function loadPortafolio() {
    const grid = document.getElementById('portfolioGrid');
    const emptyState = document.getElementById('emptyState');
    const loader = document.getElementById('portfolioLoader');
    const albumTitle = document.getElementById('albumTitle');

    if (!grid) return;

    // Obtener nombre del álbum desde URL
    const albumNombre = getURLParameter('album');

    // Mostrar loader
    if (loader) loader.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';
    grid.innerHTML = '';

    try {
        // Obtener todos los trabajos
        const trabajos = await PortafolioService.getAll();
        console.log('📸 Total de imágenes recibidas:', trabajos.length);
        console.log('📂 Álbum solicitado:', albumNombre);

        if (!trabajos || trabajos.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        let imagenesAMostrar;

        if (albumNombre) {
            // MODO: Mostrar imágenes de un álbum específico
            imagenesAMostrar = trabajos.filter(img => img.titulo === albumNombre);
            console.log(`✅ Imágenes del álbum "${albumNombre}":`, imagenesAMostrar.length);

            // Actualizar título de la página
            if (albumTitle) {
                albumTitle.textContent = albumNombre;
            }

            if (imagenesAMostrar.length === 0) {
                grid.innerHTML = '<p style="text-align: center; color: #ccc; padding: 60px;">No se encontraron imágenes para este álbum</p>';
                return;
            }
        } else {
            // MODO: Mostrar todas las imágenes
            imagenesAMostrar = trabajos;
            console.log('✅ Mostrando todas las imágenes:', imagenesAMostrar.length);

            // Actualizar título de la página
            if (albumTitle) {
                albumTitle.textContent = 'Nuestro Portafolio';
            }
        }

        // Renderizar imágenes en la galería
        imagenesAMostrar.forEach((imagen, index) => {
            const imageElement = createImageElement(imagen, index);
            grid.appendChild(imageElement);
        });

        // Configurar lightbox
        setupLightbox();

    } catch (error) {
        console.error('Error al cargar portafolio:', error);
        grid.innerHTML = '<p style="text-align: center; color: #ff6b6b; padding: 60px;">Error al cargar el portafolio</p>';
    } finally {
        // Ocultar loader
        if (loader) loader.style.display = 'none';
    }
}

/**
 * Crear elemento de imagen para la galería
 */
function createImageElement(imagen, index) {
    const div = document.createElement('div');

    // Determinar las clases CSS según el índice para mantener el layout variado
    const itemClasses = ['item-1', 'item-2', 'item-3', 'item-4', 'item-5', 'item-6', 'item-7', 'item-8'];
    const mainLandscape = (index + 1) % 9 === 0; // Cada 9 elementos, uno grande

    div.className = mainLandscape
        ? 'gallery-item item-main-landscape js-lightbox-item'
        : `gallery-item ${itemClasses[index % itemClasses.length]} js-lightbox-item`;

    // Guardar URL de la imagen en un atributo data
    div.setAttribute('data-image-url', imagen.urlImagen);

    const content = document.createElement('div');
    content.className = 'item-content';
    content.style.backgroundImage = `url('${imagen.urlImagen || 'https://via.placeholder.com/600x400?text=Sin+imagen'}')`;

    // Badge si está destacada
    if (imagen.destacado) {
        const badge = document.createElement('div');
        badge.style.cssText = 'position: absolute; top: 15px; right: 15px; background: rgba(255,215,0,0.9); color: #000; padding: 8px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; z-index: 2; box-shadow: 0 2px 8px rgba(0,0,0,0.3);';
        badge.innerHTML = `<i class="fas fa-star"></i> Destacado`;
        content.appendChild(badge);
    }

    // Overlay con descripción (opcional)
    if (imagen.descripcion) {
        const overlay = document.createElement('div');
        overlay.className = 'item-overlay';
        overlay.innerHTML = `
            <div style="text-align: center; color: white;">
                <p style="font-size: 0.9em; opacity: 0.9;">${imagen.descripcion}</p>
            </div>
        `;
        content.appendChild(overlay);
    }

    div.appendChild(content);
    return div;
}

/**
 * Configurar lightbox para ver imágenes en grande
 */
function setupLightbox() {
    const lightboxItems = document.querySelectorAll('.js-lightbox-item');

    // Crear elementos del lightbox si no existen
    let lightbox = document.getElementById('lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10000;
            justify-content: center;
            align-items: center;
        `;

        const lightboxImg = document.createElement('img');
        lightboxImg.id = 'lightbox-img';
        lightboxImg.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border-radius: 8px;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.id = 'lightbox-close';
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 30px;
            font-size: 40px;
            color: #ffffff;
            cursor: pointer;
            background: transparent;
            border: none;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            padding: 0;
            transition: color 0.3s ease;
        `;
        closeBtn.onmouseover = () => closeBtn.style.color = '#B8860B';
        closeBtn.onmouseout = () => closeBtn.style.color = '#ffffff';

        lightbox.appendChild(lightboxImg);
        lightbox.appendChild(closeBtn);
        document.body.appendChild(lightbox);

        // Cerrar al hacer clic en el fondo
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Cerrar con botón
        closeBtn.addEventListener('click', closeLightbox);

        // Cerrar con tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.style.display === 'flex') {
                closeLightbox();
            }
        });
    }

    // Agregar evento click a cada imagen
    lightboxItems.forEach(item => {
        item.addEventListener('click', () => {
            const imageUrl = item.getAttribute('data-image-url');
            openLightbox(imageUrl);
        });

        // Efecto hover
        item.addEventListener('mouseenter', () => {
            item.style.cursor = 'pointer';
            item.style.transform = 'scale(1.05)';
            item.style.transition = 'transform 0.3s ease';
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = 'scale(1)';
        });
    });
}

/**
 * Abrir lightbox con imagen
 */
function openLightbox(imageUrl) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    if (lightbox && lightboxImg) {
        lightboxImg.src = imageUrl;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevenir scroll
    }
}

/**
 * Cerrar lightbox
 */
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restaurar scroll
    }
}

// Cargar portafolio cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Cargar galería dinámicamente
    loadPortafolio();

    // Botones de navegación (si existen)
    const undoButton = document.getElementById('undo-button');
    const redoForwardButton = document.getElementById('redo-forward-button');
    const reloadButton = document.getElementById('reload-button');

    if (undoButton) {
        undoButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.history.back();
        });
    }

    if (redoForwardButton) {
        redoForwardButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.history.forward();
        });
    }

    if (reloadButton) {
        reloadButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.reload();
        });
    }
});
