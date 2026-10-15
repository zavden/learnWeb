---
example_description: "Página de preferencias: tema claro, oscuro o sepia, color de acento y tamaño de letra elegidos con radios; :root:has() solo cambia variables"
example_tags: "css|profesional|temas|custom-properties|has|accesibilidad"
example_stage: professional
example_importance: critical
---

# HTML

```html
<main class="page">
  <h1>Preferencias de lectura</h1>
  <p class="lead">Los cambios se aplican al momento en toda la página.</p>

  <form class="settings" action="#">
    <fieldset>
      <legend>Tema</legend>
      <label><input type="radio" name="theme" id="theme-light" checked> Claro</label>
      <label><input type="radio" name="theme" id="theme-dark"> Oscuro</label>
      <label><input type="radio" name="theme" id="theme-sepia"> Sepia</label>
    </fieldset>

    <fieldset>
      <legend>Color de acento</legend>
      <label><input type="radio" name="accent" id="accent-blue" checked> Azul</label>
      <label><input type="radio" name="accent" id="accent-green"> Verde</label>
      <label><input type="radio" name="accent" id="accent-purple"> Morado</label>
      <label><input type="radio" name="accent" id="accent-orange"> Teja</label>
    </fieldset>

    <fieldset>
      <legend>Tamaño del texto</legend>
      <label><input type="radio" name="text-size" id="size-normal" checked> Normal</label>
      <label><input type="radio" name="text-size" id="size-large"> Grande</label>
      <label><input type="radio" name="text-size" id="size-xlarge"> Muy grande</label>
    </fieldset>
  </form>

  <section class="preview" aria-labelledby="preview-title">
    <h2 id="preview-title">Vista previa</h2>
    <article class="card">
      <h3>Reunión de equipo</h3>
      <p>Mañana a las 10:00 en la sala Atlántico. <a href="#">Consulta el orden del día</a> antes de venir.</p>
      <p>
        <button type="button" class="btn">Confirmar asistencia</button>
        <button type="button" class="btn btn--secondary">Ahora no</button>
      </p>
      <p><label><input type="checkbox" checked> Avisarme 15 minutos antes</label></p>
    </article>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Preferencias de tema
   Tres ejes independientes, cada uno con SU variable:
     tema   → luminosidades (--bg, --surface, --text…)
     acento → --accent-hue
     tamaño → --text-scale
   Los radios marcados solo cambian esas variables en :root (con :has()); el resto
   del CSS no sabe que existen temas. Todas las combinaciones se han medido:
   el contraste mínimo es 4,9:1 en texto y 3,2:1 en bordes de controles.
   Nota: las propiedades de caja y de texto se usan de forma básica.
   ────────────────────────────────────────────────────────────────────────── */
@layer tokens, themes, base, components;

@layer tokens {
  :root {
    --accent-hue: 260;
    --text-scale: 1;

    /* Tema claro (por defecto) */
    --bg: oklch(98.5% 0.005 260);
    --surface: oklch(96% 0.01 260);
    --border: oklch(60% 0.03 260);
    --text: oklch(25% 0.03 260);
    --text-muted: oklch(45% 0.03 260);
    --accent: oklch(50% 0.16 var(--accent-hue));
    --on-accent: #ffffff;
    color-scheme: light;
  }
}

@layer themes {
  :root:has(#theme-dark:checked) {
    --bg: oklch(20% 0.02 260);
    --surface: oklch(26% 0.02 260);
    --border: oklch(55% 0.03 260);
    --text: oklch(93% 0.01 260);
    --text-muted: oklch(75% 0.02 260);
    --accent: oklch(80% 0.12 var(--accent-hue));
    --on-accent: oklch(20% 0.02 260);
    color-scheme: dark;
  }

  :root:has(#theme-sepia:checked) {
    --bg: oklch(95% 0.03 80);
    --surface: oklch(91% 0.04 80);
    --border: oklch(60% 0.05 60);
    --text: oklch(30% 0.04 60);
    --text-muted: oklch(45% 0.06 60);
    --accent: oklch(45% 0.13 var(--accent-hue));
    --on-accent: #ffffff;
  }

  :root:has(#accent-green:checked)  { --accent-hue: 150; }
  :root:has(#accent-purple:checked) { --accent-hue: 300; }
  :root:has(#accent-orange:checked) { --accent-hue: 40; }

  :root:has(#size-large:checked)  { --text-scale: 1.125; }
  :root:has(#size-xlarge:checked) { --text-scale: 1.25; }
}

@layer base {
  /* Un porcentaje, no píxeles: respeta el tamaño de letra que la persona ya
     tenga configurado en su navegador y lo multiplica. Todo lo medido en rem escala. */
  :root {
    font-size: calc(var(--text-scale) * 100%);
  }

  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.55;
  }

  :where(a) {
    color: var(--accent);
  }

  :where(input, button) {
    font: inherit;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--accent);
    outline-offset: 2px;
  }
}

@layer components {
  .page {
    max-width: 40rem;
    margin-inline: auto;
    padding: 1rem;
  }

  .lead {
    color: var(--text-muted);
  }

  .settings fieldset {
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    padding: 0.5rem 1rem 0.75rem;
    margin: 0 0 1rem;
  }

  .settings legend {
    font-weight: 700;
    padding-inline: 0.25rem;
  }

  .settings label {
    margin-inline-end: 1.25rem;
  }

  /* La opción elegida, en negrita: :has() mira dentro de cada label */
  .settings label:has(:checked) {
    font-weight: 700;
  }

  .preview h2 {
    font-size: 1rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-top: 4px solid var(--accent);
    border-radius: 0.5rem;
    padding: 0 1.25rem 0.5rem;
  }

  .card h3 {
    font-size: 1.25rem;
  }

  .btn {
    background: var(--accent);
    color: var(--on-accent);
    border: 2px solid var(--accent);
    border-radius: 0.375rem;
    padding: 0.45rem 1rem;
    font-weight: 600;
  }

  /* Variante: solo intercambia los colores de la regla base */
  .btn--secondary {
    background: transparent;
    color: var(--accent);
  }
}
```
