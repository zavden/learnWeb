---
example_description: "Spread, Object.assign y slice copian solo el primer nivel: los objetos anidados siguen compartidos entre original y copia"
example_tags: "javascript|python|copias|spread|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
const settings = { theme: 'dark', editor: { fontSize: 14, tabs: [2, 4] } };

// Tres formas de COPIA SUPERFICIAL (shallow copy): crean un objeto nuevo,
// pero sus propiedades apuntan a los mismos valores que el original.
const spread = { ...settings };
const assigned = Object.assign({}, settings);
console.log('spread === settings →', spread === settings);   // false: el contenedor sí es nuevo

spread.theme = 'light';                       // primer nivel: independiente
console.log('settings.theme →', settings.theme);   // 'dark' ✅

// 🐛 Pero el objeto anidado es el MISMO en todas las copias.
spread.editor.fontSize = 20;
console.log('settings.editor.fontSize →', settings.editor.fontSize);   // 20 ❌
console.log('assigned.editor.fontSize →', assigned.editor.fontSize);   // 20 ❌
console.log('spread.editor === settings.editor →', spread.editor === settings.editor);   // true

// Con arrays pasa lo mismo: slice(), [...arr] y Array.from son superficiales.
const matrix = [[1, 2], [3, 4]];
const rows = matrix.slice();
rows[0].push(99);
console.log('matrix[0] →', matrix[0]);   // [1, 2, 99]

// ✅ Para copiar todos los niveles usa structuredClone (siguiente ejemplo).
// > Desde Python: es la diferencia entre copy.copy y copy.deepcopy.
```
