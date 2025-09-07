const translate = require('translate');
const fs = require('fs-extra');
const path = require('path');

// --- Configuración ---
// Para un proyecto real, considera usar un servicio de pago con una clave de API.
// Ejemplo:
// translate.engine = 'deepl';
// translate.key = 'TU_CLAVE_DE_API';

// Usamos LibreTranslate para este ejemplo porque no requiere una clave de API.
translate.engine = 'libre';

const sourceLang = 'en';
const targetLangs = ['fr', 'de', 'pt', 'ru', 'ar']; // Francés, Alemán, Portugués, Ruso, Árabe

const localesDir = path.join(__dirname, '../static/lang'); // Apunta a static/lang
const sourceFile = path.join(localesDir, `${sourceLang}.json`);

async function runTranslations() {
    console.log(`Iniciando el proceso de traducción desde ${sourceFile}`);

    if (!fs.existsSync(sourceFile)) {
        console.error(`Error: El archivo base '${sourceFile}' no existe.`);
        return;
    }

    try {
        const sourceData = await fs.readJson(sourceFile);
        console.log('Archivo base en.json leído con éxito.');

        for (const lang of targetLangs) {
            console.log(`\n--- Traduciendo a ${lang.toUpperCase()} ---`);
            const translatedData = {};
            let progress = 0;
            const totalKeys = Object.keys(sourceData).length;

            for (const key in sourceData) {
                const sourceText = sourceData[key];

                try {
                    const translatedText = await translate(sourceText, { from: sourceLang, to: lang });
                    translatedData[key] = translatedText;
                    progress++;
                    process.stdout.write(`\rTraduciendo... ${progress}/${totalKeys} claves`);
                } catch (err) {
                    console.error(`\nError traduciendo la clave "${key}". Usando texto original como fallback. Error: ${err.message}`);
                    translatedData[key] = sourceText; // Fallback al texto original
                }
            }

            const targetFile = path.join(localesDir, `${lang}.json`);
            await fs.writeJson(targetFile, translatedData, { spaces: 2, EOL: '\n' });
            console.log(`\n¡Éxito! Archivo ${lang}.json generado en ${targetFile}`);
        }

        console.log('\n¡Todas las traducciones se han completado!');
    } catch (error) {
        console.error('\nHa ocurrido un error fatal en el proceso de traducción:', error);
    }
}

runTranslations();
