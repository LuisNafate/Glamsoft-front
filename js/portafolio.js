// ===================================
// PORTAFOLIO - PÁGINA COMPLETA
// ===================================

/**
 * Agrupar imágenes por título para crear álbumes
 */
function agruparPorTitulo(imagenes) {
    const grupos = {};

    imagenes.forEach(img => {
        const titulo = img.titulo || 'Sin título';
        if (!grupos[titulo]) {
            grupos[titulo] = {
                titulo: titulo,
                descripcion: img.descripcion,
                idCategoria: img.idCategoria,
                destacado: false,
                portada: null,
                totalImagenes: 0
            };
        }

        grupos[titulo].totalImagenes++;

        // Si es destacada, usar como portada y marcar el álbum como destacado
        if (img.destacado) {
            grupos[titulo].destacado = true;
            grupos[titulo].portada = img.urlImagen;
        }

        // Si no hay portada, usar la primera imagen
        if (!grupos[titulo].portada) {
            grupos[titulo].portada = img.urlImagen;
        }
    });

    return Object.values(grupos);
}

/**
 * Cargar TODOS los álbumes del portafolio
 */
async function loadPortafolio() {
    const grid = document.getElementById('portfolioGrid');
    const emptyState = document.getElementById('emptyState');
    const loader = document.getElementById('portfolioLoader');

    if (!grid) return;

    // Mostrar loader
    if (loader) loader.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';
    grid.innerHTML = '';

    try {
        // Obtener todos los trabajos
        const trabajos = await PortafolioService.getAll();
        console.log('📸 Total de imágenes recibidas:', trabajos.length);

        if (!trabajos || trabajos.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        // Agrupar por título (álbumes)
        const albumes = agruparPorTitulo(trabajos);
        console.log('✅ Total de álbumes:', albumes.length);

        // Renderizar todos los álbumes
        albumes.forEach((album, index) => {
            const albumElement = createAlbumElement(album, index);
            grid.appendChild(albumElement);
        });

        // Configurar eventos de hover
        setupHoverEffects();

    } catch (error) {
        console.error('Error al cargar portafolio:', error);
        grid.innerHTML = '<p style="text-align: center; color: #ff6b6b; padding: 60px;">Error al cargar el portafolio</p>';
    } finally {
        // Ocultar loader
        if (loader) loader.style.display = 'none';
    }
}

/**
 * Crear elemento de álbum
 */
function createAlbumElement(album, index) {
    const div = document.createElement('div');

    // Determinar las clases CSS según el índice
    // Para mantener el layout variado como en el diseño original
    const itemClasses = ['item-1', 'item-2', 'item-3', 'item-4', 'item-5', 'item-6', 'item-7', 'item-8'];
    const mainLandscape = (index + 1) % 9 === 0; // Cada 9 elementos, uno grande

    div.className = mainLandscape
        ? 'gallery-item item-main-landscape js-hover-item'
        : `gallery-item ${itemClasses[index % itemClasses.length]} js-hover-item`;

    // Al hacer clic, ir a la galería del álbum
    div.onclick = () => abrirDetalle(album.titulo);

    const content = document.createElement('div');
    content.className = 'item-content';
    content.style.backgroundImage = `url('${album.portada || 'https://via.placeholder.com/600x400?text=Sin+imagen'}')`;

    // Badge con cantidad de imágenes si son más de 1
    if (album.totalImagenes > 1) {
        const badge = document.createElement('div');
        badge.style.cssText = 'position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.8); color: white; padding: 8px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; z-index: 2; box-shadow: 0 2px 8px rgba(0,0,0,0.3);';
        badge.innerHTML = `<i class="fas fa-images"></i> ${album.totalImagenes}`;
        content.appendChild(badge);
    }

    // Overlay con título del álbum
    const overlay = document.createElement('div');
    overlay.className = 'item-overlay';
    overlay.innerHTML = `
        <div style="text-align: center; color: white;">
            <h3 style="font-size: 1.5em; margin-bottom: 10px; font-family: 'GFS Didot', serif;">${album.titulo}</h3>
            ${album.descripcion ? `<p style="font-size: 0.9em; opacity: 0.9;">${album.descripcion}</p>` : ''}
            ${album.destacado ? '<span style="display: inline-block; margin-top: 10px; padding: 5px 15px; background: rgba(255,215,0,0.3); border: 2px solid gold; border-radius: 20px; font-size: 0.8em;">⭐ Destacado</span>' : ''}
        </div>
    `;
    content.appendChild(overlay);

    div.appendChild(content);
    return div;
}

/**
 * Navegar a la galería del álbum
 */
function abrirDetalle(albumTitulo) {
    console.log(`Navegando al álbum: ${albumTitulo}`);
    window.location.href = `portafolio-galeria.html?album=${encodeURIComponent(albumTitulo)}`;
}

/**
 * Configurar efectos de hover
 */
function setupHoverEffects() {
    const hoverItems = document.querySelectorAll('.js-hover-item');

    hoverItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.classList.add('is-hovering');
        });

        item.addEventListener('mouseleave', () => {
            item.classList.remove('is-hovering');
        });
    });
}

// Cargar portafolio cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Cargar álbumes dinámicamente
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
