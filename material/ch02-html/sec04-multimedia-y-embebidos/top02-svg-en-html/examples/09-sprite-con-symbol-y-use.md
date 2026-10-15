---
example_description: "Un sprite de iconos: cada icono se define una vez como symbol (con su viewBox) y se reutiliza donde haga falta con use href=\"#id\""
example_tags: "html|svg|symbol|use|sprite|iconos"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<!-- 1. El sprite: un svg oculto (con CSS) con los iconos como symbol. Un symbol no se dibuja
     por sí mismo: es un molde. Cada uno lleva su propio viewBox. -->
<svg class="sprite">
  <symbol id="icon-drop" viewBox="0 0 24 24">
    <path d="M12 2 C12 2 5 10 5 15 A7 7 0 0 0 19 15 C19 10 12 2 12 2 Z" fill="currentColor"/>
  </symbol>
  <symbol id="icon-sun" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5" fill="currentColor"/>
    <path d="M12 1 V4 M12 20 V23 M1 12 H4 M20 12 H23 M4.2 4.2 L6.3 6.3 M17.7 17.7 L19.8 19.8 M19.8 4.2 L17.7 6.3 M6.3 17.7 L4.2 19.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </symbol>
  <symbol id="icon-leaf" viewBox="0 0 24 24">
    <path d="M4 20 C4 9 11 4 21 3 C20 13 15 20 4 20 Z M4 20 L13 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
  </symbol>
</svg>

<!-- 2. Cada uso: un svg pequeño con use href="#id". Se dibuja una copia del symbol, al tamaño
     de este svg y con su color (currentColor). Cambiar un symbol cambia todas sus copias. -->
<h2>Tareas del huerto</h2>
<ul class="tasks">
  <li class="water"><svg class="icon" aria-hidden="true"><use href="#icon-drop"/></svg> Regar los tomates</li>
  <li class="sun"><svg class="icon" aria-hidden="true"><use href="#icon-sun"/></svg> Destapar los semilleros</li>
  <li class="plant"><svg class="icon" aria-hidden="true"><use href="#icon-leaf"/></svg> Trasplantar las lechugas</li>
  <li class="water"><svg class="icon" aria-hidden="true"><use href="#icon-drop"/></svg> Llenar el depósito de lluvia</li>
</ul>

<!-- El mismo symbol, mucho más grande: ningún archivo nuevo -->
<p class="water"><svg class="big" role="img" aria-label="Gota de agua"><use href="#icon-drop"/></svg></p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* El sprite no ocupa sitio: sus symbol solo se ven a través de use (display: capítulo de CSS) */
.sprite {
  display: none;
}

/* Tamaño y color de cada copia (selectores de clase y unidades: capítulo de CSS) */
.icon {
  width: 1.25em;
  height: 1.25em;
  vertical-align: -0.25em;
}

.big {
  width: 96px;
  height: 96px;
}

.tasks {
  list-style: none;
  padding: 0;
  line-height: 2;
}

.water { color: #0369a1; }
.sun { color: #b45309; }
.plant { color: #15803d; }
```
