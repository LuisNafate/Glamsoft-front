document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const messageDiv = document.getElementById('message');

    try {
        messageDiv.textContent = 'Iniciando sesión...';
        messageDiv.className = 'message';

        // Usar AuthService para login
        const response = await AuthService.login({ email, password });

        if (response.success) {
            messageDiv.textContent = '¡Login exitoso! Redirigiendo...';
            messageDiv.className = 'message success';

            // Guardar token y datos de usuario
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user_data', JSON.stringify({
                userId: response.userID,
                email: email,
                idRol: response.idRol || response.rol || 3
            }));
            localStorage.setItem('isLoggedIn', 'true');

            // Redirigir según el rol del usuario
            setTimeout(() => {
                const userRole = response.idRol || response.rol;
                
                // Rol 1 = Admin → Panel de administración
                if (userRole === 1 || userRole === '1') {
                    window.location.href = 'admin/dashboard.html';
                } 
                // Rol 2 = Empleado → Panel de administración
                else if (userRole === 2 || userRole === '2') {
                    window.location.href = 'admin/dashboard.html';
                } 
                // Rol 3 = Cliente → Página de inicio
                else {
                    window.location.href = 'inicio.html';
                }
            }, 1000);
        } else {
            throw new Error(response.message || 'Error al iniciar sesión');
        }
    } catch (error) {
        console.error('Error en login:', error);
        messageDiv.textContent = error.message || 'Correo o contraseña incorrectos';
        messageDiv.className = 'message error';
    }
});