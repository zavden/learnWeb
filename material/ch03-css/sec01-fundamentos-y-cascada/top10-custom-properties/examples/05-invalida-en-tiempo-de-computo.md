---
example_description: "Si var() produce un valor inválido para la propiedad, no se usa la declaración anterior: la propiedad pasa a unset"
example_tags: "css|custom-properties|var|errores|unset"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<div class="parent">
  <p class="direct">✅ <code>color: crimson; color: 20px;</code> → la 2.ª se descarta al leer el CSS: rojo</p>
  <p class="via-var">❌ <code>color: crimson; color: var(--size);</code> → esperabas rojo… y sale azul (heredado)</p>
  <p class="via-var-fallback">❌ <code>color: var(--size, crimson)</code> → el respaldo no ayuda: azul</p>
</div>
```

# CSS

```css
:root {
  --size: 20px;               /* una longitud, no un color */
}

body {
  font-family: system-ui, sans-serif;
}

.parent {
  color: #1d4ed8;             /* azul: lo que heredan los párrafos */
}

/* Error normal (lección 1): «20px» no es un color y el navegador lo sabe AL LEER el CSS.
   Descarta esa declaración y se queda con la anterior → rojo. */
.direct {
  color: crimson;
  color: 20px;
}

/* 🐛 Con var(), el navegador NO puede saber al leer si el valor será válido: --size
   podría valer cualquier cosa. Así que acepta la declaración y descarta la anterior.
   Al calcular el estilo, sustituye var(--size) por 20px → no es un color → la declaración
   es «inválida en tiempo de cómputo» y la propiedad se comporta como unset:
   color es heredada → hereda el azul del padre. El crimson ya no existe. */
.via-var {
  color: crimson;
  color: var(--size);
}

/* El respaldo solo se usa cuando la variable NO existe; --size existe → mismo resultado. */
.via-var-fallback {
  color: var(--size, crimson);
}

/* Con una propiedad NO heredada pasa lo mismo, pero unset = initial:
   background: var(--size) → background transparent. */
```
