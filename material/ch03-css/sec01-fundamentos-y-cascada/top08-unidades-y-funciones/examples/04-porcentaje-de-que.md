---
example_description: "Un padding-top en % no se calcula con el alto sino con el ANCHO del contenedor"
example_tags: "css|unidades|porcentaje|padding"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p>Las dos cajas verdes tienen <code>padding-top: 25%</code> y ninguna altura. Sus contenedores tienen el mismo alto (100px) y distinto ancho:</p>
<div class="container narrow">
  <div class="box">contenedor de 200px de ancho → padding-top = 50px</div>
</div>
<div class="container wide">
  <div class="box">contenedor de 400px de ancho → padding-top = 100px</div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.container {
  height: 100px;               /* el mismo alto en los dos */
  border: 2px dashed #94a3b8;
  margin: 8px 0 16px;
}

.narrow { width: 200px; }
.wide   { width: 400px; }

/* 🐛 «25% de padding arriba» suena a «un cuarto del alto del contenedor»…
   pero los porcentajes de padding y margin, también los de arriba y abajo,
   se calculan SIEMPRE con el ANCHO del contenedor:
     200px × 25% = 50px      400px × 25% = 100px
   (El texto de la caja se coloca debajo de ese relleno.) */
.box {
  padding-top: 25%;
  background: #bbf7d0;
  font-size: 0.8rem;
}

/* Si lo que quieres es una proporción de ancho y alto, la herramienta moderna es
   aspect-ratio (módulo del modelo de cajas). */
```
