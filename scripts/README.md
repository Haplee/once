# Script de Traducción Automática

Este script se utiliza para generar archivos de idioma automáticamente a partir del archivo base `public/locales/en.json`.

## Requisitos

- Node.js y npm instalados en tu sistema.

## Uso

1.  **Instalar dependencias:**
    Desde la raíz del proyecto, abre una terminal y ejecuta:
    ```bash
    npm install translate fs-extra
    ```

2.  **Ejecutar el script:**
    Una vez instaladas las dependencias, ejecuta el script con:
    ```bash
    node scripts/translate.js
    ```

## Cómo funciona

El script leerá `static/lang/en.json`, traducirá cada valor a los idiomas de destino (francés, alemán, etc.) usando una API de traducción, y guardará los nuevos archivos (`fr.json`, `de.json`, etc.) en la misma carpeta `static/lang`.

**Nota Importante:** El script está configurado para usar `LibreTranslate` por defecto. Este servicio es gratuito y no requiere clave de API, pero puede ser inestable o tener límites de uso. Para un proyecto en producción, se recomienda encarecidamente cambiar a un servicio más robusto como **DeepL** o **Google Translate** y proporcionar una clave de API, como se indica en los comentarios dentro del propio script (`scripts/translate.js`).

## Sincronización

Cada vez que modifiques o añadas claves en `static/lang/en.json`, deberás volver a ejecutar este script para mantener todos los idiomas sincronizados.
