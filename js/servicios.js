// ========== CARGA DE SERVICIOS DESDE LA API ==========

let serviciosData = [];

// Cargar servicios desde la API
async function loadServicios() {
    try {
        console.log('🔄 Cargando servicios desde API...');
        
        // Obtener servicios de la API
        const response = await ServiciosService.getAll();
        console.log('✅ Respuesta de API:', response);
        
        // La API puede retornar directamente un array o un objeto con propiedad servicios
        serviciosData = Array.isArray(response) ? response : (response.servicios || response.data || []);
        
        console.log('📦 Servicios cargados:', serviciosData.length);
        
        if (serviciosData.length === 0) {
            console.warn('⚠️ No hay servicios disponibles, usando datos de respaldo');
            loadMockData();
            return;
        }
        
        // Renderizar servicios
        renderServicesList();
        renderServiceDetails();
        
    } catch (error) {
        console.error('❌ Error al cargar servicios:', error);
        
        // Cargar datos de respaldo (mock)
        loadMockData();
    }
}

// Datos de respaldo si la API falla
function loadMockData() {
    console.log('📋 Cargando datos de respaldo (mock)');
    serviciosData = [
        {
            idServicio: 1,
            nombreServicio: "Corte Clásico",
            duracionMinutos: 30,
            descripcion: "Corte de cabello tradicional con lavado incluido. Perfecto para mantener tu estilo clásico.",
            precio: 200.00,
            imagen: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
            idCategoria: 1
        },
        {
            idServicio: 2,
            nombreServicio: "Corte y Barba",
            duracionMinutos: 45,
            descripcion: "Corte de cabello y arreglo de barba profesional. Servicio completo para el caballero moderno.",
            precio: 350.00,
            imagen: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800",
            idCategoria: 1
        },
        {
            idServicio: 3,
            nombreServicio: "Tinte Completo",
            duracionMinutos: 120,
            descripcion: "Tinte de cabello completo con decoloración. Cambia tu look con colores vibrantes.",
            precio: 800.00,
            imagen: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800",
            idCategoria: 2
        }
    ];
    
    renderServicesList();
    renderServiceDetails();
}

// Verificar si el usuario está autenticado
function isUserAuthenticated() {
    // Verificar si existe token en localStorage
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    return !!token;
}

// Renderizar lista de servicios
function renderServicesList() {
    const listContainer = document.querySelector('.services-list');
    if (!listContainer) {
        console.error('❌ No se encontró el contenedor .services-list');
        return;
    }
    
    listContainer.innerHTML = ''; // Limpiar contenido previo
    
    console.log('📝 Renderizando lista de servicios:', serviciosData.length);
    
    serviciosData.forEach(servicio => {
        const serviceId = servicio.idServicio || servicio.id;
        const serviceName = servicio.nombreServicio || servicio.nombre;
        
        const div = document.createElement('div');
        div.className = 'service-item';
        div.onclick = () => scrollToService(`service${serviceId}`);
        div.innerHTML = `<span>${serviceName}</span><span>${serviceId.toString().padStart(3,'0')}</span>`;
        listContainer.appendChild(div);
    });
}

// Renderizar detalles de servicios
function renderServiceDetails() {
    const detailsContainer = document.querySelector('.services-details');
    if (!detailsContainer) {
        console.error('❌ No se encontró el contenedor .services-details');
        return;
    }
    
    detailsContainer.innerHTML = ''; // Limpiar contenido previo
    
    console.log('🎨 Renderizando detalles de servicios');
    
    serviciosData.forEach(servicio => {
        const serviceId = servicio.idServicio || servicio.id;
        const serviceName = servicio.nombreServicio || servicio.nombre;
        const serviceDesc = servicio.descripcion || 'Sin descripción disponible';
        const servicePrice = servicio.precio || 0;
        const serviceDuration = servicio.duracionMinutos || servicio.duracion || 60;
        const serviceImage = servicio.imagen || servicio.imagenURL || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800';
        
        // Convertir minutos a formato legible
        const hours = Math.floor(serviceDuration / 60);
        const mins = serviceDuration % 60;
        let timeStr = '';
        if (hours > 0) timeStr += `${hours} hora${hours > 1 ? 's' : ''}`;
        if (mins > 0) timeStr += ` ${mins} minutos`;
        if (!timeStr) timeStr = 'A consultar';
        
        const section = document.createElement('section');
        section.className = 'service-detail';
        section.id = `service${serviceId}`;
        
        section.innerHTML = `
            <div class="service-image">
                <img src="${serviceImage}" 
                     alt="${serviceName}"
                     onerror="this.src='https://via.placeholder.com/800x600?text=${encodeURIComponent(serviceName)}'">
            </div>
            <div class="service-info">
                <h2>${serviceName}</h2>
                <div class="info-item">
                    <h3>Tiempo Aprox.</h3>
                    <p>${timeStr}</p>
                </div>
                <div class="info-item">
                    <h3>Descripción</h3>
                    <p>${serviceDesc}</p>
                </div>
                <div class="price-section">
                    <h3>Precio $${servicePrice.toFixed(2)}</h3>
                    <button class="agendar-btn" data-service-id="${serviceId}">Agendar +</button>
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

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando página de servicios...');
    
    // Cargar servicios desde la API
    await loadServicios();

    // Botones agendar con validación de autenticación
    document.body.addEventListener('click', e => {
        if (e.target.classList.contains('agendar-btn')) {
            e.preventDefault();
            
            const servicioId = e.target.getAttribute('data-service-id');
            const servicio = serviciosData.find(s => (s.idServicio || s.id) == servicioId);
            
            console.log('🎯 Servicio seleccionado:', servicio);
            
            // Verificar si el usuario está autenticado
            if (isUserAuthenticated()) {
                // Guardar servicio seleccionado
                sessionStorage.setItem('selectedService', JSON.stringify(servicio));
                
                // Usuario autenticado: redirigir a la página de agendar
                console.log('✅ Usuario autenticado, redirigiendo a agendar.html');
                window.location.href = "agendar.html";
            } else {
                // Usuario NO autenticado: mostrar modal de login
                console.log('⚠️ Usuario no autenticado, mostrando modal de login');
                sessionStorage.setItem('redirectAfterAuth', window.location.href);
                sessionStorage.setItem('selectedService', JSON.stringify(servicio));
                alert('Debes iniciar sesión para agendar un servicio');
                window.location.href = 'login.html';
            }
        }
    });

    // Resaltar servicio activo
    const serviceItems = document.querySelectorAll('.service-item');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                serviceItems.forEach(i => i.style.backgroundColor = '');
                const serviceId = entry.target.id.replace('service', '');
                const index = serviciosData.findIndex(s => (s.idServicio || s.id) == serviceId);
                if(index >=0) serviceItems[index].style.backgroundColor = 'rgba(255,255,255,0.1)';
            }
        });
    }, { root: null, rootMargin: '-50% 0px -50% 0px', threshold: 0 });

    document.querySelectorAll('.service-detail').forEach(detail => observer.observe(detail));
    
    console.log('✅ Página de servicios inicializada');
});