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