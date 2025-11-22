// ========== CARGA DE SERVICIOS DESDE LA API ==========

let serviciosData = [];

// Cargar servicios desde la API
async function loadServicios() {
    try {
        StateManager.setLoading(true);
        
        // Obtener servicios de la API
        const response = await ServiciosService.getAll({ activo: true });
        serviciosData = response.servicios || response;
        
        // Renderizar servicios
        renderServicesList();
        renderServiceDetails();
        
        StateManager.setLoading(false);
    } catch (error) {
        StateManager.setLoading(false);
        ErrorHandler.handle(error, {
            customMessage: 'No se pudieron cargar los servicios. Intenta recargar la página.',
            showToUser: true
        });
        
        // Cargar datos de respaldo (mock)
        loadMockData();
    }
}

// Datos de respaldo si la API falla
function loadMockData() {
    serviciosData = [
        {
            id: 1,
            nombre: "Servicio 001",
            tiempo: "1 hora 30 minutos",
            descripcion: "Una experiencia completa de belleza y cuidado personal diseñada para realzar tu elegancia natural.",
            incluye: ["Consulta personalizada", "Tratamiento especializado", "Productos premium incluidos"],
            precio: 120,
            imagen: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800"
        },
        {
            id: 2,
            nombre: "Servicio 002",
            tiempo: "2 horas",
            descripcion: "Tratamiento completo de lujo con técnicas avanzadas para resultados excepcionales.",
            incluye: ["Análisis profesional detallado", "Procedimiento premium", "Seguimiento post-tratamiento"],
            precio: 200,
            imagen: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800"
        },
        {
            id: 3,
            nombre: "Servicio 003",
            tiempo: "45 minutos",
            descripcion: "Servicio express para quienes buscan resultados rápidos sin comprometer la calidad.",
            incluye: ["Servicio rápido y eficiente", "Productos de alta gama", "Resultados inmediatos"],
            precio: 80,
            imagen: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800"
        }
    ];
    
    renderServicesList();
    renderServiceDetails();
}

// Verificar si el usuario está autenticado
function isUserAuthenticated() {
    return StateManager.isAuthenticated();
}

// Renderizar lista de servicios
function renderServicesList() {
    const listContainer = document.querySelector('.services-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = ''; // Limpiar contenido previo
    
    serviciosData.forEach(servicio => {
        const div = document.createElement('div');
        div.className = 'service-item';
        div.onclick = () => scrollToService(`service${servicio.id}`);
        div.innerHTML = `<span>${servicio.nombre}</span><span>${servicio.id.toString().padStart(3,'0')}</span>`;
        listContainer.appendChild(div);
    });
}

// Renderizar detalles de servicios
function renderServiceDetails() {
    const detailsContainer = document.querySelector('.services-details');
    if (!detailsContainer) return;
    
    detailsContainer.innerHTML = ''; // Limpiar contenido previo
    
    serviciosData.forEach(servicio => {
        const section = document.createElement('section');
        section.className = 'service-detail';
        section.id = `service${servicio.id}`;
        
        // Manejar incluye como array o string
        const incluyeHTML = Array.isArray(servicio.incluye) 
            ? servicio.incluye.map(i => `<li>${i}</li>`).join('')
            : `<li>${servicio.incluye}</li>`;
        
        section.innerHTML = `
            <div class="service-image">
                <img src="${servicio.imagen || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800'}" 
                     alt="${servicio.nombre}"
                     onerror="this.src='https://via.placeholder.com/800x600?text=${encodeURIComponent(servicio.nombre)}'">
            </div>
            <div class="service-info">
                <h2>${servicio.nombre}</h2>
                <div class="info-item">
                    <h3>Tiempo Aprox.</h3>
                    <p>${servicio.tiempo || servicio.duracion || 'A consultar'}</p>
                </div>
                <div class="info-item">
                    <h3>Descripción</h3>
                    <p>${servicio.descripcion}</p>
                </div>
                <div class="info-item">
                    <h3>Lo que incluye</h3>
                    <ul>${incluyeHTML}</ul>
                </div>
                <div class="price-section">
                    <h3>Precio $${servicio.precio}</h3>
                    <button class="agendar-btn" data-service-id="${servicio.id}">Agendar +</button>
                </div>
            </div>
        `;
        detailsContainer.appendChild(section);
    });
}

// Scroll suave
function scrollToService(serviceId) {
    document.getElementById(serviceId).scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Función para abrir el modal de autenticación
function openAuthModal() {
    // Esperar a que el modal esté cargado
    setTimeout(() => {
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.style.display = 'flex';
            // Guardar la URL de redirección después del login
            sessionStorage.setItem('redirectAfterAuth', 'agendar.html');
        } else {
            console.error('Modal de autenticación no encontrado');
        }
    }, 100);
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    // Cargar servicios desde la API
    await loadServicios();

    // Botones agendar con validación de autenticación
    document.body.addEventListener('click', e => {
        if (e.target.classList.contains('agendar-btn')) {
            e.preventDefault();
            
            const servicioId = e.target.getAttribute('data-service-id');
            const servicio = serviciosData.find(s => s.id == servicioId);
            
            // Verificar si el usuario está autenticado
            if (isUserAuthenticated()) {
                // Guardar servicio seleccionado en el estado
                StateManager.setAppointmentData({ service: servicio });
                
                // Usuario autenticado: redirigir a la página de agendar
                window.location.href = "agendar.html";
            } else {
                // Usuario NO autenticado: mostrar modal de login
                sessionStorage.setItem('redirectAfterAuth', 'agendar.html');
                sessionStorage.setItem('selectedService', JSON.stringify(servicio));
                openAuthModal();
            }
        }
    });

    // Resaltar servicio activo
    const serviceItems = document.querySelectorAll('.service-item');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                serviceItems.forEach(i => i.style.backgroundColor = '');
                const index = serviciosData.findIndex(s => `service${s.id}` === entry.target.id);
                if(index >=0) serviceItems[index].style.backgroundColor = 'rgba(255,255,255,0.1)';
            }
        });
    }, { root: null, rootMargin: '-50% 0px -50% 0px', threshold: 0 });

    document.querySelectorAll('.service-detail').forEach(detail => observer.observe(detail));
});