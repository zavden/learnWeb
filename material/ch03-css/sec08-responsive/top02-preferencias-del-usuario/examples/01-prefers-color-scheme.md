---
example_description: "prefers-color-scheme: dark se cumple cuando el sistema está en modo oscuro; los colores de la página son custom properties y la media query les da otros valores. Los controles nativos (el buscador) siguen claros: falta color-scheme"
example_tags: "css|responsive|preferencias|prefers-color-scheme|tema-oscuro|custom-properties"
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
</form>
<p class="note">Lo que ves depende de tu sistema. Para cambiarlo sin tocarlo: abre DevTools (en una pestaña con ↗), menú ⋮ → More tools → Rendering → «Emulate CSS media feature prefers-color-scheme».</p>
```

# CSS

```css
/* Los colores, en custom properties: el tema claro es el de partida… */
:root {
  --surface: #ffffff;
  --surface-alt: #f1f5f9;
  --text: #1e293b;
  --muted: #475569;
  --accent: #1d4ed8;
  --scheme-name: "claro ☀️";
}

/* …y si el sistema está en modo oscuro, la media query cambia los VALORES.
   Ninguna regla de los componentes se repite: todos leen las variables. */
@media (prefers-color-scheme: dark) {
  :root {
    --surface: #0f172a;
    --surface-alt: #1e293b;
    --text: #e2e8f0;
    --muted: #94a3b8;
    --accent: #93c5fd;
    --scheme-name: "oscuro 🌙";
  }
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

.scheme-badge::after { content: var(--scheme-name); font-weight: 700; }

.story { padding: 12px; border-radius: 10px; background: var(--surface-alt); }
.story h2 { margin: 0 0 6px; font-size: 1.1rem; }
.story p { margin: 0 0 8px; font-size: 0.85rem; }
.story .kicker { color: var(--muted); font-size: 0.75rem; text-transform: uppercase; }
.story a { color: var(--accent); }

.search { display: flex; gap: 8px; align-items: center; margin-top: 12px; font-size: 0.85rem; }

/* 👀 El buscador lo dibuja el navegador, y tus variables no llegan a él: en el
   tema oscuro se queda blanco, como una mancha. Falta decirle al navegador que
   la página admite los dos esquemas: color-scheme (ejemplo siguiente). */

.note { color: var(--muted); font-size: 0.72rem; }
```
