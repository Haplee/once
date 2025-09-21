self.onmessage = function(e) {
    const data = e.data;

    if (data.action === 'save') {
        // Add a timestamp to the new data
        data.payload.timestamp = new Date().toLocaleString('es-ES');

        // Send the processed payload back to the main thread for localStorage operations
        self.postMessage({ status: 'success', payload: data.payload });
    }
};
