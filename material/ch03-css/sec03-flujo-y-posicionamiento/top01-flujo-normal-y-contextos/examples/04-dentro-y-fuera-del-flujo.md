---
example_description: "La misma caja B en cuatro situaciones: en el flujo (static), movida sin salir del flujo (relative), flotante y fuera del flujo (absolute)"
example_tags: "css|flujo-normal|float|position|fuera-del-flujo"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="scene">
  <p class="caption">static: en el flujo</p>
  <div class="box a">A</div>
  <div class="box b">B</div>
  <div class="box c">C: el texto de la caja siguiente</div>
</div>

<div class="scene">
  <p class="caption">relative: se mueve, su hueco sigue ahí</p>
  <div class="box a">A</div>
  <div class="box b is-relative">B</div>
  <div class="box c">C: el texto de la caja siguiente</div>
</div>

<div class="scene">
  <p class="caption">float: sale del flujo, el texto lo rodea</p>
  <div class="box a">A</div>
  <div class="box b is-float">B</div>
  <div class="box c">C: el texto de la caja siguiente</div>
</div>

<div class="scene">
  <p class="caption">absolute: fuera del flujo, C sube</p>
  <div class="box a">A</div>
  <div class="box b is-absolute">B</div>
  <div class="box c">C: el texto de la caja siguiente</div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

/* Cuatro escenas en fila con inline-block (vertical-align: top se explica en la lección 2). */
.scene {
  display: inline-block;
  vertical-align: top;
  width: calc(25% - 10px);        /* 4 escenas + el hueco del espacio en blanco entre ellas */
  margin: 0 4px 12px 0;
  position: relative;              /* para que B absolute se quede en su escena (lección 4) */
}

.caption {
  margin: 0 0 4px;
  min-height: 3.6em;              /* hasta tres líneas: las cajas empiezan a la misma altura */
  font-size: 0.75rem;
  color: #475569;
}

.box {
  padding: 4px 6px;
  font-size: 0.85rem;
}

.a { background: #e2e8f0; }
.c { background: #bfdbfe; }

/* B es semitransparente para que se vea lo que tiene debajo. */
.b {
  width: 40%;
  height: 32px;
  background: rgb(250 204 21 / 0.85);
  font-weight: bold;
}

/* relative: se dibuja 12px más abajo y a la derecha, pero C no se entera:
   el hueco original de B sigue reservado. */
.is-relative {
  position: relative;
  top: 12px;
  left: 12px;
}

/* float (lección 3): B se va a la izquierda; la CAJA de C pasa por debajo,
   pero su TEXTO se aparta y rodea a B. */
.is-float {
  float: left;
}

/* absolute (lección 4): B deja de ocupar sitio. C sube a su hueco y B queda encima. */
.is-absolute {
  position: absolute;
}
```
