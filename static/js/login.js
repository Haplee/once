document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessageDiv = document.getElementById('login-error-message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMessageDiv.style.display = 'none'; // Hide previous errors

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            try {
                const response = await fetch('static/users.json');
                if (!response.ok) {
                    throw new Error('No se pudo cargar la base de datos de usuarios.');
                }
                const users = await response.json();

                const foundUser = users.find(user => user.username === username && user.password === password);

                if (foundUser) {
                    // Store login state in session storage
                    sessionStorage.setItem('isLoggedIn', 'true');
                    // Redirect to the main page
                    window.location.href = 'index.html';
                } else {
                    errorMessageDiv.textContent = 'Usuario o contraseña incorrectos.';
                    errorMessageDiv.style.display = 'block';
                }
            } catch (error) {
                console.error('Error en el proceso de login:', error);
                errorMessageDiv.textContent = 'Ha ocurrido un error inesperado. Por favor, inténtalo más tarde.';
                errorMessageDiv.style.display = 'block';
            }
        });
    }
});
