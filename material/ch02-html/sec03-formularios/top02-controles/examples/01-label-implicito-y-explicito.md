---
example_description: "Un label se asocia a su campo con for=\"id\" o envolviéndolo: al pulsar el texto, el campo recibe el foco, y el texto es su nombre accesible"
example_tags: "html|formularios|label|for|nombre-accesible"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<!-- Haz clic en el TEXTO de cada etiqueta: el campo recibe el foco o la casilla se marca. -->
<form action="https://huerta.example/boletin" method="post">
  <!-- Explícito: for apunta al id del campo. El label puede estar en cualquier parte. -->
  <p>
    <label for="email">Correo electrónico</label><br>
    <input id="email" name="email" type="email">
  </p>

  <!-- Implícito: el campo va DENTRO del label; no hace falta id ni for -->
  <p><label><input name="weekly" type="checkbox"> Quiero el resumen semanal</label></p>

  <!-- ❌ for tiene que coincidir con el ID, no con el name: este label no está asociado.
       Al pulsarlo no pasa nada, y el campo no tiene nombre para un lector de pantalla. -->
  <p>
    <label for="city">Ciudad</label><br>
    <input id="user-city" name="city">
  </p>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* El foco siempre visible (:focus-visible: lección de accesibilidad) */
input:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. input.labels es la lista de labels
// asociados a cada campo: su texto es el nombre que anuncia un lector de pantalla.
for (const input of document.querySelectorAll('input')) {
  const label = input.labels[0];
  console.log(`${input.name} →`, label ? `«${label.textContent.trim()}»` : '(sin label: se anuncia solo «campo de texto»)');
}
```
