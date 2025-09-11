document.addEventListener('DOMContentLoaded', () => {

    const signupForm = document.getElementById('signup-form');
    const errorMessageDiv = document.getElementById('signup-error-message');
    const successMessageDiv = document.getElementById('signup-success-message');

    // Hardcoded base user to prevent re-registration of 'test'.
    const baseUsers = [{ "username": "test" }];

    const getCustomUsers = () => {
        try {
            const usersJson = localStorage.getItem('custom_users');
            return usersJson ? JSON.parse(usersJson) : [];
        } catch (e) {
            console.error("Error parsing custom users from localStorage", e);
            return [];
        }
    };

    const saveCustomUsers = (users) => {
        localStorage.setItem('custom_users', JSON.stringify(users));
    };

    const displayMessage = (element, i18nKey, defaultText) => {
        // Usa la clave de traducción para el mensaje
        element.setAttribute('data-i18n-key', i18nKey);
        // La traducción real la hará i18n.js, pero mostramos un texto por si acaso.
        element.textContent = defaultText;
        element.style.display = 'block';
    };

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            errorMessageDiv.style.display = 'none';
            successMessageDiv.style.display = 'none';

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirm-password').value.trim();

            // --- Validación ---
            if (!username || !password || !confirmPassword) {
                displayMessage(errorMessageDiv, 'signupErrorRequired', 'Por favor, completa todos los campos.');
                return;
            }

            if (password !== confirmPassword) {
                displayMessage(errorMessageDiv, 'signupErrorPasswordsMismatch', 'Las contraseñas no coinciden.');
                return;
            }

            // --- Comprobación de usuario existente ---
            const customUsers = getCustomUsers();
            const allUsers = [...baseUsers, ...customUsers];
            const userExists = allUsers.some(user => user.username.toLowerCase() === username.toLowerCase());

            if (userExists) {
                displayMessage(errorMessageDiv, 'signupErrorUserExists', 'El nombre de usuario ya existe. Por favor, elige otro.');
                return;
            }

            // --- Registro del nuevo usuario ---
            const newUser = { username, password };
            customUsers.push(newUser);
            saveCustomUsers(customUsers);

            // --- Mensaje de éxito y redirección ---
            displayMessage(successMessageDiv, 'signupSuccess', '¡Registro completado! Ahora puedes iniciar sesión.');

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000); // Redirige después de 2 segundos.
        });
    }
});
