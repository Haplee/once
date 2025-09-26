document.addEventListener('DOMContentLoaded', () => {
    // Check if translations are loaded
    if (!window.translations) {
        console.error("Translations not found. Aborting serial.js initialization.");
        return;
    }

    // References to DOM elements.
    const connectButton = document.getElementById('connectSerialButton');
    const machineModelSelect = document.getElementById('machineModelSelect');
    const serialControls = document.getElementById('serial-controls');
    const sendButton = document.getElementById('sendSerialButton');
    const commandInput = document.getElementById('serialCommandInput');
    const consoleLog = document.getElementById('serialConsole');

    // Check if all required elements are on the page.
    if (!connectButton || !machineModelSelect || !serialControls || !sendButton || !commandInput || !consoleLog) {
        return; // Exit if this is not the settings page.
    }

    // Variables for managing the serial port.
    let port;
    let writer;
    let reader;
    const baudRate = 9600;

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

    if ('serial' in navigator) {
        connectButton.addEventListener('click', connectToSerial);
        sendButton.addEventListener('click', sendSerialData);
        machineModelSelect.addEventListener('change', sendConfiguration);
    } else {
        logToConsole(window.t('serialNotSupported'), 'error');
        connectButton.disabled = true;
        machineModelSelect.disabled = true;
    }

    async function sendConfiguration() {
        if (writer) {
            const model = machineModelSelect.value;
            const command = `CONFIG:${model}\n`;
            try {
                await writer.write(command);
                logToConsole(window.t('serialConfigSent', { model }), 'sent');
            } catch (error) {
                logToConsole(window.t('serialConfigError', { error: error.message }), 'error');
            }
        }
    }

    async function connectToSerial() {
        try {
            port = await navigator.serial.requestPort();
            await port.open({ baudRate });
            logToConsole(window.t('serialConnected'), 'info');

            const textEncoder = new TextEncoderStream();
            textEncoder.readable.pipeTo(port.writable);
            writer = textEncoder.writable.getWriter();

            const textDecoder = new TextDecoderStream();
            port.readable.pipeTo(textDecoder.writable);
            reader = textDecoder.readable.getReader();

            serialControls.style.display = 'block';
            connectButton.textContent = window.t('serialDisconnect');
            connectButton.classList.replace('btn-primary', 'btn-danger');
            connectButton.removeEventListener('click', connectToSerial);
            connectButton.addEventListener('click', disconnectFromSerial);

            await sendConfiguration();
            readLoop();
        } catch (error) {
            logToConsole(window.t('serialConnectError', { error: error.message }), 'error');
        }
    }

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
            logToConsole(window.t('serialDisconnected'), 'info');
        } catch (error) {
            logToConsole(window.t('serialDisconnectError', { error: error.message }), 'error');
        } finally {
            serialControls.style.display = 'none';
            connectButton.textContent = window.t('settingsSerialConnect');
            connectButton.classList.replace('btn-danger', 'btn-primary');
            machineModelSelect.disabled = false;
            connectButton.removeEventListener('click', disconnectFromSerial);
            connectButton.addEventListener('click', connectToSerial);
        }
    }

    async function readLoop() {
        try {
            while (port && port.readable) {
                const { value, done } = await reader.read();
                if (done) break;
                if (value) {
                    logToConsole(window.t('serialReceived', { value }), 'received');
                }
            }
        } catch (error) {
            if (!error.message.includes('The read operation was cancelled')) {
                logToConsole(window.t('serialReadError', { error: error.message }), 'error');
            }
            await disconnectFromSerial();
        }
    }

    async function sendSerialData() {
        const dataToSend = commandInput.value;
        if (dataToSend && writer) {
            try {
                await writer.write(dataToSend + '\n');
                logToConsole(window.t('serialSent', { data: dataToSend }), 'sent');
                commandInput.value = '';
                commandInput.focus();
            } catch (error) {
                logToConsole(window.t('serialSendError', { error: error.message }), 'error');
            }
        }
    }

    commandInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') sendSerialData();
    });

    navigator.serial.addEventListener('disconnect', (event) => {
        if (port && event.target === port) disconnectFromSerial();
    });
});