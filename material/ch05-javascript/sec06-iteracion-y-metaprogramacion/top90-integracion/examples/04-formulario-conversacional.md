---
example_description: "Un formulario de reservas que conversa: un generador hace las preguntas con yield, recibe las respuestas con next(valor), repite las que no valen y devuelve la reserva con return; return() y throw() lo terminan desde fuera y finally siempre se ejecuta"
example_tags: "javascript|generadores|next|corrutinas|return|finally|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// UN BOT DE RESERVAS PARA UNA FONDA. El generador lleva la conversación:
// entrega cada pregunta con yield, recibe la respuesta con next(respuesta),
// repite lo que no vale y DEVUELVE la reserva terminada con return.
// Lecciones: next(valor), el valor de return, return(), throw() y finally.
const YES_NO = new Map([['sí', true], ['si', true], ['no', false]]);

function parseTime(answer) {
  const [hours, minutes] = answer.split(':').map(Number);
  const valid = Number.isInteger(hours) && Number.isInteger(minutes) && minutes >= 0 && minutes < 60;
  const total = hours * 60 + minutes;
  return valid && total >= 13 * 60 && total <= 22 * 60 ? `${hours}:${String(minutes).padStart(2, '0')}` : null;
}

const QUESTIONS = [
  { field: 'name', text: '¿A nombre de quién?', hint: 'escribe al menos 2 letras', parse: (a) => (a.length >= 2 ? a : null) },
  { field: 'guests', text: '¿Cuántas personas?', hint: 'un número del 1 al 12', parse: (a) => (Number.isInteger(+a) && +a >= 1 && +a <= 12 ? +a : null) },
  { field: 'time', text: '¿A qué hora?', hint: 'entre 13:00 y 22:00', parse: parseTime },
  { field: 'terrace', text: '¿En la terraza?', hint: 'responde sí o no', parse: (a) => YES_NO.get(a.toLowerCase()) ?? null },
];

function* bookingConversation() {
  const booking = {};
  try {
    for (const question of QUESTIONS) {
      let prompt = question.text;
      while (true) {
        const answer = yield prompt; // entrega la pregunta y se pausa hasta la respuesta
        const value = question.parse(String(answer).trim());
        if (value !== null) {
          booking[question.field] = value;
          break;
        }
        prompt = `⚠️ ${question.hint}. ${question.text}`;
      }
    }
    return booking; // el resultado viaja en el último resultado, el de done: true
  } finally {
    console.log('  (conversación cerrada)');
  }
}

// El «chat»: respuestas escritas de antemano. '/cancelar' y '⏰' (nadie
// responde) terminan la conversación desde fuera.
function chat(answers) {
  const conversation = bookingConversation();
  let step = conversation.next(); // arranca hasta la primera pregunta (sin valor: se perdería)
  for (const answer of answers) {
    console.log(`  🤖 ${step.value}`);
    console.log(`  🙋 ${answer}`);
    if (answer === '/cancelar') return conversation.return(null).value; // ejecuta el finally
    if (answer === '⏰') {
      try {
        conversation.throw(new Error('sin respuesta en 5 minutos')); // el error nace en el yield
      } catch (error) {
        console.log(`  ⛔ ${error.message}`);
        return null;
      }
    }
    step = conversation.next(answer);
    if (step.done) return step.value; // aquí, y no con for…of, se recoge el return
  }
}

console.group('Conversación completa (con respuestas que no valen)');
const booking = chat(['Ana Martínez', 'catorce', '14', '4', '23:30', '20:30', 'tal vez', 'sí']);
console.log('✅ reserva →', JSON.stringify(booking));
console.groupEnd();

console.group('El cliente cancela');
console.log('resultado →', chat(['Luis Pérez', '2', '/cancelar']));
console.groupEnd();

console.group('Nadie responde');
console.log('resultado →', chat(['Sofía Ríos', '⏰']));
console.groupEnd();

// > Desde Python: el mismo bot se escribe con send() en vez de next(valor);
//   allí el primer send debe ser None, aquí el valor del primer next() se ignora.
```
