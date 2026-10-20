---
example_description: "Dos niveles de tokens: los primitivos (la paleta, con nombre de color) y los semánticos (las decisiones: superficie, texto, acento), que eligen de la paleta. Los componentes solo leen semánticos, así que la tarjeta de temporada cambia de acento redefiniendo tres tokens, sin tocar ningún componente"
example_tags: "css|arquitectura|design-tokens|custom-properties|temas"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<div class="row">
  <article class="tour-card">
    <p class="tour-card__badge">Visita guiada</p>
    <h3 class="tour-card__title">Templo Mayor al atardecer</h3>
    <p class="tour-card__text">Sábados a las 17:00 · 90 minutos · $350</p>
    <a class="button" href="/visitas/templo-mayor">Reservar</a>
  </article>
  <!-- La misma tarjeta, en una zona de temporada: solo cambian tres tokens. -->
  <article class="tour-card is-seasonal">
    <p class="tour-card__badge">Día de Muertos</p>
    <h3 class="tour-card__title">Ofrendas del Centro Histórico</h3>
    <p class="tour-card__text">1 y 2 de noviembre · 2 horas · $420</p>
    <a class="button" href="/visitas/ofrendas">Reservar</a>
  </article>
</div>
```

# CSS

```css
:root {
  /* ── 1. Primitivos: la PALETA, lo que hay disponible ─────────────────
     Nombre de familia + tono (50 muy claro … 900 muy oscuro). Dicen qué
     color es, no para qué sirve. Ningún componente los lee. */
  --slate-50: #f8fafc;
  --slate-300: #cbd5e1;
  --slate-600: #475569;
  --slate-900: #0f172a;
  --teal-50: #f0fdfa;
  --teal-700: #0f766e;
  --teal-800: #115e59;
  --orange-50: #fff7ed;
  --orange-700: #c2410c;
  --orange-800: #9a3412;
  --radius-8: 8px;
  --radius-full: 999px;

  /* ── 2. Semánticos: las DECISIONES ───────────────────────────────────
     Dicen para qué sirven y eligen un primitivo. Si mañana el acento de
     la marca es otro, cambia una línea aquí y nada más. */
  --color-surface: #ffffff;
  --color-surface-muted: var(--slate-50);
  --color-text: var(--slate-900);
  --color-text-muted: var(--slate-600);
  --color-border: var(--slate-300);
  --color-accent: var(--teal-700);
  --color-accent-strong: var(--teal-800);
  --color-accent-soft: var(--teal-50);
  --color-on-accent: #ffffff;
  --radius-card: var(--radius-8);
  --radius-control: var(--radius-full);
}

/* Una zona de temporada: redefine tres tokens SEMÁNTICOS. Como son
   custom properties, se heredan: todo lo que hay dentro cambia. */
.is-seasonal {
  --color-accent: var(--orange-700);
  --color-accent-strong: var(--orange-800);
  --color-accent-soft: var(--orange-50);
}

body {
  font-family: system-ui, sans-serif;
  color: var(--color-text);
  background: var(--color-surface);
}

.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 12px;
}

/* ── Componentes: solo leen tokens semánticos ─────────────────────────── */
.tour-card {
  display: grid;
  gap: 6px;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-top: 4px solid var(--color-accent);
  border-radius: var(--radius-card);
  background: var(--color-surface-muted);
}

.tour-card__badge {
  justify-self: start;
  margin: 0;
  padding: 2px 10px;
  border-radius: var(--radius-control);
  background: var(--color-accent-soft);
  color: var(--color-accent-strong);
  font-size: 0.75rem;
  font-weight: 700;
}

.tour-card__title {
  margin: 0;
  font-size: 1rem;
}

.tour-card__text {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.button {
  justify-self: start;
  padding: 6px 16px;
  border-radius: var(--radius-control);
  background: var(--color-accent);
  color: var(--color-on-accent);
  font-weight: 700;
  text-decoration: none;
}

.button:hover {
  background: var(--color-accent-strong);
}

.button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}
```
