---
example_description: "Lookahead y lookbehind miran sin consumir: importes después de $, reglas de contraseña (una regex por regla para decir qué falta), separador de miles y una frontera de palabra que conoce la é"
example_tags: "javascript|regex|lookahead|lookbehind|validacion|contrasena"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Miran lo que hay delante o detrás SIN incluirlo en la coincidencia:
// (?=…) detrás viene…   (?!…) detrás NO viene…   (?<=…) antes hay…   (?<!…) antes NO hay…

// 1. Importes que van después de un $, sin el $:
const ticket = 'Café $210.00, envío $50, propina 10% y código 2026';
console.log('(?<=\\$) →', ticket.match(/(?<=\$)\d+(?:\.\d{2})?/g));

// 2. Reglas de contraseña. Cada (?=.*X) mira desde el principio sin avanzar:
const strong = /^(?=.*\d)(?=.*\p{Lu})(?=.*[^\p{L}\d]).{12,}$/u;
console.log('una regex →', strong.test('tomates-en-octubre'), strong.test('Tomates-en-octubre1'));
// Para el usuario es mejor una regex por regla: así puedes decirle QUÉ falta.
const rules = [
  { label: '12 caracteres o más', regex: /^.{12,}$/u },
  { label: 'una cifra', regex: /\d/ },
  { label: 'una mayúscula', regex: /\p{Lu}/u },
  { label: 'un signo', regex: /[^\p{L}\d]/u },
];
const password = 'tomates-en-octubre';
console.log('falta →', rules.filter((rule) => !rule.regex.test(password)).map((rule) => rule.label));

// 3. Separador de miles: posiciones dentro del número (\B) seguidas de grupos
//    de 3 cifras hasta el final. (Para personas, Intl.NumberFormat: «Fechas e Intl».)
console.log('miles →', ['1234567', '1000', '999'].map((n) => n.replace(/\B(?=(?:\d{3})+(?!\d))/g, ',')));

// 4. Una frontera de palabra que conoce la é (\b no la conoce): ni letra antes ni letra después.
const word = /(?<!\p{L})café(?!\p{L})/u;
console.log('palabra «café» →', word.test('Un café, por favor'), word.test('Abre la cafetería'));
```
