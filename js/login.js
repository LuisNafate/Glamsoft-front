document.addEventListener('DOMContentLoaded', () => {
    
    // --- LIMPIEZA PREVENTIVA ---
    // Al entrar al login, borramos cualquier sesión vieja para evitar conflictos
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('isLoggedIn');

    const loginForm = document.getElementById('loginForm');
    const userInput = document.getElementById('login-input'); 
    const passInput = document.getElementById('login-password');
    const loginBtn = document.getElementById('btnLogin');
    const msgDiv = document.getElementById('message');
    const toggleBtn = document.getElementById('toggleLoginPass');

    // 1. Toggle Password
    if (toggleBtn && passInput) {
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passInput.setAttribute('type', type);
            toggleBtn.classList.toggle('fa-eye');
            toggleBtn.classList.toggle('fa-eye-slash');
        });
    }

    // 2. Login Logic
    if (loginForm) {
   // Reemplaza el listener del submit en js/login.js con esto:
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Limpieza visual
        if(msgDiv) msgDiv.style.display = 'none';
        userInput.classList.remove('input-error');
        passInput.classList.remove('input-error');
        const btnTextoOriginal = loginBtn.textContent;
        loginBtn.disabled = true;
        loginBtn.textContent = "Verificando...";

        const valorUsuario = userInput.value.trim();
        const password = passInput.value.trim();

        try {
            let credenciales = {};
            if (valorUsuario.includes('@')) {
                credenciales = { email: valorUsuario, password: password };
            } else {
                credenciales = { telefono: valorUsuario, password: password };
            }

            const response = await AuthService.login(credenciales);
            console.log("Respuesta API Cruda:", response);

            // --- LÓGICA DE EXTRACCIÓN BLINDADA ---
            // 1. Desempaquetamos la respuesta (a veces viene doblemente anidada)
            const paquete1 = response.data || response;
            const paquete2 = paquete1.data || paquete1; 
            
            // 2. Buscamos el usuario y token en cualquiera de los niveles
            const usuario = paquete2.usuario || paquete2.user || paquete1.usuario;
            const token = paquete2.token || paquete1.token;

            if (usuario && token) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('auth_token', token);
                localStorage.setItem('user_data', JSON.stringify(usuario));

                loginBtn.style.backgroundColor = '#4CAF50'; 
                loginBtn.textContent = "¡Éxito!";

                // 3. DETECCIÓN DE ROL INTELIGENTE
                const idRol = parseInt(usuario.idRol || usuario.id_rol || 0);
                const nombreRol = String(usuario.rol || usuario.role || '').toUpperCase();

                console.log(`Diagnóstico -> ID: ${idRol}, NOMBRE: ${nombreRol}`);

                setTimeout(() => {
                    // Es Admin si el ID es 1 o 2, O si el nombre dice 'ADMIN'/'ESTILISTA'
                    if (idRol === 1 || idRol === 2 || nombreRol.includes('ADMIN') || nombreRol.includes('ESTILISTA')) {
                        window.location.href = 'admin/dashboard.html';
                    } else {
                        window.location.href = 'inicio.html';
                    }
                }, 800);

            } else {
                throw new Error(paquete1.message || 'No se pudo iniciar sesión');
            }

        } catch (error) {
            console.error("Error Login:", error);
            loginBtn.disabled = false;
            loginBtn.textContent = btnTextoOriginal;

            let mensaje = "Error al iniciar sesión.";
            if (error.response) {
                if (error.response.status === 404) mensaje = "Usuario no encontrado.";
                else if (error.response.status === 401) mensaje = "Contraseña incorrecta.";
                else if (error.response.data?.message) mensaje = error.response.data.message;
            }
            if(msgDiv) {
                msgDiv.textContent = mensaje;
                msgDiv.style.display = 'block';
            }
        }
    });
    }
});