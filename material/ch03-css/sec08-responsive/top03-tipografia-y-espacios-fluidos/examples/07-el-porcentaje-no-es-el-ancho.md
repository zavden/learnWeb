---
example_description: "En font-size, un porcentaje es del tamaño de letra del padre, no del ancho: clamp(1.25rem, 1rem + 3%, 2.5rem) se queda clavado en su mínimo a cualquier ancho. Con vw, el título crece con la ventana"
example_tags: "css|responsive|tipografia-fluida|clamp|porcentaje|vw|unidades|bug"
example_stage: common-error
example_importance: useful
---

# HTML

```html
<p class="caption">Estrecha y ensancha la vista previa (o ↗). El primer título no cambia nunca.</p>

<h2 class="with-percent">❌ <code>1rem + 3%</code>: Feria del Mole en San Pedro Atocpan</h2>
<h2 class="with-vw">✅ <code>1rem + 3vw</code>: Feria del Mole en San Pedro Atocpan</h2>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption { font-size: 0.72rem; }
h2 { line-height: 1.15; }
h2 code { font-size: 0.55em; }

/* 🐛 La tabla de «porcentaje ¿de qué?» de la lección de unidades: en
   font-size, % es del font-size del PADRE (aquí, el body: 16px). 3 % son
   0.48px, así que 1rem + 3% = 16.48px a cualquier ancho, y clamp() lo sube
   a su mínimo: 20px, siempre. */
.with-percent { font-size: clamp(1.25rem, 1rem + 3%, 2.5rem); }

/* ✅ vw sí mide la ventana: a 320px, 16 + 9.6 = 25.6px; a 480px, 30.4px;
   desde 800px, el máximo (40px). */
.with-vw { font-size: clamp(1.25rem, 1rem + 3vw, 2.5rem); }
```
