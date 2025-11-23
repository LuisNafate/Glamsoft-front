document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== PERFIL.JS INICIADO ===');

    // 1. Verificar sesión inicial (LocalStorage)
    const userStr = localStorage.getItem('user_data');
    if (!userStr) {
        window.location.href = 'index.html'; 
        return;
    }
    
    // Cargar usuario base
    let currentUser = JSON.parse(userStr);
    
    // Asegurar ID (puede venir como idUsuario o id)
    const userId = currentUser.idUsuario || currentUser.id; 

    // ========================================
    // REFERENCIAS DOM
    // ========================================
    const dom = {
        views: {
            read: document.getElementById('view-profile-section'),
            edit: document.getElementById('edit-profile-section')
        },
        display: {
            name: document.getElementById('profile-name-display'),
            email: document.getElementById('view-email'),
            phone: document.getElementById('view-phone'),
            commentsList: document.getElementById('user-comments-list')
        },
        inputs: {
            name: document.getElementById('edit-username'),
            email: document.getElementById('edit-email'),
            phone: document.getElementById('edit-phone'),
            pass: document.getElementById('edit-pass'),
            passConfirm: document.getElementById('edit-pass-confirm')
        },
        errors: {
            name: document.getElementById('error-username'),
            email: document.getElementById('error-email'),
            phone: document.getElementById('error-phone'),
            pass: document.getElementById('error-pass'),
            passConfirm: document.getElementById('error-pass-confirm')
        },
        buttons: {
            edit: document.getElementById('btn-edit'),
            cancel: document.getElementById('btn-cancel'),
            save: document.getElementById('btn-save')
        },
        modals: {
            overlay: document.getElementById('profile-modal-overlay'),
            confirm: document.getElementById('profile-confirm-modal'),
            success: document.getElementById('profile-success-modal'),
            closeX: document.getElementById('modal-close-x'),
            cancelBtn: document.getElementById('modal-cancel-btn'),
            confirmBtn: document.getElementById('modal-confirm-btn'),
            successBtn: document.getElementById('profile-close-modal')
        }
    };

    // ========================================
    // 1. CARGA DE DATOS DE USUARIO (FRESCOS)
    // ========================================
    async function loadUserData() {
        try {
            if (userId) {
                // Pedimos datos actualizados a la API
                const response = await UsuariosService.getById(userId);
                
                // Extraemos el usuario (API devuelve { status:..., data: {usuario} })
                // A veces el http service ya devuelve data, así que verificamos
                const freshUser = response.data || response;
                
                if (freshUser) {
                    currentUser = freshUser;
                    // Actualizamos el local storage para mantener consistencia
                    localStorage.setItem('user_data', JSON.stringify(freshUser));
                }
            }
        } catch (error) {
            console.warn("No se pudo actualizar usuario desde API, usando caché local:", error);
        }

        // Pintar datos en pantalla
        dom.display.name.textContent = currentUser.nombre || 'Usuario';
        dom.display.email.value = currentUser.email || '';
        // ✅ CORRECCIÓN: Manejar undefined/null en teléfono
        dom.display.phone.value = currentUser.telefono || ''; 

        // Cargar comentarios
        loadUserComments();
    }

    // ========================================
    // 2. CARGA DE COMENTARIOS (Lógica Recuperada)
    // ========================================
    async function loadUserComments() {
        if (!userId) {
            dom.display.commentsList.innerHTML = '<p style="color: #aaa;">No se encontró ID de usuario.</p>';
            return;
        }

        try {
            const response = await ComentariosService.getByClient(userId);
            console.log("Respuesta Comentarios:", response);

            // ✅ LÓGICA QUE TE FUNCIONABA: Abrir la "caja"
            // response = Objeto HTTP
            // response.data = JSON de la API ({ status: "success", data: [...] })
            // response.data.data = El array de comentarios real
            
            let commentsArray = [];

            if (response.data && Array.isArray(response.data.data)) {
                commentsArray = response.data.data;
            } else if (Array.isArray(response.data)) {
                // Por si acaso la API cambia y devuelve el array directo
                commentsArray = response.data;
            } else if (Array.isArray(response)) {
                commentsArray = response;
            }

            renderComments(commentsArray);

        } catch (error) {
            console.error('Error al cargar comentarios:', error);
            dom.display.commentsList.innerHTML = '<p style="color: #aaa; padding: 10px;">Aún no has realizado comentarios.</p>';
        }
    }

    function renderComments(comments) {
        dom.display.commentsList.innerHTML = '';

        if (!comments || comments.length === 0) {
            dom.display.commentsList.innerHTML = '<p style="color: #aaa; padding: 10px;">Aún no has realizado comentarios.</p>';
            return;
        }

        comments.forEach(comentario => {
            // Extraer texto (puede venir como 'contenido' o 'comentario')
            const texto = comentario.contenido || comentario.comentario || "Sin contenido";
            
            // Formatear fecha
            let fecha = 'Fecha desconocida';
            const rawDate = comentario.fecha || comentario.fechaComentario;
            
            if (Array.isArray(rawDate)) {
                // Si viene de Java como [2025, 11, 24, ...]
                fecha = `${rawDate[2]}/${rawDate[1]}/${rawDate[0]}`;
            } else if (rawDate) {
                try {
                    fecha = new Date(rawDate).toLocaleDateString();
                } catch(e) {}
            }

            // Información del servicio
            let servicioInfo = 'Servicio general';
            if (comentario.cita && comentario.cita.servicio) {
                servicioInfo = comentario.cita.servicio;
            } else if (comentario.nombre_servicio) {
                servicioInfo = comentario.nombre_servicio;
            } else if (comentario.cita) {
                const idCita = typeof comentario.cita === 'object' ? comentario.cita.idCita : comentario.cita;
                servicioInfo = `Cita #${idCita}`;
            }

            const commentBox = document.createElement('div');
            commentBox.className = 'comment-box';
            commentBox.style.cssText = `
                background-color: #1a1a1a; 
                border: 1px solid #333; 
                border-radius: 4px; 
                padding: 15px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                min-height: 100px;
                margin-bottom: 10px;
            `;
            
            commentBox.innerHTML = `
                <p style="font-size: 0.9rem; color: #ddd; line-height: 1.5; font-style: italic;">"${texto}"</p>
                <div style="margin-top: 10px; font-size: 0.8rem; color: #B8860B; display: flex; justify-content: space-between; border-top: 1px solid #333; padding-top: 8px;">
                    <span>${servicioInfo}</span>
                    <span>${fecha}</span>
                </div>
            `;
            
            dom.display.commentsList.appendChild(commentBox);
        });
    }

    // ========================================
    // 3. EDICIÓN Y GUARDADO (Manteniendo fixes)
    // ========================================
    function showEditView() {
        dom.inputs.name.value = currentUser.nombre || '';
        dom.inputs.email.value = currentUser.email || '';
        dom.inputs.phone.value = currentUser.telefono || '';
        dom.inputs.pass.value = '';
        dom.inputs.passConfirm.value = '';
        
        clearAllErrors();
        dom.views.read.classList.add('hidden');
        dom.views.edit.classList.remove('hidden');
    }

    function hideEditView() {
        dom.views.edit.classList.add('hidden');
        dom.views.read.classList.remove('hidden');
    }

    function validateForm() {
        let isValid = true;
        clearAllErrors();

        if (!dom.inputs.name.value.trim()) {
            showError(dom.inputs.name, dom.errors.name, 'El nombre es obligatorio.');
            isValid = false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dom.inputs.email.value.trim())) {
            showError(dom.inputs.email, dom.errors.email, 'Email inválido.');
            isValid = false;
        }
        if (!dom.inputs.phone.value.trim()) {
            showError(dom.inputs.phone, dom.errors.phone, 'Teléfono obligatorio.');
            isValid = false;
        }
        if (dom.inputs.pass.value) {
            if (dom.inputs.pass.value.length < 8) {
                showError(dom.inputs.pass, dom.errors.pass, 'Mínimo 8 caracteres.');
                isValid = false;
            }
            if (dom.inputs.pass.value !== dom.inputs.passConfirm.value) {
                showError(dom.inputs.passConfirm, dom.errors.passConfirm, 'Las contraseñas no coinciden.');
                isValid = false;
            }
        }
        return isValid;
    }

    function showError(input, errorSpan, msg) {
        input.style.borderColor = '#e74c3c';
        errorSpan.textContent = msg;
        errorSpan.style.display = 'block';
    }

    function clearAllErrors() {
        Object.values(dom.errors).forEach(span => { span.style.display = 'none'; });
        Object.values(dom.inputs).forEach(input => { input.style.borderColor = ''; });
    }

    async function saveProfile() {
        const updateData = {
            idUsuario: userId,
            nombre: dom.inputs.name.value.trim(),
            email: dom.inputs.email.value.trim(),
            telefono: dom.inputs.phone.value.trim(),
            idRol: currentUser.idRol || currentUser.rol || 3, 
            activo: true
        };

        if (dom.inputs.pass.value) {
            updateData.password = dom.inputs.pass.value;
        }

        try {
            const response = await UsuariosService.update(updateData);
            
            // El servicio devuelve response.data, así que verificamos
            if (response) {
                // Actualizar localmente
                const updatedUser = { ...currentUser, ...updateData };
                delete updatedUser.password;
                currentUser = updatedUser;
                localStorage.setItem('user_data', JSON.stringify(updatedUser));
                
                // Actualizar vista
                dom.display.name.textContent = updatedUser.nombre;
                dom.display.email.value = updatedUser.email;
                dom.display.phone.value = updatedUser.telefono;
                
                closeModal(dom.modals.confirm);
                openModal(dom.modals.success);
            }
        } catch (error) {
            console.error('Error al actualizar:', error);
            alert('Error al actualizar perfil. Intente nuevamente.');
            closeModal(dom.modals.confirm);
        }
    }

    function openModal(modal) {
        dom.modals.overlay.style.display = 'block';
        modal.style.display = 'block';
        setTimeout(() => {
            dom.modals.overlay.classList.add('show');
            modal.classList.add('show');
        }, 10);
    }

    function closeModal(modal) {
        dom.modals.overlay.classList.remove('show');
        modal.classList.remove('show');
        setTimeout(() => {
            dom.modals.overlay.style.display = 'none';
            modal.style.display = 'none';
        }, 300);
    }

    // Listeners
    dom.buttons.edit.addEventListener('click', showEditView);
    dom.buttons.cancel.addEventListener('click', hideEditView);
    dom.buttons.save.addEventListener('click', () => {
        if (validateForm()) openModal(dom.modals.confirm);
    });

    dom.modals.cancelBtn.addEventListener('click', () => closeModal(dom.modals.confirm));
    dom.modals.closeX.addEventListener('click', () => closeModal(dom.modals.confirm));
    dom.modals.confirmBtn.addEventListener('click', saveProfile);

    dom.modals.successBtn.addEventListener('click', () => {
        closeModal(dom.modals.success);
        hideEditView();
        window.location.reload(); // Recargar para asegurar datos frescos
    });

    // INICIAR
    loadUserData();
});