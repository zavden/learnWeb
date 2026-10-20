---
example_description: "Los temporizadores anidados nunca bajan de 4 ms: una cadena de 100 setTimeout(…, 0), cada uno programado desde el anterior, tarda cientos de milisegundos aunque no haga nada; la misma cadena con MessageChannel no tiene ese mínimo"
example_tags: "javascript|settimeout|temporizadores|messagechannel|rendimiento|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Un trabajo troceado en 100 rebanadas MUY cortas, encadenadas: cada rebanada
// programa la siguiente con setTimeout(…, 0). Aquí las rebanadas no hacen
// nada: solo medimos lo que cuesta ceder el turno 100 veces.
const HOPS = 100;

function chainWithTimeouts(done) {
  const delays = [];
  let last = performance.now();
  function hop() {
    const now = performance.now();
    delays.push(now - last);
    last = now;
    if (delays.length < HOPS) setTimeout(hop, 0); // ← programado DESDE un temporizador
    else done(delays);
  }
  setTimeout(hop, 0);
}

function chainWithMessages(done) {
  const { port1, port2 } = new MessageChannel();
  const delays = [];
  let last = performance.now();
  port1.onmessage = () => {
    const now = performance.now();
    delays.push(now - last);
    last = now;
    if (delays.length < HOPS) {
      port2.postMessage(null);
    } else {
      port1.close();
      done(delays);
    }
  };
  port2.postMessage(null);
}

const sum = (values) => values.reduce((total, value) => total + value, 0);
const average = (values) => sum(values) / values.length;

chainWithTimeouts((delays) => {
  const total = sum(delays);
  console.log('🐛 100 setTimeout(…, 0) encadenados tardan ≥ 300 ms →', total >= 300);
  console.log(`   (≈ ${Math.round(total)} ms; varía)`);
  console.log('   los 4 primeros saltos, < 2 ms de media →', average(delays.slice(0, 4)) < 2);
  console.log('   los 50 últimos, ≥ 3.5 ms de media →', average(delays.slice(-50)) >= 3.5);

  chainWithMessages((messageDelays) => {
    const messagesTotal = sum(messageDelays);
    console.log('✅ 100 mensajes encadenados tardan < 100 ms →', messagesTotal < 100);
    console.log(`   (≈ ${messagesTotal.toFixed(1)} ms; varía)`);
  });
});

// Por qué: el estándar HTML dice que, a partir del 5.º temporizador ANIDADO
// (programado desde el callback de otro, que a su vez…), un retraso menor de
// 4 ms se convierte en 4 ms. Nació para frenar páginas antiguas que hacían
// bucles con setTimeout(…, 0) y quemaban la CPU.
// Consecuencia: trocear trabajo con setTimeout(…, 0) añade ≈ 4 ms por rebanada.
// Con rebanadas de 10 ms es poco; con rebanadas diminutas, el total se dispara.
// Por eso los planificadores usan MessageChannel o, en Chrome 129+,
// scheduler.yield() (lección «Frames de animación y tiempo»).
// (En pestañas en segundo plano, Chrome espacia los temporizadores a 1 s o más.)
```
