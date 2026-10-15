---
example_description: "Una prueba visual de qué crea un contexto de apilamiento: si el hijo con z-index: 2 queda debajo de la caja naranja con z-index: 1, su padre ha creado un contexto"
example_tags: "css|z-index|stacking-context|opacity|transform|isolation"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="legend">En cada prueba, el hijo azul tiene <code>z-index: 2</code> y la caja naranja, de fuera, <code>z-index: 1</code>.
  <strong>Azul debajo del naranja</strong>: el padre gris ha creado un contexto de apilamiento y el 2 solo vale dentro de él.</p>

<div class="test"><p class="rule">sin nada · no crea</p>
  <div class="scene"><div class="parent"><span class="child">hijo · z-index: 2</span></div><span class="cover">z-index: 1</span></div></div>

<div class="test"><p class="rule"><code>position: relative</code> · no crea</p>
  <div class="scene"><div class="parent is-relative"><span class="child">hijo · z-index: 2</span></div><span class="cover">z-index: 1</span></div></div>

<div class="test"><p class="rule"><code>position: relative; z-index: 0</code> · crea</p>
  <div class="scene"><div class="parent is-relative-z"><span class="child">hijo · z-index: 2</span></div><span class="cover">z-index: 1</span></div></div>

<div class="test"><p class="rule"><code>opacity: 0.99</code> · crea</p>
  <div class="scene"><div class="parent is-opacity"><span class="child">hijo · z-index: 2</span></div><span class="cover">z-index: 1</span></div></div>

<div class="test"><p class="rule"><code>transform: translateX(0)</code> · crea</p>
  <div class="scene"><div class="parent is-transform"><span class="child">hijo · z-index: 2</span></div><span class="cover">z-index: 1</span></div></div>

<div class="test"><p class="rule"><code>filter: drop-shadow(…)</code> · crea</p>
  <div class="scene"><div class="parent is-filter"><span class="child">hijo · z-index: 2</span></div><span class="cover">z-index: 1</span></div></div>

<div class="test"><p class="rule"><code>isolation: isolate</code> · crea</p>
  <div class="scene"><div class="parent is-isolated"><span class="child">hijo · z-index: 2</span></div><span class="cover">z-index: 1</span></div></div>

<div class="test"><p class="rule"><code>position: sticky</code> · crea</p>
  <div class="scene"><div class="parent is-sticky"><span class="child">hijo · z-index: 2</span></div><span class="cover">z-index: 1</span></div></div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.legend {
  font-size: 0.8rem;
}

.test {
  display: inline-block;
  vertical-align: top;
  width: calc(50% - 12px);
  margin: 0 8px 10px 0;
}

.rule {
  min-height: 2.6em;
  margin: 0 0 2px;
  font-size: 0.75rem;
}

.scene {
  position: relative;
  height: 48px;
}

.parent {
  padding: 6px;
  background: #e2e8f0;
}

.child {
  position: relative;
  z-index: 2;
  display: block;
  width: 70%;
  padding: 2px 6px;
  border: 2px solid #1d4ed8;
  background: #bfdbfe;
  font-size: 0.75rem;
}

.cover {
  position: absolute;
  z-index: 1;
  top: 18px;
  right: 0;
  width: 55%;
  padding: 2px 6px;
  border: 2px solid #c2410c;
  background: #fed7aa;
  font-size: 0.75rem;
  text-align: right;
}

/* Lo que convierte al padre en un CONTEXTO DE APILAMIENTO. Dentro de un contexto, los
   z-index de los hijos solo ordenan a los hijos entre sí; hacia fuera, todo el contexto
   compite como una sola capa (con z-index 0 si no tiene otro). */
.is-relative   { position: relative; }               /* posicionada SIN z-index: no crea */
.is-relative-z { position: relative; z-index: 0; }   /* posicionada CON z-index: crea */
.is-opacity    { opacity: 0.99; }                     /* opacity < 1 (módulo de efectos visuales) */
.is-transform  { transform: translateX(0); }          /* cualquier transform (efectos visuales) */
.is-filter     { filter: drop-shadow(0 1px 1px rgb(15 23 42 / 0.4)); } /* cualquier filter (efectos visuales) */
.is-isolated   { isolation: isolate; }                /* la forma explícita: solo crea el contexto */
.is-sticky     { position: sticky; }                  /* fixed y sticky siempre crean uno */
```
