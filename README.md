# Aplicación Web Accesible para la ONCE

Esta es una aplicación web desarrollada en Flask, diseñada para ser una herramienta interna para la ONCE. La aplicación es completamente accesible y cuenta con funcionalidades como una calculadora de cambio con entrada por voz y un historial de operaciones.

## Características

- **Calculadora de Cambio**: Calcula el cambio para clientes de forma rápida y precisa.
- **Entrada por Voz**: Permite introducir los importes mediante comandos de voz.
- **Lectura de Resultados**: Anuncia el cambio calculado en voz alta.
- **Historial de Operaciones**: Guarda un registro de todas las transacciones.
- **Modo Día/Noche**: Tema visual adaptable para diferentes condiciones de iluminación.
- **Diseño Accesible**: Contraste alto, botones grandes y compatibilidad con lectores de pantalla.
- **API Mock**: Endpoints para simular la integración con hardware externo como Arduino.

## Estructura del Proyecto

```
.
├── app.py                # Lógica principal de la aplicación Flask
├── templates/
│   ├── layout.html       # Plantilla base
│   ├── index.html        # Página de la calculadora
│   └── history.html      # Página del historial
├── static/
│   ├── css/
│   │   └── style.css     # Estilos de la aplicación
│   ├── js/
│   │   └── main.js       # Lógica del frontend (cálculos, voz, etc.)
│   └── img/
│       └── logo.png      # Logotipo de la ONCE
└── README.md             # Este archivo
```

## Cómo Empezar

1.  **Instalar dependencias**:
    ```bash
    pip install Flask
    ```
2.  **Ejecutar la aplicación**:
    ```bash
    python app.py
    ```
3.  Abre tu navegador y ve a `http://127.0.0.1:5000`.