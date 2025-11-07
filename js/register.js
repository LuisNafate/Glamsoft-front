document.addEventListener('DOMContentLoaded', async () => {
    const modalPlaceholder = document.getElementById('modal-placeholder');
    let isUserLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // 1️⃣ Cargar modal dinámicamente
    try {
        const response = await fetch("modals/register.html");
        const html = await response.text();
        modalPlaceholder.innerHTML = html;

        // 2️⃣ Inicializar eventos del modal
        initializeModalEvents();

        // 3️⃣ Inicializar triggers que abren el modal
        attachAuthTriggers();
    } catch (err) {
        console.error('Error al cargar el modal:', err);
    }

    function initializeModalEvents() {
        const modal = document.getElementById('authModal');
        if (!modal) return console.error('Modal no encontrado en el DOM');

        const closeBtn = modal.querySelector('.close-btn');
        const showLoginBtn = document.getElementById('showLogin');
        const showRegisterBtn = document.getElementById('showRegister');
        const registerView = document.getElementById('registerView');
        const loginView = document.getElementById('loginView');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const userButton = document.getElementById('userButton');

        // Abrir modal al hacer clic en el icono de usuario
        if (userButton) {
            userButton.addEventListener('click', e => {
                e.preventDefault();
                modal.style.display = 'flex';
            });
        }

        // Cerrar modal
        closeBtn.addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

        // Alternar vistas login/registro
        showLoginBtn.addEventListener('click', e => {
            e.preventDefault();
            registerView.style.display = 'none';
            loginView.style.display = 'block';
        });
        showRegisterBtn.addEventListener('click', e => {
            e.preventDefault();
            loginView.style.display = 'none';
            registerView.style.display = 'block';
        });

        // Registro simulado
        registerForm.addEventListener('submit', e => {
            e.preventDefault();
            alert('¡Cuenta creada con éxito! Por favor, inicia sesión.');
            registerView.style.display = 'none';
            loginView.style.display = 'block';
            registerForm.reset();
        });

        // Login simulado
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
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
        });
    }

    function attachAuthTriggers() {
        document.querySelectorAll('.auth-trigger').forEach(trigger => {
            trigger.addEventListener('click', e => {
                e.preventDefault();
                const targetUrl = trigger.getAttribute('data-target');
                const modal = document.getElementById('authModal');
                if (!modal) return; // Aquí ya no mostrará error porque modal ya debe existir

                if (isUserLoggedIn) {
                    window.location.href = targetUrl;
                } else {
                    modal.style.display = 'flex';
                    sessionStorage.setItem('redirectAfterAuth', targetUrl);
                }
            });
        });
    }
});
