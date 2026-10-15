---
example_description: "El fondo del body se propaga a todo el lienzo aunque el body sea bajito; si html tiene fondo propio, el del body vuelve a su caja"
example_tags: "css|fondos|body|canvas|bug"
example_stage: common-error
example_importance: useful
---

# HTML

```html
<p>❌ El body solo mide lo que este párrafo, pero el fondo verde llena toda la vista previa.</p>
<p class="hint">Quita el comentario de la regla de <code>html</code> en el CSS: el verde vuelve a la caja real del body (con su margen de 8px alrededor).</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  background: #bbf7d0;
  border: 3px dashed #15803d;    /* el borde muestra el tamaño REAL del body */
}

/* 🐛 Regla especial: si <html> no tiene fondo, el navegador usa el del <body> para pintar
   TODO el lienzo (canvas), no solo la caja del body. Por eso el verde llena la vista previa
   aunque la caja del body (borde punteado) sea mucho más pequeña.
   En la lección 1 del capítulo viste el margen de 8px del body: aquí lo ves rodeado de verde. */

/* Quita el comentario para dar fondo propio a html: entonces el body pinta solo su caja. */
/* html { background: #f8fafc; } */

.hint {
  font-size: 0.85rem;
}
```
