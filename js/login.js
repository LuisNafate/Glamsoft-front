document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Evita que el formulario recargue la página

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    // Simulación de credenciales correctas
    const validUser = 'admin';
    const validPass = '1234';

    if (usernameInput === validUser && passwordInput === validPass) {
        // Simulación de éxito
        messageDiv.textContent = '¡Login exitoso! Redirigiendo...';
        messageDiv.className = 'message success';
        
        // Aquí iría la lógica de redirección real o manejo de token
        setTimeout(() => {
            alert('Simulación: Redirección al dashboard');
             window.location.href = 'inicio.html'; // Ejemplo de redirección real
        }, 1500);

    } else {
        // Simulación de error
        messageDiv.textContent = 'Usuario o contraseña incorrectos';
        messageDiv.className = 'message error';
    }
});