// Mock de API
const serviciosMock = [
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

// Renderizar lista de servicios
function renderServicesList() {
    const listContainer = document.querySelector('.services-list');
    serviciosMock.forEach(servicio => {
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
    serviciosMock.forEach(servicio => {
        const section = document.createElement('section');
        section.className = 'service-detail';
        section.id = `service${servicio.id}`;
        section.innerHTML = `
            <div class="service-image">
                <img src="${servicio.imagen}" alt="${servicio.nombre}">
            </div>
            <div class="service-info">
                <h2>${servicio.nombre}</h2>
                <div class="info-item">
                    <h3>Tiempo Aprox.</h3>
                    <p>${servicio.tiempo}</p>
                </div>
                <div class="info-item">
                    <h3>Descripción</h3>
                    <p>${servicio.descripcion}</p>
                </div>
                <div class="info-item">
                    <h3>Lo que incluye</h3>
                    <ul>${servicio.incluye.map(i => `<li>${i}</li>`).join('')}</ul>
                </div>
                <div class="price-section">
                    <h3>Precio $${servicio.precio}</h3>
                    <button class="agendar-btn">Agendar +</button>
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
document.addEventListener('DOMContentLoaded', () => {
    renderServicesList();
    renderServiceDetails();

    // Botones agendar
    // Botones agendar
document.body.addEventListener('click', e => {
    if (e.target.classList.contains('agendar-btn')) {
        // Redirigir a la página de agendar
        window.location.href = "agendar.html";
    }
});


    // Resaltar servicio activo
    const serviceItems = document.querySelectorAll('.service-item');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                serviceItems.forEach(i => i.style.backgroundColor = '');
                const index = serviciosMock.findIndex(s => `service${s.id}` === entry.target.id);
                if(index >=0) serviceItems[index].style.backgroundColor = 'rgba(255,255,255,0.1)';
            }
        });
    }, { root: null, rootMargin: '-50% 0px -50% 0px', threshold: 0 });

    document.querySelectorAll('.service-detail').forEach(detail => observer.observe(detail));
});
