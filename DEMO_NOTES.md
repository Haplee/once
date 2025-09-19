# Notas Técnicas y Guion para la Demo

Este documento contiene el análisis técnico, el plan de pruebas y las notas para la presentación de la demo sobre Web Serial API y seguridad en el frontend.

---

## 1. Análisis de Snippets de Código (Revisados y Mejorados)

A continuación se analizan los snippets originales, explicando sus riesgos y proporcionando una versión final robusta y comentada.

### Snippet A: Sanitización de entradas y renderizado seguro

**Versión Original:**
```javascript
function sanitizeInput(str){
  return String(str).replace(/<[^>]*>?/gm, '');
}
localStorage.setItem('historial', JSON.stringify(sanitizedArray.map(sanitizeInput)));
el.innerHTML = sanitizeInput(item);
```

**Análisis:**

*   **Qué hace:** Intenta eliminar etiquetas HTML de un string con una expresión regular y luego usa `innerHTML` para insertar el resultado en el DOM.
*   **Por qué es importante (Riesgo que cubre):** El objetivo es prevenir ataques de **Cross-Site Scripting (XSS)**. Si un atacante inyecta código como `<script>mi_codigo_malicioso()</script>`, `innerHTML` lo ejecutaría. La sanitización busca neutralizar esta amenaza.
*   **Edge Cases y Debilidades:**
    *   La expresión regular es **insuficiente y fácil de evadir**. Un atacante podría usar variantes como `<img src=x onerror=alert('XSS')>` que no serían filtradas correctamente.
    *   El principal riesgo no es guardar el HTML en `localStorage`, sino **renderizarlo en el DOM** con `innerHTML`.

**Versión Final Recomendada:**

La mejor práctica no es "limpiar" el HTML, sino tratar siempre las entradas del usuario como **texto plano**.

```javascript
// --- Versión Mejorada: Priorizar textContent ---

// No es necesaria una función de sanitización si solo vamos a mostrar texto.
// La sanitización en el guardado es una defensa secundaria. La principal está en el renderizado.
const historial = ["Dato del usuario 1", "<img src=x onerror='alert(\"XSS\")'>"];
localStorage.setItem('historial', JSON.stringify(historial));

// Al renderizar, usamos textContent. Esto es INMUNE a XSS porque no interpreta el HTML.
const el = document.getElementById('mi-elemento');
const item = "<img src=x onerror='alert(\"XSS evitado!\")'>";
el.textContent = item;
// El DOM mostrará literalmente: <img src=x onerror='alert("XSS evitado!")'>
// No se ejecutará ningún script.
```

### Snippet B: Comprobación de disponibilidad de Web Serial API

**Versión Original:**
```javascript
function serialAvailable(){
  return !!(navigator && navigator.serial);
}
if (!serialAvailable()) {
  document.getElementById('serial-status').textContent = 'Web Serial API no disponible en este navegador.';
}
```

**Análisis:**

*   **Qué hace:** Verifica si el objeto `navigator.serial` existe para determinar si el navegador soporta la API.
*   **Por qué es importante:** Permite a la aplicación **degradar de forma controlada** (graceful degradation). En lugar de fallar con un error en la consola, informa al usuario y deshabilita la funcionalidad no disponible.
*   **Edge Cases y Navegadores:**
    *   **Compatibilidad:** Soportado en **Chrome, Edge y Opera (escritorio)**. No funciona en Firefox, Safari o navegadores móviles.
    *   **Contexto Seguro:** La API solo está disponible en contextos seguros (**HTTPS** o **localhost**). La comprobación original no lo verifica.

**Versión Final Recomendada:**

Añadimos una comprobación del contexto seguro para dar un mensaje de error más preciso.

```javascript
// --- Versión Mejorada: Comprobación de Contexto Seguro ---

/**
 * Verifica si la Web Serial API está disponible y el contexto es seguro.
 * @returns {boolean} True si la API es utilizable.
 */
function isWebSerialAvailable() {
  // La API solo funciona en contextos seguros (HTTPS o localhost)
  if (!window.isSecureContext) {
    console.warn('El contexto no es seguro. La Web Serial API requiere HTTPS o localhost.');
    // Podrías mostrar un mensaje específico en la UI aquí.
  }
  return 'serial' in navigator;
}

if (!isWebSerialAvailable()) {
  document.getElementById('serial-status').textContent = 'Web Serial API no disponible en este navegador o el contexto no es seguro (se requiere HTTPS/localhost).';
  // También deberías deshabilitar los botones de conexión.
  document.getElementById('connect-button').disabled = true;
}
```

### Snippet C: Consulta de Permisos (Ej: Micrófono)

**Versión Original:**
```javascript
navigator.permissions.query({name:'microphone'}).then(result => {
  if (result.state === 'denied') showError('Permiso de micrófono denegado.');
});
```

**Análisis:**

*   **Qué hace:** Usa la **Permissions API** para consultar el estado de un permiso específico sin necesidad de solicitarlo.
*   **Por qué es importante:** Mejora la experiencia de usuario. Si el permiso ya fue denegado, podemos mostrar instrucciones para habilitarlo manually en la configuración del navegador, en lugar de volver a pedirlo sin éxito.
*   **Edge Cases y Navegadores:**
    *   Los estados posibles son `granted` (concedido), `denied` (denegado) y `prompt` (se preguntará al usuario cuando se use la función). El código solo maneja `denied`.
    *   La consulta de permisos para `serial` no está estandarizada como `microphone`. Para Web Serial, el permiso se gestiona a través de `navigator.serial.getPorts()`, que devuelve los puertos a los que el usuario ya ha dado acceso.

**Versión Final Recomendada (Aplicada a Web Serial):**

El patrón equivalente para Web Serial es intentar obtener los puertos previamente autorizados.

```javascript
// --- Versión Adaptada a Web Serial ---

/**
 * Comprueba si ya hay puertos autorizados por el usuario.
 * Útil para reconectar automáticamente al cargar la página.
 */
async function checkGrantedPorts() {
  try {
    const grantedPorts = await navigator.serial.getPorts();
    if (grantedPorts.length > 0) {
      console.log(`Puertos ya autorizados: ${grantedPorts.length}`);
      // Aquí podrías intentar reconectar al primer puerto autorizado.
      // E.g., connectToPort(grantedPorts[0]);
      return grantedPorts;
    } else {
      console.log('No hay puertos previamente autorizados.');
      return [];
    }
  } catch (error) {
    console.error('Error al consultar permisos de puertos:', error);
    return [];
  }
}

// checkGrantedPorts(); // Llamar al cargar la página si se desea reconexión.
```

### Snippet D: Solicitud de Puerto (No Robusto)

**Versión Original:**
```javascript
const port = await navigator.serial.requestPort();
await port.open({ baudRate: 9600 });
await port.close();
```

**Análisis:**

*   **Qué hace:** Pide al usuario que seleccione un puerto, lo abre y lo cierra.
*   **Por qué es importante:** Es el esqueleto de la interacción, pero carece de robustez.
*   **Edge Cases y Debilidades:**
    *   **Sin Gesto de Usuario:** Si no se llama desde un evento de clic, `requestPort()` fallará.
    *   **Sin Manejo de Errores:** Si el usuario cancela el diálogo, la promesa se rechaza y el `await` lanzará una excepción no capturada, rompiendo el script.
    *   **Sin Lectura/Escritura:** No hace nada útil con el puerto.

**Versión Final Recomendada:**

Integrada en el ejemplo completo de la siguiente sección. La clave es envolver las llamadas en `try...catch` y asegurarse de que se invoca desde un evento de usuario.

---

## 2. Explicación Detallada de la Web Serial API

### Requisitos Clave
1.  **Contexto Seguro:** La página debe servirse desde **HTTPS** o **`http://localhost`**. De lo contrario, `navigator.serial` será `undefined`.
2.  **Navegadores Compatibles:** **Google Chrome**, **Microsoft Edge**, y **Opera** en sus versiones de escritorio. No está disponible en Firefox, Safari o navegadores móviles.
3.  **Gesto de Usuario:** La solicitud de un puerto (`navigator.serial.requestPort()`) **debe** ser iniciada por una interacción directa del usuario, como un clic en un botón.

### Flujo de Uso Típico
1.  **(Opcional) `getPorts()`**: Al cargar la página, se puede llamar a `navigator.serial.getPorts()` para ver si el usuario ya ha concedido permiso a algún puerto en una sesión anterior. Esto permite una reconexión rápida.
2.  **`requestPort()`**: Tras un clic, se llama a `navigator.serial.requestPort()`. Esto muestra un diálogo del sistema operativo donde el usuario selecciona el dispositivo serie al que desea conectarse. La promesa se resuelve con un objeto `SerialPort`.
3.  **`port.open()`**: Una vez obtenido el `SerialPort`, se llama a `await port.open({ baudRate: 9600, ... })`. `baudRate` es el parámetro más común y debe coincidir con la configuración del dispositivo.
4.  **Leer y Escribir con Streams:**
    *   **Lectura:** El puerto tiene una propiedad `port.readable` que es un `ReadableStream`. Para leer, se obtiene un `reader` y se entra en un bucle que espera datos (`await reader.read()`).
    *   **Escritura:** El puerto tiene `port.writable`, un `WritableStream`. Se obtiene un `writer` para enviar datos (`await writer.write(data)`). Los datos deben ser un `Uint8Array`.
5.  **`port.close()`**: Libera el puerto. Es importante llamar a este método cuando se termina la comunicación para que otros programas puedan usarlo.

### Patrones de Diseño Seguros y Robustos
*   **Time-outs en Lectura:** Un dispositivo puede dejar de enviar datos. Al leer, es buena práctica usar `Promise.race` para competir la operación de lectura con un `setTimeout`. Si la lectura tarda demasiado, el time-out gana y se puede manejar el error sin que la aplicación se congele.
*   **Validación de Datos Entrantes:** **Nunca confíes en los datos del dispositivo**. Trátalos como si vinieran de un usuario malicioso. Si esperas un JSON, envuélvelo en `try...catch`. Si esperas un formato específico, valídalo. Usa `textContent` para mostrarlo.
*   **Manejo de Desconexión:** El objeto `port` emite un evento `disconnect`. Se debe añadir un listener (`port.addEventListener('disconnect', ...)`). Cuando salta, se deben limpiar los recursos y actualizar la UI.
*   **Reintentos de Conexión Limitados:** Si una conexión falla o se pierde, no intentes reconectar en un bucle infinito. Implementa una estrategia con reintentos limitados (ej. 3 intentos) y un retardo entre ellos (backoff exponencial) para no sobrecargar el sistema.
*   **Uso de `TextEncoderStream` y `TextDecoderStream`:** Para comunicar con dispositivos que envían texto (como la mayoría de Arduinos), estos streams son ideales. Se "acoplan" (`pipeThrough`) a los streams `readable` y `writable` del puerto para convertir automáticamente entre `String` y `Uint8Array` (el formato que requieren los streams del puerto). Esto simplifica el código y maneja la codificación (UTF-8) correctamente.

---

## 3. Plan de Pruebas para la Demo

Ejecuta estas pruebas en orden para validar la robustez de la aplicación.

**Navegador/OS Recomendado:**
*   **Navegador:** Google Chrome o Microsoft Edge (última versión).
*   **OS:** Windows 10/11, macOS, o Linux (con el usuario en el grupo `dialout` o `uucp` para tener permisos sobre los puertos serie).

### A. Comprobaciones de Seguridad (XSS / LocalStorage)

1.  **Objetivo:** Verificar que la aplicación no es vulnerable a inyección de HTML.
2.  **Pasos:**
    *   Abre la demo y las herramientas de desarrollador (F12).
    *   Busca un campo de entrada o un área donde se muestren los logs del puerto serie.
    *   **Simula un dato malicioso:** Si puedes enviar datos, envía el string `<img src=x onerror="alert('XSS')">`. Si no, modifica el código temporalmente para que un mensaje recibido sea este string.
    *   **Verificación:**
        *   **Resultado esperado:** El texto `<img src=x onerror="alert('XSS')">` debe aparecer literalmente en el log de la página. **No debe aparecer ninguna alerta de JavaScript.**
        *   **Resultado fallido:** Si aparece una alerta, la aplicación está usando `innerHTML` de forma insegura.

### B. Pruebas de Web Serial (Sin Dispositivo Físico)

1.  **Objetivo:** Asegurar que la UI maneja correctamente los casos en los que el usuario no completa la conexión.
2.  **Pasos:**
    *   Abre la demo en un navegador compatible.
    *   Haz clic en el botón "Conectar".
    *   **Caso 1: Cancelación del usuario:** Cuando aparezca el diálogo de selección de puerto, haz clic en "Cancelar".
        *   **Verificación:** La aplicación no debe romperse. La UI debe mostrar un mensaje informativo como "Selección de puerto cancelada por el usuario."
    *   **Caso 2: Navegador no compatible:**
        *   Abre la demo en Firefox o Safari.
        *   **Verificación:** El botón "Conectar" debe estar deshabilitado y debe mostrarse un mensaje indicando que la Web Serial API no está soportada.

### C. Pruebas de Web Serial (Con Dispositivo Físico o Virtual)

1.  **Objetivo:** Validar el ciclo completo de conexión, comunicación y desconexión.
2.  **Requisitos:**
    *   **Dispositivo Físico:** Un Arduino, ESP32, o similar. Carga un sketch simple que lea de `Serial` y lo reenvíe, y que envíe un mensaje "Hola" cada 2 segundos. (Ej: `if (Serial.available()) { Serial.write(Serial.read()); } delay(2000); Serial.println("Hola desde Arduino");`)
    *   **Alternativa Virtual:** Usa un emulador de puertos serie (ej. `socat` en Linux/macOS, `com0com` en Windows) para crear un par de puertos virtuales conectados entre sí.
3.  **Pasos:**
    *   **Conexión:** Conecta el dispositivo. Haz clic en "Conectar" y selecciónalo en el diálogo.
        *   **Verificación:** La UI debe indicar "Conectado". El log debe empezar a mostrar los mensajes "Hola desde Arduino" cada 2 segundos.
    *   **Comunicación (App -> Dispositivo):** Usa la interfaz de la demo para enviar un mensaje (ej. "Test").
        *   **Verificación:** Si usas un Arduino, el LED de RX debería parpadear. Si tienes un monitor serie abierto en el IDE de Arduino, deberías ver el mensaje "Test".
    *   **Comunicación (Dispositivo -> App):**
        *   **Verificación:** Confirma que los mensajes del dispositivo siguen apareciendo en el log de la página.
    *   **Desconexión Física:** Desconecta el cable USB del dispositivo.
        *   **Verificación:** La UI debe detectar el evento y mostrar un mensaje como "Dispositivo desconectado". El estado debe cambiar a "Desconectado".
    *   **Cierre Manual:** Haz clic en el botón "Desconectar".
        *   **Verificación:** La UI debe mostrar "Desconectado". El puerto debe liberarse (ej. ahora puedes abrirlo en el Monitor Serie del IDE de Arduino).

---

## 4. Mini-Nota para la Presentación (Guion)

(Máximo 8 frases, tono claro y directo)

> "Hola a todos. Hoy vamos a ver cómo una página web puede comunicarse directamente con hardware, como un Arduino, usando la **Web Serial API**.
>
> Nuestra demo se conecta a un dispositivo físico con solo un clic, sin instalar drivers ni software adicional.
>
> El flujo es totalmente seguro: la conexión **solo se inicia con la acción explícita del usuario**, y el navegador exige que la página se sirva por HTTPS o desde localhost.
>
> Hemos implementado medidas de seguridad robustas: cualquier dato que llega del dispositivo se trata como **texto plano para anular riesgos de XSS**.
>
> Además, evitamos el uso de `innerHTML` para renderizar datos, que es una fuente común de vulnerabilidades.
>
> No exponemos credenciales ni información sensible en el código del frontend.
>
> La principal limitación de esta tecnología es que aún **no es compatible con todos los navegadores**, como Safari o Firefox.
>
> Pero para aplicaciones industriales, de IoT o para aficionados, abre un mundo de posibilidades directamente desde el navegador."
