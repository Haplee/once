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

    const baudRate = 9600; // Baud rate configurable.

    // Función para añadir mensajes a la consola en la página.
    function logToConsole(message, type = 'info') {
        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        let color = '#333'; // Color por defecto para 'info'.
        if (type === 'sent') {
            color = '#007bff'; // Azul para mensajes enviados.
        } else if (type === 'received') {
            color = '#28a745'; // Verde para mensajes recibidos.
        } else if (type === 'error') {
            color = '#dc3545'; // Rojo para errores.
        }

        consoleLog.innerHTML += `<span style="color: ${color};">[${timeString}] ${message}</span>\n`;
        // Desplaza la consola hacia abajo automáticamente para ver el último mensaje.
        consoleLog.scrollTop = consoleLog.scrollHeight;
    }

    // Comprueba si la Web Serial API es compatible con el navegador.
    if ('serial' in navigator) {
        connectButton.addEventListener('click', connectToSerial);
        sendButton.addEventListener('click', sendSerialData);
        machineModelSelect.addEventListener('change', sendConfiguration);
    } else {
        logToConsole('Error: La Web Serial API no es compatible con este navegador.', 'error');
        connectButton.disabled = true;
        machineModelSelect.disabled = true;
    }

    // Función para enviar la configuración del modelo de máquina al Arduino.
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

    // Función para conectar al puerto serie.
    async function connectToSerial() {
        try {
            // Solicita al usuario que seleccione un puerto serie.
            port = await navigator.serial.requestPort();
            // Abre el puerto con el baud rate especificado.
            await port.open({ baudRate });

            logToConsole('Conectado al puerto serie.', 'info');

            // Prepara el stream para enviar datos (codifica texto a UTF-8).
            const textEncoder = new TextEncoderStream();
            const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
            writer = textEncoder.writable.getWriter();

            // Prepara el stream para recibir datos (decodifica UTF-8 a texto).
            const textDecoder = new TextDecoderStream();
            const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
            reader = textDecoder.readable.getReader();

            // Muestra los controles de envío y actualiza el botón de conexión.
            serialControls.style.display = 'block';
            connectButton.textContent = 'Desconectar';
            connectButton.classList.remove('btn-primary');
            connectButton.classList.add('btn-danger');

            // Cambia el evento del botón para desconectar.
            connectButton.removeEventListener('click', connectToSerial);
            connectButton.addEventListener('click', disconnectFromSerial);

            // Envía la configuración inicial del modelo de máquina.
            await sendConfiguration();

            // Inicia el bucle de lectura.
            readLoop();

        } catch (error) {
            logToConsole(`Error al conectar: ${error.message}`, 'error');
        }
    }

    // Función para desconectar del puerto serie.
    async function disconnectFromSerial() {
        if (!port || !port.writable) {
            return;
        }

        try {
            // Cierra el escritor y el lector antes de cerrar el puerto.
            if (writer) {
                await writer.close();
            }
            if (reader) {
                await reader.cancel(); // Esto provoca que el bucle de lectura termine.
            }

            await port.close();

        } catch (error) {
            // No es necesario un log de error aquí, ya que el evento 'disconnect' se encargará.
        } finally {
            port = null;
            writer = null;
            reader = null;

            logToConsole('Desconectado del puerto serie.', 'info');

            // Restaura la interfaz de usuario a su estado inicial.
            serialControls.style.display = 'none';
            connectButton.textContent = 'Conectar Dispositivo';
            connectButton.classList.remove('btn-danger');
            connectButton.classList.add('btn-primary');
            machineModelSelect.disabled = false; // Habilita el selector de nuevo.

            // Cambia el evento del botón de nuevo a conectar.
            connectButton.removeEventListener('click', disconnectFromSerial);
            connectButton.addEventListener('click', connectToSerial);
        }
    }

    // Bucle para leer datos del puerto serie continuamente.
    async function readLoop() {
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    // El lector se ha cerrado, salir del bucle.
                    reader.releaseLock();
                    break;
                }
                if (value) {
                    logToConsole(`Recibido: ${value}`, 'received');
                }
            }
        } catch (error) {
            logToConsole(`Error de lectura: ${error.message}`, 'error');
            await disconnectFromSerial();
        }
    }

    // Función para enviar datos al puerto serie.
    async function sendSerialData() {
        const dataToSend = commandInput.value;
        if (dataToSend && writer) {
            try {
                // Se añade '\n' para que Arduino pueda usar readStringUntil('\n').
                await writer.write(dataToSend + '\n');
                logToConsole(`Enviado: ${dataToSend}`, 'sent');
                commandInput.value = ''; // Limpia el input.
                commandInput.focus(); // Devuelve el foco al input.
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
