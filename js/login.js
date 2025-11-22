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
                email: email
            }));
            localStorage.setItem('isLoggedIn', 'true');

            setTimeout(() => {
                window.location.href = 'inicio.html';
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