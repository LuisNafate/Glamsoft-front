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
            initializeModalEvents(); // Aquí conectamos la lógica
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
    // Si no hay modal, al menos intentamos buscar el formulario de login normal
    // por si estamos en la página login.html
    
    const showLoginBtn = document.getElementById('showLogin');
    const showRegisterBtn = document.getElementById('showRegister');
    const registerView = document.getElementById('registerView');
    const loginView = document.getElementById('loginView');
    
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // --- 1. VALIDACIÓN VISUAL DE ERRORES ---
    function showInputError(inputId, message) {
        const input = document.getElementById(inputId);
        if (!input) return;
        input.classList.add('input-error');
        let errorSpan = input.parentNode.querySelector('.error-text');
        if (!errorSpan) {
            errorSpan = document.createElement('span');
            errorSpan.className = 'error-text';
            input.parentNode.appendChild(errorSpan);
        }
        errorSpan.textContent = message;
    }

    function clearInputError(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        input.classList.remove('input-error');
        const errorSpan = input.parentNode.querySelector('.error-text');
        if (errorSpan) errorSpan.remove();
    }

    ['reg-nombre', 'reg-email', 'reg-telefono', 'reg-password'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => clearInputError(id));
    });

    // --- 2. VER/OCULTAR CONTRASEÑA ---
    function setupPasswordToggle(inputId, iconId) {
        const input = document.getElementById(inputId);
        const icon = document.getElementById(iconId);
        if (input && icon) {
            icon.addEventListener('click', () => {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            });
        }
    }
    setupPasswordToggle('reg-password', 'toggleRegPass');
    setupPasswordToggle('modal-login-password', 'toggleLoginPass');

    // --- 3. LÓGICA DE REGISTRO ---
    if (registerForm) {
        registerForm.addEventListener('submit', async e => {
            e.preventDefault(); // ¡IMPORTANTE! Evita la recarga
            
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const passInput = document.getElementById('reg-password');
            
            if (passInput.value.length < 8) {
                showInputError('reg-password', 'Mínimo 8 caracteres');
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
                if (response.status === 'success' || response.success) {
                    alert('✅ ¡Cuenta creada! Inicia sesión.');
                    if(registerView) registerView.style.display = 'none';
                    if(loginView) loginView.style.display = 'block';
                    registerForm.reset();
                    clearInputError('reg-email');
                    clearInputError('reg-telefono');
                } else {
                    throw new Error(response.message || 'Error desconocido');
                }
            } catch (error) {
                console.error('Error Registro:', error);
                const errorMsg = error.response?.data?.message || error.message || '';
                
                if (errorMsg.includes('Duplicate entry')) {
                    if (errorMsg.includes('email')) showInputError('reg-email', 'Correo ya registrado');
                    else if (errorMsg.includes('telefono')) showInputError('reg-telefono', 'Teléfono ya registrado');
                    else alert('El usuario ya existe');
                } else {
                    alert('Error: ' + errorMsg);
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "CREAR CUENTA";
            }
        });
    }

    // --- 4. LÓGICA DE LOGIN (CORREGIDA REDIRECCIÓN) ---
    // Buscamos el form del modal O el form de la página de login normal
    const formLoginToUse = document.getElementById('modalLoginForm') || document.getElementById('loginForm');

    if (formLoginToUse) {
        formLoginToUse.addEventListener('submit', async e => {
            e.preventDefault(); // ¡CRUCIAL! Detiene el envío ?
            
            const submitBtn = formLoginToUse.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = "Entrando...";

            // Detectar inputs (soportamos ambos IDs para compatibilidad)
            const inputUser = document.getElementById('modal-login-telefono') || document.getElementById('login-telefono') || document.getElementById('login-email');
            const inputPass = document.getElementById('modal-login-password') || document.getElementById('login-password');
            
            // Limpiar errores previos
            if(inputUser) clearInputError(inputUser.id);

            try {
                const response = await AuthService.login({ 
                    telefono: inputUser.value, 
                    password: inputPass.value 
                });

                if (response.success || response.status === 'success') {
                    const token = response.data ? response.data.token : response.token;
                    const usuario = response.data ? response.data.usuario : response.usuario;

                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('auth_token', token);
                    localStorage.setItem('user_data', JSON.stringify(usuario));

                    if(modal) modal.style.display = 'none';
                    
                    // === REDIRECCIÓN INTELIGENTE ===
                    const redirectUrl = sessionStorage.getItem('redirectAfterAuth');
                    if (redirectUrl) {
                        window.location.href = redirectUrl;
                        sessionStorage.removeItem('redirectAfterAuth');
                    } else {
                        const rol = usuario.rol || usuario.idRol;
                        
                        if (rol === 1 || rol === 2) { 
                            // Admin/Estilista -> Dashboard
                            window.location.href = 'admin/dashboard.html';
                        } else {
                            // Cliente -> Inicio
                            // Si ya estamos en inicio, recargamos. Si estamos en login, vamos a inicio.
                            if (window.location.pathname.includes('login.html')) {
                                window.location.href = 'inicio.html';
                            } else {
                                window.location.reload();
                            }
                        }
                    }
                } else {
                    // Mostrar error visualmente en el input
                    if(inputUser) showInputError(inputUser.id, 'Credenciales incorrectas');
                    else alert('Credenciales incorrectas');
                }
            } catch (error) {
                console.error('Error Login:', error);
                if(inputUser) showInputError(inputUser.id, 'Error de conexión o datos erróneos');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "ENTRAR";
            }
        });
    }

    // --- 5. EVENTOS DEL MODAL (SOLO SI EXISTE) ---
    if (modal) {
        const closeBtn = modal.querySelector('.close-btn-auth');
        if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
        
        window.addEventListener('click', e => { 
            if (e.target === modal) modal.style.display = 'none'; 
        });

        showLoginBtn?.addEventListener('click', e => {
            e.preventDefault();
            registerView.style.display = 'none';
            loginView.style.display = 'block';
        });

        showRegisterBtn?.addEventListener('click', e => {
            e.preventDefault();
            loginView.style.display = 'none';
            registerView.style.display = 'block';
        });
    }
}

// ================== Otros Modales ==================
function initLogoutModalEvents() {
    const logoutModal = document.getElementById('logoutModal');
    if (!logoutModal) return;
    const confirmBtn = document.getElementById('confirmLogout');
    const cancelBtn = document.getElementById('cancelLogout');
    const closeBtn = logoutModal.querySelector('.logout-close-btn');

    if (confirmBtn) confirmBtn.addEventListener('click', async () => {
        await AuthService.logout();
        window.location.href = 'index.html'; // O login.html
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

    // Abrir Agendar
    if (target.closest('.btn-agendar')) {
        e.preventDefault();
        const modal = document.getElementById('agendarModal');
        if (modal) modal.style.display = 'flex';
        return;
    }

    // Auth / Perfil Trigger
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
    
    // Cerrar perfil al click fuera
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