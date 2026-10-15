---
example_description: "Hasta ahora, una foto que debía llenar una celda iba de fondo con role=img y aria-label. Con object-fit, la misma celda se hace con un <img> de verdad: alt, srcset y sizes, loading=lazy, impresión y «Guardar imagen». En pantalla se ven iguales; en la vista previa de impresión, el fondo desaparece"
example_tags: "css|responsive|imagenes|object-fit|background-image|accesibilidad|impresion"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">Dos celdas iguales de una galería. Para ver una diferencia: ábrelo con ↗ y pulsa <kbd>⌘</kbd> <kbd>P</kbd>. En la vista previa de impresión, la celda de fondo sale vacía (los fondos solo se imprimen si marcas «Background graphics» en «More settings»).</p>
<div class="gallery">
  <figure>
    <div class="tile is-background" role="img" aria-label="Buzz Aldrin camina sobre la Luna"></div>
    <figcaption>Antes: fondo con <code>role="img"</code></figcaption>
  </figure>
  <figure>
    <img class="tile" src="aldrin-apolo-11-480.jpg" alt="Buzz Aldrin camina sobre la Luna" width="480" height="483" loading="lazy">
    <figcaption>Ahora: <code>&lt;img&gt;</code> con <code>object-fit</code></figcaption>
  </figure>
</div>
<p class="credit">NASA, Apolo 11, 1969. Dominio público.</p>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption, .credit { margin: 0 0 8px; font-size: 0.72rem; }
.gallery { display: grid; grid-template-columns: repeat(2, minmax(0, 12rem)); gap: 12px; }
figure { margin: 0; }
figcaption { margin-top: 4px; font-size: 0.7rem; }

/* La celda: 3:2, la foto la llena y se recorta. */
.tile { display: block; width: 100%; height: auto; aspect-ratio: 3 / 2; }

/* ANTES (módulo de grid): la foto como fondo. Funciona en pantalla, pero:
   - el «alt» es un aria-label que hay que acordarse de poner;
   - no hay srcset ni sizes: o una foto para todos, o image-set() por densidad;
   - no hay loading="lazy";
   - los fondos NO SE IMPRIMEN por defecto, y no se pueden guardar con el
     botón derecho como imagen. */
.is-background {
  background: url("aldrin-apolo-11-480.jpg") 50% 20% / cover;
}

/* AHORA: un <img> de verdad. object-fit hace lo que hacía background-size,
   y object-position lo que hacía background-position. Lo que es CONTENIDO
   va en el HTML; los fondos, para la decoración. */
img.tile {
  object-fit: cover;
  object-position: 50% 20%;
}
```
