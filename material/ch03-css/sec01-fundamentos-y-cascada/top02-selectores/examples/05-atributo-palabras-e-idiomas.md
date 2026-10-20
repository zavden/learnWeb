---
example_description: "~= busca una palabra completa (como class), *= busca cualquier trozo y |= está pensado para códigos de idioma"
example_tags: "css|selectores|atributo|lang"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<div class="legend">Fondo verde ← <code>[data-tags~="css"]</code> · Barra azul ← <code>[data-tags*="css"]</code> · Cursiva ← <code>p[lang|="es"]</code></div>
<p data-tags="css html"><code>data-tags="css html"</code></p>
<p data-tags="html scss"><code>data-tags="html scss"</code> (scss contiene las letras «css»)</p>
<p data-tags="javascript"><code>data-tags="javascript"</code></p>
<p lang="es"><code>lang="es"</code> · Hola, ¿qué tal?</p>
<p lang="es-MX"><code>lang="es-MX"</code> · ¿Qué onda?</p>
<p lang="eu"><code>lang="eu"</code> (euskera) · Kaixo</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

p {
  margin: 4px 0;
  padding: 2px 6px;
}

/* ~= → el valor es una lista de palabras separadas por espacios y una de ellas es «css».
   Así funciona class por dentro: .card equivale a [class~="card"]. */
[data-tags~="css"] {
  background: #bbf7d0;        /* ✅ "css html" · ❌ "html scss" */
}

/* *= → el TROZO «css» aparece en cualquier parte, aunque sea dentro de otra palabra */
[data-tags*="css"] {
  border-left: 6px solid #2563eb;   /* ✅ "css html" · ✅ "html scss" (¡también!) */
}

/* |= → exactamente «es», o «es» seguido de un guion: es, es-MX, es-ES… */
p[lang|="es"] {
  font-style: italic;         /* ✅ es · ✅ es-MX · ❌ eu */
}
/* ¿Por qué p[lang|="es"] y no [lang|="es"] a secas? Porque la página es <html lang="es">:
   sin el p, también coincidiría con <html>, y la cursiva se heredaría a TODO
   (incluido el párrafo en euskera). Un selector de atributo mira todos los elementos. */
```
