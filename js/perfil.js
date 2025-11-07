document.addEventListener('DOMContentLoaded', () => {

    // (Asumiendo que tienes una función para cargar header/footer en header_footer.js)
    if (typeof loadHeaderFooter === 'function') {
        loadHeaderFooter();
    }

    // --- Referencias a los elementos ---
    const viewProfileSection = document.getElementById('view-profile-section');
    const editProfileSection = document.getElementById('edit-profile-section');
    
    const editButton = document.getElementById('btn-edit');
    const cancelButton = document.getElementById('btn-cancel');
    const saveButton = document.getElementById('btn-save');

    // --- Validar que todos los elementos existan ---
    if (!viewProfileSection || !editProfileSection || !editButton || !cancelButton || !saveButton) {
        console.error('Error: Faltan elementos clave en la página de perfil.');
        return;
    }

    // --- Funciones para cambiar de vista ---
    function showEditView() {
        viewProfileSection.classList.add('hidden');
        editProfileSection.classList.remove('hidden');
    }

    function showProfileView() {
        editProfileSection.classList.add('hidden');
        viewProfileSection.classList.remove('hidden');
    }

    // --- Asignar Eventos ---
    
    // Al hacer clic en "Editar" -> Mostrar formulario de edición
    editButton.addEventListener('click', showEditView);

    // Al hacer clic en "Cancelar" -> Volver a la vista de perfil
    cancelButton.addEventListener('click', showProfileView);

    // Al hacer clic en "Guardar" -> (Simulación) Guardar y volver a la vista de perfil
    saveButton.addEventListener('click', () => {
        // Aquí iría tu lógica para enviar el formulario (fetch, etc.)
        
        alert('¡Perfil actualizado con éxito! (Simulación)');
        
        // Después de guardar, vuelve a la vista de perfil
        showProfileView();
    });

});