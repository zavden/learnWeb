---
example_stage: final-solution
example_description: "Solución: overflow-wrap: anywhere en los correos, hyphens: auto en los cargos, borde y relleno lógicos en los avisos y unicode-bidi: isolate en los nombres"
example_tags: "css|solucion|tipografia|overflow-wrap|hyphens|propiedades-logicas|unicode-bidi"
console: true
---

# HTML

```html
<div class="cards">
  <article class="card"><h3>Ana Lucía Méndez</h3><p class="role">Coordinadora de exportaciones</p><p class="mail">ana.mendez@panaderialaespiga.mx</p></article>
  <article class="card"><h3>Facturación</h3><p class="role">Departamento de administración</p><p class="mail">facturacionyclientes@panaderialaespiga.mx</p></article>
  <article class="card"><h3>Mayoreo</h3><p class="role">Pedidos para restaurantes</p><p class="mail">mayoreo@panaderialaespiga.mx</p></article>
</div>

<div class="notes">
  <p class="note">Respondemos en menos de 24&nbsp;horas.</p>
  <p class="note" lang="ar" dir="rtl">نرد خلال أقل من 24 ساعة.</p>
</div>

<ul class="reviews">
  <li><span class="reviewer">Ana</span>: 12 reseñas</li>
  <li><span class="reviewer" lang="ar">سارة</span>: 5 reseñas</li>
  <li><span class="reviewer" lang="he">דוד</span>: 3 reseñas</li>
</ul>

<ul class="checklist">
  <li>Las tres fichas, iguales: <output id="check-cards">…</output></li>
  <li>Cargos con guiones automáticos: <output id="check-hyphens">…</output></li>
  <li>La barra del aviso árabe, a la derecha: <output id="check-border">…</output></li>
  <li>Nombres aislados: <output id="check-bidi">…</output></li>
</ul>
```

# CSS

```css
body {
  color: #1e293b;
  font-family: system-ui, sans-serif;
  font-size: 0.85rem;
}

.cards {
  display: flex;
  gap: 8px;
  width: 400px;
}

.card {
  flex: 1;
  padding: 6px 8px;
  background: #e0e7ff;
}

.card h3,
.card p {
  margin: 0;
}

.card h3 {
  font-size: 0.95rem;
}

/* ✅ 1: anywhere también rebaja el min-content, el mínimo de los elementos flex. */
.mail {
  overflow-wrap: anywhere;
}

/* ✅ 2: guiones con el diccionario del idioma de la página (lang="es"). */
.role {
  color: #334155;
  hyphens: auto;
}

.notes {
  display: grid;
  gap: 6px;
  max-width: 400px;
  margin-block: 12px;
}

/* ✅ 3: el lado donde empieza la línea, en cualquier idioma. */
.note {
  margin: 0;
  padding-inline-start: 10px;
  border-inline-start: 4px solid #4338ca;
  background: #f1f5f9;
}

.reviews {
  margin: 0;
  padding-inline-start: 1.2em;
  font-size: 1rem;
}

/* ✅ 4: lo mismo que hace <bdi>: el nombre se ordena por su cuenta. */
.reviewer {
  font-weight: 700;
  unicode-bidi: isolate;
}

.checklist {
  padding-inline-start: 1.2em;
  color: #475569;
  font-size: 0.8rem;
}

.checklist output {
  color: #1e293b;
  font-weight: bold;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script solo mide las cajas,
// lee los estilos calculados y escribe ✅ o ❌ en la lista (y en la consola).
// No hace falta tocarlo: se vuelve a ejecutar con cada cambio.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

const widths = [...document.querySelectorAll('.card')].map((card) => card.getBoundingClientRect().width);
check('check-cards', Math.max(...widths) - Math.min(...widths) < 1,
  `${widths.map(Math.round).join(', ')} px`);

const hyphens = getComputedStyle(document.querySelector('.role')).hyphens;
check('check-hyphens', hyphens === 'auto', `hyphens: ${hyphens}`);

// getComputedStyle siempre responde en lados físicos: así se ve dónde ha ido a parar.
const arabicNote = getComputedStyle(document.querySelector('.note[dir="rtl"]'));
const right = parseFloat(arabicNote.borderRightWidth);
const left = parseFloat(arabicNote.borderLeftWidth);
check('check-border', right > 0 && left === 0, `borde izquierdo ${left} px, derecho ${right} px`);

const bidi = getComputedStyle(document.querySelector('.reviewer')).unicodeBidi;
check('check-bidi', bidi === 'isolate', `unicode-bidi: ${bidi}`);
```
