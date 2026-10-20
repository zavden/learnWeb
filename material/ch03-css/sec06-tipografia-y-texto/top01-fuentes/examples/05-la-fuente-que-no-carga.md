---
example_description: "Un @font-face con la ruta mal escrita o un nombre que no coincide falla en silencio: el texto sale con la fuente de reserva; DevTools (Network y Rendered Fonts) dice por qué"
example_tags: "css|tipografia|font-face|devtools|rendered-fonts|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">Los tres logotipos piden la fuente Pacifico. En pantalla no hay ningún aviso: solo una fuente distinta. Ábrelo con ↗ y busca la causa en DevTools.</p>

<p class="caption">❌ La ruta del archivo está mal: <code>fonts/pacifico.woff2</code> no existe</p>
<p class="logo is-bad-path">Café La Esquina</p>

<p class="caption">❌ La fuente se declara como <code>"Pacifico"</code> y se pide como <code>"Pacífico"</code>, con tilde</p>
<p class="logo is-bad-name">Café La Esquina</p>

<p class="caption">✅ Ruta y nombre correctos</p>
<p class="logo is-right">Café La Esquina</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label,
.caption {
  margin: 8px 0 2px;
  font-size: 0.75rem;
}

.logo {
  margin: 0;
  padding: 4px 12px;
  background: #e0e7ff;
  color: #3730a3;
  font-size: 2rem;
}

/* ❌ 1. El archivo se llama pacifico-normal.woff2. El servidor responde 404, el
   navegador descarta esta fuente y sigue con la pila: system-ui. En Network
   (filtro Font) verás la petición en rojo; en Console, «Failed to load resource». */
@font-face {
  font-family: "Pacifico Broken";
  src: url("fonts/pacifico.woff2") format("woff2");
  font-display: swap;
}

.is-bad-path {
  font-family: "Pacifico Broken", system-ui, sans-serif;
}

/* La declaración buena. */
@font-face {
  font-family: "Pacifico";
  src: url("fonts/pacifico-normal.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

/* ❌ 2. Los nombres deben coincidir letra a letra (las mayúsculas dan igual; la
   tilde, no). "Pacífico" no está declarada ni instalada, así que el navegador ni
   siquiera intenta descargar nada: Network no muestra ningún error. Solo
   Computed → Rendered Fonts revela que dibuja otra fuente. */
.is-bad-name {
  font-family: "Pacífico", system-ui, sans-serif;
}

/* ✅ Rendered Fonts dice «Pacifico — Network resource»: viene del archivo. */
.is-right {
  font-family: Pacifico, system-ui, sans-serif;
}
```
