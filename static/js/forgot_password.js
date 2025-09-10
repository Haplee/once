document.addEventListener('DOMContentLoaded', () => {

    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const messageDiv = document.getElementById('forgot-password-message');
    const usernameInput = document.getElementById('username');

    const displayMessage = (element, i18nKey, defaultText) => {
        // Usa la clave de traducción para el mensaje
        element.setAttribute('data-i18n-key', i18nKey);
        // La traducción real la hará i18n.js, pero mostramos un texto por si acaso.
        element.textContent = defaultText;
        element.style.display = 'block';
    };

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = usernameInput.value.trim();
            if (!username) {
                // Opcional: se podría añadir un mensaje de error si el campo está vacío.
                // Por ahora, simplemente mostramos el mensaje de confirmación genérico.
            }

            // Muestra un mensaje de confirmación genérico por razones de seguridad.
            // No revela si el nombre de usuario existe o no.
            const confirmationText = 'Si existe una cuenta con ese nombre de usuario, se han enviado las instrucciones para recuperar la contraseña a la dirección de correo asociada.';
            displayMessage(messageDiv, 'forgotPasswordConfirmation', confirmationText);

            // Deshabilita el formulario para evitar envíos múltiples.
            usernameInput.disabled = true;
            forgotPasswordForm.querySelector('button').disabled = true;
        });
    }
});
