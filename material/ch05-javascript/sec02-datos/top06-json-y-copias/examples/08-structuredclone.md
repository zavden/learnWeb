---
example_description: "structuredClone hace una copia profunda que conserva Date, Map, Set y referencias circulares; el truco JSON las pierde"
example_tags: "javascript|python|copias|structuredClone|deepcopy"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
const project = {
  name: 'Tienda',
  deadline: new Date(Date.UTC(2026, 11, 1)),
  members: new Set(['ana', 'luis']),
  config: { theme: { primary: '#1d4ed8' } },
};
project.self = project;   // referencia circular

// ✅ Copia profunda (deep copy): todos los niveles son nuevos.
const clone = structuredClone(project);
clone.config.theme.primary = '#dc2626';
console.log('original primary →', project.config.theme.primary);   // '#1d4ed8'
console.log('deadline sigue siendo Date →', clone.deadline instanceof Date);   // true
console.log('members sigue siendo Set →', clone.members instanceof Set);       // true
console.log('el ciclo se conserva →', clone.self === clone);                    // true

// ❌ El truco JSON.parse(JSON.stringify(x)) es una copia profunda MUY limitada:
const withoutCycle = { ...project, self: undefined };
const viaJson = JSON.parse(JSON.stringify(withoutCycle));
console.log('JSON: deadline →', typeof viaJson.deadline);   // 'string'
console.log('JSON: members →', viaJson.members);            // {} (el Set se pierde)
try {
  JSON.stringify(project);   // con el ciclo, ni siquiera funciona
} catch (error) {
  console.log('JSON con ciclo →', error.name);
}

// structuredClone no copia funciones (ni métodos): lanza DataCloneError.
try {
  structuredClone({ run() {} });
} catch (error) {
  console.log('con una función →', error.name);
}
```
