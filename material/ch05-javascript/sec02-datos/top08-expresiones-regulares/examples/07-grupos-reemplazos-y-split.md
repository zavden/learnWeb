---
example_description: "Grupos que capturan (match[1]), con nombre ((?<year>…) y match.groups) y sin capturar ((?:…)); replace con $1, $<nombre>, $& o una función; split con una regex"
example_tags: "javascript|regex|grupos|replace|split|python"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// ( ) CAPTURA: lo que encaja dentro queda en match[1], match[2]…
const delivery = 'Entrega: 2026-10-14, de 9:00 a 14:00';
const date = delivery.match(/(\d{4})-(\d{2})-(\d{2})/);
console.log('grupos →', date[1], date[2], date[3], '| todo →', date[0]);

// (?<nombre>…) captura CON NOMBRE: match.groups.nombre (en Python, (?P<nombre>…))
const isoDate = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const { year, month, day } = delivery.match(isoDate).groups;
console.log('groups →', year, month, day);

// (?:…) agrupa SIN capturar: para aplicar ? o | a un trozo
const phone = /^(?:\+52 )?(\d{2}) (\d{4}) (\d{4})$/;
console.log('teléfono →', phone.exec('+52 55 1234 5678').slice(1));

// replace con una regex: $1, $2… son los grupos, $<nombre> los grupos con nombre
// y $& la coincidencia entera (en Python, \1 y \g<nombre> en re.sub).
console.log('$<…> →', '2026-10-14'.replace(isoDate, '$<day>/$<month>/$<year>'));
console.log('$1 →', 'Tel. 5512345678'.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3'));
console.log('$& →', 'Envío gratis desde $500'.replace(/gratis/, '«$&»'));

// Con una FUNCIÓN, cada coincidencia se sustituye por lo que devuelve.
// Recibe la coincidencia y después cada grupo: (match, grupo1, grupo2…)
const recipe = 'Harina 500g, azúcar 250g y mantequilla 125g';
console.log('×2 →', recipe.replace(/(\d+)g/g, (match, grams) => `${Number(grams) * 2}g`));

// split con una regex: cualquier separador (como /\s+/ en la lección «Strings»)
console.log('split →', 'harina, azúcar ;huevos;  leche'.split(/\s*[,;]\s*/));
// Si el separador tiene un grupo que captura, split también lo devuelve
console.log('con grupo →', '12+3*4'.split(/([+*])/));
```
