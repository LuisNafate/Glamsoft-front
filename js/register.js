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

        // --- FUNCIONES DE AYUDA (VALIDACIÓN Y UI) ---
        
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

        // Configurar limpieza de errores al escribir
        ['reg-nombre', 'reg-email', 'reg-telefono', 'reg-password', 'reg-password-confirm', 'modal-login-telefono', 'modal-login-password'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => clearInputError(id));
        });

        // Configurar visibilidad de contraseñas
        setupPasswordToggle('reg-password', 'toggleRegPass');
        setupPasswordToggle('modal-login-password', 'toggleLoginPass');
        // ✅ NUEVO: Configurar para el campo de confirmación
        setupPasswordToggle('reg-password-confirm', 'toggleRegPassConfirm');


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
        // LÓGICA DE REGISTRO (CORREGIDA Y ACTUALIZADA)
        // ==========================================
        registerForm?.addEventListener('submit', async e => {
            e.preventDefault();

            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const passInput = document.getElementById('reg-password');
            const passConfirmInput = document.getElementById('reg-password-confirm'); // Referencia al nuevo campo

            // Validaciones básicas antes de enviar
            if (passInput.value.length < 8) {
                showInputError('reg-password', 'Mínimo 8 caracteres');
                return;
            }

            // ✅ VALIDACIÓN: Comparar contraseñas
            if (passInput.value !== passConfirmInput.value) {
                showInputError('reg-password-confirm', 'Las contraseñas no coinciden');
                return;
            }

            // Deshabilitar botón para evitar doble envío
            submitBtn.disabled = true;
            submitBtn.textContent = "Registrando...";

            // Construimos el objeto EXACTO que pide tu Backend
            const userData = {
                nombre: document.getElementById('reg-nombre').value,
                email: document.getElementById('reg-email').value,
                telefono: document.getElementById('reg-telefono').value,
                password: passInput.value,
                idRol: 3,    // 3 = Cliente
                activo: true
            };

            console.log("Enviando datos de registro:", userData);

            try {
                const response = await AuthService.register(userData);

                if (response.status === 'success' || response.success) {
                    alert('¡Cuenta creada con éxito! Por favor, inicia sesión.');
                    registerView.style.display = 'none';
                    loginView.style.display = 'block';
                    registerForm.reset();
                    // Limpiar errores visuales
                    clearInputError('reg-email');
                    clearInputError('reg-telefono');
                    clearInputError('reg-password');
                    clearInputError('reg-password-confirm');
                } else {
                    alert('Error: ' + (response.message || 'No se pudo registrar'));
                }
            } catch (error) {
                console.error('Error en registro:', error);
                const errorMsg = error.response && error.response.data ? error.response.data.message : 'Error al crear cuenta.';
                
                // Mostrar errores específicos en los campos si es posible
                if (errorMsg.includes('Duplicate entry')) {
                    if (errorMsg.includes('email')) showInputError('reg-email', 'Correo ya registrado');
                    else if (errorMsg.includes('telefono')) showInputError('reg-telefono', 'Teléfono ya registrado');
                    else alert('El usuario ya existe');
                } else {
                    alert(errorMsg);
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "CREAR CUENTA";
            }
        });

        // ==========================================
        // LÓGICA DE LOGIN EN MODAL
        // ==========================================
        modalLoginForm?.addEventListener('submit', async e => {
            e.preventDefault();
            
            const telefonoInput = document.getElementById('modal-login-telefono');
            const passwordInput = document.getElementById('modal-login-password');
            const submitBtn = modalLoginForm.querySelector('button[type="submit"]');

            submitBtn.disabled = true;
            submitBtn.textContent = "Verificando...";

            try {
                const response = await AuthService.login({ 
                    telefono: telefonoInput.value, 
                    password: passwordInput.value 
                });

                if (response.status === 'success' || response.success) {
                    const token = response.data ? response.data.token : response.token;
                    const usuario = response.data ? response.data.usuario : response.usuario;

                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('auth_token', token);
                    localStorage.setItem('user_data', JSON.stringify(usuario));

                    modal.style.display = 'none';
                    alert(`¡Bienvenido ${usuario.nombre}!`);
                    
                    window.location.reload();
                } else {
                    showInputError('modal-login-password', 'Credenciales incorrectas');
                }
            } catch (error) {
                console.error('Error login:', error);
                showInputError('modal-login-telefono', 'Error de conexión o datos incorrectos');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "ENTRAR";
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