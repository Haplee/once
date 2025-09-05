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

```
.
├── index.html            # Página principal de la calculadora
├── history.html          # Página del historial de operaciones
├── static/
│   ├── css/
│   │   └── style.css     # Estilos de la aplicación
│   ├── js/
│   │   ├── main.js       # Lógica de la calculadora
│   │   └── history.js    # Lógica de la página de historial
│   └── img/
│       └── logo.png      # Logotipo de la ONCE
└── README.md             # Este archivo
```

## Cómo Empezar

Simplemente abre el archivo `index.html` en tu navegador web. No se requiere instalación ni servidor.

## Despliegue en GitHub Pages

1.  Asegúrate de que tu repositorio tenga una rama llamada `gh-pages`, o configura GitHub Pages para que se despliegue desde la rama `main` en la configuración de tu repositorio.
2.  Sube todos los archivos del proyecto a esa rama.
3.  GitHub Pages desplegará automáticamente el sitio y te proporcionará una URL.

