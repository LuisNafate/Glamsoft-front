// ===================================
// GALERÍA DE ÁLBUM DE PORTAFOLIO
// ===================================

/**
 * Obtener parámetros de la URL
 */
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * Agrupar imágenes por título
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
                imagenes: []
            };
        }

        // Agregar imagen al grupo
        grupos[titulo].imagenes.push(img);

        // Si es destacada, marcar el álbum como destacado
        if (img.destacado) {
            grupos[titulo].destacado = true;
        }
    });

    return Object.values(grupos);
}

/**
 * Cargar y mostrar galería del álbum
 */
async function loadGallery() {
    const albumTitulo = decodeURIComponent(getUrlParameter('album') || '');

    if (!albumTitulo) {
        showError('No se especificó un álbum');
        return;
    }

    console.log('Cargando álbum:', albumTitulo);

    // Mostrar loader
    const loader = document.getElementById('global-loader');
    if (loader) loader.style.display = 'flex';

    try {
        // Obtener todas las imágenes del portafolio
        const todasLasImagenes = await PortafolioService.getAll();
        console.log('Total de imágenes obtenidas:', todasLasImagenes.length);

        // Agrupar por título
        const albumes = agruparPorTitulo(todasLasImagenes);
        console.log('Álbumes encontrados:', albumes.map(a => a.titulo));

        // Buscar el álbum específico
        const album = albumes.find(a => a.titulo === albumTitulo);

        if (!album || album.imagenes.length === 0) {
            showError('No se encontraron imágenes en este álbum');
            return;
        }

        console.log('Álbum encontrado:', album);
        console.log('Total de imágenes en el álbum:', album.imagenes.length);

        // Actualizar título y descripción
        document.getElementById('albumTitle').textContent = album.titulo;
        document.getElementById('albumDescription').textContent = album.descripcion || '';

        // Renderizar imágenes
        renderImages(album.imagenes);

    } catch (error) {
        console.error('Error al cargar galería:', error);
        showError('Error al cargar la galería del álbum');
    } finally {
        // Ocultar loader
        if (loader) loader.style.display = 'none';
    }
}

/**
 * Renderizar imágenes en el grid
 */
function renderImages(imagenes) {
    const grid = document.getElementById('imagesGrid');
    const emptyState = document.getElementById('emptyState');

    if (!grid) return;

    if (imagenes.length === 0) {
        grid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Ordenar: primero las destacadas (portada)
    const imagenesOrdenadas = [...imagenes].sort((a, b) => {
        if (a.destacado && !b.destacado) return -1;
        if (!a.destacado && b.destacado) return 1;
        return 0;
    });

    grid.innerHTML = imagenesOrdenadas.map(img => {
        const imageSrc = img.urlImagen || 'https://via.placeholder.com/300x350?text=Sin+imagen';

        return `
            <div class="image-item ${img.destacado ? 'portada' : ''}" onclick="openLightbox('${imageSrc}')">
                <img src="${imageSrc}"
                     alt="${img.titulo || 'Imagen'}"
                     loading="lazy">
            </div>
        `;
    }).join('');

    console.log(`✅ Renderizadas ${imagenes.length} imágenes`);
}

/**
 * Mostrar error
 */
function showError(message) {
    const grid = document.getElementById('imagesGrid');
    const emptyState = document.getElementById('emptyState');

    if (grid) grid.innerHTML = '';
    if (emptyState) {
        emptyState.style.display = 'block';
        emptyState.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error</h3>
            <p>${message}</p>
            <a href="portafolio.html" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 25px;">
                Volver al Portafolio
            </a>
        `;
    }

    document.getElementById('albumTitle').textContent = 'Error';
    document.getElementById('albumDescription').textContent = '';
}

// Cargar galería cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    loadGallery();
});
