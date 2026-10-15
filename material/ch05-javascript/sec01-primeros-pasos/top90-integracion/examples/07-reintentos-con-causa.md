---
example_description: "Reintentar una petición que falla: do…while, try/catch/finally, break según el tipo de error y error.cause al rendirse"
example_tags: "javascript|integracion|errores|cause|do-while|finally"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Integra: do…while y break (lección 6), try/catch/finally, instanceof y cause (7),
// ?? (5) y let/const (3).
// function: módulo «Funciones y ámbito»; arrays y objetos: «Números, texto y colecciones».

// Simulamos un servicio poco fiable con una lista FIJA de respuestas (sin azar,
// para que el resultado sea siempre el mismo).
function requestExchangeRate(scenario, attempt) {
  const outcome = scenario[attempt - 1] ?? 'timeout';
  switch (outcome) {
    case 'ok':
      return 1.0842; // 1 € en dólares
    case 'timeout':
      throw new Error('tiempo de espera agotado');
    case 'bad-data':
      throw new TypeError('la respuesta no trae el campo «rate»');
    default:
      throw new RangeError(`resultado de simulación desconocido: ${outcome}`);
  }
}

function getRateWithRetries(scenario, maxAttempts) {
  let attempt = 0;
  let lastError = null;

  do {
    attempt++;
    try {
      const rate = requestExchangeRate(scenario, attempt);
      console.log(`intento ${attempt}: ✅ ${rate}`);
      return rate;
    } catch (error) {
      lastError = error;
      console.log(`intento ${attempt}: ❌ ${error.message}`);
      if (error instanceof TypeError) {
        // Reintentar no arregla unos datos mal formados: salimos del bucle ya.
        break;
      }
    } finally {
      // Se ejecuta siempre: también tras el return y tras el break.
      console.log(`  (intento ${attempt} cerrado)`);
    }
  } while (attempt < maxAttempts);

  // Error de alto nivel para quien llama, con el original guardado en cause.
  const attempts = attempt === 1 ? '1 intento' : `${attempt} intentos`;
  throw new Error(`no se pudo obtener el tipo de cambio (${attempts})`, { cause: lastError });
}

const scenarios = {
  'falla dos veces y luego responde': ['timeout', 'timeout', 'ok'],
  'el servicio está caído': ['timeout', 'timeout', 'timeout', 'timeout'],
  'responde con datos rotos': ['bad-data', 'ok'],
};

for (const name in scenarios) {
  console.group(`Escenario: ${name}`);
  try {
    const rate = getRateWithRetries(scenarios[name], 3);
    console.log(`100 € = ${(100 * rate).toFixed(2)} $`);
  } catch (error) {
    console.log(`⛔ ${error.message}`);
    console.log(`   causa: ${error.cause.name}: ${error.cause.message}`);
  }
  console.groupEnd();
}
```
