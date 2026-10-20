---
example_description: "align-content reparte las LÍNEAS de un contenedor con flex-wrap en el eje cruzado; por defecto las estira y separa las filas"
example_tags: "css|flexbox|align-content|flex-wrap|alineacion"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="label">Seis elementos en tres líneas (<code>flex-wrap: wrap</code>) dentro de contenedores de 120px de alto. Sobran unos 60px de alto.</p>

<div class="panels">
  <div class="panel"><code>normal</code> (estira)
    <div class="box"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span></div>
  </div>
  <div class="panel"><code>flex-start</code>
    <div class="box is-start"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span></div>
  </div>
  <div class="panel"><code>center</code>
    <div class="box is-center"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span></div>
  </div>
  <div class="panel"><code>space-between</code>
    <div class="box is-between"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span></div>
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
  gap: 8px;
}

.panel {
  width: 104px;
  font-size: 0.75rem;
  text-align: center;
}

.box {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  height: 120px;
  margin-top: 4px;
  padding: 2px;
  border: 2px dashed #7c3aed;
}

.box span {
  width: 42px;
  border: 1px solid #4338ca;
  background: #e0e7ff;
  font-weight: bold;
}

/* align-items coloca los elementos DENTRO de cada línea; align-content coloca las
   LÍNEAS dentro del contenedor, en el eje cruzado. Solo tiene efecto con flex-wrap:
   un contenedor nowrap tiene una sola línea, que ocupa todo el alto, y lo ignora.

   normal (por defecto) se comporta como stretch: las líneas se reparten el alto
   sobrante y, como align-items también es stretch, los elementos crecen con ellas.
   Por eso un contenedor alto con wrap «separa» o «engorda» sus filas. */

.is-start { align-content: flex-start; }      /* líneas juntas arriba (con su gap)   */
.is-center { align-content: center; }
.is-between { align-content: space-between; } /* primera arriba, última abajo        */
```
