---
example_description: "Un & sin escapar en el texto: &region se convierte en ®ion"
example_tags: "html|entidades|ampersand|url|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- 🐛 Un & suelto casi siempre «funciona»… salvo si lo que le sigue empieza como una
     entidad antigua, de las que no necesitan punto y coma: &reg (®), &curren (¤),
     &copy (©), &para (¶), &not (¬)… En el TEXTO, el navegador la decodifica. -->
<p>❌ https://tienda.ejemplo.com/buscar?q=zapatos&region=es&currency=eur</p>

<!-- ✅ Escribe siempre &amp; cuando quieras un & literal -->
<p>✅ https://tienda.ejemplo.com/buscar?q=zapatos&amp;region=es&amp;currency=eur</p>

<!-- Dentro de un ATRIBUTO hay una excepción histórica: si a la entidad le sigue una
     letra, un número o un =, no se decodifica. Por eso este enlace funciona… y aun
     así, lo correcto también es escribir &amp; -->
<p><a href="?q=zapatos&region=es&currency=eur">Enlace con el & sin escapar</a></p>
```

# JavaScript

```javascript
// textContent y getAttribute (JavaScript) muestran lo que el parser guardó en el DOM
const paragraphs = document.querySelectorAll('p');
console.log('❌ texto →', paragraphs[0].textContent);
console.log('✅ texto →', paragraphs[1].textContent);
console.log('href del enlace →', document.querySelector('a').getAttribute('href'));
```
