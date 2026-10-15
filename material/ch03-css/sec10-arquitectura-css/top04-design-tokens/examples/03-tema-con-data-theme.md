---
example_description: "Un tema con [data-theme]: el bloque [data-theme=\"dark\"] redefine los tokens semánticos y color-scheme; un adelanto de JavaScript cambia el atributo de <html> con un botón y la página dice qué tema está activo. Empieza en claro aunque el sistema esté en oscuro: el atributo no sabe nada del sistema"
example_tags: "css|arquitectura|design-tokens|temas|data-theme|color-scheme|javascript"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<header class="topbar">
  <p class="topbar__brand">Cafetería La Molienda</p>
  <button class="theme-toggle" type="button" aria-pressed="false">Tema oscuro</button>
</header>
<main class="menu">
  <h2>Para hoy</h2>
  <ul class="menu__list" role="list">
    <li><span>Café de olla</span> <span class="menu__price">$45</span></li>
    <li><span>Chocolate de metate</span> <span class="menu__price">$55</span></li>
    <li><span>Concha de vainilla</span> <span class="menu__price">$28</span></li>
  </ul>
  <label class="menu__field">Nota para la barra <input type="text" value="Sin azúcar, por favor"></label>
  <output id="theme-status" class="menu__status" aria-live="polite"></output>
</main>
```

# CSS

```css
/* El tema claro: los valores por defecto, en :root (es decir, <html>). */
:root {
  color-scheme: light;
  --color-page: #fafaf9;
  --color-surface: #ffffff;
  --color-text: #1c1917;
  --color-text-muted: #57534e;
  --color-border: #d6d3d1;
  --color-accent: #9a3412;
  --color-on-accent: #ffffff;
}

/* El tema oscuro: el MISMO conjunto de tokens semánticos, con otros
   valores. Ningún componente cambia. color-scheme: dark oscurece también
   lo que dibuja el navegador (el campo de texto, la barra de scroll). */
:root[data-theme="dark"] {
  color-scheme: dark;
  --color-page: #0c0a09;
  --color-surface: #1c1917;
  --color-text: #f5f5f4;
  --color-text-muted: #d6d3d1;
  --color-border: #44403c;
  --color-accent: #fdba74;
  --color-on-accent: #1c1917;
}

/* El inconveniente: para seguir también al sistema habría que copiar el
   bloque oscuro entero dentro de
   @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }.
   El ejemplo siguiente lo evita con light-dark(). */

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: var(--color-text);
  background: var(--color-page);
}

.topbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.topbar__brand {
  margin: 0;
  font-weight: 700;
}

.theme-toggle {
  padding: 6px 14px;
  border: 0;
  border-radius: 999px;
  background: var(--color-accent);
  color: var(--color-on-accent);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.menu {
  display: grid;
  gap: 10px;
  max-width: 26rem;
  padding: 12px 16px;
}

.menu h2 {
  margin: 0;
  font-size: 1.1rem;
}

.menu__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.menu__list li {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px dashed var(--color-border);
}

.menu__price {
  color: var(--color-accent);
  font-weight: 700;
}

.menu__field {
  display: grid;
  gap: 4px;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.menu__field input {
  font: inherit;
}

.menu__status {
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript del navegador (capítulo 6). El script solo cambia UN
// atributo de <html>; todo lo demás lo hace el CSS. (Guardar la elección para
// la próxima visita también es cosa de JavaScript: capítulo 6.)
const root = document.documentElement;
const toggle = document.querySelector('.theme-toggle');
const themeStatus = document.querySelector('#theme-status');

function showTheme() {
  const theme = root.dataset.theme;          // undefined si <html> no tiene el atributo
  const label = theme === 'dark' ? 'oscuro' : 'claro';
  const source = theme ? `data-theme="${theme}"` : 'sin data-theme: los valores de :root';
  themeStatus.textContent = `Tema activo: ${label} (${source})`;
  console.log(themeStatus.textContent);
}

toggle.addEventListener('click', () => {
  const goDark = root.dataset.theme !== 'dark';
  root.dataset.theme = goDark ? 'dark' : 'light';
  toggle.setAttribute('aria-pressed', String(goDark));
  showTheme();
});

console.log('Listo: pulsa «Tema oscuro» para cambiar data-theme en <html>.');
showTheme();
```
