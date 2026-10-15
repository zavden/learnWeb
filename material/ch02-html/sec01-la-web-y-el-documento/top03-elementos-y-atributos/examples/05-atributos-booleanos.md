---
example_description: "disabled=\"false\" sigue desactivado: los atributos booleanos van por presencia"
example_tags: "atributos|booleanos|disabled|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<!-- Un atributo booleano funciona por PRESENCIA, no por su valor:
     si está escrito, está activado, ponga lo que ponga. -->
<p><button type="button" disabled>disabled</button> desactivado ✅</p>
<p><button type="button" disabled="disabled">disabled="disabled"</button> desactivado ✅</p>

<!-- 🐛 Estos dos TAMBIÉN están desactivados: el navegador ni mira el valor -->
<p><button type="button" disabled="false">disabled="false"</button> ¡también desactivado!</p>
<p><button type="button" disabled="no">disabled="no"</button> ¡también desactivado!</p>

<!-- ✅ La única forma de que no esté desactivado: no escribir el atributo -->
<p><button type="button">sin atributo</button> activo</p>

<!-- Igual con checked, hidden, required, readonly, multiple, open… -->
<p><label><input type="checkbox" checked="false"> checked="false" → ¡marcada!</label></p>
```

# JavaScript

```javascript
// La propiedad .disabled (JavaScript) vale true si el atributo EXISTE, sea cual sea su valor.
// querySelectorAll y el bucle for…of se explican en los capítulos de JavaScript.
for (const button of document.querySelectorAll('button')) {
  console.log(button.textContent.padEnd(19), '→ disabled:', button.disabled);
}
console.log('checkbox con checked="false" → checked:', document.querySelector('input').checked);
```
