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

// ================== Sistema de Autenticación ==================
let isUserLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

document.addEventListener('click', e => {
    if (e.target.classList.contains('auth-trigger')) {
        e.preventDefault();
        const targetUrl = e.target.getAttribute('data-target');
        if (isUserLoggedIn) {
            window.location.href = targetUrl;
        } else {
            openModal();
            sessionStorage.setItem('redirectAfterAuth', targetUrl);
        }
    }
});

function openModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'flex';
}

// ================== CIERRE GLOBAL DE MODALES ==================
function initGlobalModalClose() {
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

        // Cerrar si se hace clic fuera del contenido
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
    const allModals = document.querySelectorAll('#authModal, #notificaciones-modal');
    allModals.forEach(m => m.style.display = 'none');
}

// ================== Inicialización ==================
document.addEventListener('DOMContentLoaded', () => {
    loadHeaderFooter();
    loadModalNotificaciones();
    loadModalAuth();

    // Esperar un poco para asegurar que las modales se carguen antes de aplicar eventos
    setTimeout(initGlobalModalClose, 800);
});
