document.addEventListener('DOMContentLoaded', () => {
    // Check if translations are loaded
    if (!window.translations) {
        console.error("Translations not found. Aborting history.js initialization.");
        return;
    }

    const historyTableBody = document.getElementById('history-table-body');
    if (!historyTableBody) return;

    fetch('/api/history')
        .then(response => {
            if (!response.ok) {
                throw new Error(window.t('serverCommunicationError'));
            }
            return response.json();
        })
        .then(history => {
            if (history.length === 0) {
                const row = historyTableBody.insertRow();
                const cell = row.insertCell();
                cell.colSpan = 4;
                cell.textContent = window.t('historyEmpty');
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
        })
        .catch(error => {
            console.error('Error fetching history:', error);
            const row = historyTableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 4;
            cell.textContent = window.t('historyError');
            cell.style.textAlign = 'center';
        });
});