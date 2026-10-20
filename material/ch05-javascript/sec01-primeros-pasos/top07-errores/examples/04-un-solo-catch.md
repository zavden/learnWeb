---
example_description: "Un solo catch: distinguir el tipo con instanceof y relanzar lo que no sabes manejar"
example_tags: "javascript|python|errores|instanceof|relanzar"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// En Python puedes poner varios except, uno por tipo. JavaScript tiene UN solo
// catch: el tipo se distingue dentro, con instanceof.
function readVolume(raw) {
  try {
    const settings = JSON.parse(raw); // puede lanzar SyntaxError
    if (settings.volume > 100) {
      throw new RangeError(`volume = ${settings.volume}`);
    }
    return settings.volume;           // puede lanzar TypeError si settings es null
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.log('  JSON mal escrito → se usa 50');
      return 50;
    }
    if (error instanceof RangeError) {
      console.log('  fuera de rango → se usa 100');
      return 100;
    }
    throw error; // ← no sé manejarlo: lo relanzo («raise» a secas en Python)
  }
}

for (const raw of ['{"volume": 30}', '{volume: 30}', '{"volume": 500}', 'null']) {
  console.log('▶', raw);
  try {
    console.log('  volumen:', readVolume(raw));
  } catch (error) {
    console.log('  catch exterior (relanzado):', error.name, '|', error.message);
  }
}

// Python:
// try:
//     settings = json.loads(raw)
//     ...
// except json.JSONDecodeError:
//     return 50
// except ValueError:
//     return 100
// (cualquier otra excepción sigue subiendo sola)
```
