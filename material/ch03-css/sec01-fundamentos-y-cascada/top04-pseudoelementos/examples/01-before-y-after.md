---
example_description: "::before y ::after añaden contenido generado por CSS: texto, comillas, el valor de un atributo y adornos accesibles"
example_tags: "css|pseudoelementos|before|after|content"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="price">19,99</p>
<blockquote class="quote">La simplicidad es la máxima sofisticación.</blockquote>
<p class="tip">Guarda tu trabajo a menudo.</p>
<p>Un enlace con su dirección escrita al lado (pasa el ratón por encima): <a href="https://example.com/guia">la guía</a></p>
<p>Ninguno de los textos grises, las comillas ni el icono está en el HTML: selecciónalos con el ratón y verás que no puedes.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* ::after crea una caja al FINAL del contenido del elemento; ::before, al PRINCIPIO.
   Son hijos del elemento (el primero y el último), pero no existen en el HTML:
   los genera el CSS. La propiedad content dice qué contienen. */
.price::after {
  content: " €";               /* un texto literal */
  color: #64748b;
}

.quote::before { content: "«"; }
.quote::after  { content: "»"; }

/* Varias piezas seguidas se concatenan. attr() lee un atributo del propio elemento. */
a::after {
  content: " (" attr(href) ")";
  font-size: 0.8em;
  color: #475569;
}

/* Con una pseudoclase, la pseudoclase va antes y el pseudoelemento SIEMPRE al final */
a:hover::after {
  color: #b91c1c;
}

/* Lo que va tras la barra es el texto alternativo: "" = decorativo, los lectores de
   pantalla lo ignoran. Sin la barra, el contenido generado SÍ se lee en voz alta:
   no pongas información importante solo en content. */
.tip::before {
  content: "💡 " / "";
}
```
