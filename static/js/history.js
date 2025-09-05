document.addEventListener('DOMContentLoaded', () => {

    /**
     * Handles the theme switching between light and dark mode.
     * It persists the user's preference in localStorage.
     */
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        // Apply saved theme on load
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            document.body.classList.add(currentTheme);
            if (currentTheme === 'dark-mode') {
                themeToggleButton.checked = true;
            }
        }
        // Add event listener for theme changes
        themeToggleButton.addEventListener('change', function() {
            if(this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light-mode');
            }
        });
    }

    /**
     * Loads and displays the transaction history from localStorage.
     */
    const historyTableBody = document.getElementById('history-table-body');
    const history = JSON.parse(localStorage.getItem('transactionHistory')) || [];

    if (history.length === 0) {
        const row = historyTableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 4;
        cell.textContent = 'No hay operaciones registradas.';
        cell.style.textAlign = 'center';
    } else {
        history.forEach(item => {
            const row = historyTableBody.insertRow();

            const cellDate = row.insertCell();
            cellDate.textContent = item.timestamp;

            const cellTotal = row.insertCell();
            cellTotal.textContent = `${item.total.toFixed(2)} €`;

            const cellReceived = row.insertCell();
            cellReceived.textContent = `${item.received.toFixed(2)} €`;

            const cellChange = row.insertCell();
            cellChange.textContent = `${item.change.toFixed(2)} €`;
        });
    }
});
