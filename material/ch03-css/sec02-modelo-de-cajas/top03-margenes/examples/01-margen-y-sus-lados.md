---
example_description: "margin con 1, 2, 3 o 4 valores y sus versiones lógicas margin-inline y margin-block; el margen naranja se ve gracias a un contenedor"
example_tags: "css|modelo-de-cajas|margin|propiedades-logicas"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="legend">Naranja = margen (el color que usa DevTools) · Azul = la caja</p>

<div class="frame"><div class="box one">margin: 16px</div></div>
<div class="frame"><div class="box two">margin: 8px 32px (arriba/abajo · izquierda/derecha)</div></div>
<div class="frame"><div class="box three">margin: 4px 16px 28px (arriba · lados · abajo)</div></div>
<div class="frame"><div class="box four">margin: 4px 40px 12px 8px (sentido horario: ↑ → ↓ ←)</div></div>
<div class="frame"><div class="box logical">margin-inline: 40px; margin-block: 8px</div></div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.legend {
  font-size: 0.9rem;
}

/* El margen es transparente: lo hacemos visible pintando de naranja el contenedor.
   display: flow-root impide que el margen de la caja «escape» del marco (lo verás en esta lección). */
.frame {
  display: flow-root;
  background: #fed7aa;
  margin-bottom: 12px;
}

.box {
  background: #bfdbfe;
  padding: 6px 10px;
  font-size: 0.9rem;
}

.one     { margin: 16px; }
.two     { margin: 8px 32px; }
.three   { margin: 4px 16px 28px; }
.four    { margin: 4px 40px 12px 8px; }

/* Propiedades lógicas: inline = dirección del texto (izquierda/derecha en español),
   block = dirección en la que se apilan los bloques (arriba/abajo). */
.logical {
  margin-inline: 40px;
  margin-block: 8px;
}
```
