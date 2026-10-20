---
example_description: "Los espacios seguidos se dibujan como uno solo, pero siguen en el DOM"
example_tags: "parser|espacios|white-space|nbsp|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- 🐛 Los espacios, tabuladores y saltos de línea seguidos se DIBUJAN como un solo
     espacio, y los del principio y el final de una línea desaparecen. Pero el parser
     no los borra: siguen en el DOM. Quien los junta es el CSS al dibujar
     (white-space: normal, el valor por defecto). -->
<p id="source">
    Hola,          mundo.
    Estas    líneas    están
          llenas de espacios.
</p>

<!-- ✅ Para separar a propósito: &nbsp; (espacio que no se junta), <br> (salto de
     línea) o <pre> (texto preformateado: respeta todos los espacios y saltos) -->
<p>Tres&nbsp;&nbsp;&nbsp;espacios con &amp;nbsp;<br>y un salto de línea con &lt;br&gt;</p>
<pre>En un pre    los espacios
    y los saltos se respetan.</pre>
```

# JavaScript

```javascript
// JSON.stringify enseña el texto con sus espacios y sus saltos (\n) visibles:
// todo lo que escribiste sigue en el DOM, aunque en pantalla veas una sola línea.
console.log('texto en el DOM →', JSON.stringify(document.querySelector('#source').textContent));
```
