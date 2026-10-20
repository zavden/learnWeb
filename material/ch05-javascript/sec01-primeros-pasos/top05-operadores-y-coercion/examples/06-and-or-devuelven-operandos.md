---
example_description: "&& y || devuelven uno de sus operandos (como and/or en Python) y cortocircuitan"
example_tags: "javascript|python|operadores|logicos|cortocircuito"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// && y || NO devuelven true/false: devuelven UNO DE LOS OPERANDOS,
// exactamente igual que and / or en Python.
console.log("'Ada' || 'anónimo' →", 'Ada' || 'anónimo'); // 'Ada'
console.log("'' || 'anónimo' →", '' || 'anónimo');       // 'anónimo'
console.log("'Ada' && 'admin' →", 'Ada' && 'admin');     // 'admin'
console.log("null && 'admin' →", null && 'admin');       // null

// Regla:
//   a || b  → a si a es truthy; si no, b
//   a && b  → a si a es falsy;  si no, b

// Cortocircuito: si con el primer operando basta, el segundo NI SE EVALÚA.
function expensive() {
  console.log('   (expensive se ha ejecutado)');
  return 'resultado';
}
console.log('true || expensive() →', true || expensive());   // no la llama
console.log('false || expensive() →', false || expensive()); // sí la llama
// (El aviso de expensive sale ANTES de esa línea: los argumentos de
// console.log se calculan antes de imprimir.)

// Patrón habitual: && como «si existe, haz esto».
const user = { name: 'Ada' };
user && console.log('user existe; su nombre es', user.name);

// ! siempre devuelve un booleano; !! convierte cualquier valor a booleano.
console.log("!'' →", !'', "| !!'texto' →", !!'texto'); // true, true
```
