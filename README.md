# Aplicación Web Accesible para la ONCE (Versión Python)

Esta es la versión refactorizada de la aplicación web de la Calculadora de Cambio, ahora impulsada por un backend de Python usando el framework Flask. La aplicación mantiene toda la funcionalidad original, incluyendo la alta accesibilidad, pero ahora con una arquitectura más robusta y modular.

## Características

- **Backend en Python (Flask)**: La lógica de negocio, el enrutamiento y la gestión de datos ahora se manejan en el servidor.
- **Calculadora de Cambio**: Calcula el cambio de forma rápida y precisa a través de una API interna.
- **Entrada y Salida de Voz**: Utiliza las APIs del navegador para la entrada de voz y para anunciar los resultados en voz alta.
- **Historial de Operaciones Persistente**: Guarda un registro de todas las transacciones en una base de datos SQLite en el servidor.
- **Internacionalización (I18N)**: Soporte para múltiples idiomas (Español, Inglés, Gallego, Catalán, Valenciano, Euskera) gestionado por Flask-Babel.
- **Modo Día/Noche**: Tema visual adaptable.
- **Comunicación con Hardware**: Mantiene la capacidad de comunicarse con dispositivos externos (como Arduino) a través de la Web Serial API.

## Requisitos

- Python 3.8+
- pip (gestor de paquetes de Python)
- Node.js y npm (para las pruebas)

## Cómo Empezar

Sigue estos pasos para configurar y ejecutar la aplicación en tu máquina local.

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd <nombre-del-repositorio>
```

### 2. Crear un Entorno Virtual

Es una buena práctica usar un entorno virtual para aislar las dependencias del proyecto.

```bash
# Crear el entorno virtual
python -m venv venv

# Activar el entorno (en Windows)
# venv\Scripts\activate

# Activar el entorno (en macOS/Linux)
source venv/bin/activate
```

### 3. Instalar Dependencias

Instala todas las dependencias de Python y Node.js.

```bash
# Instalar dependencias de Python
pip install -r requirements.txt

# Instalar dependencias de Node.js (para pruebas)
npm install
```

### 4. Inicializar la Base de Datos

Antes de ejecutar la aplicación por primera vez, necesitas crear la base de datos y la tabla para el historial.

```bash
flask --app app init-db
```
Deberías ver un mensaje que dice "Initialized the database."

### 5. Ejecutar la Aplicación

Ahora puedes iniciar el servidor de desarrollo de Flask:

```bash
flask --app app run
```

La aplicación estará disponible en `http://127.0.0.1:5000` en tu navegador.

### 6. Ejecutar las Pruebas (Opcional)

Para ejecutar las pruebas End-to-End de Playwright, asegúrate de que el servidor de Flask esté corriendo y luego ejecuta:

```bash
npm test
```

## Estructura del Proyecto

La arquitectura del proyecto sigue un patrón estándar de Flask:

```
.
├── app/
│   ├── static/             # (Actualmente vacío, los activos se sirven desde /docs)
│   ├── templates/          # Plantillas HTML de Jinja2
│   ├── translations/       # Archivos de traducción de Gettext (.po)
│   ├── __init__.py         # Inicializador de la aplicación Flask
│   ├── api.py              # Blueprint para la API
│   ├── db.py               # Lógica de la base de datos
│   ├── routes.py           # Rutas de la aplicación
│   └── schema.sql          # Esquema de la base de datos
├── docs/                   # Directorio original, ahora solo para activos estáticos
│   └── assets/
├── arduino_sketch/
│   └── arduino_sketch.ino  # Código de ejemplo para el dispositivo Arduino
├── tests/
│   └── e2e.spec.js         # Pruebas End-to-End con Playwright
├── .github/
│   └── workflows/
│       └── ci.yml          # Flujo de trabajo de GitHub Actions para CI
├── requirements.txt        # Dependencias de Python
├── package.json            # Dependencias de Node.js
└── README.md               # Este archivo
```

## Comunicación con Arduino

El código de ejemplo para un dispositivo compatible con Arduino se encuentra en `arduino_sketch/arduino_sketch.ino`. Puedes cargarlo en tu dispositivo para probar la funcionalidad de comunicación serie desde la página de **Configuración**.