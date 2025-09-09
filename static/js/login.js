document.addEventListener('DOMContentLoaded', () => {
    // Limpiar cualquier estado de sesión anterior para asegurar un inicio de sesión limpio.
    sessionStorage.clear();

    // Los datos de usuario se internalizan para evitar la necesidad de 'fetch' y un servidor.
    const users = [
        {
            "username": "test",
            "password": "123"
        }
    ];

    const loginForm = document.getElementById('login-form');
    const errorMessageDiv = document.getElementById('login-error-message');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');

    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            // Toggle the type attribute
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            // Toggle the icon
            const icon = togglePasswordBtn.querySelector('i');
            if (type === 'password') {
                icon.classList.remove('bi-eye');
                icon.classList.add('bi-eye-slash');
            } else {
                icon.classList.remove('bi-eye-slash');
                icon.classList.add('bi-eye');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            errorMessageDiv.style.display = 'none'; // Hide previous errors

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            const foundUser = users.find(user => user.username === username && user.password === password);

            if (foundUser) {
                // Store login state in session storage
                sessionStorage.setItem('isLoggedIn', 'true');
                // Redirect to the main page
                window.location.href = 'index.html';
            } else {
                // Usar la clave de traducción para el mensaje de error
                errorMessageDiv.setAttribute('data-i18n-key', 'loginErrorIncorrect');
                // La traducción real la hará i18n.js, pero mostramos un texto por si acaso.
                errorMessageDiv.textContent = 'Usuario o contraseña incorrectos.';
                errorMessageDiv.style.display = 'block';
            }
        });
    }
});
