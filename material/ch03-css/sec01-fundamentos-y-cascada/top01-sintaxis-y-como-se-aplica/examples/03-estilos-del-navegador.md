---
example_description: "Una página sin una sola línea de CSS: todo lo que se ve lo pone la hoja de estilos del navegador"
example_tags: "css|user-agent|estilos-por-defecto"
example_stage: minimal
example_importance: important
---

# HTML

```html
<!-- Este ejemplo NO tiene bloque CSS. Todo lo que ves lo aplica la hoja de estilos
     del navegador (user agent stylesheet). Ábrelo con DevTools → Elements → Styles. -->
<h1>Un h1: 2em, negrita y margen arriba y abajo</h1>

<p>Un párrafo: margen de 1em arriba y abajo. Dentro, <a href="#">un enlace azul y subrayado</a>,
  <strong>negrita</strong>, <em>cursiva</em> y <code>código en letra monoespaciada</code>.</p>

<ul>
  <li>Una lista: viñetas y 40px de sangría (padding-inline-start)</li>
  <li>Las viñetas no son texto del HTML: las dibuja el navegador</li>
</ul>

<button type="button">Un botón con su propia fuente, borde y fondo</button>

<!-- [hidden] { display: none } también es una regla del navegador: este párrafo no se ve. -->
<p hidden>No me ves.</p>
```
