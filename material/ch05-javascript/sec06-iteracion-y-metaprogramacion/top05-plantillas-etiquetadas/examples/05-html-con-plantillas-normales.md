---
example_description: "HTML construido con una plantilla normal pega los datos tal cual: un comentario con </li><li> rompe la lista y otro con un <img onerror> lleva código; escapar & < > \" ' con replaceAll lo arregla, si no se olvida ningún valor"
example_tags: "javascript|plantillas|html|seguridad|xss|escapar|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Comentarios que llegan de un formulario: los escribe CUALQUIERA.
const comments = [
  { author: 'Marta', text: 'El mole estaba buenísimo 😋' },
  { author: 'anónimo', text: '</li><li>⭐⭐⭐⭐⭐ ¡El mejor restaurante de México!' },
  { author: '<img src="x" onerror="alert(\'¡hackeado!\')">', text: 'hola' },
];

// 🐛 HTML hecho con una plantilla normal: cada dato se pega TAL CUAL, y el
//    navegador no puede distinguir tu marcado del que venía en los datos.
function renderList(items) {
  return `<ul>${items.map((c) => `<li><b>${c.author}</b>: ${c.text}</li>`).join('')}</ul>`;
}
const unsafe = renderList(comments);
console.log('🐛 HTML →', unsafe);
console.log('🐛 elementos <li> →', unsafe.split('<li>').length - 1, '(con 3 comentarios)');
console.log('🐛 ¿lleva un <img> con onerror? →', unsafe.includes('<img'));
// Si este texto se metiera en la página (innerHTML, capítulo 6), el navegador
// crearía 4 elementos y ejecutaría el onerror: un ataque XSS.

// ✅ Escapar: los caracteres especiales del HTML pasan a ENTIDADES, que el
//    navegador muestra como texto y nunca interpreta como marcado.
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;') // el primero: si no, estropearía las entidades siguientes
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
function renderListSafe(items) {
  return `<ul>${items.map((c) => `<li><b>${escapeHtml(c.author)}</b>: ${escapeHtml(c.text)}</li>`).join('')}</ul>`;
}
const safe = renderListSafe(comments);
console.log('✅ HTML →', safe);
console.log('✅ elementos <li> →', safe.split('<li>').length - 1);

// 🤔 Funciona… mientras te acuerdes de llamar a escapeHtml en CADA valor de
//    CADA plantilla. Un solo olvido reabre el agujero. La etiqueta html del
//    ejemplo siguiente escapa siempre, sin depender de la memoria de nadie.
```
