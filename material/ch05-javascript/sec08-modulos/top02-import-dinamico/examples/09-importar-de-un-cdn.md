---
example_description: "Importar una librería de npm desde un CDN (esm.sh) con la versión fijada, con un plazo y con un mensaje claro si no hay conexión"
example_tags: "javascript|modulos|import-dinamico|cdn|esm-sh|npm"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// ⚠️ Este ejemplo necesita internet. Sin conexión, lo dice y termina bien.
// esm.sh convierte paquetes de npm en módulos ES que el navegador puede
// importar por URL. Aquí, la librería slugify, con la versión FIJADA (@1.6.6):
// sin versión recibirías la última, que puede cambiar sin avisar.
const SLUGIFY_URL = 'https://esm.sh/slugify@1.6.6';

// import() no se puede cancelar, pero sí dejar de esperarlo (lección
// «Combinadores y cancelación»): si en 8 s no llega, seguimos sin él.
let timerId;
const timeout = new Promise((resolve, reject) => {
  timerId = setTimeout(() => reject(new Error('sin respuesta en 8 s')), 8000);
});

try {
  const { default: slugify } = await Promise.race([import(SLUGIFY_URL), timeout]);
  console.log('✅ slugify 1.6.6 cargado desde esm.sh');
  for (const name of ['Café de Olla 500 g', 'Mole poblano (frasco)']) {
    console.log(`${name} →`, slugify(name, { lower: true, strict: true }));
  }
} catch (error) {
  console.log(`⚠️ sin conexión: no se pudo cargar ${SLUGIFY_URL} (${error.name}: ${error.message.split(': ')[0]})`);
} finally {
  clearTimeout(timerId);
}

// Un CDN es cómodo para probar y para páginas pequeñas, pero tu página pasa
// a depender de un servidor ajeno (caídas, privacidad, código que no has
// revisado). En un proyecto real, las dependencias se instalan con npm y un
// empaquetador las sirve desde tu propio servidor (lección «Rutas, import
// maps y herramientas»).
```
