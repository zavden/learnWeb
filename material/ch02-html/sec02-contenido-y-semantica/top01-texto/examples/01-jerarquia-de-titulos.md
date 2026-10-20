---
example_description: "h1-h6: seis niveles de título que forman el índice del documento"
example_tags: "html|texto|titulos|h1|estructura"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<!-- Los títulos van de h1 (el más importante) a h6. El nivel no se elige por el
     tamaño, sino por el lugar en el índice: un h3 es una subsección del h2 anterior. -->
<h1>Granada en un fin de semana</h1>
<p>Qué ver, dónde comer y cómo moverse sin coche.</p>

<h2>Qué ver</h2>
<h3>La Alhambra</h3>
<p>Compra la entrada con semanas de antelación: el aforo es limitado.</p>
<h3>El Albaicín</h3>
<p>Sube al mirador de San Nicolás al atardecer.</p>

<h2>Cómo moverse</h2>
<h3>Autobús</h3>
<h4>Líneas al centro</h4>
<!-- Llegar a h5 y h6 es raro; aquí están para ver los seis tamaños por defecto.
     Fíjate: h5 y h6 son MÁS PEQUEÑOS que el texto de los párrafos. -->
<h5>Línea C30</h5>
<h6>Horario de invierno</h6>
<p>De 7:00 a 23:00, cada diez minutos.</p>
```

# JavaScript

```javascript
// Así «ve» la página quien navega por títulos con un lector de pantalla (tecla H en
// NVDA, rotor en VoiceOver): un índice. querySelectorAll y for…of se explican en JavaScript.
for (const heading of document.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
  const level = Number(heading.tagName[1]);
  const size = getComputedStyle(heading).fontSize; // tamaño que pone el navegador
  console.log('  '.repeat(level - 1) + `${heading.tagName.toLowerCase()} (${size}) →`, heading.textContent);
}
```
