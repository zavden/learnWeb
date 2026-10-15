---
example_description: "Junto a un flotante, solo el texto se aparta: el fondo de un título y el borde de una cita pasan por debajo de la imagen. Con display: flow-root se colocan al lado"
example_tags: "css|float|bfc|flow-root|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="label">❌ El fondo azul del título y el borde de la cita pasan por DEBAJO de la foto</p>
<section class="post">
  <img class="photo" src="bread.svg" alt="Hogaza de pan" width="160" height="120">
  <h3 class="heading">Ingredientes</h3>
  <blockquote class="tip">«Pesa siempre el agua: una taza nunca mide lo mismo dos veces.»</blockquote>
</section>

<p class="label">✅ Con <code>display: flow-root</code>, título y cita se colocan AL LADO de la foto</p>
<section class="post is-fixed">
  <img class="photo" src="bread.svg" alt="Hogaza de pan" width="160" height="120">
  <h3 class="heading">Ingredientes</h3>
  <blockquote class="tip">«Pesa siempre el agua: una taza nunca mide lo mismo dos veces.»</blockquote>
</section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

/* Cada sección encierra su flotante (lo verás en el ejemplo 5). */
.post {
  display: flow-root;
  max-width: 420px;
}

.photo {
  float: left;
  width: 88px;
  height: auto;
  margin-right: 12px;
}

.heading {
  margin: 0 0 6px;
  padding: 4px 8px;
  background: #bfdbfe;
  font-size: 1rem;
}

.tip {
  margin: 0;
  padding: 4px 12px;
  border-left: 4px solid #1d4ed8;
  background: #f1f5f9;
  font-style: italic;
}

/* 🐛 Un flotante sale del flujo: las CAJAS de los bloques siguientes se colocan como si
   no existiera (empiezan en el borde izquierdo, debajo de la foto) y solo sus LÍNEAS de
   texto se acortan para rodearla. Por eso el fondo del título asoma en el hueco del margen
   de la foto y el borde de la cita solo aparece cuando la foto termina. */

/* ✅ Un bloque que crea un BFC no se mete debajo de los flotantes de fuera:
   se estrecha y se coloca a su lado, con su fondo y su borde enteros. */
.is-fixed .heading,
.is-fixed .tip {
  display: flow-root;
}
```
