---
example_description: "Un semáforo simulado como máquina de estados: switch sin fallthrough, bucle de reloj, botón de peatón y estado imposible"
example_tags: "javascript|integracion|switch|bucles|maquina-de-estados"
example_stage: intermediate
example_importance: useful
console: true
---

# JavaScript

```javascript
// Integra: const/let (lección 3), switch y for (6), errores (7), ternario (5).
// Un semáforo es una «máquina de estados»: en cada momento está en UN estado,
// y los eventos (el reloj, el botón de peatón) lo hacen pasar a otro.
// function: módulo «Funciones y ámbito»; objetos como datos: «Números, texto y colecciones».

const DURATIONS = { green: 3, yellow: 1, red: 2 }; // segundos simulados
const LABELS = { green: '🟢 verde', yellow: '🟡 ámbar', red: '🔴 rojo' };
const PEDESTRIAN_PRESS_AT = 2; // segundo en el que alguien pulsa el botón

function nextState(state) {
  switch (state) {
    case 'green':
      return 'yellow';
    case 'yellow':
      return 'red';
    case 'red':
      return 'green';
    default:
      // Nunca debería pasar: si pasa, mejor un error claro que un semáforo apagado.
      throw new RangeError(`Estado imposible: «${state}»`);
  }
}

let state = 'green';
let remaining = DURATIONS[state];

for (let second = 1; second <= 10; second++) {
  // El botón de peatón acorta el verde, pero nunca a menos de 1 segundo.
  if (second === PEDESTRIAN_PRESS_AT && state === 'green') {
    remaining = remaining > 1 ? 1 : remaining;
    console.log(`t=${second}s 🚶 botón de peatón pulsado: el verde termina ya`);
  }

  const plural = remaining === 1 ? 'segundo' : 'segundos';
  console.log(`t=${second}s ${LABELS[state]} (queda ${remaining} ${plural})`);

  remaining--;
  if (remaining === 0) {
    state = nextState(state);
    remaining = DURATIONS[state];
  }
}

// Una errata en el estado no pasa en silencio: el default la convierte en error.
try {
  nextState('gren');
} catch (error) {
  console.log('❌', error.name, '|', error.message);
}
```
