---
example_description: "La caja de una línea de texto deja espacio por encima de las mayúsculas y por debajo de la línea base; text-box: trim-both cap alphabetic lo recorta y el padding de un botón queda igual arriba y abajo"
example_tags: "css|tipografia|text-box|text-box-trim|line-height|botones"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="caption">El borde discontinuo es la caja del párrafo. Izquierda: la caja normal, con aire encima de la H y debajo de la línea base. Derecha: <code>text-box: trim-both cap alphabetic</code></p>
<div class="row">
  <p class="sample">Hoja</p>
  <p class="sample is-trimmed">Hoja</p>
</div>

<p class="caption">❌ Botón con 12px de padding arriba y abajo: el texto parece más cerca del borde de abajo</p>
<a class="button" href="/reservas">Reservar mesa</a>

<p class="caption">✅ El mismo padding con <code>text-box</code>: 12px desde la altura de las mayúsculas y 12px desde la línea base</p>
<a class="button is-trimmed" href="/reservas">Reservar mesa</a>

<p class="caption">La tilde de la Ú sobresale del recorte, pero se pinta igual: deja padding para ella</p>
<a class="button is-trimmed" href="/pedidos">Último pedido: 19:30</a>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 12px 0 4px;
  font-size: 0.75rem;
}

.row {
  display: flex;
  gap: 24px;
}

.sample {
  margin: 0;
  font-size: 4rem;
  line-height: 1.2;
  outline: 1px dashed #4338ca;
}

/* La caja de una línea mide su line-height. Por encima de las mayúsculas queda el
   medio interlineado más el sitio que la fuente reserva para tildes y letras
   altas; por debajo de la línea base, el de los rabos (g, j, p) y el otro medio
   interlineado. No suman lo mismo, así que el texto nunca parece centrado.

   text-box-trim dice qué lados recortar (trim-start, trim-end, trim-both) y
   text-box-edge, hasta dónde: «cap» (la altura de las mayúsculas) arriba y
   «alphabetic» (la línea base) abajo. El atajo text-box escribe los dos.
   Afecta a la primera y a la última línea del bloque. Desde Chrome 133. */
.is-trimmed {
  text-box: trim-both cap alphabetic;
}

.button {
  display: inline-block;
  padding: 12px 20px;
  border-radius: 8px;
  background: #3730a3;
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 600;
  text-decoration: none;
}
```
