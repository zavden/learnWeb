---
example_description: "text-overflow: ellipsis en un hijo de un elemento flex no aparece: el elemento flex no encoge por debajo de la línea entera hasta que lleva min-width: 0"
example_tags: "css|flexbox|min-width|text-overflow|ellipsis|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">❌ El <code>p</code> tiene las tres propiedades del recorte, pero no salen los «…»: la fila se sale</p>
<ul class="inbox">
  <li class="thread">
    <span class="avatar" aria-hidden="true">LR</span>
    <div class="summary">
      <p class="name">Laura Rivas</p>
      <p class="preview">Te mando el presupuesto de la cocina con los tres tipos de encimera que vimos el sábado</p>
    </div>
    <time datetime="2026-10-13T09:42">9:42</time>
  </li>
</ul>

<p class="label">✅ <code>min-width: 0</code> en <code>.summary</code>, el elemento flex que contiene el texto</p>
<ul class="inbox is-fixed">
  <li class="thread">
    <span class="avatar" aria-hidden="true">LR</span>
    <div class="summary">
      <p class="name">Laura Rivas</p>
      <p class="preview">Te mando el presupuesto de la cocina con los tres tipos de encimera que vimos el sábado</p>
    </div>
    <time datetime="2026-10-13T09:42">9:42</time>
  </li>
</ul>

<p class="label">✅ Si el texto recortado es él mismo el elemento flex, funciona sin más</p>
<ul class="inbox">
  <li class="thread">
    <span class="avatar" aria-hidden="true">PDF</span>
    <span class="preview">presupuesto-cocina-encimeras-cuarzo-granito-y-madera-maciza.pdf</span>
    <span class="size">2,4 MB</span>
  </li>
</ul>
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

.inbox {
  max-width: 400px;
  margin: 0;
  padding: 0;
  outline: 2px dashed #7c3aed;
  list-style: none;
  font-size: 0.8rem;
}

.thread {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
}

/* flex-shrink: 0 evita que el avatar y la hora se aplasten (otra trampa: ejemplo 6). */
.avatar,
time,
.size {
  flex-shrink: 0;
}

.avatar {
  width: 32px;
  line-height: 32px;
  border-radius: 50%;
  background: #4338ca;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: bold;
  text-align: center;
}

.name {
  margin: 0;
  font-weight: bold;
}

time,
.size {
  margin-left: auto;
  color: #475569;
}

/* El recorte de una línea del módulo 2: las tres propiedades juntas. */
.preview {
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 🐛 El p está bien. El problema es su padre, .summary, que es el elemento flex.
   Con white-space: nowrap, el ancho mínimo del contenido de .summary es la frase
   entera en una línea, y min-width: auto no le deja bajar de ahí. El p nunca es más
   estrecho que su texto, así que no hay nada que recortar: ni «…» ni recorte, y la
   fila se sale del contenedor. */

/* ✅ min-width: 0 en el elemento flex. Ahora .summary encoge, el p es más estrecho
   que su frase y aparecen los puntos suspensivos. */
.is-fixed .summary {
  min-width: 0;
}

/* En la tercera lista, .preview es directamente el elemento flex. Con overflow: hidden
   es un contenedor de scroll y no tiene mínimo automático: encoge y recorta. */
```
