---
example_description: "La escala completa de tokens fluidos: --step--2 … --step-5 para la letra y --space-3xs … --space-3xl (más los pares s-l y m-xl) para los espacios, con la recta del clamp() del módulo responsive. Una muestra de cada paso con su rango en píxeles; ensancha la ventana para verlos crecer"
example_tags: "css|arquitectura|design-tokens|clamp|tipografia-fluida|espacios|escala-modular"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">Cada paso es una recta entre 320 y 1200px de ventana (base 16 → 20px, razón 1,2 → 1,25). En una tarjeta de 480px, todos están cerca de su mínimo; ábrelo con ↗ y ensancha la ventana.</p>
<section class="specimen" aria-labelledby="type-title">
  <h2 id="type-title" class="specimen__title">Letra</h2>
  <p style="font-size: var(--step-5)">Paso 5 <span>40 → 61px</span></p>
  <p style="font-size: var(--step-4)">Paso 4 <span>33 → 49px</span></p>
  <p style="font-size: var(--step-3)">Paso 3 <span>28 → 39px</span></p>
  <p style="font-size: var(--step-2)">Paso 2 <span>23 → 31px</span></p>
  <p style="font-size: var(--step-1)">Paso 1 <span>19 → 25px</span></p>
  <p style="font-size: var(--step-0)">Paso 0, el texto <span>16 → 20px</span></p>
  <p style="font-size: var(--step--1)">Paso −1 <span>13 → 16px</span></p>
  <p style="font-size: var(--step--2)">Paso −2 <span>11 → 13px</span></p>
</section>
<section class="specimen" aria-labelledby="space-title">
  <h2 id="space-title" class="specimen__title">Espacio</h2>
  <p class="bar" style="--size: var(--space-3xs)">3xs <span>4 → 5px</span></p>
  <p class="bar" style="--size: var(--space-2xs)">2xs <span>8 → 10px</span></p>
  <p class="bar" style="--size: var(--space-xs)">xs <span>12 → 15px</span></p>
  <p class="bar" style="--size: var(--space-s)">s <span>16 → 20px</span></p>
  <p class="bar" style="--size: var(--space-m)">m <span>24 → 30px</span></p>
  <p class="bar" style="--size: var(--space-l)">l <span>32 → 40px</span></p>
  <p class="bar" style="--size: var(--space-xl)">xl <span>48 → 60px</span></p>
  <p class="bar" style="--size: var(--space-2xl)">2xl <span>64 → 80px</span></p>
  <p class="bar" style="--size: var(--space-3xl)">3xl <span>96 → 120px</span></p>
  <p class="bar is-pair" style="--size: var(--space-s-l)">s-l <span>16 → 40px</span></p>
  <p class="bar is-pair" style="--size: var(--space-m-xl)">m-xl <span>24 → 60px</span></p>
</section>
```

# CSS

```css
/* ── Los tokens de tamaño (calculados con el script de Python del módulo
   responsive, lección de tipografía fluida) ────────────────────────────
   Mínimo, corte y máximo en rem (siguen al zoom y a la letra del
   usuario); solo la pendiente en vw. */
:root {
  --step--2: clamp(0.6944rem, 0.6561rem + 0.1919vw, 0.8rem);
  --step--1: clamp(0.8333rem, 0.7727rem + 0.303vw, 1rem);
  --step-0: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
  --step-1: clamp(1.2rem, 1.0682rem + 0.6591vw, 1.5625rem);
  --step-2: clamp(1.44rem, 1.2534rem + 0.933vw, 1.9531rem);
  --step-3: clamp(1.728rem, 1.4686rem + 1.2971vw, 2.4414rem);
  --step-4: clamp(2.0736rem, 1.7179rem + 1.7785vw, 3.0518rem);
  --step-5: clamp(2.4883rem, 2.006rem + 2.4116vw, 3.8147rem);

  /* Espacios: múltiplos del paso 0 (×0,25 … ×6). */
  --space-3xs: clamp(0.25rem, 0.2273rem + 0.1136vw, 0.3125rem);
  --space-2xs: clamp(0.5rem, 0.4545rem + 0.2273vw, 0.625rem);
  --space-xs: clamp(0.75rem, 0.6818rem + 0.3409vw, 0.9375rem);
  --space-s: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
  --space-m: clamp(1.5rem, 1.3636rem + 0.6818vw, 1.875rem);
  --space-l: clamp(2rem, 1.8182rem + 0.9091vw, 2.5rem);
  --space-xl: clamp(3rem, 2.7273rem + 1.3636vw, 3.75rem);
  --space-2xl: clamp(4rem, 3.6364rem + 1.8182vw, 5rem);
  --space-3xl: clamp(6rem, 5.4545rem + 2.7273vw, 7.5rem);

  /* Pares: del mínimo de un paso al máximo de otro. Crecen mucho más:
     para separar bloques grandes (secciones, el relleno de la página). */
  --space-s-l: clamp(1rem, 0.4545rem + 2.7273vw, 2.5rem);
  --space-m-xl: clamp(1.5rem, 0.6818rem + 4.0909vw, 3.75rem);
}

body {
  font-family: system-ui, sans-serif;
  font-size: var(--step-0);
  color: #1e293b;
  background: #ffffff;
}

.caption {
  font-size: var(--step--1);
}

.specimen {
  margin-block: var(--space-s);
}

.specimen__title {
  margin: 0 0 var(--space-2xs);
  font-size: var(--step--1);
  text-transform: uppercase;
  color: #475569;
}

.specimen p {
  margin: 0 0 var(--space-3xs);
  line-height: 1.2;
}

.specimen span {
  color: #475569;
  font-size: var(--step--2);
  font-variant-numeric: tabular-nums;
}

/* Cada barra mide su token de ancho. */
.bar {
  display: flex;
  gap: var(--space-2xs);
  align-items: center;
  font-size: var(--step--1);
}

.bar::before {
  content: "";
  flex: none;
  width: var(--size);
  height: 0.75em;
  background: #0f766e;
}

.bar.is-pair::before {
  background: #9a3412;
}
```
