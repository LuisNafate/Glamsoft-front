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

// ✅ FUNCIÓN CRÍTICA ACTUALIZADA
function loadModalAuth() {
    fetch('modals/register.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('modal-placeholder').insertAdjacentHTML('beforeend', html);
            
            // Esperamos 200ms para asegurar que el DOM renderizó el formulario
            setTimeout(() => {
                console.log("Inicializando eventos del modal de autenticación...");
                initializeModalEvents();
            }, 200);
        });
}

function loadModalProfileMenu() {
    const modalPlaceholder = document.getElementById('modal-placeholder');
    fetch('modals/profile_menu.html')
        .then(res => res.text())
        .then(html => {
            modalPlaceholder.insertAdjacentHTML('beforeend', html);
            initProfileMenuEvents();
            updateUserProfileName(); // Cargar nombre si ya está logueado
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

function updateUserProfileName() {
    try {
        const userData = localStorage.getItem('user_data');
        if (userData) {
            const user = JSON.parse(userData);
            const nameElement = document.getElementById('userProfileName');
            if (nameElement && user.nombre) {
                nameElement.textContent = user.nombre;
            }
        }
    } catch (e) {
        console.error("Error leyendo datos de usuario", e);
    }
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
    if (!modal) {
        console.error("❌ No se encontró el modal 'authModal'");
        return;
    }

    const showLoginBtn = document.getElementById('showLogin');
    const showRegisterBtn = document.getElementById('showRegister');
    const registerView = document.getElementById('registerView');
    const loginView = document.getElementById('loginView');
    
    const modalLoginForm = document.getElementById('modalLoginForm');
    const registerForm = document.getElementById('registerForm');

    // --- Helpers Visuales ---
    function showInputError(inputId, message) {
        const input = document.getElementById(inputId);
        if (!input) return;
        input.classList.add('input-error');
        // Buscar contenedor de error específico
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

    ['reg-nombre', 'reg-email', 'reg-telefono', 'reg-password', 'reg-password-confirm', 'modal-login-input', 'modal-login-password'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => clearInputError(id));
    });

    function setupPasswordToggle(inputId, iconId) {
        const input = document.getElementById(inputId);
        const icon = document.getElementById(iconId);
        if (input && icon) {
            // Clonamos para eliminar listeners previos y evitar duplicados
            const newIcon = icon.cloneNode(true);
            icon.parentNode.replaceChild(newIcon, icon);
            newIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                newIcon.classList.toggle('fa-eye');
                newIcon.classList.toggle('fa-eye-slash');
            });
        }
    }
    
    setupPasswordToggle('reg-password', 'toggleRegPass');
    setupPasswordToggle('reg-password-confirm', 'toggleRegPassConfirm'); 
    setupPasswordToggle('modal-login-password', 'toggleModalLoginPass');

    // --- 1. LÓGICA DE REGISTRO ---
    if (registerForm) {
        registerForm.addEventListener('submit', async e => {
            e.preventDefault(); 
            
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const passInput = document.getElementById('reg-password');
            const passConfirmInput = document.getElementById('reg-password-confirm');
            
            if (passInput.value.length < 8) {
                showInputError('reg-password', 'Mínimo 8 caracteres');
                return;
            }
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
                idRol: 3, // Por defecto Cliente
                activo: true
            };

            try {
                const response = await AuthService.register(userData);
                if (response.status === 'success' || response.success) {
                    alert('✅ Cuenta creada. Inicia sesión.');
                    registerView.style.display = 'none';
                    loginView.style.display = 'block';
                    registerForm.reset();
                    const msgDiv = document.getElementById('registerMessage');
                    if(msgDiv) msgDiv.style.display = 'none';
                } else {
                    throw new Error(response.message || 'Error desconocido');
                }
            } catch (error) {
                console.error("Error Registro:", error);
                const errorMsg = error.response?.data?.message || error.message || 'Error al registrar';
                const msgDiv = document.getElementById('registerMessage');
                if(msgDiv) {
                    msgDiv.textContent = errorMsg;
                    msgDiv.style.display = 'block';
                } else {
                    alert(errorMsg);
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "CREAR CUENTA";
            }
        });
    }

    // --- 2. LÓGICA DE LOGIN EN MODAL (CORREGIDA) ---
   // Reemplaza el listener del modalLoginForm en js/header_footer.js:
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
                let credenciales = {};
                const val = inputUser.value.trim();
                if (val.includes('@')) {
                    credenciales = { email: val, password: inputPass.value };
                } else {
                    credenciales = { telefono: val, password: inputPass.value };
                }

                const response = await AuthService.login(credenciales);
                
                // --- EXTRACCIÓN BLINDADA (Igual que en login.js) ---
                const paquete1 = response.data || response;
                const paquete2 = paquete1.data || paquete1; 
                const usuario = paquete2.usuario || paquete2.user || paquete1.usuario;
                const token = paquete2.token || paquete1.token;

                if (usuario && token) {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('auth_token', token);
                    localStorage.setItem('user_data', JSON.stringify(usuario));

                    modal.style.display = 'none';
                    
                    const idRol = parseInt(usuario.idRol || usuario.id_rol || 0);
                    const nombreRol = String(usuario.rol || usuario.role || '').toUpperCase();

                    if (idRol === 1 || idRol === 2 || nombreRol.includes('ADMIN') || nombreRol.includes('ESTILISTA')) { 
                        window.location.href = 'admin/dashboard.html';
                    } else {
                        // Lógica de redirección del cliente
                        const redirectUrl = sessionStorage.getItem('redirectAfterAuth');
                        if (redirectUrl) {
                            sessionStorage.removeItem('redirectAfterAuth');
                            window.location.href = redirectUrl;
                        } else {
                            window.location.reload();
                        }
                    }
                } else {
                    throw new Error('Credenciales incorrectas');
                }
            } catch (error) {
                console.error('Error Login Modal:', error);
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                
                let mensaje = "Error de conexión";
                if (error.response && error.response.status === 404) mensaje = "Usuario no encontrado";
                if (error.response && error.response.status === 401) mensaje = "Contraseña incorrecta";
                if (msgDiv) { msgDiv.textContent = mensaje; msgDiv.style.display = 'block'; }
            }
        });
    } else {
        console.error("❌ NO SE ENCONTRÓ el formulario 'modalLoginForm' en el DOM.");
    }

    // --- 3. Navegación Modal ---
    const closeBtn = modal.querySelector('.close-btn-auth');
    if (closeBtn) {
        // Clonar para evitar duplicados
        const newClose = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newClose, closeBtn);
        newClose.addEventListener('click', () => modal.style.display = 'none');
    }
    
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

// ================== Otros Modales ==================
function initLogoutModalEvents() {
    const logoutModal = document.getElementById('logoutModal');
    if (!logoutModal) return;
    const confirmBtn = document.getElementById('confirmLogout');
    const cancelBtn = document.getElementById('cancelLogout');
    const closeBtn = logoutModal.querySelector('.logout-close-btn');

    if (confirmBtn) confirmBtn.addEventListener('click', async () => {
        await AuthService.logout();
        window.location.href = 'inicio.html'; 
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