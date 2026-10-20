---
example_description: "Los cuantificadores (* + ? {n,m}) son codiciosos: <.+> se traga desde la primera etiqueta hasta la última; con ? detrás son perezosos, y una clase negada como <[^>]+> es aún más clara"
example_tags: "javascript|regex|cuantificadores|codicioso|perezoso|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Cuantificadores: * (0 o más), + (1 o más), ? (0 o 1), {5} (exactamente 5),
// {2,4} (de 2 a 4), {2,} (2 o más). Afectan a lo que tienen justo delante.
console.log('{5} →', /^\d{5}$/.test('50001'), '| u? →', /^colou?r$/.test('color'), /^colou?r$/.test('colour'));

const html = '<p>Envío <b>gratis</b> desde <b>$500</b></p>';

// 🐛 Son CODICIOSOS: .+ se queda con todo el texto que puede y luego retrocede
//    lo justo para que el > final encaje… con el ÚLTIMO > de la línea.
console.log('🐛 <.+> →', html.match(/<.+>/)[0]);
// (En una regex literal, la barra de </b> se escribe \/ para no cerrar la regex.)
console.log('🐛 <b>.+<\\/b> →', html.match(/<b>.+<\/b>/g));

// ✅ Con ? detrás son PEREZOSOS: se quedan con lo mínimo que permite encajar.
console.log('✅ <.+?> →', html.match(/<.+?>/g));
console.log('✅ <b>.+?<\\/b> →', html.match(/<b>.+?<\/b>/g));

// ✅ Mejor aún, una clase negada: «uno o más caracteres que no sean >».
//    Dice exactamente lo que quieres y no necesita retroceder.
console.log('✅ <[^>]+> →', html.match(/<[^>]+>/g));
console.log('✅ en negrita →', html.match(/<b>[^<]+<\/b>/g));

// Ojo: esto vale para trocear un texto con etiquetas sencillas. Para HTML de
// verdad, el navegador ya trae un analizador: el DOM (capítulo 6).
```
