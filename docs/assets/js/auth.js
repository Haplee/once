// Este script comprueba si el usuario ha iniciado sesión.
// Debe ser incluido en la cabecera (<head>) de todas las páginas protegidas.
(function() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        // Si el usuario no ha iniciado sesión, redirigirlo a la página de login.
        // Se asume que esta página está en el mismo nivel de directorio que login.html.
        window.location.href = 'login.html';
    }
})();
