---
example_description: "visible, hidden, clip, scroll y auto: qué hace cada valor con el contenido que no cabe en una caja de altura fija"
example_tags: "css|overflow|scroll"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<div class="grid">
  <section class="box visible"><h3>visible</h3><p>El contenido que no cabe se sale de la caja y se dibuja encima de lo que haya debajo. Es el valor por defecto.</p></section>
  <section class="box hidden"><h3>hidden</h3><p>Lo que no cabe se recorta, pero la caja sigue siendo desplazable: por código o cuando recibe el foco un elemento que está dentro.</p></section>
  <section class="box clip"><h3>clip</h3><p>Recorta igual que hidden, pero la caja NO es un contenedor de scroll: no se puede desplazar de ninguna forma.</p></section>
  <section class="box scroll"><h3>scroll</h3><p>Siempre hay barras de desplazamiento, sobre todo en sistemas con barras clásicas, aunque el contenido quepa.</p></section>
  <section class="box auto"><h3>auto</h3><p>Barras solo cuando hacen falta. Es el valor que normalmente quieres para un área con scroll.</p></section>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.box {
  display: inline-block;
  vertical-align: top;
  width: 170px;
  height: 120px;                /* altura fija: el texto no cabe a propósito */
  margin: 0 12px 70px 0;
  padding: 0 10px;
  background: #bfdbfe;
  border: 2px solid #1d4ed8;
  font-size: 0.85rem;
}

.box h3 {
  margin: 6px 0;
}

.visible { overflow: visible; }
.hidden  { overflow: hidden; }
.clip    { overflow: clip; }
.scroll  { overflow: scroll; }
.auto    { overflow: auto; }
```
