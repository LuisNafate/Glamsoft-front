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
 * Cargar trabajos del portafolio desde la API
 */
async function loadPortafolio() {
    try {
        // Obtener trabajos destacados (máximo 4 para la página de inicio)
        const trabajos = await PortafolioService.getDestacados(4);
        
        const portfolioGrid = document.querySelector('.portfolio-grid');
        if (!portfolioGrid) return;
        
        // Limpiar el contenido actual
        portfolioGrid.innerHTML = '';
        
        // Renderizar trabajos
        if (trabajos && trabajos.length > 0) {
            trabajos.forEach(trabajo => {
                const item = createPortfolioItem(trabajo);
                portfolioGrid.appendChild(item);
            });
        } else {
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
 * Crear elemento de portafolio
 */
function createPortfolioItem(trabajo) {
    const item = document.createElement('a');
    item.href = 'portafolio.html';
    item.className = 'portfolio-item';
    
    const img = document.createElement('img');
    img.src = trabajo.imagen || trabajo.url || 'https://images.pexels.com/photos/3373746/pexels-photo-3373746.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop';
    img.alt = trabajo.titulo || 'Trabajo';
    img.loading = 'lazy';
    
    const overlay = document.createElement('div');
    overlay.className = 'portfolio-overlay';
    
    const label = document.createElement('p');
    label.className = 'portfolio-label';
    label.textContent = trabajo.titulo || 'Trabajo';
    
    overlay.appendChild(label);
    item.appendChild(img);
    item.appendChild(overlay);
    
    return item;
}

/**
 * Cargar comentarios/valoraciones desde la API
 */
async function loadComentarios() {
    try {
        // Obtener valoraciones destacadas
        const valoraciones = await ValoracionesService.getAll({ destacadas: true, limit: 6 });
        
        const comentariosGrid = document.querySelector('.comentarios-grid');
        if (!comentariosGrid) return;
        
        // Limpiar el contenido actual
        comentariosGrid.innerHTML = '';
        
        // Renderizar comentarios
        if (valoraciones && valoraciones.length > 0) {
            valoraciones.forEach(valoracion => {
                const item = createComentarioItem(valoracion);
                comentariosGrid.appendChild(item);
            });
        } else {
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
    
    const texto = document.createElement('p');
    texto.style.cssText = 'font-size: 14px; color: #ccc; line-height: 1.6;';
    texto.textContent = `"${valoracion.comentario || valoracion.texto}"`;
    
    const autor = document.createElement('p');
    autor.style.cssText = 'font-size: 12px; color: #B8860B; margin-top: 10px;';
    
    // Renderizar estrellas si existe calificación
    let estrellas = '';
    if (valoracion.calificacion) {
        estrellas = '⭐'.repeat(valoracion.calificacion) + ' ';
    }
    
    autor.textContent = `${estrellas}- ${valoracion.usuario || valoracion.nombre || 'Usuario'}`;
    
    item.appendChild(texto);
    item.appendChild(autor);
    
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