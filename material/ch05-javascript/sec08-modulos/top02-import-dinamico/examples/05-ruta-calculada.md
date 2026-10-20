---
example_description: "La ruta de import() puede calcularse: la tienda carga el catálogo de textos del idioma elegido y, si ese idioma no existe, atrapa el error de carga y usa el español"
example_tags: "javascript|python|modulos|import-dinamico|i18n|errores"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Archivos que usa: assets/05-idiomas/es.js y assets/05-idiomas/en.js
// (los dos exportan locale y messages con las mismas claves). No hay fr.js.

// Un import estático necesita una ruta fija: esto sería un SyntaxError.
//   import { messages } from `./05-idiomas/${lang}.js`;
// import() acepta cualquier expresión que dé un texto.
const SUPPORTED = ['es', 'en', 'fr']; // nunca construyas la ruta con datos sin validar

async function loadMessages(lang) {
  if (!SUPPORTED.includes(lang)) throw new RangeError(`Idioma no admitido: ${lang}`);
  try {
    return await import(`./05-idiomas/${lang}.js`);
  } catch (error) {
    // Un módulo que no existe (404) rechaza la promesa con un TypeError.
    console.log(`  ⚠️ no hay catálogo «${lang}» (${error.name}: ${error.message.split(': ')[0]}); uso «es»`);
    return import('./05-idiomas/es.js');
  }
}

for (const lang of ['es', 'en', 'fr']) {
  const { locale, messages } = await loadMessages(lang);
  console.log(`${lang} → ${locale} · ${messages.cartTitle}: ${messages.items(3)}`);
}

// Solo se descargan los catálogos que se piden: con 20 idiomas, la página
// no carga 19 que no va a usar.
// > Desde Python: importlib.import_module(f'idiomas.{lang}') con un
//   try/except ModuleNotFoundError. La diferencia: aquí hay que esperar.
```
