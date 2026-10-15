---
example_description: "La sintaxis indentada (.sass): la misma tarjeta sin llaves ni punto y coma, con la indentación marcando los bloques, como en Python"
example_tags: "sass|sintaxis-indentada|scss|compilar"
example_stage: minimal
example_importance: important
---

# HTML

```html
<article class="card">
  <h2>Kit de riego por goteo</h2>
  <p>Doce goteros regulables, programador solar y 20 metros de tubo.</p>
  <a href="/tienda/kit-riego-goteo">Ver el kit</a>
</article>
```

# SASS

```sass
// La sintaxis indentada (archivos .sass): sin llaves y sin punto y coma.
// La indentación marca qué va dentro de qué, como en Python.
// Genera exactamente el mismo CSS que la versión SCSS del primer ejemplo.

$brand: #2563eb
$text: #1e293b
$radius: 12px
$space: 16px

body
  font-family: system-ui, sans-serif
  color: $text

.card
  max-width: 22rem
  padding: $space
  border: 2px solid $brand
  border-radius: $radius

  h2
    margin: 0 0 $space * 0.5
    color: $brand
    font-size: 1.25rem

  p
    margin: 0 0 $space
    line-height: 1.5

  a
    color: $brand
    font-weight: bold

// Cuidado: aquí la indentación SÍ importa. Si mueves «h2» a la columna 0,
// deja de estar dentro de .card y pasa a ser una regla para todos los h2.
```
