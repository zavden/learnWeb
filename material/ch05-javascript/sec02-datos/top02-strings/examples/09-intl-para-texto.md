---
example_description: "Intl básico para texto: listas con «y», plurales, mayúsculas según el idioma y nombres de países"
example_tags: "javascript|python|strings|intl|i18n|plurales"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Intl es la API de internacionalización del navegador: conoce las reglas de cada
// idioma (los datos de Unicode CLDR) sin que tengas que programarlas. Cada
// constructor recibe una etiqueta de idioma: 'es', 'es-ES', 'es-MX', 'en-US'…

// Listas con «y» / «o» y la puntuación correcta de cada idioma:
const fruits = ['manzanas', 'peras', 'uvas'];
console.log(new Intl.ListFormat('es', { type: 'conjunction' }).format(fruits));         // manzanas, peras y uvas
console.log(new Intl.ListFormat('en', { type: 'conjunction' }).format(fruits));         // manzanas, peras, and uvas
console.log(new Intl.ListFormat('es', { type: 'disjunction' }).format(['tarjeta', 'Bizum', 'efectivo'])); // tarjeta, Bizum o efectivo

// Plurales: PluralRules dice qué forma toca para un número ('one', 'other'…).
const plural = new Intl.PluralRules('es');
const messageWords = { one: 'mensaje nuevo', other: 'mensajes nuevos' };
for (const count of [0, 1, 2]) {
  console.log(`${count} ${messageWords[plural.select(count)]}`); // 0 mensajes nuevos, 1 mensaje nuevo…
}
// Otros idiomas tienen más formas (el árabe tiene seis): count === 1 no basta.
console.log("PluralRules('ar').select(2) →", new Intl.PluralRules('ar').select(2)); // 'two'

// Mayúsculas según el idioma: en turco, la i lleva punto también en mayúscula.
console.log("'i'.toUpperCase() →", 'i'.toUpperCase());                     // 'I'
console.log("'i'.toLocaleUpperCase('tr') →", 'i'.toLocaleUpperCase('tr')); // 'İ'
// Y algunas letras cambian de longitud: la ß alemana en mayúsculas es SS.
console.log("'straße'.toUpperCase() →", 'straße'.toUpperCase());           // 'STRASSE'

// Nombres de países, idiomas y monedas, traducidos:
const regions = new Intl.DisplayNames('es', { type: 'region' });
const languages = new Intl.DisplayNames('es', { type: 'language' });
console.log("regions.of('JP') →", regions.of('JP'));             // 'Japón'
console.log("languages.of('pt-BR') →", languages.of('pt-BR'));   // 'portugués de Brasil'

// Fechas y números con Intl: lección «Fechas e Intl».
// En Python, lo equivalente requiere el módulo locale (limitado) o la librería Babel.
```
