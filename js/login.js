document.addEventListener('DOMContentLoaded', () => {
    console.log("Script de login cargado correctamente");
    const loginForm = document.getElementById('loginForm');

    // --- 1. FUNCIÓN VER/OCULTAR CONTRASEÑA ---
    const passInput = document.getElementById('login-password');
    const toggleIcon = document.getElementById('toggleLoginPass');
    
    if (passInput && toggleIcon) {
        toggleIcon.addEventListener('click', (e) => {
            e.preventDefault(); // Evita submit accidental
            const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passInput.setAttribute('type', type);
            
            toggleIcon.classList.toggle('fa-eye');
            toggleIcon.classList.toggle('fa-eye-slash');
        });
    }

    // --- 2. FUNCIONES VISUALES DE ERROR ---
    function showInputError(inputElement, message) {
        if (!inputElement) return;
        
        // Agregar clase para borde rojo
        inputElement.classList.add('input-error');
        
        // Crear mensaje de texto si no existe
        let errorText = inputElement.parentNode.querySelector('.error-text');
        if (!errorText) {
            errorText = document.createElement('div');
            errorText.className = 'error-text';
            inputElement.parentNode.appendChild(errorText);
        }
        errorText.textContent = message;
    }

    function clearInputError(inputElement) {
        if (!inputElement) return;
        inputElement.classList.remove('input-error');
        const errorText = inputElement.parentNode.querySelector('.error-text');
        if (errorText) errorText.remove();
    }

    // Limpiar errores al escribir
    if(passInput) passInput.addEventListener('input', () => clearInputError(passInput));
    const telInput = document.getElementById('login-telefono') || document.getElementById('login-email');
    if(telInput) telInput.addEventListener('input', () => clearInputError(telInput));


    // --- 3. LÓGICA DE LOGIN ---
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // 🛑 DETIENE LA RECARGA

            const inputUser = document.getElementById('login-telefono') || document.getElementById('login-email');
            const inputPass = document.getElementById('login-password');
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const messageDiv = document.getElementById('message');

            // Limpiar todo antes de empezar
            clearInputError(inputUser);
            clearInputError(inputPass);
            if(messageDiv) messageDiv.textContent = '';

            // Validaciones locales
            if (inputPass.value.length < 8) {
                showInputError(inputPass, 'Mínimo 8 caracteres');
                return; // Detiene el proceso aquí
            }

            submitBtn.disabled = true;
            submitBtn.textContent = "Verificando...";

            try {
                // Petición al Backend
                const response = await AuthService.login({ 
                    telefono: inputUser.value, 
                    password: inputPass.value 
                });

                if (response.success || response.status === 'success') {
                    // ÉXITO: Guardar y Redirigir
                    const token = response.data ? response.data.token : response.token;
                    const usuario = response.data ? response.data.usuario : response.usuario;

                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('auth_token', token);
                    localStorage.setItem('user_data', JSON.stringify(usuario));

                    submitBtn.textContent = "¡Éxito!";
                    
                    // Redirección
                    const rol = usuario.rol || usuario.idRol;
                    if (rol === 1 || rol === 2) {
                        window.location.href = 'admin/dashboard.html';
                    } else {
                        window.location.href = 'inicio.html'; 
                    }

                } else {
                    // FALLO (Credenciales mal)
                    showInputError(inputUser, 'Credenciales incorrectas');
                    showInputError(inputPass, 'Verifica tu contraseña');
                }

            } catch (error) {
                console.error('Error en login:', error);
                // FALLO (Error de conexión o 404/401 del backend)
                showInputError(inputUser, 'No se encontró el usuario o la contraseña es incorrecta');
            } finally {
                if (submitBtn.textContent !== "¡Éxito!") {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Entrar";
                }
            }
        });
    }
});