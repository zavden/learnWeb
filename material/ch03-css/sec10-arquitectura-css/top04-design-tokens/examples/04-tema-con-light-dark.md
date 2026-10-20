---
example_description: "El mismo sistema con light-dark(): cada token semántico guarda sus dos valores en una línea, y elegir tema es cambiar color-scheme en la raíz (Sistema, Claro u Oscuro, con :has()). Sigue al sistema sin duplicar nada; los primitivos no cambian nunca y la página dice qué tema está activo"
example_tags: "css|arquitectura|design-tokens|temas|light-dark|color-scheme|has|prefers-color-scheme"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<fieldset class="theme-picker">
  <legend>Tema</legend>
  <label><input type="radio" name="theme" value="system" checked> Sistema</label>
  <label><input type="radio" name="theme" value="light"> Claro</label>
  <label><input type="radio" name="theme" value="dark"> Oscuro</label>
</fieldset>
<p class="theme-status">Tema activo: <span class="is-light-label">claro</span><span class="is-dark-label">oscuro</span></p>

<article class="ticket">
  <p class="ticket__kicker">Tu visita</p>
  <h2 class="ticket__title">Museo Nacional de Antropología</h2>
  <p class="ticket__meta">Domingo 25 de octubre · 11:00 · 2 adultos</p>
  <p class="ticket__notice">Entrada libre para residentes los domingos.</p>
  <a class="ticket__action" href="/visita/cambiar-horario">Cambiar horario</a>
</article>
```

# CSS

```css
:root {
  /* ── Primitivos: no cambian con el tema ───────────────────────────── */
  --stone-50: #fafaf9;
  --stone-300: #d6d3d1;
  --stone-600: #57534e;
  --stone-700: #44403c;
  --stone-900: #1c1917;
  --stone-950: #0c0a09;
  --jade-300: #6ee7b7;
  --jade-800: #065f46;
  --amber-100: #fef3c7;
  --amber-200: #fde68a;
  --amber-800: #92400e;
  --amber-950: #451a03;

  /* ── Semánticos: cada uno con sus DOS valores, light-dark(claro, oscuro).
     light-dark() elige según el color-scheme del elemento, así que el
     tema entero depende de una sola propiedad. */
  color-scheme: light dark;            /* «Sistema»: el navegador elige */
  --color-page: light-dark(var(--stone-50), var(--stone-950));
  --color-surface: light-dark(#ffffff, var(--stone-900));
  --color-text: light-dark(var(--stone-900), var(--stone-50));
  --color-text-muted: light-dark(var(--stone-600), var(--stone-300));
  --color-border: light-dark(var(--stone-300), var(--stone-700));
  --color-accent: light-dark(var(--jade-800), var(--jade-300));
  --color-notice-bg: light-dark(var(--amber-100), var(--amber-950));
  --color-notice-text: light-dark(var(--amber-800), var(--amber-200));
}

/* Elegir tema = cambiar color-scheme. Ni un solo color repetido. */
:root:has(input[name="theme"][value="light"]:checked) { color-scheme: light; }
:root:has(input[name="theme"][value="dark"]:checked) { color-scheme: dark; }

/* La etiqueta del tema activo. CSS no puede preguntar «¿qué esquema usa
   este elemento?», así que repite la lógica: oscuro si se eligió
   «Oscuro», o si se eligió «Sistema» y el sistema está en oscuro. */
.is-dark-label { display: none; }

:root:has(input[name="theme"][value="dark"]:checked) .is-light-label { display: none; }
:root:has(input[name="theme"][value="dark"]:checked) .is-dark-label { display: inline; }

@media (prefers-color-scheme: dark) {
  :root:has(input[name="theme"][value="system"]:checked) .is-light-label { display: none; }
  :root:has(input[name="theme"][value="system"]:checked) .is-dark-label { display: inline; }
}

/* ── Componentes: solo tokens semánticos ─────────────────────────────── */
body {
  font-family: system-ui, sans-serif;
  color: var(--color-text);
  background: var(--color-page);
}

.theme-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.85rem;
}

.theme-picker input {
  accent-color: var(--color-accent);
}

.theme-status {
  font-size: 0.85rem;
  font-weight: 700;
}

.ticket {
  display: grid;
  gap: 6px;
  max-width: 26rem;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
}

.ticket p,
.ticket h2 {
  margin: 0;
}

.ticket__kicker {
  color: var(--color-accent);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.ticket__title {
  font-size: 1.1rem;
}

.ticket__meta {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.ticket__notice {
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--color-notice-bg);
  color: var(--color-notice-text);
  font-size: 0.85rem;
}

.ticket__action {
  color: var(--color-accent);
  font-weight: 700;
}

:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}
```
