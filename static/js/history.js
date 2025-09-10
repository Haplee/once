document.addEventListener('DOMContentLoaded', () => {

    // --- Theme Management ---
    // Note: This is a simplified theme handler specific to the history page.
    // It ensures the theme toggle reflects the state from localStorage and applies it.
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        // Apply saved theme on initial page load.
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            document.body.classList.add(currentTheme);
            if (currentTheme === 'dark-mode') {
                themeToggleButton.checked = true;
            }
        }
        // Listen for changes on the toggle to update theme in real-time and in storage.
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

    // --- History Loading ---
    // Fetches transaction history from localStorage and populates the table.
    // If no history is found, it displays a message to the user.
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
