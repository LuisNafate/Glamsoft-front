document.addEventListener("DOMContentLoaded", () => {
    // --- LÓGICA DE VALIDACIÓN DEL FORMULARIO DE DATOS ---

    const appointmentForm = document.getElementById('appointment-data-form');

    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let isValid = true;
            
            // Seleccionar todos los campos requeridos
            const requiredInputs = appointmentForm.querySelectorAll('input[required]');

            requiredInputs.forEach(input => {
                const formGroup = input.closest('.form-group');
                const errorMessage = formGroup.querySelector('.error-message');

                if (input.value.trim() === '') {
                    // Muestra el error
                    formGroup.classList.add('error');
                    if (errorMessage) errorMessage.classList.remove('hidden');
                    isValid = false;
                } else {
                    // Remueve el error si el campo es válido
                    formGroup.classList.remove('error');
                    if (errorMessage) errorMessage.classList.add('hidden');
                }
            });

            if (isValid) {
                // Si todos los campos son válidos:
                alert('¡Datos de cita completados! Enviando al servidor. ¡Gracias por agendar!');
                console.log('Formulario válido. Datos listos para ser procesados.');
                // Aquí iría la lógica para enviar los datos (fetch/AJAX)
                // appointmentForm.reset();
            } else {
                console.log('Formulario inválido. Errores mostrados al usuario.');
            }
        });
        
        // Lógica para el botón Cancelar
        const btnCancel = appointmentForm.querySelector('.btn-cancel');
        btnCancel.addEventListener('click', () => {
            alert('Formulario cancelado. Redirigiendo a la vista anterior.');
            window.history.back();
        });
    }

    // --- Asegúrate de que tu lógica de navegación y menú persista ---
    // (Tu código JS existente para undoButton, reloadButton, categoriasLink, etc., debe estar en este mismo archivo).

});