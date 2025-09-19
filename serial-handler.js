/**
 * serial-handler.js
 *
 * Este script gestiona toda la lógica para interactuar con la Web Serial API
 * de forma robusta y segura.
 *
 * Estructura:
 * 1. Referencias a elementos del DOM.
 * 2. Estado de la aplicación (puerto, conexión, etc.).
 * 3. Lógica de conexión y desconexión.
 * 4. Bucle de lectura de datos del puerto.
 * 5. Funciones de utilidad para actualizar la UI y registrar mensajes.
 * 6. Inicialización y asignación de eventos.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Referencias a Elementos del DOM ---
    const connectButton = document.getElementById('connect-button');
    const disconnectButton = document.getElementById('disconnect-button');
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const statusDisplay = document.getElementById('status-display');
    const logArea = document.getElementById('log');
    const infoMessage = document.getElementById('info-message');

    // --- 2. Estado de la Aplicación ---
    let port;
    let reader;
    let writer;
    let isConnecting = false;
    let connectionAttempts = 0;
    const MAX_CONNECTION_ATTEMPTS = 3;

    // Objeto para cancelar el bucle de lectura de forma segura
    let keepReading = true;


    // --- 3. Funciones Principales (Conexión, Desconexión, Envío) ---

    /**
     * Inicia el proceso de conexión. Se llama al hacer clic en el botón "Conectar".
     */
    const connectToDevice = async () => {
        if (isConnecting) {
            logToPage('INFO', 'Ya se está intentando establecer una conexión.');
            return;
        }

        isConnecting = true;
        connectionAttempts = 0;
        updateUIState('connecting', 'Intentando conectar...');

        try {
            // Solicita al usuario que seleccione un puerto serie.
            // Esto DEBE ser llamado desde un gesto de usuario (como un clic).
            logToPage('INFO', 'Solicitando selección de puerto al usuario...');
            port = await navigator.serial.requestPort();

            // Si el usuario selecciona un puerto, procedemos a abrirlo y leerlo.
            logToPage('INFO', 'Puerto seleccionado. Procediendo a abrir...');
            await openAndReadFromPort();

        } catch (error) {
            // El usuario canceló el diálogo de selección de puerto.
            if (error.name === 'NotFoundError') {
                logToPage('WARN', 'Selección de puerto cancelada por el usuario.');
            } else {
                logToPage('ERROR', `Error al solicitar el puerto: ${error.message}`);
            }
            updateUIState('disconnected');
        } finally {
            isConnecting = false;
        }
    };

    /**
     * Abre el puerto seleccionado, configura los streams y comienza a leer.
     */
    const openAndReadFromPort = async () => {
        if (!port) return;

        try {
            // Configuración del puerto. El baudRate debe coincidir con el del dispositivo.
            await port.open({ baudRate: 9600 });

            // Escucha el evento de desconexión física (si se desenchufa el USB)
            port.addEventListener('disconnect', handleDisconnectEvent);

            // --- Configuración de Streams Seguros ---
            // TextDecoderStream convierte los chunks (Uint8Array) a texto.
            const textDecoder = new TextDecoderStream();
            // readable.pipeTo() bloquea, por lo que lo usamos en un "olvidar y continuar"
            keepReading = true;
            const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
            reader = textDecoder.readable.getReader();

            // TextEncoderStream convierte el texto a Uint8Array para enviarlo.
            const textEncoder = new TextEncoderStream();
            const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
            writer = textEncoder.writable.getWriter();

            logToPage('SUCCESS', 'Puerto abierto y streams configurados.');
            updateUIState('connected');
            connectionAttempts = 0; // Reiniciar contador en conexión exitosa

            // Iniciar el bucle de lectura
            readLoop();

        } catch (error) {
            logToPage('ERROR', `No se pudo abrir el puerto: ${error.message}`);
            handleConnectionFailure();
        }
    };

    /**
     * Cierra el puerto y todos los streams de forma segura.
     */
    const disconnectFromDevice = async () => {
        keepReading = false; // Señal para detener el bucle de lectura

        // Cancelar el reader para desbloquearlo si está esperando datos
        if (reader) {
            try {
                await reader.cancel();
            } catch (error) {
                // Ignorar errores de cancelación, son esperados
            }
        }

        // Cerrar el writer
        if (writer) {
            try {
                await writer.close();
            } catch (error) {
                logToPage('ERROR', `Error al cerrar el writer: ${error.message}`);
            }
        }

        // Cerrar el puerto
        if (port) {
            try {
                await port.close();
            } catch (error) {
                logToPage('ERROR', `Error al cerrar el puerto: ${error.message}`);
            }
        }

        port = null;
        reader = null;
        writer = null;

        logToPage('INFO', 'Puerto desconectado por el usuario.');
        updateUIState('disconnected');
    };

    /**
     * Envía un mensaje de texto al dispositivo conectado.
     */
    const sendMessage = async () => {
        const message = messageInput.value;
        if (!message) {
            logToPage('WARN', 'El mensaje está vacío.');
            return;
        }

        if (!writer) {
            logToPage('ERROR', 'No hay un writer activo. ¿Estás conectado?');
            return;
        }

        try {
            logToPage('SENT', `-> ${message}`);
            await writer.write(message + '\n'); // Añadimos un salto de línea, común en comunicación serie
            messageInput.value = ''; // Limpiar input tras enviar
        } catch (error) {
            logToPage('ERROR', `Error al enviar el mensaje: ${error.message}`);
        }
    };


    // --- 4. Bucle de Lectura y Manejo de Eventos ---

    /**
     * Bucle que lee continuamente los datos del puerto serie.
     */
    async function readLoop() {
        while (port && port.readable && keepReading) {
            try {
                const { value, done } = await reader.read();

                if (done) {
                    // El reader ha sido cancelado. Salimos del bucle.
                    break;
                }

                // Sanitizamos la salida usando textContent en logToPage
                logToPage('RECEIVED', `<- ${value}`);

            } catch (error) {
                logToPage('ERROR', `Error en el bucle de lectura: ${error.message}`);
                // Si el error es por desconexión, el evento 'disconnect' se encargará
                break;
            }
        }
    }

    /**
     * Maneja el evento de desconexión física del dispositivo.
     */
    const handleDisconnectEvent = (event) => {
        logToPage('WARN', '¡Dispositivo desconectado físicamente!');
        // Limpiar recursos sin intentar cerrar el puerto (ya está perdido)
        keepReading = false;
        reader?.cancel();
        writer?.close();
        port = null;
        reader = null;
        writer = null;
        updateUIState('disconnected');
    };

    /**
     * Gestiona los fallos de conexión y reintentos.
     */
    const handleConnectionFailure = () => {
        connectionAttempts++;
        if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
            logToPage('WARN', `Intento de conexión ${connectionAttempts} fallido. Reintentando en 3 segundos...`);
            setTimeout(openAndReadFromPort, 3000);
        } else {
            logToPage('ERROR', `No se pudo conectar tras ${MAX_CONNECTION_ATTEMPTS} intentos.`);
            updateUIState('disconnected');
        }
    };


    // --- 5. Funciones de Utilidad ---

    /**
     * Actualiza la interfaz de usuario según el estado de la conexión.
     * @param {'connected'|'disconnected'|'connecting'} state
     * @param {string} [message=null] - Mensaje a mostrar en el estado.
     */
    const updateUIState = (state, message = null) => {
        switch (state) {
            case 'connected':
                statusDisplay.textContent = message || 'Conectado';
                statusDisplay.className = 'connected';
                connectButton.disabled = true;
                disconnectButton.disabled = false;
                sendButton.disabled = false;
                messageInput.disabled = false;
                break;

            case 'connecting':
                statusDisplay.textContent = message || 'Conectando...';
                statusDisplay.className = 'connecting';
                connectButton.disabled = true;
                disconnectButton.disabled = true;
                sendButton.disabled = true;
                messageInput.disabled = true;
                break;

            case 'disconnected':
            default:
                statusDisplay.textContent = message || 'Desconectado';
                statusDisplay.className = 'disconnected';
                connectButton.disabled = false;
                disconnectButton.disabled = true;
                sendButton.disabled = true;
                messageInput.disabled = true;
                break;
        }
    };

    /**
     * Añade un mensaje al área de log. Usa textContent para ser inmune a XSS.
     * @param {'INFO'|'ERROR'|'WARN'|'SUCCESS'|'SENT'|'RECEIVED'} type
     * @param {string} text - El mensaje a mostrar.
     */
    const logToPage = (type, text) => {
        const logEntry = document.createElement('p');
        // Usar textContent es la clave para prevenir XSS.
        // Nunca interpreta el string como HTML.
        logEntry.textContent = `[${type}] ${new Date().toLocaleTimeString()}: ${text}`;
        logArea.appendChild(logEntry);

        // Auto-scroll al final del log
        logArea.scrollTop = logArea.scrollHeight;
    };


    // --- 6. Inicialización ---

    /**
     * Función principal que se ejecuta al cargar la página.
     */
    const initialize = () => {
        // Comprobar si la Web Serial API está disponible
        if ('serial' in navigator) {
            infoMessage.textContent = 'Web Serial API disponible. Haz clic en "Conectar" para empezar.';

            // Asignar eventos a los botones
            connectButton.addEventListener('click', connectToDevice);
            disconnectButton.addEventListener('click', disconnectFromDevice);
            sendButton.addEventListener('click', sendMessage);
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') sendMessage();
            });

        } else {
            // La API no está disponible, deshabilitar toda la funcionalidad
            infoMessage.textContent = 'Error: La Web Serial API no está disponible en este navegador o el contexto no es seguro (se requiere HTTPS o localhost).';
            logToPage('ERROR', 'Web Serial no soportado.');
            updateUIState('disconnected');
            connectButton.disabled = true;
        }

        updateUIState('disconnected');
    };

    initialize();
});
