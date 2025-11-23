document.addEventListener('DOMContentLoaded', () => {
    console.log("Script de Login cargado. Esperando interacción...");

    // 1. REFERENCIAS
    const loginForm = document.getElementById('loginForm');
    const userInput = document.getElementById('login-input'); // El campo de texto
    const passInput = document.getElementById('login-password');
    const loginBtn = document.getElementById('btnLogin');
    const msgDiv = document.getElementById('message');
    const toggleBtn = document.getElementById('toggleLoginPass');

    // 2. FUNCIÓN: MOSTRAR / OCULTAR CONTRASEÑA
    if (toggleBtn && passInput) {
        toggleBtn.addEventListener('click', () => {
            const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passInput.setAttribute('type', type);
            toggleBtn.classList.toggle('fa-eye');
            toggleBtn.classList.toggle('fa-eye-slash');
        });
    }

    // 3. FUNCIÓN PRINCIPAL: ENVIAR FORMULARIO
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            // ¡ESTO ES LO MÁS IMPORTANTE!
            e.preventDefault(); // Evita que la página se recargue
            console.log("Botón presionado. Iniciando proceso de login...");

            // Limpiar mensajes previos
            msgDiv.style.display = 'none';
            msgDiv.textContent = '';
            userInput.classList.remove('input-error');
            passInput.classList.remove('input-error');

            // Bloquear botón
            const btnTextoOriginal = loginBtn.textContent;
            loginBtn.disabled = true;
            loginBtn.textContent = "Verificando...";

            // Obtener valores
            const valorUsuario = userInput.value.trim();
            const password = passInput.value.trim();

            try {
                // Preparar datos para la API
                // Determinamos si es email o teléfono automáticamente
                let credenciales = {};
                if (valorUsuario.includes('@')) {
                    credenciales = { email: valorUsuario, password: password };
                } else {
                    credenciales = { telefono: valorUsuario, password: password };
                }

                console.log("Enviando a API:", credenciales);

                // LLAMADA A LA API
                const response = await AuthService.login(credenciales);
                console.log("Respuesta API:", response);

                // Verificar éxito (La API suele devolver { status: 'success', data: {...} } o similar)
                // Ajustamos para aceptar diferentes formatos de respuesta exitosa
                if (response.status === 'success' || response.success || response.token || (response.data && response.data.token)) {
                    
                    // Extraer datos
                    const data = response.data || response;
                    const token = data.token;
                    const usuario = data.usuario || data.user;

                    // Guardar en LocalStorage
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('auth_token', token);
                    localStorage.setItem('user_data', JSON.stringify(usuario));

                    // Mensaje de éxito visual
                    loginBtn.style.backgroundColor = '#4CAF50'; // Verde
                    loginBtn.textContent = "¡Éxito! Redirigiendo...";

                    // REDIRECCIÓN SEGÚN ROL
                    // Asumimos: 1=Admin, 2=Estilista, 3=Cliente
                    const idRol = usuario.idRol || usuario.rol; // Ajusta según tu BD

                    setTimeout(() => {
                        if (idRol === 1 || idRol === 2) {
                            console.log("Es Admin/Estilista -> Dashboard");
                            window.location.href = 'admin/dashboard.html';
                        } else {
                            console.log("Es Cliente -> Inicio");
                            window.location.href = 'inicio.html';
                        }
                    }, 1000);

                } else {
                    throw new Error(response.message || 'Credenciales inválidas');
                }

            } catch (error) {
                console.error("Error en Login:", error);
                
                // Restaurar botón
                loginBtn.disabled = false;
                loginBtn.textContent = btnTextoOriginal;

                // Determinar mensaje de error
                let mensaje = "Error al iniciar sesión.";
                
                if (error.response) {
                    // La API respondió con un error (ej. 404, 401)
                    if (error.response.status === 404) {
                        mensaje = "El usuario no existe.";
                    } else if (error.response.status === 401) {
                        mensaje = "Contraseña incorrecta.";
                    } else if (error.response.data && error.response.data.message) {
                        mensaje = error.response.data.message;
                    }
                } else {
                    mensaje = "No se pudo conectar con el servidor.";
                }

                // Mostrar error en pantalla
                msgDiv.textContent = mensaje;
                msgDiv.style.display = 'block';
                
                // Resaltar input con error
                if (mensaje.includes("usuario") || mensaje.includes("correo")) {
                    userInput.classList.add('input-error');
                } else if (mensaje.includes("Contraseña")) {
                    passInput.classList.add('input-error');
                }
            }
        });
    } else {
        console.error("No se encontró el formulario #loginForm en el HTML");
    }
});