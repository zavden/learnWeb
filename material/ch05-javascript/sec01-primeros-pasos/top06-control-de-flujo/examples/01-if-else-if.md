---
example_description: "if / else if / else (el elif de Python) y la condición convertida a booleano"
example_tags: "javascript|python|control-de-flujo|if"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// if / else if / else: el elif de Python se escribe «else if».
const score = 7.5;

if (score >= 9) {
  console.log(score, '→ Sobresaliente');
} else if (score >= 7) {
  console.log(score, '→ Notable');
} else if (score >= 5) {
  console.log(score, '→ Aprobado');
} else {
  console.log(score, '→ Suspenso');
}

// La condición se convierte a booleano con las reglas truthy/falsy (lección 5).
const nickname = '';
if (nickname) {
  console.log('Hola,', nickname);
} else {
  console.log('Sin apodo: el string vacío es falsy');
}

// Python:
// if score >= 9:
//     print(score, "→ Sobresaliente")
// elif score >= 7:
//     print(score, "→ Notable")
// elif score >= 5:
//     print(score, "→ Aprobado")
// else:
//     print(score, "→ Suspenso")
```
