---
example_description: "Con !important el orden de las capas se invierte: gana la capa más temprana y cualquier capa gana a lo que no tiene capa"
example_tags: "css|cascada|layer|important"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="normal-demo">Declaraciones normales → gana lo que no tiene capa (amarillo)</p>
<p class="important-demo">Las mismas con <code>!important</code> → gana la capa «base» (azul)</p>
<ul class="legend">
  <li class="swatch-blue"><code>@layer base</code> (la primera capa)</li>
  <li class="swatch-purple"><code>@layer components</code> (la segunda)</li>
  <li class="swatch-yellow">Sin capa</li>
</ul>
```

# CSS

```css
@layer base, components;

@layer base {
  .normal-demo    { background: #bfdbfe; }
  .important-demo { background: #bfdbfe !important; }
}

@layer components {
  .normal-demo    { background: #e9d5ff; }
  .important-demo { background: #e9d5ff !important; }
}

.normal-demo    { background: #fde68a; }
.important-demo { background: #fde68a !important; }

/* 🐛 Normales:     base < components < sin capa      → gana amarillo (sin capa)
      !important:   sin capa < components < base      → gana azul (base)
   El orden se INVIERTE para las declaraciones importantes. Es a propósito: así una capa
   temprana (un reset, una base) puede «blindar» una declaración con !important y ninguna
   capa posterior podrá pisarla. Lo mismo pasa con los orígenes: un !important del
   navegador gana a un !important tuyo.
   Consecuencia: si añades !important sin capa para «ganar» a una librería que va en
   una capa y también usa !important, perderás. */

body {
  font-family: system-ui, sans-serif;
}

p {
  padding: 8px;
}

.legend {
  list-style: none;
  padding: 0;
}

.legend li {
  padding: 4px 8px;
  margin: 4px 0;
}

.swatch-blue { background: #bfdbfe; }
.swatch-purple { background: #e9d5ff; }
.swatch-yellow { background: #fde68a; }
```
