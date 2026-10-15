---
example_description: "La portada de la escuela de panadería del módulo de tipografía, ahora fluida: escala modular con clamp(), espacios fluidos y ni una media query. Se adapta a cualquier ancho y respeta el zoom y la letra del usuario"
example_tags: "css|responsive|tipografia-fluida|escala-modular|espaciado-fluido|clamp|text-wrap"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<header class="hero">
  <p class="eyebrow">Escuela de Panadería del Barrio · Otoño 2026</p>
  <h1>Del horno de leña a tu cocina: pan de masa madre en seis sábados</h1>
  <p class="lead">Aprende a alimentar tu masa madre, a formar hogazas y conchas y a hornear sin un horno profesional.</p>
  <a class="cta" href="/cursos/masa-madre">Ver fechas y precios</a>
</header>
<p class="caption">Ni una media query: cambia el ancho de la vista previa (o ↗) y todo escala a la vez. El título, de 33 a 49px; los rellenos, de 16 a 40px.</p>
```

# CSS

```css
/* Los tokens de la lección: escala de 1,2 (320px) a 1,25 (1200px) y espacios. */
:root {
  --step--1: clamp(0.8333rem, 0.7727rem + 0.303vw, 1rem);
  --step-0: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
  --step-1: clamp(1.2rem, 1.0682rem + 0.6591vw, 1.5625rem);
  --step-4: clamp(2.0736rem, 1.7179rem + 1.7785vw, 3.0518rem);
  --space-xs: clamp(0.75rem, 0.6818rem + 0.3409vw, 0.9375rem);
  --space-s: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
  --space-s-l: clamp(1rem, 0.4545rem + 2.7273vw, 2.5rem);
}

body {
  margin: 0;
  font-family: Georgia, serif;
  font-size: var(--step-0);
  color: #1c1917;
  background: #ffffff;
}

.hero {
  padding: var(--space-s-l);
  background: #fef3c7;
}

.eyebrow {
  margin: 0 0 var(--space-xs);
  font-family: system-ui, sans-serif;
  font-size: var(--step--1);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #92400e;
}

/* text-wrap: balance (módulo de tipografía) reparte el título en líneas
   parecidas; max-inline-size en ch lo mantiene en una medida legible. */
h1 {
  max-inline-size: 22ch;
  margin: 0 0 var(--space-s);
  font-size: var(--step-4);
  line-height: 1.1;
  text-wrap: balance;
}

.lead {
  max-inline-size: 45ch;
  margin: 0 0 var(--space-s);
  font-size: var(--step-1);
  line-height: 1.4;
}

.cta {
  display: inline-block;
  padding: var(--space-xs) var(--space-s);
  border-radius: 999px;
  background: #7c2d12;
  color: #ffffff;
  font-family: system-ui, sans-serif;
  font-weight: 700;
  text-decoration: none;
}

.cta:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 3px; }

.caption { margin: 8px; font-family: system-ui, sans-serif; font-size: 0.72rem; }
```
