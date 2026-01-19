# Aplicación Web Accesible para la ONCE (Next.js)

Esta es la aplicación web de la Calculadora de Cambio, ahora impulsada por **Next.js** con un backend moderno usando API Routes. La aplicación mantiene toda la funcionalidad original, incluyendo la alta accesibilidad, pero ahora con una arquitectura más robusta y escalable.

## Características

- **Framework Next.js 14**: Arquitectura moderna con App Router y Server Components.
- **Calculadora de Cambio**: Calcula el cambio de forma rápida y precisa a través de API Routes internas.
- **Entrada y Salida de Voz**: Utiliza las APIs del navegador para la entrada de voz y para anunciar los resultados en voz alta.
- **Historial de Operaciones Persistente**: Guarda un registro de todas las transacciones en una base de datos SQLite.
- **Internacionalización (I18N)**: Soporte para múltiples idiomas (Español, Inglés, Catalán) gestionado por React Context.
- **Modo Día/Noche**: Tema visual adaptable con `next-themes`.
- **Comunicación con Hardware**: Mantiene la capacidad de comunicarse con dispositivos externos (como Arduino) a través de la Web Serial API.
- **Diseño Premium**: Interfaz glassmorphic moderna con animaciones suaves y diseño responsive.

## Requisitos

- Node.js 18+ (recomendado 20+)
- npm o yarn

## Cómo Empezar

Sigue estos pasos para configurar y ejecutar la aplicación en tu máquina local.

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd <nombre-del-repositorio>
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Ejecutar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000` en tu navegador.

### 4. Construir para Producción

```bash
npm run build
npm start
```

### 5. Ejecutar las Pruebas (Opcional)

Para ejecutar las pruebas End-to-End de Playwright:

```bash
npm test
```

## Estructura del Proyecto

```
.
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── api/               # API Routes
│   │   │   ├── calculate/     # Endpoint de cálculo
│   │   │   └── history/       # Endpoint de historial
│   │   ├── configuracion/     # Página de configuración
│   │   ├── history/           # Página de historial
│   │   ├── layout.tsx         # Layout principal
│   │   ├── page.tsx           # Página de inicio (calculadora)
│   │   └── globals.css        # Estilos globales
│   ├── components/            # Componentes React
│   │   ├── Navbar.tsx         # Barra de navegación
│   │   └── ThemeProvider.tsx  # Proveedor de tema
│   ├── lib/                   # Utilidades
│   │   ├── db.ts              # Conexión a SQLite
│   │   └── i18n.tsx           # Sistema de internacionalización
│   └── data/                  # Datos estáticos
│       └── translations/      # Archivos de traducción JSON
├── public/                    # Archivos estáticos
│   └── static/                # Imágenes y assets
├── arduino_sketch/            # Código de ejemplo para Arduino
├── tests/                     # Pruebas E2E
├── next.config.js             # Configuración de Next.js
├── tsconfig.json              # Configuración de TypeScript
├── package.json               # Dependencias del proyecto
└── README.md                  # Este archivo
```

## Migración desde Flask

La versión anterior de Flask se encuentra archivada en la rama `old_version`. Para acceder a ella:

```bash
git checkout old_version
```

## Despliegue en Vercel

Este proyecto está optimizado para desplegarse en Vercel:

1. Conecta tu repositorio a Vercel
2. Vercel detectará automáticamente que es un proyecto Next.js
3. El despliegue se realizará automáticamente

## Comunicación con Arduino

El código de ejemplo para un dispositivo compatible con Arduino se encuentra en `arduino_sketch/arduino_sketch.ino`. Puedes cargarlo en tu dispositivo para probar la funcionalidad de comunicación serie desde la página de **Configuración**.

## Tecnologías Utilizadas

- **Next.js 14**: Framework React con SSR y App Router
- **TypeScript**: Tipado estático para mayor robustez
- **SQLite**: Base de datos ligera para el historial
- **Lucide React**: Iconos modernos
- **next-themes**: Gestión de temas oscuro/claro
- **Web APIs**: Speech Recognition, Speech Synthesis, Web Serial

## Licencia

ISC