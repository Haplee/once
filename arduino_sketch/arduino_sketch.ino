// arduino_coin_dispenser.ino

// Define los pines para los pulsadores (simulados).
// En un caso real, estos serían los pines de entrada para los botones físicos.
const int BUTTON_PINS[] = {2, 3, 4, 5, 6, 7, 8, 9};
const int NUM_BUTTONS = sizeof(BUTTON_PINS) / sizeof(BUTTON_PINS[0]);

// Define las monedas que cada pulsador dispensa.
const char* COIN_VALUES[] = {
  "1 centimo", "2 centimos", "5 centimos", "10 centimos",
  "20 centimos", "50 centimos", "1 euro", "2 euros"
};

// Enum para los modelos de máquina.
enum MachineModel { MODEL_S, MODEL_M, MODEL_MAX };
MachineModel currentModel = MODEL_M; // Modelo por defecto.

// Arrays que definen qué monedas están disponibles para cada modelo.
// Los valores son índices del array COIN_VALUES.
const int MODEL_S_COINS[] = {3, 4, 5, 6}; // 10c, 20c, 50c, 1€
const int MODEL_M_COINS[] = {2, 3, 4, 5, 6, 7}; // 5c, 10c, 20c, 50c, 1€, 2€
const int MODEL_MAX_COINS[] = {0, 1, 2, 3, 4, 5, 6, 7}; // Todas

void setup() {
  Serial.begin(9600);
  while (!Serial) { ; }

  // Configura los pines de los botones como entrada.
  for (int i = 0; i < NUM_BUTTONS; i++) {
    pinMode(BUTTON_PINS[i], INPUT_PULLUP);
  }

  randomSeed(analogRead(0)); // Semilla para el generador de números aleatorios.
  Serial.println("EVENTO: Arduino listo. Esperando configuración de modelo...");
}

void loop() {
  // 1. Comprobar si hay un comando de configuración desde la web.
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim(); // Limpiar espacios en blanco.

    if (command.startsWith("CONFIG:")) {
      configureModel(command.substring(7));
    } else {
      // Si no es un comando de config, es una orden para dispensar.
      // Simulamos la pulsación de un botón aleatorio del modelo actual.
      dispenseRandomCoin();
    }
  }

  // 2. En un caso real, aquí se leerían los pulsadores físicos.
  // Ejemplo:
  // for (int i = 0; i < NUM_BUTTONS; i++) {
  //   if (digitalRead(BUTTON_PINS[i]) == LOW) {
  //     dispenseCoin(i);
  //     delay(200); // Anti-rebote simple.
  //   }
  // }
}

void configureModel(String modelCode) {
  if (modelCode == "S") {
    currentModel = MODEL_S;
    Serial.println("EVENTO: Maquina configurada como Modelo S.");
  } else if (modelCode == "M") {
    currentModel = MODEL_M;
    Serial.println("EVENTO: Maquina configurada como Modelo M.");
  } else if (modelCode == "MAX") {
    currentModel = MODEL_MAX;
    Serial.println("EVENTO: Maquina configurada como Modelo MAX.");
  } else {
    Serial.println("ERROR: Modelo desconocido.");
  }
}

void dispenseRandomCoin() {
  int coinIndex;

  switch (currentModel) {
    case MODEL_S:
      coinIndex = MODEL_S_COINS[random(sizeof(MODEL_S_COINS) / sizeof(int))];
      break;
    case MODEL_M:
      coinIndex = MODEL_M_COINS[random(sizeof(MODEL_M_COINS) / sizeof(int))];
      break;
    case MODEL_MAX:
      coinIndex = MODEL_MAX_COINS[random(sizeof(MODEL_MAX_COINS) / sizeof(int))];
      break;
  }

  dispenseCoin(coinIndex);
}

void dispenseCoin(int coinIndex) {
  if (coinIndex >= 0 && coinIndex < NUM_BUTTONS) {
    Serial.print("EVENTO: Dispensando ");
    Serial.println(COIN_VALUES[coinIndex]);
  }
}
