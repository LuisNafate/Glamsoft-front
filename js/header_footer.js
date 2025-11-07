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
            // IMPORTANTE: Inicializar evento de campana DESPUÉS de cargar el header
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

// ================== Modales ==================
function loadModalNotificaciones() {
    fetch('modals/notificaciones.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('modal-placeholder').innerHTML += html;
            initNotificacionesModal();
            initGlobalModalClose(); // ✅ Unifica cierre global
        })
        .catch(err => console.error('Error cargando notificaciones:', err));
}

function loadModalAuth() {
    const modalPlaceholder = document.getElementById('modal-placeholder');
    fetch('modals/register.html')
        .then(res => res.text())
        .then(html => {
            modalPlaceholder.innerHTML += html;
            initializeModalEvents();
            initGlobalModalClose(); // ✅ Unifica cierre global
        })
        .catch(err => console.error('Error cargando modal auth:', err));
}

// NUEVO: Cargar y configurar el menú de perfil
function loadModalProfileMenu() {
    const modalPlaceholder = document.getElementById('modal-placeholder');
    fetch('modals/profile_menu.html')
        .then(res => res.text())
        .then(html => {
            modalPlaceholder.innerHTML += html;
            initProfileMenuEvents(); // Configurar el botón de logout
        })
        .catch(err => console.error('Error cargando modal de perfil:', err));
}

// ================== Modal Notificaciones ==================
function initBellIcon() {
    const bellIcon = document.querySelector('.fa-bell');
    if (!bellIcon) {
        console.error('Icono de campana no encontrado');
        return;
    }

    bellIcon.addEventListener('click', () => {
        const modal = document.getElementById('notificaciones-modal');
        if (modal) {
            modal.style.display = 'block';
            loadNotificaciones();
        }
    });
}

function initNotificacionesModal() {
    const modal = document.getElementById('notificaciones-modal');
    if (!modal) {
        console.error('Modal de notificaciones no encontrado');
        return;
    }
}

// ================== Modal Auth ==================
function initializeModalEvents() {
    const modal = document.getElementById('authModal');
    if (!modal) {
        console.error('Modal de auth no encontrado');
        return;
    }

    const showLoginBtn = document.getElementById('showLogin');
    const showRegisterBtn = document.getElementById('showRegister');
    const registerView = document.getElementById('registerView');
    const loginView = document.getElementById('loginView');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    const handleAuthSuccess = () => {
        isUserLoggedIn = true;
        localStorage.setItem('isLoggedIn', 'true');
        modal.style.display = 'none';
        const redirectUrl = sessionStorage.getItem('redirectAfterAuth');
        if (redirectUrl) {
            window.location.href = redirectUrl;
            sessionStorage.removeItem('redirectAfterAuth');
        } else {
            alert('¡Autenticación exitosa!');
        }
    };

    registerForm.addEventListener('submit', e => {
        e.preventDefault();
        alert('¡Cuenta creada con éxito! Por favor, inicia sesión.');
        registerView.style.display = 'none';
        loginView.style.display = 'block';
        registerForm.reset();
    });

    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        handleAuthSuccess();
    });

    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', e => {
            e.preventDefault();
            registerView.style.display = 'none';
            loginView.style.display = 'block';
        });
    }

    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', e => {
            e.preventDefault();
            loginView.style.display = 'none';
            registerView.style.display = 'block';
        });
    }
}

// NUEVO: Lógica para el botón de "Cerrar Sesión"
function initProfileMenuEvents() {
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Lógica de logout
            isUserLoggedIn = false;
            localStorage.setItem('isLoggedIn', 'false'); // O removeItem('isLoggedIn')
            
            alert('Has cerrado sesión.');
            
            // Ocultar el menú y recargar la página
            document.getElementById('profileMenuModal').style.display = 'none';
            window.location.reload(); 
        });
    }
}

// ================== Cargar Notificaciones ==================
function loadNotificaciones() {
    const lista = document.getElementById('notificaciones-list');
    if (!lista) return;

    lista.innerHTML = '';
    const notis = [
        'Tienes un nuevo mensaje.',
        'Tu cita ha sido confirmada.',
        'Promoción disponible esta semana.'
    ];

    notis.forEach(noti => {
        const li = document.createElement('li');
        li.textContent = noti;
        lista.appendChild(li);
    });
}

// ================== Sistema de Autenticación (MODIFICADO) ==================
let isUserLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

// NUEVO: Función para abrir/cerrar el menú de perfil
function toggleProfileMenu() {
    const profileModal = document.getElementById('profileMenuModal');
    if (profileModal) {
        const isVisible = profileModal.style.display === 'block';
        // Cerrar todos los otros modales primero
        closeAllModals(); 
        // Mostrar/ocultar el menú de perfil
        profileModal.style.display = isVisible ? 'none' : 'block';
    }
}

// MODIFICADO: Listener de clic principal
document.addEventListener('click', e => {
    
    // Selector modificado para incluir el icono y el elemento dentro de él si se hace clic
    const authTrigger = e.target.closest('.auth-trigger');
    const profileModal = document.getElementById('profileMenuModal');

    if (authTrigger) {
        // Si se hace clic en el icono de usuario
        e.preventDefault();
        if (isUserLoggedIn) {
            // Usuario LOGUEADO: Abrir menú de perfil
            toggleProfileMenu();
        } else {
            // Usuario NO LOGUEADO: Abrir modal de autenticación
            const targetUrl = authTrigger.getAttribute('data-target');
            openModal(); // Esto abre 'authModal'
            sessionStorage.setItem('redirectAfterAuth', targetUrl);
        }
    } else if (profileModal && profileModal.style.display === 'block') {
        // NUEVO: Lógica de "click-outside"
        // Si el menú de perfil está abierto Y el clic fue FUERA de él
        if (!profileModal.contains(e.target)) {
            profileModal.style.display = 'none';
        }
    }
});


function openModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'flex';
}

// ================== CIERRE GLOBAL DE MODALES (MODIFICADO) ==================
function initGlobalModalClose() {
    // MODIFICADO: Excluimos el profileMenuModal de esta lógica,
    // ya que tiene su propio "click-outside"
    const modals = document.querySelectorAll('#authModal, #notificaciones-modal');

    modals.forEach(modal => {
        if (!modal) return;

        const closeBtn = modal.querySelector('.close-btn-auth, .close-btn-notif');
        const modalContent = modal.querySelector('.modal-content, .modal-content-notificaciones');

        // Cerrar al hacer clic en el botón X
        if (closeBtn) {
            closeBtn.addEventListener('click', e => {
                e.stopPropagation();
                closeAllModals();
            });
        }

        // Evitar cierre si se hace clic dentro del contenido
        if (modalContent) {
            modalContent.addEventListener('click', e => e.stopPropagation());
        }

        // Cerrar si se hace clic fuera del contenido (en el overlay)
        modal.addEventListener('click', () => {
            closeAllModals();
        });
    });

    // Cerrar todas las modales con la tecla ESC
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

function closeAllModals() {
    // MODIFICADO: Ahora cierra también el menú de perfil
    const allModals = document.querySelectorAll('#authModal, #notificaciones-modal, #profileMenuModal');
    allModals.forEach(m => m.style.display = 'none');
}

// ================== Inicialización (MODIFICADO) ==================
document.addEventListener('DOMContentLoaded', () => {
    loadHeaderFooter();
    loadModalNotificaciones();
    loadModalAuth();
    loadModalProfileMenu(); // NUEVO: Cargar el menú de perfil

    // Esperar un poco para asegurar que las modales se carguen antes de aplicar eventos
    setTimeout(initGlobalModalClose, 800);
});