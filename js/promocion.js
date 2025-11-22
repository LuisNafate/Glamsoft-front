document.addEventListener('DOMContentLoaded', async () => {
    
    console.log('Página de Promociones cargada correctamente.');

    const promoContainer = document.querySelector('.promo-container');
    
    try {
        // Cargar promociones desde la API
        const response = await fetch('http://localhost:7000/api/promociones');
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
            const promociones = data.data;
            
            // Filtrar solo promociones activas
            const hoy = new Date();
            const promocionesActivas = promociones.filter(promo => {
                const inicio = new Date(promo.fechaInicio);
                const fin = new Date(promo.fechaFin);
                return hoy >= inicio && hoy <= fin;
            });
            
            if (promocionesActivas.length > 0) {
                // Limpiar contenedor y agregar promociones
                promoContainer.innerHTML = '';
                
                promocionesActivas.forEach(promo => {
                    const descuentoTexto = promo.tipoDescuento === 'PORCENTAJE' 
                        ? `${promo.descuento}%` 
                        : `$${promo.descuento}`;
                    
                    const card = document.createElement('section');
                    card.className = 'promo-card';
                    card.style.backgroundImage = 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(\'../img/promo1.jpg\')';
                    card.innerHTML = `
                        <div class="promo-content">
                            <h2 class="promo-title">${promo.nombrePromocion}</h2>
                            <p class="promo-desc">Aprovecha un descuento de ${descuentoTexto}</p>
                            <a href="#" data-target="agendar.html" class="btn-promo">AGENDAR AHORA</a>
                        </div>
                    `;
                    
                    // Estilo inicial para animación
                    card.style.opacity = 0;
                    card.style.transform = 'translateY(50px)';
                    card.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
                    
                    promoContainer.appendChild(card);
                });
                
                // Aplicar animación con IntersectionObserver
                const cards = promoContainer.querySelectorAll('.promo-card');
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.style.opacity = 1;
                            entry.target.style.transform = 'translateY(0)';
                        }
                    });
                }, { threshold: 0.2 });
                
                cards.forEach(card => observer.observe(card));
            } else {
                mostrarSinPromociones();
            }
        } else {
            mostrarSinPromociones();
        }
    } catch (error) {
        console.error('Error al cargar promociones:', error);
        mostrarSinPromociones();
    }
    
    function mostrarSinPromociones() {
        const noPromosHTML = `
            <div class="no-promos-container">
                <span class="no-promos-text">No hay promociones disponibles</span>
                <div class="promo-dots">
                    <span class="promo-dot active"></span>
                    <span class="promo-dot"></span>
                    <span class="promo-dot"></span>
                </div>
            </div>
        `;
        promoContainer.innerHTML = noPromosHTML;
    }
});