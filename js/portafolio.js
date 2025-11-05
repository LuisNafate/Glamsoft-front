document.addEventListener('DOMContentLoaded', function() {
    
    // --- LÓGICA DE HOVER (ANIMACIÓN DORADA) CONTROLADA POR JS ---
    
    // Seleccionamos todos los elementos con la clase js-hover-item
    const hoverItems = document.querySelectorAll('.js-hover-item');

    hoverItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            // Añade la clase que tiene los estilos de animación
            item.classList.add('is-hovering');
        });

        item.addEventListener('mouseleave', () => {
            // Remueve la clase para que regrese a su estado normal
            item.classList.remove('is-hovering');
        });
    });

    // --- FUNCIÓN DE NAVEGACIÓN (EJEMPLO) ---
    // Esta función simula lo que sucedería al hacer clic en un recuadro.
    window.abrirDetalle = function(itemId) {
        console.log(`Navegando a la página de detalle del servicio: ${itemId}`);
        // Aquí iría el código real para cargar la nueva vista (ej: window.location.href = 'detalle_servicio.html?id=' + itemId;)
        alert(`Has seleccionado el ítem ${itemId}. Esto redirigiría a la vista de detalle.`);
    }

    // --- (Resto de tu código JS existente para la navegación principal, menú, etc.) ---
    
    const undoButton = document.getElementById('undo-button');
    const redoForwardButton = document.getElementById('redo-forward-button');
    const reloadButton = document.getElementById('reload-button');
    
    if (undoButton) { undoButton.addEventListener('click', (e) => { e.preventDefault(); window.history.back(); }); }
    if (redoForwardButton) { redoForwardButton.addEventListener('click', (e) => { e.preventDefault(); window.history.forward(); }); }
    if (reloadButton) { reloadButton.addEventListener('click', (e) => { e.preventDefault(); window.location.reload(); }); }
    
    // ... (Lógica de initializeIndicator, updateIndicator, categorías, etc. iría aquí) ...

});