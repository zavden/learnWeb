---
example_description: "align-self cambia la alineación de un solo elemento: en una conversación en columna, los mensajes propios se van a la derecha"
example_tags: "css|flexbox|align-self|flex-direction|chat"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="label">Una columna (<code>flex-direction: column</code>): aquí el eje cruzado es el <strong>horizontal</strong>.</p>

<ol class="chat" aria-label="Conversación con Sofía">
  <li class="message">¿Sigue en pie lo del sábado?</li>
  <li class="message is-mine">¡Claro! A las 10 en la estación.</li>
  <li class="message">Perfecto. Llevo los bocadillos.</li>
  <li class="message is-mine">Y yo el mapa de la ruta 🗺️</li>
</ol>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 0 0 6px;
  font-size: 0.8rem;
}

/* En una columna, align-items actúa en horizontal: flex-start pega todos los
   mensajes a la izquierda y cada uno mide lo que su texto (no se estiran). */
.chat {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  max-width: 360px;
  margin: 0;
  padding: 8px;
  border: 2px dashed #7c3aed;
  list-style: none;
}

.message {
  max-width: 75%;
  padding: 4px 10px;
  border-radius: 12px 12px 12px 2px;
  background: #e2e8f0;
  font-size: 0.85rem;
}

/* align-self sobrescribe align-items para UN elemento. Acepta los mismos valores
   (y auto, que significa «lo que diga el contenedor»).
   No existe un justify-self para el eje principal en flexbox: lo verás en el ejemplo 8. */
.is-mine {
  align-self: flex-end;
  border-radius: 12px 12px 2px 12px;
  background: #1d4ed8;
  color: #ffffff;
}
```
