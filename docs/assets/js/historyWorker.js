self.onmessage = function(e) {
    const data = e.data;

    if (data.action === 'save') {
        try {
            // Get existing history or initialize a new array
            const history = JSON.parse(localStorage.getItem('transactionHistory')) || [];

            // Add a timestamp to the new data
            data.payload.timestamp = new Date().toLocaleString('es-ES');

            // Add the new transaction to the beginning of the array
            history.unshift(data.payload);

            // Save back to localStorage
            localStorage.setItem('transactionHistory', JSON.stringify(history));

            // Optional: send a success message back to the main thread
            self.postMessage({ status: 'success' });
        } catch (error) {
            // Optional: send an error message back to the main thread
            self.postMessage({ status: 'error', error: error.message });
        }
    }
};
