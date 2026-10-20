---
example_description: "Una regex con g guarda lastIndex: test() con la misma regex alterna true y false y un filtro pierde elementos. Al revés, replaceAll y matchAll exigen g y sin él lanzan TypeError"
example_tags: "javascript|regex|flag-g|lastindex|replaceall|matchall|typeerror|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Con el flag g, la regex GUARDA ESTADO: lastIndex, la posición desde la que
// seguirá buscando. test y exec empiezan ahí y, si encuentran, la dejan después.
const coffee = /café/gi;

// 🐛 El mismo test sobre el mismo texto alterna true y false:
console.log('🐛 1.º →', coffee.test('Café de Chiapas'), '| lastIndex →', coffee.lastIndex);
console.log('🐛 2.º →', coffee.test('Café de Chiapas'), '| lastIndex →', coffee.lastIndex);
console.log('🐛 3.º →', coffee.test('Café de Chiapas'), '| lastIndex →', coffee.lastIndex);

// 🐛 …y en un filtro se pierden elementos (cada test hereda el lastIndex del anterior):
const products = ['Café de Chiapas', 'Café de olla', 'Cacao de Tabasco', 'Café de Veracruz'];
coffee.lastIndex = 0;
console.log('🐛 filter →', products.filter((name) => coffee.test(name)));

// ✅ Para preguntar «¿aparece?» no hace falta g: sin g no hay estado.
const coffeeAnywhere = /café/i;
console.log('✅ filter →', products.filter((name) => coffeeAnywhere.test(name)));

// 🐛 Al revés: replaceAll y matchAll EXIGEN g. Sin él, TypeError.
const pantry = 'café, cacao,vainilla';
try {
  pantry.replaceAll(/,\s*/, ' · ');
} catch (error) {
  console.log('🐛', error.name, '|', error.message);
}
try {
  console.log([...pantry.matchAll(/\p{L}+/u)]);
} catch (error) {
  console.log('🐛', error.name, '|', error.message);
}
// ✅ Con g. (replace con g hace lo mismo; replaceAll deja claro que esperas varias.)
console.log('✅ replaceAll →', pantry.replaceAll(/,\s*/g, ' · '));
console.log('✅ matchAll →', [...pantry.matchAll(/\p{L}+/gu)].map((match) => match[0]));
```
