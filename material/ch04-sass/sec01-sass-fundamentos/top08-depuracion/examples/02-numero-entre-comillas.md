---
example_description: "\"8px\" entre comillas es una cadena, no un número: $gap + 4px pega texto (\"8px4px\"). @debug no muestra las comillas; meta.inspect y meta.type-of sí"
example_tags: "sass|depuracion|debug|meta|cadenas|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<div class="card card-bad">❌ <code>$gap-bad: "8px"</code> → <code>padding: "8px4px"</code>: sin padding</div>
<div class="card card-good">✅ <code>$gap-good: 8px</code> → <code>padding: 12px</code></div>
<p>Investiga en <code>sass-output.txt</code>: compara la primera línea con las siguientes.</p>
```

# SCSS

```scss
@use "sass:meta";

// Una configuración copiada de un archivo JSON, con las comillas incluidas.
$gap-bad: "8px";
$gap-good: 8px;

// 🔍 La investigación:
@debug $gap-bad;                       // 8px      ← ¡parece un número!
@debug meta.inspect($gap-bad);         // "8px"    ← inspect muestra las comillas
@debug meta.type-of($gap-bad);         // string   ← es una CADENA
@debug meta.type-of($gap-good);        // number
@debug meta.inspect($gap-bad + 4px);   // "8px4px" ← + con una cadena PEGA texto

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.card {
  max-width: 26rem;
  margin-bottom: 8px;
  border: 2px solid #7c3aed;
  background: #ede9fe;
}

// 🐛 Una cadena + un número = otra cadena: "8px4px". El CSS recibe
// padding: "8px4px" (con comillas), que no es una longitud → se descarta.
.card-bad {
  padding: $gap-bad + 4px;
}

// ✅ Los números van SIN comillas, con su unidad.
.card-good {
  padding: $gap-good + 4px;
}

// Python: "8px" + "4px" == "8px4px" también; la diferencia es que Python da
// error con "8" + 4 y Sass no: convierte el número en texto y lo pega.
```
