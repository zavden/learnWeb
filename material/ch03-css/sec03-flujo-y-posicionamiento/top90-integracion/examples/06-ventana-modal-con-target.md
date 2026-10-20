---
example_description: "Una ventana modal hecha a mano: capa fixed con inset: 0, panel centrado con margin: auto, escala de z-index por encima de la cabecera sticky y contenido aislado con isolation; se abre y se cierra con :target"
example_tags: "css|fixed|sticky|z-index|isolation|inset|target"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<header class="site-header">Ayuntamiento de Ribera · Reservas</header>

<main class="page">
  <h1>Reserva de pistas deportivas</h1>
  <p class="hint">Pulsa «Leer las condiciones»: la ventana tapa también la cabecera fija.</p>
  <article class="court"><span class="court-tag">Cubierta</span><h2>Pabellón municipal</h2><p>Pista de baloncesto y fútbol sala. De 9:00 a 22:00.</p></article>
  <article class="court"><span class="court-tag">Exterior</span><h2>Pistas del parque</h2><p>Dos pistas de pádel y una de tenis. De 8:00 a 21:00.</p></article>
  <p><a class="button" id="open-conditions" href="#conditions">Leer las condiciones de uso</a></p>
  <p>Las reservas se abren cada lunes a las 9:00 para la semana siguiente. Cada persona puede reservar dos horas por semana.</p>
</main>

<section class="modal" id="conditions" aria-labelledby="conditions-title">
  <div class="modal-panel">
    <h2 id="conditions-title">Condiciones de uso</h2>
    <ul>
      <li>Cancela con al menos 24 horas de antelación.</li>
      <li>Lleva calzado deportivo de suela clara.</li>
      <li>Deja la pista libre cinco minutos antes de la hora.</li>
    </ul>
    <a class="button" href="#open-conditions">Cerrar</a>
  </div>
</section>
```

# CSS

```css
/* La escala de z-index del proyecto, en un solo sitio (lección 5). */
:root {
  --z-sticky: 200;
  --z-modal: 400;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
  line-height: 1.5;
}

/* Lección 4: sticky en el hijo directo del body. Lección 5: z-index de la escala. */
.site-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  padding: 0.6rem 1rem;
  background: #1e3a8a;
  color: #ffffff;
  font-weight: bold;
}

/* Lección 5: el contenido es un contexto aislado. Los z-index de sus tarjetas
   no pueden competir con la cabecera ni con la ventana. */
.page {
  isolation: isolate;
  width: min(100% - 2rem, 34rem);
  margin: 1rem auto 3rem;
}

.page h1 {
  margin: 0 0 0.5rem;
  font-size: 1.4rem;
}

.hint {
  color: #475569;
  font-size: 0.85rem;
}

.court {
  position: relative;
  margin: 0.75rem 0;
  padding: 0.6rem 0.9rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.court h2 {
  margin: 0;
  font-size: 1rem;
}

.court p {
  margin: 0;
  font-size: 0.9rem;
}

.court-tag {
  position: absolute;
  z-index: 1;
  top: 0.6rem;
  right: 0.75rem;
  color: #166534;
  font-size: 0.75rem;
  font-weight: bold;
}

.button {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: #1d4ed8;
  color: #ffffff;
  font-weight: 600;
  text-decoration: none;
}

.button:focus-visible {
  outline: 3px solid #1e3a8a;
  outline-offset: 2px;
}

/* La capa oscura: fixed con inset: 0 cubre la ventana entera, encima de todo (z-index de la
   escala). Oculta hasta que la URL apunta a #conditions (:target). */
.modal {
  display: none;
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: rgb(15 23 42 / 0.6);
}

.modal:target {
  display: block;
}

/* El panel: centrado en los dos ejes con inset: 0, margin: auto y un tamaño
   (height: fit-content = lo que mida su contenido, con un máximo y scroll si no cabe). */
.modal-panel {
  position: absolute;
  inset: 0;
  width: min(100% - 2rem, 26rem);
  height: fit-content;
  max-height: calc(100% - 2rem);
  margin: auto;
  padding: 1rem 1.25rem;
  overflow: auto;
  border-radius: 12px;
  background: #ffffff;
}

.modal-panel h2 {
  margin: 0 0 0.5rem;
  font-size: 1.15rem;
}

/* «Cerrar» apunta al enlace que abrió la ventana: el :target cambia, la ventana se oculta
   y el teclado sigue desde ese enlace.
   Una ventana modal de verdad se hace con <dialog> y showModal() (capítulo de HTML): va en la
   capa superior, atrapa el foco y se cierra con Esc. Aquí se construye a mano para ver las piezas. */
```
