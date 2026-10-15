---
example_description: "Desestructurar objetos: sacar propiedades a variables, renombrar, valores por defecto, anidados y ...resto"
example_tags: "javascript|python|objetos|desestructuracion"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Respuesta típica de una API de usuarios.
const response = {
  id: 7,
  name: 'Lucía Romero',
  email: 'lucia@example.com',
  password: 'hash$2b$10$…',
  address: { city: 'Valencia', zip: '46001' },
};

// Sacar propiedades a variables con el mismo nombre:
const { name, email } = response;
console.log('name →', name, '| email →', email);
// En Python: name, email = response['name'], response['email']

// Renombrar con «clave: nuevoNombre» (útil si el nombre ya está ocupado):
const { id: userId } = response;
console.log('userId →', userId); // 7

// Valores por defecto si la propiedad no existe (o vale undefined):
const { role = 'lector', theme = 'claro' } = response;
console.log('role →', role, '| theme →', theme);

// Renombrar y dar un valor por defecto a la vez:
const { language: lang = 'es' } = response;
console.log('lang →', lang);

// Anidados: el patrón imita la forma del objeto.
const { address: { city } } = response;
console.log('city →', city); // 'Valencia' (address no se crea como variable)

// ...resto recoge las propiedades que quedan: quitar datos sensibles sin mutar.
const { password, ...publicProfile } = response;
console.log('publicProfile →', publicProfile); // todo menos password

// 🐛 Para desestructurar en variables YA declaradas, la línea entera va entre
// paréntesis: sin ellos, el { inicial se lee como un bloque y es un SyntaxError.
let total;
let currency;
({ total, currency } = { total: 42.5, currency: 'EUR' });
console.log('total →', total, currency);
```
