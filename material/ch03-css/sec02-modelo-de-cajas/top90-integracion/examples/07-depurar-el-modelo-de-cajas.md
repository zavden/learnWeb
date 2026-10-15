---
example_description: "Diagnóstico completo: una caja de suscripción con cinco errores del modelo de cajas (colapso, inline, content-box, altura fija con overflow y borde en hover) y su versión arreglada"
example_tags: "css|modelo-de-cajas|depuracion|colapso|box-sizing|overflow"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<p class="controls"><label><input type="checkbox" id="show-boxes"> Ver todas las cajas con <code>outline</code> (no mueve nada)</label></p>

<section class="newsletter">
  <h2>❌ Boletín del huerto <span class="tag">Nuevo</span></h2>
  <p class="text">Cada lunes, qué sembrar esa semana, el tiempo previsto y las actividades del barrio. Sin publicidad y con un enlace para darte de baja en cada correo.</p>
  <label for="email-broken">Correo electrónico</label>
  <input id="email-broken" type="email" placeholder="nombre@ejemplo.es">
  <button type="button">Suscribirme</button>
</section>

<section class="newsletter fixed">
  <h2>✅ Boletín del huerto <span class="tag">Nuevo</span></h2>
  <p class="text">Cada lunes, qué sembrar esa semana, el tiempo previsto y las actividades del barrio. Sin publicidad y con un enlace para darte de baja en cada correo.</p>
  <label for="email-fixed">Correo electrónico</label>
  <input id="email-fixed" type="email" placeholder="nombre@ejemplo.es">
  <button type="button">Suscribirme</button>
</section>

<table class="report">
  <caption>Cinco errores, cinco lecciones</caption>
  <thead>
    <tr><th scope="col">Síntoma en la caja ❌</th><th scope="col">Causa</th><th scope="col">Arreglo en la caja ✅</th></tr>
  </thead>
  <tbody>
    <tr><td>El título toca el borde de arriba del verde</td><td>El margen del <code>h2</code> colapsa con el de la sección y sale fuera (lección 3)</td><td><code>display: flow-root</code></td></tr>
    <tr><td>«Nuevo» queda apretado: su <code>width</code> no hace nada</td><td>Un <code>span</code> es <code>inline</code> (lección 2)</td><td><code>display: inline-block</code></td></tr>
    <tr><td>El texto se corta a media frase</td><td><code>height</code> fija + <code>overflow: hidden</code> «para igualar alturas» (lecciones 4 y 5)</td><td>altura <code>auto</code> y sin recorte</td></tr>
    <tr><td>El campo asoma por la derecha</td><td><code>width: 100%</code> con <code>content-box</code> (lección 1)</td><td><code>box-sizing: border-box</code></td></tr>
    <tr><td>Al pasar el ratón, el botón salta</td><td>Un borde más grueso agranda la caja (lecciones 1 y 6)</td><td>mismo borde y un anillo de <code>box-shadow</code></td></tr>
  </tbody>
</table>
```

# CSS

```css
/* El CSS de la caja ROTA: cada regla tiene un error del módulo.
   Al final, la clase .fixed los corrige uno a uno. */
body {
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: #1e293b;
}

.newsletter {
  max-width: 22rem;
  margin-bottom: 1.5rem;
  padding: 0 1rem 1rem;            /* arriba, nada: confiamos en el margen del título… */
  border-radius: 12px;
  background: #ecfccb;
}

/* 🐛 1. Sin padding ni borde arriba, este margen se une al de la sección y sale FUERA */
.newsletter h2 {
  margin: 1.25rem 0 0.5rem;
  font-size: 1.25rem;
}

/* 🐛 2. Un span es inline: width se ignora y la etiqueta se ajusta a su texto */
.tag {
  width: 4.5rem;
  padding: 0.15rem 0;
  border-radius: 999px;
  background: #15803d;
  color: #ffffff;
  font-size: 0.75rem;
  text-align: center;
  vertical-align: middle;          /* vertical-align llega en el módulo de flujo */
}

/* 🐛 3. «Que todas las cajas midan igual»: el texto que no cabe desaparece sin aviso */
.text {
  height: 4.5em;
  overflow: hidden;
  margin: 0 0 1rem;
}

.newsletter label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

/* 🐛 4. content-box: 100% del contenido + 24px de padding + 4px de borde */
.newsletter input {
  display: block;
  width: 100%;
  margin-bottom: 0.75rem;
  padding: 0.6rem 0.75rem;
  border: 2px solid #64748b;
  border-radius: 8px;
  font: inherit;
}

.newsletter button {
  padding: 0.6rem 1.2rem;
  border: 1px solid #14532d;
  border-radius: 8px;
  background: #15803d;
  color: #ffffff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

/* 🐛 5. El borde forma parte de la caja: de 1px a 4px, 6px más ancho y más alto */
.newsletter button:hover {
  border-width: 4px;
}

/* ─── Los arreglos ─────────────────────────────────────────────────────────── */

/* ✅ 1. flow-root: un BFC propio; los márgenes de los hijos se quedan dentro */
.fixed {
  display: flow-root;
}

/* ✅ 2. En la línea por fuera, bloque por dentro: respeta width y padding */
.fixed .tag {
  display: inline-block;
}

/* ✅ 3. La caja mide lo que su contenido. Si un diseño necesita recortar texto,
   que se note: «…» o line-clamp, y el texto completo en otra parte. */
.fixed .text {
  height: auto;
  overflow: visible;
}

/* ✅ 4. En una hoja real, el reset *, *::before, *::after { box-sizing: border-box; }
   al principio arregla este error en todos los elementos a la vez. */
.fixed input {
  box-sizing: border-box;
}

/* ✅ 5. El borde no cambia; el anillo es una sombra, que no ocupa espacio */
.fixed button:hover {
  border-width: 1px;
  background: #166534;
  box-shadow: 0 0 0 3px #4d7c0f;
}

/* ─── Herramientas ─────────────────────────────────────────────────────────── */

.newsletter :focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

/* El truco de depuración de la lección 1: outline dibuja todas las cajas sin moverlas */
body:has(#show-boxes:checked) .newsletter,
body:has(#show-boxes:checked) .newsletter * {
  outline: 1px solid #dc2626;
}

.report {
  max-width: 44rem;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.report caption {
  margin-bottom: 0.5rem;
  font-weight: 700;
  text-align: start;
}

.report th,
.report td {
  padding: 0.4rem 0.6rem;
  border: 1px solid #cbd5e1;
  text-align: start;
  vertical-align: top;
}
```
