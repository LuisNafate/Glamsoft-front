document.addEventListener('DOMContentLoaded', () => {
    
    console.log('Página de Promociones cargada correctamente.');

    // --- AQUÍ PUEDES AGREGAR JS ESPECÍFICO PARA PROMOCIONES ---

    // EJEMPLO: Animación simple de entrada para las tarjetas
    const cards = document.querySelectorAll('.promo-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Cuando la tarjeta entra en pantalla, se vuelve visible
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.2 }); // Se activa cuando el 20% de la tarjeta es visible

    cards.forEach(card => {
        // Estado inicial: invisible y un poco más abajo
        card.style.opacity = 0;
        card.style.transform = 'translateY(50px)';
        card.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        
        // Empezar a observar
        observer.observe(card);
    });

});