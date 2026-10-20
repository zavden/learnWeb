---
example_description: "En un campo, el atributo value es el valor INICIAL (defaultValue) y la propiedad value, el ACTUAL: lo que escribe el usuario no cambia el atributo, y un setAttribute('value') después ya no cambia lo que se ve. Con checked pasa lo mismo"
example_tags: "javascript|dom|value|defaultvalue|checked|atributos|propiedades|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<p>
  <label for="qty">Cantidad</label>
  <input id="qty" type="number" min="1" value="1">
</p>
<p>
  <label><input id="gift" type="checkbox"> Envolver para regalo</label>
</p>
```

# JavaScript

```javascript
const qty = document.querySelector('#qty');

// Lo que escribe el usuario va a la PROPIEDAD value:
qty.value = '3'; // como si hubiera escrito un 3
console.log('qty.value →', qty.value);
console.log("🐛 getAttribute('value') →", qty.getAttribute('value'));
console.log('defaultValue →', qty.defaultValue); // la propiedad que refleja el ATRIBUTO
console.log('qty →', qty); // la consola enseña los atributos: sigue value="1"

// 🐛 Una vez que el valor ha cambiado, el atributo ya no lo controla:
qty.setAttribute('value', '5');
console.log("🐛 tras setAttribute('value', '5') → value:", qty.value, '| defaultValue:', qty.defaultValue);

// ✅ Para leer o cambiar lo que hay en el campo: la propiedad.
qty.value = '2';
console.log('✅ qty.value = 2 →', qty.value, `(typeof: ${typeof qty.value})`);

// checked funciona igual: el atributo es el estado inicial (defaultChecked).
const gift = document.querySelector('#gift');
gift.checked = true;
console.log('gift.checked →', gift.checked);
console.log("🐛 hasAttribute('checked') →", gift.hasAttribute('checked'));
console.log('defaultChecked →', gift.defaultChecked);

// Los atributos son el estado INICIAL: un form.reset() vuelve a ellos
// (lo verás en el módulo de formularios con JavaScript).
```
