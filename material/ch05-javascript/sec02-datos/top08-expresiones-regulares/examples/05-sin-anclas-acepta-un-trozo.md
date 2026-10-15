---
example_description: "Sin ^ y $, test responde «¿aparece en algún sitio?»: «12345abc» pasa un control de «solo cifras». Las anclas obligan a encajar el valor entero (el re.fullmatch de Python), y el flag m las convierte en anclas de línea: nunca en un validador"
example_tags: "javascript|regex|anclas|validacion|flag-m|python|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
const values = ['12345', '12345abc', 'abc12345', 'CP 50001', ''];

// 🐛 Una regex busca el patrón EN CUALQUIER PARTE: basta con un trozo que encaje.
const digits = /\d+/;
console.log('🐛 /\\d+/ →', values.map((value) => digits.test(value)));

// ✅ ^ (principio) y $ (final) obligan a que el patrón ocupe el valor ENTERO.
const onlyDigits = /^\d+$/;
console.log('✅ /^\\d+$/ →', values.map((value) => onlyDigits.test(value)));
// En Python: re.search busca dentro y re.fullmatch exige el valor entero.
// El atributo pattern de HTML añade las anclas por ti (pattern="\d+" es /^(?:\d+)$/v).

// Con el flag m (multilínea), ^ y $ marcan el principio y el final de CADA LÍNEA:
const inventory = 'CAF-500\nnota: revisar el lote\nCAC-250';
console.log('sin m →', inventory.match(/^[A-Z]{3}-\d{3}$/g));
console.log('con m →', inventory.match(/^[A-Z]{3}-\d{3}$/gm));

// 🐛 Por eso m nunca va en un validador: basta con que UNA línea sea buena.
const postalCode = '50001\n<img src=x onerror=robar()>';
console.log('🐛 /^\\d{5}$/m →', /^\d{5}$/m.test(postalCode));
console.log('✅ /^\\d{5}$/ →', /^\d{5}$/.test(postalCode));
```
