---
example_description: "Un degradado en el body de una página corta se repite en franjas: el fondo pinta toda la ventana, pero la imagen se mide con la caja de html, que solo es tan alta como el contenido. html { min-height: 100% } lo arregla"
example_tags: "css|degradados|body|background-repeat|lienzo|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<main class="card">
  <h1>Boletín de la huerta</h1>
  <p>Una página con poco contenido y un degradado en el <code>body</code>, de azul muy claro a azul oscuro.</p>
  <p class="note">❌ Sin el arreglo, el degradado mide lo que mide el contenido y se repite en franjas hasta abajo.</p>
  <label class="fix"><input type="checkbox" id="fix"> Aplicar el arreglo: <code>html { min-height: 100% }</code></label>
</main>
```

# CSS

```css
/* 🐛 El fondo del body se propaga al lienzo y pinta TODA la ventana (lección de
   fondos del módulo del modelo de cajas). Pero la imagen de fondo se mide como
   si fuera para la caja de <html>, que aquí solo es tan alta como el contenido
   (unos 160px). Un degradado de 160px de alto, con background-repeat: repeat
   (el valor inicial), se repite en franjas hasta el final de la ventana. */
body {
  background-image: linear-gradient(#f0f9ff, #0369a1);
  color: #0f172a;
  font-family: system-ui, sans-serif;
}

/* El texto va en una tarjeta blanca: se lee igual sobre cualquier zona del degradado. */
.card {
  max-width: 400px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #ffffff;
}

h1 {
  margin: 0 0 4px;
  font-size: 1.15rem;
}

p,
.fix {
  margin: 0 0 6px;
  font-size: 0.8rem;
}

.fix {
  display: block;
  margin: 0;
  font-weight: 600;
}

/* ✅ Con html al menos tan alto como la ventana, la imagen se mide con todo el
   alto y ya no hay repetición. Si el contenido crece, html crece con él y el
   degradado se estira hasta el final del documento.
   Otras soluciones: background-attachment: fixed (la imagen se mide con la
   ventana y no se mueve al hacer scroll) o background-repeat: no-repeat con
   un background-color de reserva para lo que quede debajo. */
html:has(#fix:checked) {
  min-height: 100%;
}

html:has(#fix:checked) .note {
  text-decoration: line-through;
}
```
