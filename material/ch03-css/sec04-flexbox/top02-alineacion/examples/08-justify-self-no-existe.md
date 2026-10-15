---
example_description: "justify-self y float no hacen nada en un elemento flex: para mandar un solo elemento al final de la fila se usa margin-left: auto"
example_tags: "css|flexbox|justify-self|float|margin-auto|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="label">❌ <code>justify-self: end</code> y <code>float: right</code> en «Publicar»: no se mueve</p>
<div class="actions">
  <button type="button">Vista previa</button>
  <button type="button">Guardar borrador</button>
  <button type="button" class="publish is-wrong">Publicar</button>
</div>

<p class="label">✅ <code>margin-left: auto</code> en «Publicar»</p>
<div class="actions">
  <button type="button">Vista previa</button>
  <button type="button">Guardar borrador</button>
  <button type="button" class="publish is-fixed">Publicar</button>
</div>
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

.actions {
  display: flex;
  gap: 8px;
  padding: 6px;
  border: 2px dashed #7c3aed;
}

.actions button {
  padding: 4px 10px;
  border: 1px solid #475569;
  border-radius: 6px;
  background: #ffffff;
  color: #1e293b;
  font: inherit;
  font-size: 0.85rem;
}

.actions button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.publish {
  border-color: #15803d;
  background: #15803d;
  color: #ffffff;
}

/* 🐛 Dos declaraciones válidas que un elemento flex ignora sin avisar:
   - justify-self: en flexbox no existe alineación individual en el eje principal,
     porque ahí los elementos van uno tras otro y comparten el espacio. (Sí funciona
     en grid, en el próximo módulo.)
   - float: los elementos flex no flotan (lección 1).
   Ninguna de las dos es un error de sintaxis, así que el navegador no avisa. */
.is-wrong {
  justify-self: end;
  float: right;
}

/* ✅ Un margen automático absorbe el espacio libre en su lado y empuja el botón al
   final. Con margin-inline-start: auto funciona también en páginas de derecha a izquierda. */
.is-fixed {
  margin-left: auto;
}
```
