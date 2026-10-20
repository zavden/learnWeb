---
example_description: "map.get con una clave mal escrita devuelve null y Sass borra la declaración sin avisar. Una función con @error convierte la errata en un mensaje claro"
example_tags: "sass|depuracion|mapas|null|error|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<h2 class="title-bad">❌ Título sin color (<code>map.get($palette, brnad)</code>)</h2>
<h2 class="title-good">✅ Título verde (<code>palette(brand)</code>)</h2>
<p>Busca <code>.title-bad</code> en <code>compiled.css</code>: le falta la declaración <code>color</code>.</p>
```

# SCSS

```scss
@use "sass:map";

$palette: (
  brand: #15803d,
  text: #1e293b,
  muted: #475569,
);

// ✅ Un «getter» que no perdona: si la clave no existe, detiene la compilación.
@function palette($name) {
  @if not map.has-key($palette, $name) {
    @error "palette(): no hay ningún color «#{$name}». Opciones: #{map.keys($palette)}.";
  }
  @return map.get($palette, $name);
}

body {
  font-family: system-ui, sans-serif;
  color: palette(text);
}

// 🐛 Errata: «brnad». map.get no falla: devuelve null (como dict.get en Python),
// y una declaración con valor null NO SE ESCRIBE. No hay error ni aviso:
// el título simplemente hereda el color del texto.
.title-bad {
  color: map.get($palette, brnad);
  font-size: 1.25rem;
}

// Con el getter, la misma errata, palette(brnad), detendría la compilación con:
// «palette(): no hay ningún color «brnad». Opciones: brand, text, muted.»
.title-good {
  color: palette(brand);
  font-size: 1.25rem;
}

p {
  color: palette(muted);
}
```
