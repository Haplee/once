# Aplicación Web Accesible para la ONCE

Esta es una aplicación web estática, diseñada para ser una herramienta interna para la ONCE. La aplicación es completamente accesible y cuenta con funcionalidades como una calculadora de cambio con entrada por voz y un historial de operaciones que se guarda localmente en el navegador.

## Características

- **Calculadora de Cambio**: Calcula el cambio para clientes de forma rápida y precisa.
- **Entrada por Voz**: Permite introducir los importes mediante comandos de voz.
- **Lectura de Resultados**: Anuncia el cambio calculado en voz alta.
- **Historial de Operaciones**: Guarda un registro de todas las transacciones en el `localStorage` del navegador.
- **Modo Día/Noche**: Tema visual adaptable para diferentes condiciones de iluminación.
- **Diseño Accesible**: Contraste alto, botones grandes y compatibilidad con lectores de pantalla.

## Estructura del Proyecto

El proyecto se organiza de la siguiente manera:

```
.
├── index.html              # Página principal de la calculadora (requiere login)
├── history.html            # Página del historial de operaciones
├── configuracion.html      # Página de configuración (tema, idioma, serial)
├── login.html              # Página de inicio de sesión
├── signup.html             # Página de registro de usuarios
├── forgot_password.html    # Página de recuperación de contraseña
├── static/
│   ├── css/style.css       # Estilos principales de la aplicación
│   ├── js/
│   │   ├── main.js         # Lógica principal de la calculadora
│   │   ├── history.js      # Lógica de la página de historial
│   │   ├── auth.js         # Gestiona la autenticación y sesión de usuario
│   │   ├── serial.js       # Lógica para la comunicación con Web Serial API
│   │   ├── i18n.js         # Gestor de internacionalización
│   │   └── ...             # Otros scripts para login, registro, etc.
│   └── img/                # Logotipos e iconos
├── scripts/
│   └── translate.js        # Script de Node.js para gestionar claves de traducción
└── README.md               # Este archivo
```

## Cómo Empezar

Simplemente abre el archivo `login.html` en tu navegador web. No se requiere instalación ni servidor.

### Autenticación

La aplicación cuenta con un sistema de registro e inicio de sesión. Para fines de demostración, puedes usar los siguientes usuarios pre-cargados que se encuentran en `static/users.json`:
- **Usuario:** `admin`, **Contraseña:** `admin123`
- **Usuario:** `user`, **Contraseña:** `user123`

También puedes registrar nuevos usuarios.

## Despliegue en GitHub Pages

1.  Asegúrate de que tu repositorio tenga una rama llamada `gh-pages`, o configura GitHub Pages para que se despliegue desde la rama `main` en la configuración de tu repositorio.
2.  Sube todos los archivos del proyecto a esa rama.
3.  GitHub Pages desplegará automáticamente el sitio y te proporcionará una URL.

---

## Cómo probar

Para probar las nuevas funcionalidades, sigue estos pasos:

1.  **Lanzar el servidor local**: Esta es una aplicación estática, por lo que no necesitas un servidor Python como `flask run`. Simplemente abre el archivo `login.html` en tu navegador.
2.  **Probar Internacionalización (i18n)**:
    - Ve a la página de **Configuración**.
    - Usa el selector de "Idioma" para cambiar entre `es`, `en`, `pt`, `gl`, `eu` y `ca`.
    - Verifica que los textos de la interfaz (títulos, etiquetas, botones) se actualizan al cambiar de idioma.
    - Recarga la página y comprueba que el último idioma seleccionado persiste.
3.  **Probar Modo Oscuro**:
    - En la página de **Configuración**, activa el interruptor de "Modo Oscuro".
    - Verifica que los colores de la aplicación cambian a un tema oscuro. Los fondos deben ser oscuros y el texto claro.
    - Navega a otras páginas (Calculadora, Historial) para asegurarte de que el tema se aplica en toda la web.
    - Recarga la página y comprueba que el modo oscuro persiste.
4.  **Probar Reconocimiento de Voz**:
    - Ve a la página principal de la **Calculadora**.
    - Asegúrate de que el idioma de la UI (por ejemplo, Español) esté seleccionado en la configuración.
    - Haz clic en el botón del micrófono. El navegador te pedirá permiso para usarlo. Concédelo.
    - Di en voz alta dos números, por ejemplo: "Total 25 con 50, me pagan con 30".
    - Verifica que los campos "Total a Pagar" y "Importe Recibido" se rellenan con `25.50` y `30` respectivamente.
    - Cambia el idioma de la UI en la configuración (por ejemplo, a Inglés) y repite el proceso. El reconocimiento de voz debería ahora esperar comandos en inglés.
    - Si tu navegador no es compatible, debería aparecer un mensaje indicando que la función no está disponible.

---

## Comunicación con Arduino (Web Serial API)

Se ha añadido una nueva funcionalidad en la página de **Configuración** para comunicarse con un dispositivo externo (como un Arduino) a través del puerto USB, utilizando la Web Serial API.

### Requisitos Previos

- Un navegador compatible con la Web Serial API (Google Chrome, Microsoft Edge, Opera).
- Un microcontrolador tipo Arduino.
- El IDE de Arduino para cargar el código en la placa.

### Código para Arduino

Copia y pega el siguiente código en tu IDE de Arduino y súbelo a tu placa. Este sketch simula una máquina dispensadora de monedas con diferentes modelos (S, M, MAX).

**Funcionalidades del Sketch:**
- Recibe un comando de configuración (`CONFIG:S`, `CONFIG:M`, `CONFIG:MAX`) desde la web.
- Configura los "pulsadores" (simulados en el código) según el modelo.
- Al recibir cualquier otro texto (ej. "dispensar"), simula la pulsación de uno de los botones disponibles para el modelo actual.
- Envía notificaciones a la web sobre la configuración y las monedas dispensadas.

```cpp
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
```

### Cómo Utilizar la Funcionalidad

1.  **Carga el código**: Sube el sketch anterior a tu placa Arduino.
2.  **Abre la aplicación**: Abre el archivo `index.html` en un navegador compatible.
3.  **Ve a Configuración**: Navega a la página de configuración.
4.  **Selecciona el Modelo**: Elige el modelo de tu máquina (S, M, o MAX) en el menú desplegable.
5.  **Conecta el dispositivo**: Haz clic en **"Conectar Dispositivo"**. El modelo seleccionado se enviará automáticamente al Arduino.
6.  **Comunícate**: Una vez conectado:
    - Puedes cambiar el modelo en el menú desplegable para reconfigurar el Arduino en cualquier momento.
    - Escribe cualquier texto en el campo de comando (ej. "dame una moneda") y presiona **"Enviar"**. Esto simulará la dispensación de una moneda aleatoria permitida por el modelo actual.
    - Todos los eventos (configuración, monedas dispensadas) se mostrarán en la consola de la página.
7.  **Desconecta**: Cuando termines, haz clic en **"Desconectar"**.

---

# Cómo probar el login responsive

## 1) Preparar y arrancar el servidor
1. Clona el repo y cambia a la rama `feature/responsive-login`.
2. Esta es una aplicación estática, por lo que no se requiere un servidor. Simplemente abre `login.html` en tu navegador.

## 2) Probar la vista de escritorio
1. Abre la página de login en una ventana del navegador con un ancho de 881px o más.
2. Deberías ver una tarjeta grande dividida en dos paneles: una ilustración a la izquierda y el formulario de inicio de sesión a la derecha.
3. Comprueba que todos los elementos son visibles y están bien alineados.

## 3) Probar la vista móvil
1. Reduce el ancho de la ventana del navegador a 880px o menos, o usa las herramientas de desarrollador de tu navegador para simular un dispositivo móvil.
2. La vista de escritorio debería desaparecer y en su lugar deberían aparecer dos tarjetas apiladas más pequeñas.
3. La primera tarjeta contiene el formulario de inicio de sesión y la segunda un enlace para registrarse.

## 4) Probar la funcionalidad
1. Tanto en la vista de escritorio como en la móvil, intenta iniciar sesión con credenciales válidas (ej. `test`/`123`) e inválidas.
2. Comprueba que los mensajes de error aparecen correctamente.
3. Asegúrate de que el botón para mostrar/ocultar la contraseña funciona en la vista de escritorio.
4. Verifica que el modo oscuro funciona correctamente en ambas vistas.