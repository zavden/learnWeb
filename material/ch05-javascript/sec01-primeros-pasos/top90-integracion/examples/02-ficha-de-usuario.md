---
example_description: "Ficha de usuario con datos incompletos: ?. y ?? para lo que falta, || solo donde '' significa «vacío», === para booleanos"
example_tags: "javascript|integracion|null|undefined|nullish|optional-chaining"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Integra: null y undefined (lección 4), ?. ?? || y ternario (5), if/else if (6).
// function se estudia en «Funciones y ámbito»; los objetos como datos, en
// «Números, texto y colecciones».

// Datos tal como llegarían de una API: incompletos, y con «vacíos» que son datos reales.
const users = [
  {
    name: 'Lucía Fernández',
    nickname: 'lucia_dev',
    unreadMessages: 3,
    address: { city: 'Valencia', country: 'España' },
    settings: { newsletter: false },
  },
  {
    name: 'Tomás Reyes',
    nickname: '',          // eligió no tener apodo
    unreadMessages: 0,     // 0 es un dato, no «falta el dato»
    address: null,         // prefirió no dar su dirección
    settings: { newsletter: true },
  },
  {
    name: 'Ana Ito',
    // nickname, unreadMessages, address y settings no llegaron: son undefined
  },
];

function describeUser(user) {
  // Aquí SÍ queremos tratar '' como «sin apodo»: || es la herramienta adecuada.
  const nickname = user.nickname || 'sin apodo';

  // ?? solo sustituye null o undefined: el 0 se respeta.
  const unread = user.unreadMessages ?? 'desconocido';
  const bell = typeof unread === 'number' && unread > 0 ? ` 🔔${unread}` : '';

  // ?. evita el TypeError cuando address es null o no existe.
  const city = user.address?.city ?? 'sin dirección';

  // newsletter puede ser false: comparamos con === para no confundir
  // «no quiere» (false) con «no lo sabemos» (undefined).
  let newsletter;
  if (user.settings?.newsletter === true) {
    newsletter = 'suscrito';
  } else if (user.settings?.newsletter === false) {
    newsletter = 'no suscrito';
  } else {
    newsletter = 'sin preferencia guardada';
  }

  return `${user.name} (${nickname})${bell}\n` +
    `   ciudad: ${city}\n` +
    `   mensajes sin leer: ${unread}\n` +
    `   newsletter: ${newsletter}`;
}

for (const user of users) {
  console.log(describeUser(user));
}

// La versión ingenua con || pierde un dato real (el 0 de Tomás):
const tomas = users[1];
console.log("🐛 unreadMessages || 'desconocido' →", tomas.unreadMessages || 'desconocido');
console.log("✅ unreadMessages ?? 'desconocido' →", tomas.unreadMessages ?? 'desconocido');
```
