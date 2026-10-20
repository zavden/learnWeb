---
example_description: "El mismo aviso en español y en árabe: con propiedades físicas, la versión con dir=\"rtl\" queda con la barra, el icono, la etiqueta y la flecha en el lado equivocado; con propiedades lógicas, flexbox y :dir(), se invierte sola"
example_tags: "css|modos-de-escritura|propiedades-logicas|rtl|dir|flexbox|arabe"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<p class="caption">❌ Propiedades físicas (<code>border-left</code>, <code>padding-right</code>, <code>right</code>, <code>text-align: left</code>)</p>
<div class="notices">
  <section class="notice is-physical" lang="es" aria-labelledby="p-es">
    <span class="icon" aria-hidden="true">i</span>
    <div>
      <h3 id="p-es">Horario de la biblioteca</h3>
      <p>Abrimos de lunes a sábado, de 9:00 a 20:00.</p>
      <a class="more" href="/biblioteca/horario">Más información</a>
    </div>
    <span class="badge">Nuevo</span>
  </section>
  <section class="notice is-physical" lang="ar" dir="rtl" aria-labelledby="p-ar">
    <span class="icon" aria-hidden="true">i</span>
    <div>
      <h3 id="p-ar">ساعات عمل المكتبة</h3>
      <p>المكتبة مفتوحة من الاثنين إلى السبت، من الساعة 9:00 حتى 20:00.</p>
      <a class="more" href="/ar/biblioteca/horario">مزيد من المعلومات</a>
    </div>
    <span class="badge">جديد</span>
  </section>
</div>

<p class="caption">✅ Propiedades lógicas: la versión árabe es el espejo de la española</p>
<div class="notices">
  <section class="notice is-logical" lang="es" aria-labelledby="l-es">
    <span class="icon" aria-hidden="true">i</span>
    <div>
      <h3 id="l-es">Horario de la biblioteca</h3>
      <p>Abrimos de lunes a sábado, de 9:00 a 20:00.</p>
      <a class="more" href="/biblioteca/horario">Más información</a>
    </div>
    <span class="badge">Nuevo</span>
  </section>
  <section class="notice is-logical" lang="ar" dir="rtl" aria-labelledby="l-ar">
    <span class="icon" aria-hidden="true">i</span>
    <div>
      <h3 id="l-ar">ساعات عمل المكتبة</h3>
      <p>المكتبة مفتوحة من الاثنين إلى السبت، من الساعة 9:00 حتى 20:00.</p>
      <a class="more" href="/ar/biblioteca/horario">مزيد من المعلومات</a>
    </div>
    <span class="badge">جديد</span>
  </section>
</div>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Aviso bilingüe
   - El mismo HTML en los dos idiomas; el árabe lleva lang="ar" y dir="rtl".
   - La fila icono + texto es flex: su eje es el inline, así que en árabe el
     icono pasa solo a la derecha (en las DOS versiones).
   - Lo demás depende de cómo se escriba: la barra, el hueco para la etiqueta,
     la posición de la etiqueta, la alineación y la flecha del enlace.
   ────────────────────────────────────────────────────────────────────────── */
* {
  box-sizing: border-box;
}

body {
  color: #1e293b;
  font-family: system-ui, sans-serif;
}

.caption {
  margin: 10px 0 4px;
  font-size: 0.75rem;
}

.notices {
  display: grid;
  gap: 8px;
  max-inline-size: 26rem;
}

.notice {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding-block: 10px;
  background: #e0e7ff;
  font-size: 0.875rem;
  line-height: 1.5;
}

.notice h3,
.notice p {
  margin: 0;
}

.notice h3 {
  font-size: 1rem;
}

.icon {
  display: grid;
  flex: none;
  place-items: center;
  inline-size: 1.5rem;
  block-size: 1.5rem;
  border-radius: 50%;
  background: #3730a3;
  color: #ffffff;
  font-family: Georgia, serif;
  font-weight: 700;
}

.badge {
  position: absolute;
  padding: 0 6px;
  border-radius: 4px;
  background: #9a3412;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
}

.more {
  color: #1d4ed8;
  font-weight: 600;
  text-underline-offset: 0.2em;
}

/* La flecha es contenido generado: señala hacia donde avanza la lectura. El
   texto alternativo vacío (/ "") evita que el lector de pantalla la lea. */
.more::after {
  content: " →" / "";
}

/* ❌ Lados de la pantalla. En árabe, la barra queda al final de la línea, el
   hueco reservado para la etiqueta (padding-right) cae donde empieza el texto,
   el texto se alinea a la izquierda (al final) y la flecha apunta hacia atrás. */
.is-physical {
  padding-left: 12px;
  padding-right: 64px;
  border-left: 4px solid #4338ca;
  text-align: left;
}

.is-physical .badge {
  top: 8px;
  right: 8px;
}

/* ✅ Lados del texto: todo gira con dir. */
.is-logical {
  padding-inline: 12px 64px;           /* inicio, final */
  border-inline-start: 4px solid #4338ca;
  text-align: start;
}

.is-logical .badge {
  inset-block-start: 8px;
  inset-inline-end: 8px;
}

/* :dir(rtl) pregunta por la dirección heredada del HTML (Chrome 120). */
.is-logical .more:dir(rtl)::after {
  content: " ←" / "";
}
```
