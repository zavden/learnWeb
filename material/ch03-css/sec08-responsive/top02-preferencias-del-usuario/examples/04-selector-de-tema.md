---
example_description: "Un selector de tema Sistema / Claro / Oscuro sin JavaScript: todos los colores con light-dark() y :root:has() cambiando color-scheme según el radio marcado. Cambiar de tema es cambiar color-scheme"
example_tags: "css|responsive|preferencias|light-dark|color-scheme|has|tema-oscuro"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<fieldset class="theme-picker">
  <legend>Tema</legend>
  <label><input type="radio" name="theme" value="system" checked> Sistema</label>
  <label><input type="radio" name="theme" value="light"> Claro</label>
  <label><input type="radio" name="theme" value="dark"> Oscuro</label>
</fieldset>

<article class="dashboard">
  <h2>Ventas de la semana</h2>
  <dl class="stats">
    <div><dt>Pedidos</dt><dd>128</dd></div>
    <div><dt>Ingresos</dt><dd>46&nbsp;300 MXN</dd></div>
    <div><dt>Devoluciones</dt><dd class="is-alert">3</dd></div>
  </dl>
  <label class="field">Nota para el equipo <input type="text" value="Reponer macetas de barro"></label>
</article>
<p class="note">«Sistema» sigue a tu sistema; «Claro» y «Oscuro» lo fuerzan. La elección no se guarda al recargar: guardarla (en localStorage) es trabajo de JavaScript, capítulo 6.</p>
```

# CSS

```css
/* Todos los colores se escriben UNA vez, con sus dos versiones. */
:root {
  color-scheme: light dark;                 /* «Sistema»: el navegador elige */
  --surface: light-dark(#ffffff, #0f172a);
  --surface-alt: light-dark(#f1f5f9, #1e293b);
  --text: light-dark(#1e293b, #e2e8f0);
  --muted: light-dark(#475569, #94a3b8);
  --alert: light-dark(#b91c1c, #fca5a5);
  --accent: light-dark(#1d4ed8, #93c5fd);
}

/* Cambiar de tema es cambiar color-scheme. :has() (módulo de fundamentos)
   pregunta por el radio marcado desde la raíz. Sin duplicar ni un color en
   una @media para el oscuro y en otra regla para el botón «Oscuro». */
:root:has(input[name="theme"][value="light"]:checked) { color-scheme: light; }
:root:has(input[name="theme"][value="dark"]:checked)  { color-scheme: dark; }

body {
  background: var(--surface);
  color: var(--text);
  font-family: system-ui, sans-serif;
  font-size: 0.85rem;
}

.theme-picker { display: flex; gap: 12px; margin: 0 0 10px; border-color: var(--muted); }
.theme-picker input { accent-color: var(--accent); }

.dashboard { padding: 12px; border-radius: 10px; background: var(--surface-alt); }
.dashboard h2 { margin: 0 0 8px; font-size: 1rem; }

.stats { display: flex; flex-wrap: wrap; gap: 8px 24px; margin: 0 0 10px; }
.stats dt { color: var(--muted); font-size: 0.75rem; }
.stats dd { margin: 0; font-size: 1.2rem; font-weight: 700; }
.stats .is-alert { color: var(--alert); }

.field { display: grid; gap: 4px; color: var(--muted); font-size: 0.75rem; }
.field input { font: inherit; font-size: 0.85rem; }

.note { color: var(--muted); font-size: 0.72rem; }
```
