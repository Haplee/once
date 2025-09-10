// Espera a que el contenido del DOM esté completamente cargado.
document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM.
    const connectButton = document.getElementById('connectSerialButton');
    const machineModelSelect = document.getElementById('machineModelSelect');
    const serialControls = document.getElementById('serial-controls');
    const sendButton = document.getElementById('sendSerialButton');
    const commandInput = document.getElementById('serialCommandInput');
    const consoleLog = document.getElementById('serialConsole');

    // Variables para gestionar el puerto serie.
    let port;
    let writer;
    let reader;

    const baudRate = 9600;

    /**
     * Appends a message to the on-page console with a timestamp and color-coding.
     * @param {string} message - The message to log.
     * @param {'info'|'sent'|'received'|'error'} [type='info'] - The type of message, for styling.
     */
    function logToConsole(message, type = 'info') {
        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        let color;
        switch (type) {
            case 'sent': color = '#007bff'; break;
            case 'received': color = '#28a745'; break;
            case 'error': color = '#dc3545'; break;
            default: color = '#333';
        }

        consoleLog.innerHTML += `<span style="color: ${color};">[${timeString}] ${message}</span>\n`;
        consoleLog.scrollTop = consoleLog.scrollHeight;
    }

    // Check for Web Serial API compatibility and set up initial event listeners.
    if ('serial' in navigator) {
        connectButton.addEventListener('click', connectToSerial);
        sendButton.addEventListener('click', sendSerialData);
        machineModelSelect.addEventListener('change', sendConfiguration);
    } else {
        logToConsole('Error: La Web Serial API no es compatible con este navegador.', 'error');
        connectButton.disabled = true;
        machineModelSelect.disabled = true;
    }

    /**
     * Sends the selected machine model configuration to the connected device.
     * This is triggered when the dropdown value changes.
     */
    async function sendConfiguration() {
        if (writer) {
            const model = machineModelSelect.value;
            const command = `CONFIG:${model}\n`;
            try {
                await writer.write(command);
                logToConsole(`Configuración enviada: Modelo ${model}`, 'sent');
            } catch (error) {
                logToConsole(`Error al enviar configuración: ${error.message}`, 'error');
            }
        }
    }

    /**
     * Initiates a connection to a serial device.
     * It prompts the user to select a port, opens it, and sets up readers/writers.
     */
    async function connectToSerial() {
        try {
            port = await navigator.serial.requestPort();
            await port.open({ baudRate });
            logToConsole('Conectado al puerto serie.', 'info');

            const textEncoder = new TextEncoderStream();
            textEncoder.readable.pipeTo(port.writable);
            writer = textEncoder.writable.getWriter();

            const textDecoder = new TextDecoderStream();
            port.readable.pipeTo(textDecoder.writable);
            reader = textDecoder.readable.getReader();

            // Update UI to reflect connected state
            serialControls.style.display = 'block';
            connectButton.textContent = 'Desconectar';
            connectButton.classList.replace('btn-primary', 'btn-danger');

            // Switch event listener from connect to disconnect
            connectButton.removeEventListener('click', connectToSerial);
            connectButton.addEventListener('click', disconnectFromSerial);

            await sendConfiguration(); // Send initial configuration
            readLoop(); // Start listening for data

        } catch (error) {
            logToConsole(`Error al conectar: ${error.message}`, 'error');
        }
    }

    /**
     * Disconnects from the serial port and resets the UI to its initial state.
     */
    async function disconnectFromSerial() {
        if (!port) return;

        try {
            if (reader) {
                await reader.cancel();
                reader.releaseLock();
                reader = null;
            }
            if (writer) {
                await writer.close();
                writer = null;
            }
            await port.close();
            port = null;

            logToConsole('Desconectado del puerto serie.', 'info');
        } catch (error) {
            logToConsole(`Error al desconectar: ${error.message}`, 'error');
        } finally {
            // Restore UI to initial state
            serialControls.style.display = 'none';
            connectButton.textContent = 'Conectar Dispositivo';
            connectButton.classList.replace('btn-danger', 'btn-primary');
            machineModelSelect.disabled = false;

            // Switch event listener back to connect
            connectButton.removeEventListener('click', disconnectFromSerial);
            connectButton.addEventListener('click', connectToSerial);
        }
    }

    /**
     * Continuously reads data from the serial port and logs it to the console.
     * The loop is broken when the reader is cancelled or an error occurs.
     */
    async function readLoop() {
        try {
            while (port && port.readable) {
                const { value, done } = await reader.read();
                if (done) {
                    break;
                }
                if (value) {
                    logToConsole(`Recibido: ${value}`, 'received');
                }
            }
        } catch (error) {
            if (!error.message.includes('The read operation was cancelled')) {
                logToConsole(`Error de lectura: ${error.message}`, 'error');
            }
            await disconnectFromSerial();
        }
    }

    /**
     * Sends the text from the command input field to the connected serial device.
     */
    async function sendSerialData() {
        const dataToSend = commandInput.value;
        if (dataToSend && writer) {
            try {
                await writer.write(dataToSend + '\n');
                logToConsole(`Enviado: ${dataToSend}`, 'sent');
                commandInput.value = '';
                commandInput.focus();
            } catch (error) {
                logToConsole(`Error al enviar: ${error.message}`, 'error');
            }
        }
    }

    // Permite enviar datos presionando "Enter" en el campo de texto.
    commandInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            sendSerialData();
        }
    });

    // Escucha eventos de desconexión del dispositivo (ej. si se desenchufa).
    navigator.serial.addEventListener('disconnect', (event) => {
        if (port && event.target === port) {
            disconnectFromSerial();
        }
    });
});
