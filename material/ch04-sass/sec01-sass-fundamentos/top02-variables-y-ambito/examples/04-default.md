---
example_description: "!default asigna un valor solo si la variable no existe (o es null): así una librería ofrece valores por defecto que tú puedes cambiar antes"
example_tags: "sass|variables|default|configuracion"
example_stage: minimal
example_importance: important
---

# HTML

```html
<button type="button" class="btn">Reservar visita</button>
<p class="note">Color: el tuyo (violeta). Radio y padding: los de la «librería».</p>
```

# SCSS

```scss
// ── TU CONFIGURACIÓN (antes de la librería) ──────────────────────
$btn-bg: #7c3aed;

// ── «LIBRERÍA» DE BOTONES ────────────────────────────────────────
// !default significa: «usa este valor SOLO si la variable aún no existe
// o vale null». Es como dict.setdefault() de Python.
$btn-bg: #2563eb !default;       // ya existe (#7c3aed) → se ignora
$btn-radius: 999px !default;     // no existe → se asigna
$btn-padding: 10px 20px !default;

.btn {
  padding: $btn-padding;
  border: 0;
  border-radius: $btn-radius;
  background: $btn-bg;           // → #7c3aed, el tuyo
  color: #ffffff;
  font: inherit;
  font-weight: bold;
}

// ── RESTO DE LA PÁGINA ───────────────────────────────────────────
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.note {
  font-size: 0.875rem;
}

// En un proyecto real, la librería está en otro archivo y la configuras
// al cargarla: @use "buttons" with ($btn-bg: #7c3aed);
// Lo verás en la lección de módulos.
```
