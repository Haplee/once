document.addEventListener('DOMContentLoaded', () => {
    // --- Theme & i18n Initialization ---
    const applyTheme = () => {
        const savedTheme = localStorage.getItem('once_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', savedTheme);
    };

    applyTheme();
    if (window.I18N) {
        I18N.applyToDOM();
    }

    // --- User Data ---
    sessionStorage.clear();
    const baseUsers = [{ "username": "test", "password": "123" }];
    const getCustomUsers = () => {
        try {
            const usersJson = localStorage.getItem('custom_users');
            return usersJson ? JSON.parse(usersJson) : [];
        } catch (e) {
            console.error("Error parsing custom users from localStorage", e);
            return [];
        }
    };
    const allUsers = [...baseUsers, ...getCustomUsers()];

    // --- Form Handling Logic ---
    const handleLogin = (e) => {
        e.preventDefault();

        const form = e.target;
        const isMobile = form.id === 'mobile-login-form';
        const username = document.getElementById(isMobile ? 'mobile-username' : 'username').value.trim();
        const password = document.getElementById(isMobile ? 'mobile-password' : 'password').value.trim();
        const errorMessageDiv = document.getElementById(isMobile ? 'mobile-login-error-message' : 'login-error-message');

        errorMessageDiv.style.display = 'none';

        const foundUser = allUsers.find(user => user.username === username && user.password === password);

        if (foundUser) {
            sessionStorage.setItem('isLoggedIn', 'true');
            window.location.href = 'index.html';
        } else {
            errorMessageDiv.setAttribute('data-i18n', 'loginErrorIncorrect');
            errorMessageDiv.textContent = I18N.t('loginErrorIncorrect'); // Set text immediately
            errorMessageDiv.style.display = 'block';
        }
    };

    const desktopForm = document.getElementById('login-form');
    const mobileForm = document.getElementById('mobile-login-form');

    if (desktopForm) desktopForm.addEventListener('submit', handleLogin);
    if (mobileForm) mobileForm.addEventListener('submit', handleLogin);


    // --- Password Toggle ---
    const togglePasswordBtn = document.getElementById('toggle-password');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            const icon = togglePasswordBtn.querySelector('i');
            icon.classList.toggle('bi-eye');
            icon.classList.toggle('bi-eye-slash');
        });
    }
});
