---
example_description: "::backdrop es la capa que cubre la página bajo un popover o un dialog modal abierto"
example_tags: "css|pseudoelementos|backdrop|popover"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<button type="button" popovertarget="notice">Abrir aviso</button>
<p>Contenido normal de la página. Al abrir el aviso, el <code>::backdrop</code> lo cubrirá con una capa oscura.
  Para cerrarlo, pulsa «Cerrar», <kbd>Esc</kbd> o haz clic fuera.</p>

<div id="notice" class="notice" popover>
  <p>Detrás de este aviso, el <code>::backdrop</code> oscurece la página.</p>
  <button type="button" popovertarget="notice" popovertargetaction="hide">Cerrar</button>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.notice {
  padding: 16px;
  border: 2px solid #1e3a8a;
}

/* ::backdrop → una caja que ocupa toda la ventana justo DEBAJO de un elemento de la
   capa superior (top layer): un popover abierto o un <dialog> abierto con showModal().
   (El atributo popover lo viste en el capítulo de HTML: no hace falta JavaScript.) */
.notice::backdrop {
  background: rgba(15, 23, 42, 0.6);   /* azul casi negro al 60 % de opacidad (lección de color) */
}
```
