document.addEventListener('DOMContentLoaded', () => {

    /**
     * Handles the theme switching between light and dark mode.
     * It persists the user's preference in localStorage.
     */
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        // Apply saved theme on load
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            document.body.classList.add(currentTheme);
            if (currentTheme === 'dark-mode') {
                themeToggleButton.checked = true;
            }
        }
        // Add event listener for theme changes
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

    /**
     * Handles the main calculator form submission.
     * It calculates the change, displays it, speaks it, and saves it to history.
     */
    const form = document.getElementById('change-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const totalAmount = parseFloat(document.getElementById('total-amount').value);
            const amountReceived = parseFloat(document.getElementById('amount-received').value);
            const resultDiv = document.getElementById('result');

            if (isNaN(totalAmount) || isNaN(amountReceived)) {
                resultDiv.textContent = 'Por favor, introduce importes válidos.';
                return;
            }

            if (amountReceived < totalAmount) {
                resultDiv.textContent = 'El importe recibido es menor que el total a pagar.';
                return;
            }

            const change = amountReceived - totalAmount;
            const changeText = `El cambio a devolver es: ${change.toFixed(2)} €`;
            resultDiv.textContent = changeText;

            speak(changeText); // Announce the result
            saveToHistory({ total: totalAmount, received: amountReceived, change: change }); // Save to history
        });
    }

    /**
     * Initializes Speech Recognition for voice commands.
     */
    const voiceInputBtn = document.getElementById('voice-input-btn');
    if (voiceInputBtn) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'es-ES';
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                const command = event.results[event.results.length - 1][0].transcript;
                processVoiceCommand(command);
            };

            voiceInputBtn.addEventListener('click', () => recognition.start());

        } else {
            // Hide button if Speech Recognition is not supported
            voiceInputBtn.style.display = 'none';
        }
    }

    /**
     * Processes the transcribed voice command to fill form fields.
     * @param {string} command - The voice command transcribed by the SpeechRecognition API.
     */
    function processVoiceCommand(command) {
        const totalAmountInput = document.getElementById('total-amount');
        const amountReceivedInput = document.getElementById('amount-received');

        // Example commands: "total 10.50", "recibido 20"
        const commandLower = command.toLowerCase();
        const words = commandLower.split(' ');

        if (words.includes('total')) {
            const index = words.indexOf('total') + 1;
            if (words[index]) {
                totalAmountInput.value = parseFloat(words[index].replace(',', '.'));
            }
        }

        if (words.includes('recibido')) {
            const index = words.indexOf('recibido') + 1;
            if (words[index]) {
                amountReceivedInput.value = parseFloat(words[index].replace(',', '.'));
            }
        }
    }

    /**
     * Uses the SpeechSynthesis API to read text aloud.
     * @param {string} text - The text to be spoken.
     */
    function speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';
            window.speechSynthesis.speak(utterance);
        }
    }

    /**
     * Sends the transaction data to the backend to be saved in the history.
     * @param {object} data - The transaction data.
     */
    function saveToHistory(data) {
        fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    }

    /**
     * Example function to demonstrate calling the mock Arduino API.
     * @param {object} data - Data to be sent to the mock Arduino.
     */
    function sendToArduino(data) {
        fetch('/api/arduino', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(result => {
            console.log('Arduino API response:', result);
        });
    }
});
