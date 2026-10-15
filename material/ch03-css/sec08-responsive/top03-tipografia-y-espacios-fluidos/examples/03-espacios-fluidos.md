---
example_description: "Los espacios también pueden ser fluidos con la misma recta: tokens de espacio con clamp(), y «pares» que crecen más (de s a l) para el relleno de las secciones. En el móvil la sección respira poco; en un escritorio, mucho"
example_tags: "css|responsive|espaciado-fluido|clamp|custom-properties|tokens"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">Relleno de la sección (rayado): par <code>s-l</code>, de 16px (ventana de 320px) a 40px (1200px); a 480px, unos 20px. Hueco entre noticias: <code>m</code>, de 24 a 30px. Ensancha la vista previa o usa ↗.</p>
<section class="news">
  <h2>Últimas noticias</h2>
  <div class="teasers">
    <article><h3>Llega la temporada de lluvias al Valle de México</h3><p>El Servicio Meteorológico prevé tormentas por la tarde hasta septiembre.</p></article>
    <article><h3>Reabre el Mercado de Coyoacán tras su remodelación</h3><p>Los 400 puestos estrenan techumbre y drenaje.</p></article>
    <article><h3>La línea 1 del Metro, completa de nuevo</h3><p>Las estaciones de Pantitlán a Observatorio ya funcionan.</p></article>
  </div>
</section>
```

# CSS

```css
/* Tokens de espacio: cada uno, la recta entre su valor a 320px y a 1200px
   (la misma cuenta que la tipografía; el valor grande es 1,25 veces el pequeño). */
:root {
  --space-xs: clamp(0.75rem, 0.6818rem + 0.3409vw, 0.9375rem);   /* 12 → 15px */
  --space-s: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);         /* 16 → 20px */
  --space-m: clamp(1.5rem, 1.3636rem + 0.6818vw, 1.875rem);      /* 24 → 30px */
  /* Un PAR va del mínimo de un paso al máximo de otro: crece mucho más.
     Para el relleno de las secciones: apretado en el móvil, amplio en grande. */
  --space-s-l: clamp(1rem, 0.4545rem + 2.7273vw, 2.5rem);        /* 16 → 40px */
}

body {
  margin: 8px;
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption { margin: 0 0 8px; font-size: 0.72rem; }

/* Para ver el relleno: dos capas de fondo. Abajo, rayas en toda la caja;
   encima, blanco recortado a la caja de contenido (content-box, del módulo
   del modelo de cajas). Lo rayado es el relleno. */
.news {
  padding: var(--space-s-l);
  background:
    linear-gradient(#ffffff, #ffffff) content-box,
    repeating-linear-gradient(45deg, #cffafe 0 6px, #a5f3fc 6px 12px);
  border: 1px solid #0e7490;
}

.news h2 { margin: 0 0 var(--space-s); font-size: 1.1rem; }

.teasers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr));
  gap: var(--space-m);
}

.teasers article { padding: var(--space-xs); border-left: 3px solid #0e7490; background: #f8fafc; }
.teasers h3 { margin: 0 0 4px; font-size: 0.85rem; }
.teasers p { margin: 0; font-size: 0.75rem; }
```
