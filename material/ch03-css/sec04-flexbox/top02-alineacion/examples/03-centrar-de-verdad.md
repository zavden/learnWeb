---
example_description: "Centrar en los dos ejes con flexbox: align-items: center en el cruzado y justify-content: center en el principal, donde vertical-align no podía"
example_tags: "css|flexbox|centrar|align-items|justify-content|vertical-align"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<div class="banner is-wrong">
  <p>❌ <code>height: 80px; vertical-align: middle</code>: el texto sigue arriba</p>
</div>

<div class="banner is-centered">
  <p>✅ <code>display: flex; align-items: center; justify-content: center</code></p>
</div>

<div class="banner is-centered">
  <p>✅ Aunque el texto ocupe dos líneas o cambie el tamaño de letra, sigue centrado en los dos ejes.<br>Prueba a hacer zoom.</p>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.banner {
  height: 80px;
  margin-bottom: 10px;
  border: 2px solid #1d4ed8;
  background: #bfdbfe;
}

.banner p {
  margin: 0;
  padding: 0 12px;
  font-size: 0.85rem;
}

/* 🐛 Lo que viste en la lección del contexto inline: vertical-align solo se aplica a
   cajas en línea y a celdas de tabla. En un bloque no hace nada. */
.is-wrong {
  vertical-align: middle;
}

/* ✅ La promesa del módulo anterior. El párrafo es el ÚNICO elemento flex:
   - align-items: center lo coloca en el centro del eje CRUZADO (vertical);
   - justify-content: center, en el centro del eje PRINCIPAL (horizontal).
   El texto DENTRO del párrafo sigue su flujo normal: text-align lo centra línea a línea. */
.is-centered {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
```
