---
example_description: "Encadenar errores con { cause }: el raise … from … de Python"
example_tags: "javascript|python|errores|cause"
example_stage: intermediate
example_importance: useful
console: true
---

# JavaScript

```javascript
// Al traducir un error de bajo nivel a uno con sentido para tu programa,
// guarda el original en cause: no pierdes la información de qué falló de verdad.
// Es el «raise ConfigError(...) from error» de Python.
function parseConfig(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('La configuración no es válida', { cause: error });
  }
}

try {
  parseConfig('{ "theme": "dark", }'); // coma final: JSON no la admite
} catch (error) {
  console.log('error →', error.message);
  console.log('causa →', error.cause.name, '|', error.cause.message);

  // Expándelo en la consola: verás la propiedad cause con el error original.
  console.log(error);
}
```
