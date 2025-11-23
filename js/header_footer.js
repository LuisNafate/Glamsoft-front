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

// Removido: loadModalAgendar() - ya no se usa porque el botón AGENDAR redirige directamente a agendar.html

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

// Removido: initAgendarModal() - ya no se usa

function initBellIcon() {
    const bellIcon = document.querySelector('.notification-icon-container');
    if (!bellIcon) return;

    bellIcon.addEventListener('click', async () => {
        const modal = document.getElementById('notificaciones-modal');
        if (modal) {
            modal.style.display = 'block';
            await cargarNotificaciones();
        }
    });

    // Cargar contador de notificaciones no leídas
    actualizarContadorNotificaciones();

    // Actualizar cada 30 segundos
    setInterval(actualizarContadorNotificaciones, 30000);
}

async function actualizarContadorNotificaciones() {
    try {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) return;

        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        const idUsuario = userData.idUsuario || userData.id_usuario;

        if (!idUsuario) return;

        const response = await NotificacionesService.contarNoLeidas(idUsuario);
        const count = response.data || response.count || 0;

        const badge = document.getElementById('notificationBadge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error al actualizar contador de notificaciones:', error);
    }
}

async function cargarNotificaciones() {
    try {
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        const idUsuario = userData.idUsuario || userData.id_usuario;

        if (!idUsuario) return;

        const response = await NotificacionesService.getByUsuario(idUsuario);
        const notificaciones = response.data || response;

        renderizarNotificaciones(notificaciones);

        // Mostrar botón de marcar todas como leídas si hay no leídas
        const noLeidas = notificaciones.filter(n => !n.leida);
        const btnMarcarTodas = document.getElementById('marcarTodasLeidasBtn');
        if (btnMarcarTodas) {
            btnMarcarTodas.style.display = noLeidas.length > 0 ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Error al cargar notificaciones:', error);
    }
}

function renderizarNotificaciones(notificaciones) {
    const container = document.getElementById('notificationsList');
    if (!container) return;

    if (!notificaciones || notificaciones.length === 0) {
        container.innerHTML = `
            <div class="no-notifications">
                <i class="fas fa-bell-slash"></i>
                <p>No tienes notificaciones</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    notificaciones.forEach(notif => {
        const item = document.createElement('div');
        item.className = `notification-item ${!notif.leida ? 'unread' : ''}`;

        const tiempo = formatearTiempoTranscurrido(notif.fechaCreacion || notif.fecha_creacion);
        const tipo = (notif.tipo || '').toLowerCase().replace('cita_', '');

        item.innerHTML = `
            <div class="notification-header">
                <h4 class="notification-title">${notif.titulo}</h4>
                <span class="notification-time">${tiempo}</span>
            </div>
            <p class="notification-message">${notif.mensaje}</p>
            <span class="notification-tipo ${tipo}">${tipo}</span>
        `;

        // Click para marcar como leída
        item.addEventListener('click', async () => {
            if (!notif.leida) {
                await NotificacionesService.markAsRead(notif.idNotificacion || notif.id_notificacion);
                item.classList.remove('unread');
                actualizarContadorNotificaciones();
            }
        });

        container.appendChild(item);
    });
}

function formatearTiempoTranscurrido(fecha) {
    if (!fecha) return '';

    const ahora = new Date();
    const fechaNotif = new Date(fecha);
    const diff = Math.floor((ahora - fechaNotif) / 1000); // segundos

    if (diff < 60) return 'Ahora';
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return fechaNotif.toLocaleDateString();
}

function initNotificacionesModal() {
    const modal = document.getElementById('notificaciones-modal');
    if(!modal) return;

    const closeBtn = modal.querySelector('.close-btn-notif');
    if(closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Botón marcar todas como leídas
    const btnMarcarTodas = document.getElementById('marcarTodasLeidasBtn');
    if (btnMarcarTodas) {
        btnMarcarTodas.addEventListener('click', async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
                const idUsuario = userData.idUsuario || userData.id_usuario;

                if (idUsuario) {
                    await NotificacionesService.marcarTodasComoLeidas(idUsuario);
                    await cargarNotificaciones();
                    actualizarContadorNotificaciones();
                }
            } catch (error) {
                console.error('Error al marcar todas como leídas:', error);
            }
        });
    }
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

    // Removido: el botón .btn-agendar ahora redirige directamente a agendar.html

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
    loadModalAuth();
    loadModalProfileMenu();
});