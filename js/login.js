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
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            // Reset UI
            if(msgDiv) msgDiv.style.display = 'none';
            userInput.classList.remove('input-error');
            passInput.classList.remove('input-error');
            
            // Loading State
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
                console.log("API Response:", response); // MIRA ESTO EN CONSOLA SI FALLA

                if (response.status === 'success' || response.success || (response.data && response.data.token)) {
                    
                    const data = response.data || response;
                    const token = data.token;
                    const usuario = data.usuario || data.user;

                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('auth_token', token);
                    localStorage.setItem('user_data', JSON.stringify(usuario));

                    loginBtn.style.backgroundColor = '#4CAF50'; 
                    loginBtn.textContent = "¡Éxito!";

                    // --- DETECCIÓN DE ROL ---
                    // Buscamos cualquier indicio del rol en el objeto
                    const rol = usuario.rol || usuario.idRol || usuario.role;
                    
                    // Normalizamos a string minúscula para comparar fácil
                    // '1', 1, 'Admin', 'ADMIN' -> todos pasan
                    const rolStr = String(rol).toLowerCase();

                    console.log("Rol detectado para redirección:", rolStr);

                    setTimeout(() => {
                        // Si es 1, 2, admin o estilista -> Dashboard
                        if (rolStr === '1' || rolStr === '2' || rolStr.includes('admin') || rolStr.includes('estilista')) {
                            window.location.href = 'admin/dashboard.html';
                        } else {
                           // window.location.href = '.html';
                        }
                    }, 800);

                } else {
                    throw new Error(response.message || 'Credenciales inválidas');
                }

            } catch (error) {
                console.error("Login Error:", error);
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