document.addEventListener('DOMContentLoaded', () => {
    const historyTableBody = document.getElementById('history-table-body');

    fetch('/api/history')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(history => {
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
        })
        .catch(error => {
            console.error('Error fetching history:', error);
            const row = historyTableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 4;
            cell.textContent = 'Error al cargar el historial.';
            cell.style.textAlign = 'center';
        });
});
