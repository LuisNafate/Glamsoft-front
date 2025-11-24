document.addEventListener('DOMContentLoaded', async () => {
    
    console.log('Página de Promociones cargada correctamente.');

    const promoContainer = document.querySelector('.promo-container');
    
    try {
        // Cargar promociones desde la API
        const response = await fetch('http://98.86.212.2:7000/api/promociones');
        const data = await response.json();
        
        console.log('Respuesta de promociones:', data);
        
        if (data.data && data.data.length > 0) {
            const promociones = data.data;
            
            // Filtrar promociones activas y próximas (excluir solo las expiradas)
            const hoy = new Date();
            const promocionesDisponibles = promociones.filter(promo => {
                // Las fechas vienen como [año, mes, día]
                let fin;
                if (Array.isArray(promo.fechaFin)) {
                    const [year, month, day] = promo.fechaFin;
                    fin = new Date(year, month - 1, day);
                } else {
                    fin = new Date(promo.fechaFin);
                }
                
                // Mostrar solo si no ha expirado
                return hoy <= fin;
            });
            
            if (promocionesDisponibles.length > 0) {
                // Limpiar contenedor y agregar promociones
                promoContainer.innerHTML = '';
                
                promocionesDisponibles.forEach(promo => {
                    const descuento = promo.porcentajeDescuento || promo.descuento || 0;
                    const descuentoTexto = `${descuento}%`;
                    
                    const card = document.createElement('section');
                    card.className = 'promo-card';
                    card.style.backgroundImage = 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(\'../img/promo1.jpg\')';
                    card.innerHTML = `
                        <div class="promo-content">
                            <h2 class="promo-title">${promo.nombre}</h2>
                            <p class="promo-desc">${promo.descripcion || 'Aprovecha un descuento de ' + descuentoTexto}</p>
                            <button class="btn-promo agendar-ahora">AGENDAR AHORA</button>
                        </div>
                    `;
                    
                    // Estilo inicial para animación
                    card.style.opacity = 0;
                    card.style.transform = 'translateY(50px)';
                    card.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
                    
                    promoContainer.appendChild(card);

                    const agendarAhoraBtn = card.querySelector('.agendar-ahora');
                    agendarAhoraBtn.addEventListener('click', () => {
                        window.location.href = 'agendar.html';
                    });
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