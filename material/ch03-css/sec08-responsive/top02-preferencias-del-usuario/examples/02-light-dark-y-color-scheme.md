---
example_description: "color-scheme: light dark en la raíz hace que el navegador siga el tema del sistema también en sus piezas (fondo, buscador, casillas), y light-dark(claro, oscuro) escribe cada color de los dos temas en una sola línea, sin media query"
example_tags: "css|responsive|preferencias|light-dark|color-scheme|tema-oscuro|formularios"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="scheme-badge">Tu sistema prefiere el tema: </p>

<article class="story">
  <p class="kicker">Cultura · Oaxaca</p>
  <h2>La Guelaguetza vuelve al cerro del Fortín</h2>
  <p>Las delegaciones de las ocho regiones del estado bailarán los dos últimos lunes de julio. Los boletos para el auditorio salen a la venta el 1 de junio.</p>
  <a href="/cultura/guelaguetza-2026">Leer la nota completa</a>
</article>

<form class="search" role="search" action="/buscar">
  <label for="q">Buscar noticias</label>
  <input id="q" name="q" type="search" placeholder="mezcal, lluvias…">
  <label><input type="checkbox" checked> Solo de hoy</label>
</form>
<p class="note">Ahora el buscador y la casilla también cambian de tema. Para probar el otro tema: DevTools → Rendering → «Emulate CSS media feature prefers-color-scheme».</p>
```

# CSS

```css
/* 1. color-scheme: la página admite los dos esquemas. El navegador elige el
      del sistema y lo usa para SUS piezas: el fondo del lienzo, el color del
      texto por defecto, los controles de formulario y las barras de scroll.
   2. light-dark(claro, oscuro): un color que elige su valor según el esquema
      que usa el elemento. Los dos temas, juntos en cada línea. */
:root {
  color-scheme: light dark;
  --surface: light-dark(#ffffff, #0f172a);
  --surface-alt: light-dark(#f1f5f9, #1e293b);
  --text: light-dark(#1e293b, #e2e8f0);
  --muted: light-dark(#475569, #94a3b8);
  --accent: light-dark(#1d4ed8, #93c5fd);
}

body {
  background: var(--surface);
  color: var(--text);
  font-family: system-ui, sans-serif;
}

.scheme-badge {
  display: inline-block;
  margin: 0 0 10px;
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--surface-alt);
  font-size: 0.8rem;
}

/* light-dark() solo acepta colores, así que el NOMBRE del tema sale de la
   media query de siempre. */
.scheme-badge::after { content: "claro ☀️"; font-weight: 700; }

@media (prefers-color-scheme: dark) {
  .scheme-badge::after { content: "oscuro 🌙"; }
}

.story { padding: 12px; border-radius: 10px; background: var(--surface-alt); }
.story h2 { margin: 0 0 6px; font-size: 1.1rem; }
.story p { margin: 0 0 8px; font-size: 0.85rem; }
.story .kicker { color: var(--muted); font-size: 0.75rem; text-transform: uppercase; }
.story a { color: var(--accent); }

.search { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 12px; font-size: 0.85rem; }

/* accent-color tiñe la casilla marcada, también con light-dark(). */
.search input { accent-color: var(--accent); }

.note { color: var(--muted); font-size: 0.72rem; }
```
