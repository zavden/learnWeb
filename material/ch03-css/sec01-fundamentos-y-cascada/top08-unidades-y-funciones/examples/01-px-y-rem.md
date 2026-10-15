---
example_description: "px es fijo; rem es un múltiplo de la fuente de html y respeta el tamaño de letra que elige el usuario"
example_tags: "css|unidades|px|rem"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="px-text">font-size: 20px → siempre 20 píxeles de CSS</p>
<p class="rem-text">font-size: 1.25rem → 1.25 × la fuente de &lt;html&gt;</p>
<p class="hint">Ahora valen lo mismo (1.25 × 16px = 20px). Cambia en el CSS el <code>100%</code> de <code>html</code> por <code>150%</code>: solo crece el segundo.</p>
```

# CSS

```css
/* 100% = el tamaño de letra que tenga configurado el navegador (16px si nadie lo ha
   cambiado). Las personas con baja visión suelen subirlo en los ajustes. */
html {
  font-size: 100%;
}

body {
  font-family: system-ui, sans-serif;
}

/* px: unidad absoluta. No sigue a nadie: ni a la raíz ni a los ajustes del usuario. */
.px-text {
  font-size: 20px;
  background: #fecaca;
}

/* rem («root em»): múltiplo del font-size del elemento raíz, <html>.
   Si el usuario sube su letra por defecto, todo lo medido en rem crece con ella. */
.rem-text {
  font-size: 1.25rem;
  background: #bbf7d0;
}

.hint {
  color: #475569;
}
```
