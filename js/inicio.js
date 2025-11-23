// ===================================
// CARGA DE DATOS DESDE LA API
// ===================================

/**
 * Mostrar/ocultar indicador de carga
 */
function toggleLoader(show) {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

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
 * Cargar trabajos del portafolio desde la API (AGRUPADOS POR ÁLBUM)
 */
async function loadPortafolio() {
    try {
        // Obtener todos los trabajos
        const trabajos = await PortafolioService.getAll();

        console.log('📸 Datos de portafolio recibidos:', trabajos);

        const portfolioGrid = document.querySelector('.portfolio-grid');
        if (!portfolioGrid) return;

        // Limpiar el contenido actual
        portfolioGrid.innerHTML = '';

        // Renderizar trabajos
        if (trabajos && trabajos.length > 0) {
            // Agrupar por título (álbumes)
            const albumes = agruparPorTitulo(trabajos);
            console.log(`✅ ${albumes.length} álbumes encontrados`);

            // Tomar solo los primeros 4 álbumes destacados o los primeros 4
            const albumesDestacados = albumes
                .filter(a => a.destacado)
                .slice(0, 4);

            const albumesMostrar = albumesDestacados.length >= 4
                ? albumesDestacados
                : albumes.slice(0, 4);

            albumesMostrar.forEach(album => {
                console.log('Álbum:', album);
                const item = createPortfolioItem(album);
                portfolioGrid.appendChild(item);
            });
        } else {
            console.log('⚠️ No hay trabajos en el portafolio');
            portfolioGrid.innerHTML = '<p style="text-align: center; color: #ccc; padding: 40px;">No hay trabajos disponibles en el portafolio</p>';
        }

    } catch (error) {
        console.error('Error al cargar portafolio:', error);
        const portfolioGrid = document.querySelector('.portfolio-grid');
        if (portfolioGrid) {
            portfolioGrid.innerHTML = '<p style="text-align: center; color: #ff6b6b; padding: 40px;">Error al cargar el portafolio</p>';
        }
    }
}

/**
 * Crear elemento de portafolio (ÁLBUM)
 */
function createPortfolioItem(album) {
    const item = document.createElement('a');
    // Enlazar a portafolio.html con el nombre del álbum
    item.href = `portafolio.html?album=${encodeURIComponent(album.titulo)}`;
    item.className = 'portfolio-item';

    const img = document.createElement('img');
    // Usar la imagen de portada del álbum
    img.src = album.portada || 'https://images.pexels.com/photos/3373746/pexels-photo-3373746.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop';
    img.alt = album.titulo || 'Álbum';
    img.loading = 'lazy';

    const overlay = document.createElement('div');
    overlay.className = 'portfolio-overlay';

    const label = document.createElement('p');
    label.className = 'portfolio-label';
    label.textContent = album.titulo || 'Álbum';

    // Mostrar cantidad de imágenes si es más de 1
    if (album.totalImagenes > 1) {
        const badge = document.createElement('span');
        badge.style.cssText = 'position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px;';
        badge.innerHTML = `<i class="fas fa-images"></i> ${album.totalImagenes}`;
        item.appendChild(badge);
    }

    overlay.appendChild(label);
    item.appendChild(img);
    item.appendChild(overlay);

    return item;
}

/**
 * Cargar destacados basados en las mejores valoraciones
 */
async function loadDestacados() {
    try {
        // Obtener todas las valoraciones
        const valoraciones = await ValoracionesService.getAll();
        console.log('⭐ Valoraciones para destacados:', valoraciones);

        const destacadoGrid = document.querySelector('.destacado-grid');
        if (!destacadoGrid) return;

        // Calcular promedio de valoraciones por servicio
        const serviciosValoraciones = {};

        valoraciones.forEach(val => {
            // El idServicio puede venir directo o dentro del objeto servicio
            const idServicio = val.idServicio || val.servicio?.idServicio;
            if (!idServicio) return;

            if (!serviciosValoraciones[idServicio]) {
                serviciosValoraciones[idServicio] = {
                    total: 0,
                    count: 0,
                    nombreServicio: val.nombreServicio || val.servicio?.nombre || 'Servicio'
                };
            }
            serviciosValoraciones[idServicio].total += val.calificacion || 0;
            serviciosValoraciones[idServicio].count++;
        });

        // Calcular promedio y ordenar
        const serviciosOrdenados = Object.entries(serviciosValoraciones)
            .map(([id, data]) => ({
                idServicio: id,
                promedio: data.total / data.count,
                nombreServicio: data.nombreServicio,
                totalValoraciones: data.count
            }))
            .sort((a, b) => b.promedio - a.promedio)
            .slice(0, 2); // Top 2

        console.log('🏆 Servicios más valorados:', serviciosOrdenados);

        // Obtener imágenes del portafolio para estos servicios
        const trabajos = await PortafolioService.getAll();

        // Limpiar grid
        destacadoGrid.innerHTML = '';

        if (serviciosOrdenados.length > 0) {
            serviciosOrdenados.forEach(servicio => {
                const div = document.createElement('div');
                div.className = 'destacado-item';

                // Buscar imagen relacionada o usar placeholder
                const imagenRelacionada = trabajos.find(t =>
                    t.categoria === servicio.nombreServicio ||
                    t.titulo?.toLowerCase().includes(servicio.nombreServicio.toLowerCase())
                );

                // Usar imágenes de Unsplash según el índice
                const imagenesUnsplash = [
                    'https://images.unsplash.com/photo-1675034743339-0b0747047727?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHNhbG9uJTIwZGUlMjBiZWxsZXphfGVufDB8fDB8fHww',
                    'https://images.unsplash.com/photo-1559599101-f09722fb4948?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                ];
                const indice = serviciosOrdenados.indexOf(servicio);
                const urlImagen = imagenRelacionada?.urlImagen ||
                                imagenesUnsplash[indice] ||
                                imagenesUnsplash[0];

                div.style.cssText = `background-image: url('${urlImagen}'); background-size: cover; background-position: center; position: relative;`;

                // Agregar overlay con información
                const overlay = document.createElement('div');
                overlay.style.cssText = 'position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); padding: 20px; color: white;';
                overlay.innerHTML = `
                    <h3 style="margin: 0; font-size: 18px; color: white;">${servicio.nombreServicio}</h3>
                    <p style="margin: 5px 0 0; font-size: 14px;">⭐ ${servicio.promedio.toFixed(1)}/5 (${servicio.totalValoraciones} valoraciones)</p>
                `;

                div.appendChild(overlay);
                destacadoGrid.appendChild(div);
            });
        } else {
            // Si no hay valoraciones, mostrar imágenes genéricas
            destacadoGrid.innerHTML = `
                <div class="destacado-item" style="background-image: url('https://images.unsplash.com/photo-1675034743339-0b0747047727?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHNhbG9uJTIwZGUlMjBiZWxsZXphfGVufDB8fDB8fHww'); background-size: cover; background-position: center;"></div>
                <div class="destacado-item" style="background-image: url('https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=1136&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'); background-size: cover; background-position: center;"></div>
            `;
        }

    } catch (error) {
        console.error('Error al cargar destacados:', error);
    }
}

/**
 * Cargar comentarios/valoraciones desde la API
 */
async function loadComentarios() {
    try {
        // Obtener todas las valoraciones (sin filtro de destacadas)
        const valoraciones = await ValoracionesService.getAll();

        console.log('💬 Datos de valoraciones recibidos:', valoraciones);

        const comentariosGrid = document.querySelector('.comentarios-grid');
        if (!comentariosGrid) return;

        // Limpiar el contenido actual
        comentariosGrid.innerHTML = '';

        // Renderizar comentarios
        if (valoraciones && valoraciones.length > 0) {
            // Ordenar por fecha (más reciente primero) y tomar solo 6
            const valoracionesOrdenadas = valoraciones
                .sort((a, b) => {
                    // Convertir fechas si vienen como arrays [año, mes, día, ...]
                    const fechaA = Array.isArray(a.fecha) ? new Date(...a.fecha.slice(0, 6)) : new Date(a.fecha);
                    const fechaB = Array.isArray(b.fecha) ? new Date(...b.fecha.slice(0, 6)) : new Date(b.fecha);
                    return fechaB - fechaA; // Más reciente primero
                })
                .slice(0, 6);

            console.log(`✅ Renderizando ${valoracionesOrdenadas.length} comentarios`);
            valoracionesOrdenadas.forEach(valoracion => {
                console.log('Valoración:', valoracion);
                const item = createComentarioItem(valoracion);
                comentariosGrid.appendChild(item);
            });
        } else {
            console.log('⚠️ No hay comentarios disponibles');
            comentariosGrid.innerHTML = '<p style="text-align: center; color: #ccc; padding: 40px; grid-column: 1/-1;">No hay comentarios disponibles</p>';
        }

    } catch (error) {
        console.error('Error al cargar comentarios:', error);
        const comentariosGrid = document.querySelector('.comentarios-grid');
        if (comentariosGrid) {
            comentariosGrid.innerHTML = '<p style="text-align: center; color: #ff6b6b; padding: 40px; grid-column: 1/-1;">Error al cargar comentarios</p>';
        }
    }
}

/**
 * Crear elemento de comentario
 */
function createComentarioItem(valoracion) {
    const item = document.createElement('div');
    item.className = 'comentario-item';
    item.style.cssText = 'padding: 20px; display: flex; flex-direction: column; justify-content: center;';

    // Comentario
    const texto = document.createElement('p');
    texto.style.cssText = 'font-size: 14px; color: #ccc; line-height: 1.6; margin-bottom: 8px;';
    texto.textContent = `"${valoracion.comentario || valoracion.texto || 'Sin comentario'}"`;

    // Información del cliente y calificación
    const infoCliente = document.createElement('p');
    infoCliente.style.cssText = 'font-size: 12px; color: #B8860B; margin-top: 10px;';

    // Obtener el nombre del usuario
    const nombreUsuario = valoracion.nombreCliente ||
                         valoracion.usuario ||
                         valoracion.nombre ||
                         valoracion.cliente?.nombre ||
                         'Cliente';

    // Obtener calificación
    const calificacion = valoracion.calificacion ? `${valoracion.calificacion}/5` : '';

    infoCliente.textContent = `- ${nombreUsuario}${calificacion ? ` (${calificacion})` : ''}`;

    // Información del servicio y estilista
    const infoServicio = document.createElement('p');
    infoServicio.style.cssText = 'font-size: 11px; color: #999; margin-top: 5px; font-style: italic;';

    const servicio = valoracion.nombreServicio || valoracion.servicio?.nombre || '';
    const estilista = valoracion.nombreEstilista || valoracion.estilista?.nombre || '';

    let infoTexto = [];
    if (servicio) infoTexto.push(`Servicio: ${servicio}`);
    if (estilista) infoTexto.push(`Estilista: ${estilista}`);

    if (infoTexto.length > 0) {
        infoServicio.textContent = infoTexto.join(' | ');
    }

    item.appendChild(texto);
    item.appendChild(infoCliente);
    if (infoTexto.length > 0) {
        item.appendChild(infoServicio);
    }

    return item;
}

// ===================================
// INICIALIZACIÓN
// ===================================
document.addEventListener('DOMContentLoaded', async function() {
    // Mostrar indicador de carga
    toggleLoader(true);
    
    // Aplicar animaciones de entrada
    const sections = document.querySelectorAll('.portfolio-section, .destacado-section, .comentarios-section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    try {
        // Cargar datos desde la API
        await Promise.all([
            loadPortafolio(),
            loadDestacados(),
            loadComentarios()
        ]);
    } catch (error) {
        console.error('Error al cargar datos de la página:', error);
    } finally {
        // Ocultar indicador de carga
        toggleLoader(false);
    }
});

// ===================================
// NAVEGACIÓN: Botones de control
// ===================================
const undoButton = document.getElementById('undo-button');
const reloadButton = document.getElementById('reload-button');

if (undoButton) {
    undoButton.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Botón RETROCEDER presionado.');
        window.history.back(); 
    });
}

if (reloadButton) {
    reloadButton.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Botón RECARGAR presionado.');
        window.location.reload(); 
    });
}

// ===================================
// MENÚ DESPLEGABLE DE CATEGORÍAS
// ===================================
const categoriasLink = document.getElementById('categorias-link');
const categoriasMenu = document.getElementById('categorias-menu');
const arrowIcon = categoriasLink ? categoriasLink.querySelector('i') : null;

if (categoriasLink && categoriasMenu && arrowIcon) {
    // Toggle del menú al hacer clic
    categoriasLink.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        categoriasMenu.classList.toggle('visible');
        
        // Cambiar el ícono de flecha
        if (categoriasMenu.classList.contains('visible')) {
            arrowIcon.classList.remove('fa-chevron-down');
            arrowIcon.classList.add('fa-chevron-up');
        } else {
            arrowIcon.classList.remove('fa-chevron-up');
            arrowIcon.classList.add('fa-chevron-down');
        }
    });

    // Cerrar el menú al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!categoriasLink.contains(e.target) && !categoriasMenu.contains(e.target)) {
            categoriasMenu.classList.remove('visible');
            arrowIcon.classList.remove('fa-chevron-up');
            arrowIcon.classList.add('fa-chevron-down');
        }
    });

    // Prevenir que se cierre al hacer clic dentro del menú
    if (categoriasMenu) {
        categoriasMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

// ===================================
// BOTÓN AGENDAR
// ===================================
const agendarButton = document.querySelector('.btn-agendar');
if (agendarButton) {
    agendarButton.addEventListener('click', function() {
        console.log('Botón AGENDAR presionado. ¡Listo para la siguiente vista!');
        // Aquí puedes agregar la lógica para redirigir o abrir un modal
    });
}

// ===================================
// SMOOTH SCROLL para enlaces internos
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Evitar que los enlaces del dropdown y el toggle causen scroll
        if (href === '#' || this.id === 'categorias-link') {
            return;
        }
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Cerrar el dropdown si está abierto
            if (categoriasMenu && categoriasMenu.classList.contains('visible')) {
                categoriasMenu.classList.remove('visible');
                if (arrowIcon) {
                    arrowIcon.classList.remove('fa-chevron-up');
                    arrowIcon.classList.add('fa-chevron-down');
                }
            }
        }
    });
});

// ===================================
// ANIMACIÓN DE ENTRADA AL SCROLL
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Aplicar animación a las secciones
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.portfolio-section, .destacado-section, .comentarios-section');
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});

// ===================================
// EFECTO PARALLAX EN HERO
// ===================================
window.addEventListener('scroll', function() {
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        heroImage.style.transform = `translateY(${parallax}px)`;
    }
});

// ===================================
// EFECTO DE CARGA SUAVE
// ===================================
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// ===================================
// DETECCIÓN DE VISTA MÓVIL
// ===================================
const createMobileMenu = () => {
    if (window.innerWidth <= 768) {
        console.log('Vista móvil detectada');
        // Aquí puedes agregar lógica adicional para un menú hamburguesa si lo necesitas
    }
};

window.addEventListener('resize', createMobileMenu);
createMobileMenu();