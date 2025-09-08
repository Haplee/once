document.addEventListener('DOMContentLoaded', () => {
    // Limpiar cualquier estado de sesión anterior para asegurar un inicio de sesión limpio.
    sessionStorage.clear();

    const loginForm = document.getElementById('login-form');
    const errorMessageDiv = document.getElementById('login-error-message');

    // Function to fetch users from the JSON file
    async function getUsers() {
        try {
            const response = await fetch('static/users.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Could not fetch users:", error);
            // Return an empty array or handle the error as appropriate
            return [];
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMessageDiv.style.display = 'none'; // Hide previous errors

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            // Fetch the users and then find the matching user
            const users = await getUsers();
            const foundUser = users.find(user => user.username === username && user.password === password);

            if (foundUser) {
                // Store login state in session storage
                sessionStorage.setItem('isLoggedIn', 'true');
                // Redirect to the main page
                window.location.href = 'index.html';
            } else {
                // Use the translation key for the error message
                errorMessageDiv.setAttribute('data-i18n-key', 'loginErrorIncorrect');
                // The actual translation will be handled by i18n.js, but we show a fallback text.
                errorMessageDiv.textContent = 'Usuario o contraseña incorrectos.';
                errorMessageDiv.style.display = 'block';
            }
        });
    }
});
