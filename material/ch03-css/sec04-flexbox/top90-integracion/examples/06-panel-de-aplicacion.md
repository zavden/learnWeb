---
example_description: "El esqueleto de una aplicación de alto fijo: barra superior, menú lateral con «Ayuda» al fondo, zona principal con scroll y un resumen sticky que se pega gracias a align-self"
example_tags: "css|flexbox|aplicacion|min-height|sticky|align-self|margin-auto"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<div class="app">
  <header class="topbar">
    <strong>Xochi · Panel</strong>
    <a class="user" href="/cuenta"><img src="avatar-4.svg" alt="" width="24" height="24"> Ana</a>
  </header>

  <div class="app-main">
    <nav class="sidebar" aria-label="Secciones del panel">
      <a href="/panel/pedidos" aria-current="page">Pedidos</a>
      <a href="/panel/clientes">Clientes</a>
      <a href="/panel/inventario">Inventario</a>
      <a class="help" href="/ayuda">Ayuda</a>
    </nav>

    <main class="content" tabindex="0" aria-label="Detalle del pedido">
      <div class="order-layout">
        <article class="order">
          <h2>Pedido 4821 <span class="status">Pagado</span></h2>
          <ul class="items">
            <li><img src="plant-monstera.svg" alt="" width="36" height="36"><span class="item-name">Monstera deliciosa en maceta de barro de 25 cm</span><span class="qty">×1</span><span class="price">420</span></li>
            <li><img src="plant-pothos.svg" alt="" width="36" height="36"><span class="item-name">Pothos dorado colgante</span><span class="qty">×2</span><span class="price">320</span></li>
            <li><img src="plant-cactus.svg" alt="" width="36" height="36"><span class="item-name">Cactus candelabro</span><span class="qty">×1</span><span class="price">290</span></li>
            <li><img src="plant-sansevieria.svg" alt="" width="36" height="36"><span class="item-name">Sansevieria</span><span class="qty">×1</span><span class="price">240</span></li>
          </ul>
          <h3>Envío</h3>
          <p>Ana Torres · Av. Chapultepec 480, int. 12, col. Americana, 44160 Guadalajara, Jal.</p>
          <h3>Notas del cliente</h3>
          <p>Por favor, dejar en la recepción del edificio. Si no hay nadie, llamar al 33 1234 5678 antes de las 18:00.</p>
          <h3>Historial</h3>
          <p>12 oct., 10:14 · Pedido creado<br>12 oct., 10:15 · Pago confirmado<br>12 oct., 16:40 · Preparando<br>13 oct., 09:02 · Etiqueta de envío impresa</p>
        </article>

        <aside class="summary" aria-label="Resumen del pedido">
          <p><span>Subtotal</span> <span>1270</span></p>
          <p><span>Envío</span> <span>90</span></p>
          <p class="total"><span>Total</span> <span>1360 MXN</span></p>
          <button type="button">Marcar enviado</button>
        </aside>
      </div>
    </main>
  </div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: -3px;
}

/* Nivel 1: la aplicación es una columna de alto fijo (en una página real, 100dvh). */
.app {
  display: flex;
  flex-direction: column;
  max-width: 28rem;
  height: 340px;
  border: 1px solid #94a3b8;
  font-size: 0.8rem;
}

.topbar {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  background: #14532d;
  color: #ffffff;
}

.user {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;          /* al final de la barra (lección 2) */
  color: #ffffff;
}

.user img {
  border-radius: 50%;
}

/* Nivel 2: una FILA dentro de la columna. Es el elemento intermedio de la lección 4:
   sin min-height: 0 mediría lo que todo el pedido y la zona principal no tendría scroll. */
.app-main {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* El menú lateral: rígido y en columna. Como la fila lo estira hasta su alto (aquí el
   stretch sí es lo que queremos), «Ayuda» puede irse al fondo con margin-top: auto. */
.sidebar {
  display: flex;
  flex-direction: column;
  flex: none;
  gap: 2px;
  width: 6.5rem;
  padding: 8px 6px;
  background: #f0fdf4;
}

.sidebar a {
  padding: 4px 8px;
  border-radius: 6px;
  color: #14532d;
  text-decoration: none;
}

.sidebar a[aria-current="page"] {
  background: #166534;
  color: #ffffff;
}

.help {
  margin-top: auto;
}

/* La zona principal se queda con el resto del ancho y se desplaza en vertical. */
.content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 10px;
}

/* Nivel 3: el pedido y su resumen, en fila. */
.order-layout {
  display: flex;
  gap: 12px;
}

.order {
  flex: 1;
  min-width: 0;
}

.order h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 6px;
  font-size: 1rem;
}

.status {
  padding: 0 8px;
  border-radius: 999px;
  background: #dcfce7;
  color: #14532d;
  font-size: 0.7rem;
}

.order h3 {
  margin: 10px 0 2px;
  font-size: 0.85rem;
}

.order p {
  margin: 0;
}

/* Cada línea del pedido: miniatura rígida, nombre que se recorta, cantidad y precio. */
.items {
  margin: 0;
  padding: 0;
  list-style: none;
}

.items li {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  border-bottom: 1px solid #e2e8f0;
}

.items img {
  flex: none;
  border-radius: 4px;
}

.item-name {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.qty {
  color: #475569;
}

/* El resumen se queda arriba mientras se lee el pedido. Sin align-self: flex-start,
   el stretch lo haría tan alto como el pedido y no tendría recorrido (lección 4). */
.summary {
  position: sticky;
  top: 0;
  align-self: flex-start;
  flex: 0 0 7.5rem;
  padding: 8px;
  border-radius: 8px;
  background: #f1f5f9;
}

/* Concepto a un lado, importe al otro. */
.summary p {
  display: flex;
  justify-content: space-between;
  margin: 0 0 4px;
}

.summary .total {
  padding-top: 4px;
  border-top: 1px solid #cbd5e1;
  font-weight: bold;
}

.summary button {
  width: 100%;
  margin-top: 6px;
  padding: 5px;
  border: 0;
  border-radius: 6px;
  background: #166534;
  color: #ffffff;
  font: inherit;
}
```
