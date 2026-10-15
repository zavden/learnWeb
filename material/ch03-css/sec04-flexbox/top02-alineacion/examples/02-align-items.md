---
example_description: "align-items coloca los elementos en el eje cruzado: estirados (por defecto), al inicio, al centro, al final o alineados por la línea base de su texto"
example_tags: "css|flexbox|align-items|alineacion|stretch|baseline"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label">Tres elementos con distinto tamaño de letra en contenedores de 90px de alto. <code>align-items</code> decide su posición vertical.</p>

<div class="panels">
  <div class="panel"><code>stretch</code>
    <div class="box is-stretch"><span class="s">Ag</span><span class="l">Ag</span><span class="m">Ag<br>Ag</span></div>
  </div>
  <div class="panel"><code>flex-start</code>
    <div class="box is-start"><span class="s">Ag</span><span class="l">Ag</span><span class="m">Ag<br>Ag</span></div>
  </div>
  <div class="panel"><code>center</code>
    <div class="box is-center"><span class="s">Ag</span><span class="l">Ag</span><span class="m">Ag<br>Ag</span></div>
  </div>
  <div class="panel"><code>flex-end</code>
    <div class="box is-end"><span class="s">Ag</span><span class="l">Ag</span><span class="m">Ag<br>Ag</span></div>
  </div>
  <div class="panel"><code>baseline</code>
    <div class="box is-baseline"><span class="s">Ag</span><span class="l">Ag</span><span class="m">Ag<br>Ag</span></div>
  </div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 0 0 6px;
  font-size: 0.8rem;
}

.panels {
  display: flex;
  gap: 6px;
}

.panel {
  width: 84px;
  font-size: 0.75rem;
  text-align: center;
}

.box {
  display: flex;
  justify-content: center;
  gap: 2px;
  height: 90px;
  margin-top: 4px;
  border: 2px dashed #7c3aed;
}

.box span {
  padding: 0 1px;
  border: 1px solid #4338ca;
  background: #e0e7ff;
  line-height: 1.1;
}

.s { font-size: 11px; }
.l { font-size: 22px; }
.m { font-size: 14px; }

/* align-items actúa en el EJE CRUZADO (en una fila, el vertical).
   stretch (por defecto): los elementos sin altura fija se estiran hasta llenar la línea. */
.is-stretch { align-items: stretch; }

/* Los demás valores dejan a cada elemento con la altura de su contenido. */
.is-start { align-items: flex-start; }
.is-center { align-items: center; }
.is-end { align-items: flex-end; }

/* baseline: alinea la línea base de la PRIMERA línea de texto de cada elemento.
   Fíjate en que las tres «Ag» quedan apoyadas en la misma raya invisible. */
.is-baseline { align-items: baseline; }
```
