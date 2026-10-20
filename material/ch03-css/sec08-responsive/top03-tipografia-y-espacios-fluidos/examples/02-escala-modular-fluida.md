---
example_description: "Una escala modular fluida: cada paso multiplica el anterior por una razón que crece de 1,2 (ventana de 320px) a 1,25 (1200px). Los títulos grandes crecen mucho más que el texto, y la jerarquía se acentúa en pantallas anchas"
example_tags: "css|responsive|tipografia-fluida|escala-modular|clamp|custom-properties"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">Cada línea dice su paso y su tamaño a 320px → a 1200px. Ensancha la vista previa (o ↗): el paso 4 pasa de 33 a 49px; el texto, solo de 16 a 20.</p>
<div class="specimen">
  <p class="step-4">Pan dulce <span>paso 4 · 33 → 49px</span></p>
  <p class="step-3">Conchas y orejas <span>paso 3 · 28 → 39px</span></p>
  <p class="step-2">La masa madre <span>paso 2 · 23 → 31px</span></p>
  <p class="step-1">Curso de otoño en la Escuela del Barrio <span>paso 1 · 19 → 25px</span></p>
  <p class="step-0">Aprende a alimentar tu masa madre y a formar piezas clásicas. <span>paso 0 · 16 → 20px</span></p>
  <p class="step--1">Plazas limitadas: 12 personas por grupo. <span>paso −1 · 13 → 16px</span></p>
</div>
```

# CSS

```css
/* Una escala modular: paso n = base × razónⁿ. Aquí, con DOS escalas:
     a 320px:  base 16px, razón 1,2   → 13.33, 16, 19.2, 23.04, 27.65, 33.18
     a 1200px: base 20px, razón 1,25  → 16, 20, 25, 31.25, 39.06, 48.83
   y cada paso es la recta entre su valor pequeño y su valor grande (los
   números salen del programa en Python de la lección). */
:root {
  --step--1: clamp(0.8333rem, 0.7727rem + 0.303vw, 1rem);
  --step-0: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
  --step-1: clamp(1.2rem, 1.0682rem + 0.6591vw, 1.5625rem);
  --step-2: clamp(1.44rem, 1.2534rem + 0.933vw, 1.9531rem);
  --step-3: clamp(1.728rem, 1.4686rem + 1.2971vw, 2.4414rem);
  --step-4: clamp(2.0736rem, 1.7179rem + 1.7785vw, 3.0518rem);
}

body {
  font-family: Georgia, serif;
  color: #1e293b;
  background: #ffffff;
}

.caption { font-family: system-ui, sans-serif; font-size: 0.72rem; }

.specimen p { margin: 0 0 0.4em; line-height: 1.15; }

/* La etiqueta de cada línea, pequeña y fija: no es parte de la escala. */
.specimen span {
  font-family: system-ui, sans-serif;
  font-size: 0.65rem;
  color: #475569;
  white-space: nowrap;
}

.step-4 { font-size: var(--step-4); font-weight: 700; }
.step-3 { font-size: var(--step-3); font-weight: 700; }
.step-2 { font-size: var(--step-2); }
.step-1 { font-size: var(--step-1); }
.step-0 { font-size: var(--step-0); }
.specimen .step-0 { line-height: 1.5; }   /* el texto corrido, más aire */
.step--1 { font-size: var(--step--1); }
```
