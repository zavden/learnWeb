---
example_description: "La interpolación #{} pega el valor de una variable dentro de un selector, un nombre de propiedad, una cadena de texto o una media query"
example_tags: "sass|interpolacion|variables|selectores"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="tag-new">Tomatera cherry</p>
<p class="tag-sale">Semillas de albahaca</p>
<p class="release">Hoja de estilos</p>
```

# SCSS

```scss
$new: "new";
$side: left;
$version: "2.3";
$bp: 30rem;

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

// 1) En un SELECTOR: Sass construye el nombre de la clase → .tag-new
.tag-#{$new} {
  // 2) En un NOMBRE DE PROPIEDAD → padding-left
  padding-#{$side}: 12px;
  border-#{$side}: 6px solid #15803d;
}

.tag-sale {
  padding-#{$side}: 12px;
  border-#{$side}: 6px solid #b45309;
}

// 3) Dentro de una CADENA DE TEXTO → "Versión 2.3"
.release::after {
  content: " · versión #{$version}";
  color: #475569;
}

// 4) En una MEDIA QUERY también puedes usar la variable sin interpolar:
//    @media (width >= $bp) funciona igual.
@media (width >= #{$bp}) {
  .release {
    font-weight: bold;
  }
}

// Sin #{}, Sass no sabría que «tag-$new» es una variable dentro de un nombre:
// en selectores y nombres de propiedad la interpolación es OBLIGATORIA.
// En valores normales (padding: $space) no hace falta.
```
