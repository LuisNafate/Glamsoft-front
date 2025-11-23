// js/header_footer.js

// ================== Header & Footer ==================
function loadHeaderFooter() {
    fetch('header_footer.html')
        .then(res => res.text())
        .then(html => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            document.body.appendChild(tempDiv);

            const headerTemplate = document.getElementById('header-template');
            document.getElementById('header-placeholder').appendChild(headerTemplate.content.cloneNode(true));

            const footerTemplate = document.getElementById('footer-template');
            document.getElementById('footer-placeholder').appendChild(footerTemplate.content.cloneNode(true));

            initDropdowns();
            initBellIcon(); 
        });
}

function initDropdowns() {
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const link = dropdown.querySelector('a');
        const menu = dropdown.querySelector('.dropdown-menu');

        link.addEventListener('mouseenter', () => menu.classList.add('visible'));
        link.addEventListener('mouseleave', () => menu.classList.remove('visible'));
        dropdown.addEventListener('mouseleave', () => menu.classList.remove('visible'));
    });
}

// ================== Modales Carga ==================
function loadModalNotificaciones() {
    fetch('modals/notificaciones.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('modal-placeholder').insertAdjacentHTML('beforeend', html);
            initNotificacionesModal();
        });
}

function loadModalAuth() {
    fetch('modals/register.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('modal-placeholder').insertAdjacentHTML('beforeend', html);
            // Esperamos un momento breve para asegurar que el DOM esté listo antes de asignar eventos
            setTimeout(() => initializeModalEvents(), 100);
        });
}

function loadModalProfileMenu() {
    const modalPlaceholder = document.getElementById('modal-placeholder');
    fetch('modals/profile_menu.html')
        .then(res => res.text())
        .then(html => {
            modalPlaceholder.insertAdjacentHTML('beforeend', html);
            initProfileMenuEvents();
            return fetch('modals/logout_confirm.html');
        })
        .then(res => res.text())
        .then(html => {
            const logoutPlaceholder = document.getElementById('modal-placeholder-logout');
            if (logoutPlaceholder) {
                logoutPlaceholder.insertAdjacentHTML('beforeend', html);
                initLogoutModalEvents();
            }
        });
}

function loadModalAgendar() {
    fetch('modals/agendar_servicios.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('modal-placeholder').insertAdjacentHTML('beforeend', html);
            initAgendarModal();
        });
}

// ================== LOGICA DE AUTH (LOGIN/REGISTRO) ==================
function initializeModalEvents() {
    const modal = document.getElementById('authModal');
    if (!modal) return;

    const showLoginBtn = document.getElementById('showLogin');
    const showRegisterBtn = document.getElementById('showRegister');
    const registerView = document.getElementById('registerView');
    const loginView = document.getElementById('loginView');
    
    const loginForm = document.getElementById('loginForm'); 
    const modalLoginForm = document.getElementById('modalLoginForm');
    const registerForm = document.getElementById('registerForm');

    // --- 1. VALIDACIÓN VISUAL DE ERRORES ---
    function showInputError(inputId, message) {
        const input = document.getElementById(inputId);
        if (!input) return;
        input.classList.add('input-error');
        // Intentar mostrar mensaje en contenedor específico si existe
        const msgDivId = inputId.includes('reg') ? 'registerMessage' : 'modalLoginMessage';
        const msgDiv = document.getElementById(msgDivId);
        if (msgDiv) {
            msgDiv.textContent = message;
            msgDiv.style.display = 'block';
        }
    }

    function clearInputError(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        input.classList.remove('input-error');
        const msgDivId = inputId.includes('reg') ? 'registerMessage' : 'modalLoginMessage';
        const msgDiv = document.getElementById(msgDivId);
        if (msgDiv) msgDiv.style.display = 'none';
    }

    // Limpiar errores al escribir
    ['reg-nombre', 'reg-email', 'reg-telefono', 'reg-password', 'reg-password-confirm'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => clearInputError(id));
    });

    // --- 2. VER/OCULTAR CONTRASEÑA (MEJORADA) ---
    function setupPasswordToggle(inputId, iconId) {
        const input = document.getElementById(inputId);
        const icon = document.getElementById(iconId);
        
        if (input && icon) {
            // Removemos listeners anteriores para evitar duplicados
            const newIcon = icon.cloneNode(true);
            icon.parentNode.replaceChild(newIcon, icon);
            
            newIcon.addEventListener('click', (e) => {
                e.preventDefault(); // Evitar que el click envíe formulario
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                newIcon.classList.toggle('fa-eye');
                newIcon.classList.toggle('fa-eye-slash');
            });
        } else {
            console.warn(`No se encontró input: ${inputId} o icono: ${iconId}`);
        }
    }
    
    // Configurar toggles
    setupPasswordToggle('reg-password', 'toggleRegPass');
    setupPasswordToggle('reg-password-confirm', 'toggleRegPassConfirm'); 
    setupPasswordToggle('modal-login-password', 'toggleModalLoginPass');

    // --- 3. LÓGICA DE REGISTRO ---
    if (registerForm) {
        registerForm.addEventListener('submit', async e => {
            e.preventDefault(); 
            console.log("Intentando registrar usuario...");
            
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const passInput = document.getElementById('reg-password');
            const passConfirmInput = document.getElementById('reg-password-confirm');
            
            // Validación A: Longitud
            if (passInput.value.length < 8) {
                showInputError('reg-password', 'La contraseña debe tener al menos 8 caracteres');
                return;
            }

            // Validación B: Coincidencia
            if (passInput.value !== passConfirmInput.value) {
                showInputError('reg-password-confirm', 'Las contraseñas no coinciden');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = "Registrando...";

            const userData = {
                nombre: document.getElementById('reg-nombre').value,
                email: document.getElementById('reg-email').value,
                telefono: document.getElementById('reg-telefono').value,
                password: passInput.value,
                idRol: 3,
                activo: true
            };

            try {
                const response = await AuthService.register(userData);
                console.log("Respuesta Registro:", response);

                if (response.status === 'success' || response.success || response.idUsuario) {
                    alert('✅ ¡Cuenta creada exitosamente! Ahora inicia sesión.');
                    if(registerView) registerView.style.display = 'none';
                    if(loginView) loginView.style.display = 'block';
                    registerForm.reset();
                    document.getElementById('registerMessage').style.display = 'none';
                } else {
                    throw new Error(response.message || 'No se pudo completar el registro');
                }
            } catch (error) {
                console.error('Error Registro:', error);
                const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
                
                // Mostrar error en la interfaz
                const msgDiv = document.getElementById('registerMessage');
                let textoError = 'Error al crear cuenta.';
                
                if (errorMsg.includes('Duplicate entry') || errorMsg.includes('Duplicate')) {
                    textoError = 'El correo o teléfono ya están registrados.';
                } else {
                    textoError = errorMsg;
                }
                
                if(msgDiv) {
                    msgDiv.textContent = textoError;
                    msgDiv.style.display = 'block';
                }
                alert(textoError); // Alerta de respaldo
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "CREAR CUENTA";
            }
        });
    }

    // --- 4. LÓGICA DE LOGIN EN EL MODAL ---
    if (modalLoginForm) {
        modalLoginForm.addEventListener('submit', async e => {
            e.preventDefault();
            
            const submitBtn = modalLoginForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            const inputUser = document.getElementById('modal-login-input');
            const inputPass = document.getElementById('modal-login-password');
            const msgDiv = document.getElementById('modalLoginMessage');

            submitBtn.disabled = true;
            submitBtn.textContent = "Verificando...";
            if(msgDiv) msgDiv.style.display = 'none';

            try {
                // Detectar si es email o teléfono
                let credenciales = {};
                if (inputUser.value.includes('@')) {
                    credenciales = { email: inputUser.value, password: inputPass.value };
                } else {
                    credenciales = { telefono: inputUser.value, password: inputPass.value };
                }

                const response = await AuthService.login(credenciales);

                if (response.status === 'success' || response.success || (response.data && response.data.token)) {
                    const data = response.data || response;
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('auth_token', data.token);
                    localStorage.setItem('user_data', JSON.stringify(data.usuario || data.user));

                    modal.style.display = 'none';
                    
                    // Redirección
                    const rol = (data.usuario || data.user).idRol;
                    if (rol === 1 || rol === 2) { 
                        window.location.href = 'admin/dashboard.html';
                    } else {
                        window.location.reload();
                    }
                } else {
                    throw new Error('Credenciales incorrectas');
                }
            } catch (error) {
                console.error('Error Login Modal:', error);
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                
                let mensaje = "Error de conexión o datos incorrectos";
                if (error.response && error.response.status === 404) mensaje = "Usuario no encontrado";
                if (error.response && error.response.status === 401) mensaje = "Contraseña incorrecta";

                if(msgDiv) {
                    msgDiv.textContent = mensaje;
                    msgDiv.style.display = 'block';
                }
                inputPass.classList.add('input-error');
            }
        });
    }

    // --- 5. EVENTOS DE NAVEGACIÓN DEL MODAL ---
    const closeBtn = modal.querySelector('.close-btn-auth');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
    
    window.addEventListener('click', e => { 
        if (e.target === modal) modal.style.display = 'none'; 
    });

    if (showLoginBtn) showLoginBtn.addEventListener('click', e => {
        e.preventDefault();
        registerView.style.display = 'none';
        loginView.style.display = 'block';
    });

    if (showRegisterBtn) showRegisterBtn.addEventListener('click', e => {
        e.preventDefault();
        loginView.style.display = 'none';
        registerView.style.display = 'block';
    });
}

// ================== Otros Modales (Logout, Agendar, Notif) ==================
function initLogoutModalEvents() {
    const logoutModal = document.getElementById('logoutModal');
    if (!logoutModal) return;
    const confirmBtn = document.getElementById('confirmLogout');
    const cancelBtn = document.getElementById('cancelLogout');
    const closeBtn = logoutModal.querySelector('.logout-close-btn');

    if (confirmBtn) confirmBtn.addEventListener('click', async () => {
        await AuthService.logout();
        window.location.href = 'index.html'; 
    });
    if (cancelBtn) cancelBtn.addEventListener('click', () => logoutModal.style.display = 'none');
    if (closeBtn) closeBtn.addEventListener('click', () => logoutModal.style.display = 'none');
}

function initAgendarModal() {
    const modal = document.getElementById('agendarModal');
    if (!modal) return;
    const closeBtn = modal.querySelector('.close-btn-agendar');
    const cancelBtn = modal.querySelector('.btn-agendar-cancel');
    const form = modal.querySelector('#agendarForm');

    const closeModal = () => modal.style.display = 'none';
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    
    form?.addEventListener('submit', e => {
        e.preventDefault();
        window.location.href = 'servicios.html';
    });
}

function initBellIcon() {
    const bellIcon = document.querySelector('.fa-bell');
    if (!bellIcon) return;
    bellIcon.addEventListener('click', () => {
        const modal = document.getElementById('notificaciones-modal');
        if (modal) modal.style.display = 'block';
    });
}

function initNotificacionesModal() {
    const modal = document.getElementById('notificaciones-modal');
    if(!modal) return;
    const closeBtn = modal.querySelector('.close-btn-notif');
    if(closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
}

// ================== Menú Perfil ==================
function initProfileMenuEvents() {
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', e => {
            e.preventDefault();
            document.getElementById('profileMenuModal').style.display = 'none';
            const logoutModal = document.getElementById('logoutModal');
            if (logoutModal) logoutModal.style.display = 'flex';
        });
    }
}

function toggleProfileMenu() {
    const profileModal = document.getElementById('profileMenuModal');
    if (profileModal) {
        profileModal.style.display = (profileModal.style.display === 'block') ? 'none' : 'block';
    }
}

// ================== CLICKS GLOBALES ==================
document.addEventListener('click', e => {
    const target = e.target;

    if (target.closest('.btn-agendar')) {
        e.preventDefault();
        const modal = document.getElementById('agendarModal');
        if (modal) modal.style.display = 'flex';
        return;
    }

    const authTrigger = target.closest('.auth-trigger');
    if (authTrigger) {
        e.preventDefault();
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            toggleProfileMenu();
        } else {
            const targetUrl = authTrigger.getAttribute('data-target');
            if(targetUrl && targetUrl !== '#') sessionStorage.setItem('redirectAfterAuth', targetUrl);
            const modal = document.getElementById('authModal');
            if (modal) modal.style.display = 'flex';
        }
        return;
    }
    
    const profileModal = document.getElementById('profileMenuModal');
    if (profileModal && profileModal.style.display === 'block' && !target.closest('#profileMenuModal') && !target.closest('.auth-trigger')) {
        profileModal.style.display = 'none';
    }
});

// ================== INICIALIZACIÓN ==================
document.addEventListener('DOMContentLoaded', () => {
    loadHeaderFooter();
    loadModalNotificaciones();
    loadModalAgendar();
    loadModalAuth();
    loadModalProfileMenu();
});