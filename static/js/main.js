document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Manager ---
    const themeToggle = document.getElementById('theme-toggle');
    const storedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', storedTheme);
    if (themeToggle) {
        themeToggle.checked = storedTheme === 'dark';
        themeToggle.addEventListener('change', () => {
            const newTheme = themeToggle.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // --- Machine Model Manager ---
    const machineSelect = document.getElementById('machine-model');
    if (machineSelect) {
        const storedModel = localStorage.getItem('machineModel') || 'M';
        machineSelect.value = storedModel;
        machineSelect.addEventListener('change', (e) => {
            localStorage.setItem('machineModel', e.target.value);
            console.log('Machine Model set to:', e.target.value);
        });
    }

    // --- Calculator Logic ---
    const calcForm = document.getElementById('calculator-form');
    if (calcForm) {
        calcForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const total = parseFloat(document.getElementById('total').value);
            const received = parseFloat(document.getElementById('received').value);
            const resultBox = document.getElementById('result-value');
            const resultText = document.getElementById('result-text'); // For accessibility/status

            try {
                const response = await fetch('/api/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ total, received })
                });

                const data = await response.json();

                if (data.success) {
                    const change = data.change.toFixed(2);
                    resultBox.textContent = `€ ${change}`;
                    announceResult(`El cambio es ${change} euros`);

                    // Save to history
                    await fetch('/api/history', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            total: data.total,
                            received: data.received,
                            change: data.change
                        })
                    });

                    // Serial Communication (Fire and forget)
                    sendSerialData(`C:${change}`);
                } else {
                    resultBox.textContent = 'Error';
                    announceResult('Error en el cálculo. ' + (data.error || ''));
                }
            } catch (err) {
                console.error(err);
                resultBox.textContent = 'Error';
            }
        });
    }

    // --- Voice Input ---
    const micBtn = document.getElementById('mic-btn');
    if (micBtn && 'webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = document.documentElement.lang || 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;

        micBtn.addEventListener('click', () => {
            recognition.start();
            micBtn.classList.add('listening'); // Add visual cue if needed
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('Voice Input:', transcript);
            parseVoiceInput(transcript);
            micBtn.classList.remove('listening');
        };

        recognition.onerror = () => micBtn.classList.remove('listening');
        recognition.onend = () => micBtn.classList.remove('listening');
    }

    function parseVoiceInput(text) {
        // Simple regex to find numbers. "Cobrar 50.50 de 100"
        // This is a naive implementation, can be improved with better NLP or regex
        const numbers = text.match(/[\d]+([.,][\d]+)?/g);
        if (numbers && numbers.length >= 2) {
            // Assume first number is total, second is received? Or defined by keywords?
            // "Total 10, Recibido 20"
            // For now, let's just try to fill inputs if empty?
            // Or just alert the user to be clearer? 
            // Let's implement a "Total... Recibido..." logic if possible, 
            // otherwise just fill them in order.
            const n1 = parseFloat(numbers[0].replace(',', '.'));
            const n2 = parseFloat(numbers[1].replace(',', '.'));

            // Which is bigger? usually received > total
            if (n1 > n2) {
                document.getElementById('received').value = n1;
                document.getElementById('total').value = n2;
            } else {
                document.getElementById('received').value = n2;
                document.getElementById('total').value = n1;
            }
            // Auto submit?
            // calcForm.dispatchEvent(new Event('submit'));
        }
    }

    function announceResult(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = document.documentElement.lang || 'es-ES';
            window.speechSynthesis.speak(utterance);
        }
    }

    // --- Serial API ---
    let serialPort;
    let writer;

    const connectSerialBtn = document.getElementById('connect-serial');
    if (connectSerialBtn) {
        connectSerialBtn.addEventListener('click', async () => {
            try {
                serialPort = await navigator.serial.requestPort();
                await serialPort.open({ baudRate: 9600 });
                writer = serialPort.writable.getWriter();
                console.log('Serial Connected');
                alert('Conectado a Arduino/Dispositivo');
            } catch (err) {
                console.error('Serial Error:', err);
                alert('Error al conectar dispositivo serial.');
            }
        });
    }

    async function sendSerialData(data) {
        if (writer) {
            const encoder = new TextEncoder();
            await writer.write(encoder.encode(data + '\n'));
        }
    }
});