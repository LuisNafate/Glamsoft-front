// js/register.js

document.addEventListener('DOMContentLoaded', async () => {
    const modalPlaceholder = document.getElementById('modal-placeholder');
    let isUserLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // 1. Cargar el modal
    try {
        const response = await fetch("modals/register.html");
        const html = await response.text();
        modalPlaceholder.innerHTML = html;
        
        initializeModalEvents();
        attachAuthTriggers();
    } catch (err) {
        console.error('Error al cargar el modal:', err);
    }

    function initializeModalEvents() {
        const modal = document.getElementById('authModal');
        if (!modal) return;

        // Referencias
        const closeBtn = modal.querySelector('.close-btn-auth');
        const showLoginBtn = document.getElementById('showLogin');
        const showRegisterBtn = document.getElementById('showRegister');
        const registerView = document.getElementById('registerView');
        const loginView = document.getElementById('loginView');
        
        // Formularios
        const registerForm = document.getElementById('registerForm');
        const modalLoginForm = document.getElementById('modalLoginForm');

        // Cerrar modal
        closeBtn?.addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

        // Cambiar entre Login y Registro
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

        // ==========================================
        // LÓGICA DE REGISTRO (CORREGIDA)
        // ==========================================
        registerForm?.addEventListener('submit', async e => {
            e.preventDefault();

            // Construimos el objeto EXACTO que pide tu Backend
            const userData = {
                nombre: document.getElementById('reg-nombre').value,
                email: document.getElementById('reg-email').value,
                telefono: document.getElementById('reg-telefono').value,
                password: document.getElementById('reg-password').value,
                idRol: 3,    // 3 = Cliente (Según tu script SQL)
                activo: true // Obligatorio según tu modelo
            };

            console.log("Enviando datos de registro:", userData); // Para depurar

            try {
                const response = await AuthService.register(userData);

                if (response.status === 'success' || response.success) {
                    alert('¡Cuenta creada con éxito! Por favor, inicia sesión.');
                    registerView.style.display = 'none';
                    loginView.style.display = 'block';
                    registerForm.reset();
                } else {
                    alert('Error: ' + (response.message || 'No se pudo registrar'));
                }
            } catch (error) {
                console.error('Error en registro:', error);
                // Mostrar mensaje detallado si el backend lo envía
                const msg = error.response && error.response.data ? error.response.data.message : 'Error al crear cuenta. Verifica tus datos.';
                alert(msg);
            }
        });

        // ==========================================
        // LÓGICA DE LOGIN EN MODAL (CORREGIDA)
        // ==========================================
        modalLoginForm?.addEventListener('submit', async e => {
            e.preventDefault();
            
            const telefono = document.getElementById('modal-login-telefono').value;
            const password = document.getElementById('modal-login-password').value;

            try {
                // Usamos teléfono porque el backend así lo requiere
                const response = await AuthService.login({ telefono, password });

                if (response.status === 'success' || response.success) {
                    const token = response.data ? response.data.token : response.token;
                    const usuario = response.data ? response.data.usuario : response.usuario;

                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('auth_token', token);
                    localStorage.setItem('user_data', JSON.stringify(usuario));

                    modal.style.display = 'none';
                    alert(`¡Bienvenido ${usuario.nombre}!`);
                    
                    // Recargar para actualizar la UI
                    window.location.reload();
                } else {
                    alert('Credenciales incorrectas');
                }
            } catch (error) {
                console.error('Error login:', error);
                alert('Error de conexión o datos incorrectos');
            }
        });
    }

    function attachAuthTriggers() {
        document.querySelectorAll('.auth-trigger').forEach(trigger => {
            trigger.addEventListener('click', e => {
                e.preventDefault();
                const modal = document.getElementById('authModal');
                if (modal) modal.style.display = 'flex';
            });
        });
    }
});