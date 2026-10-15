---
example_description: "document.cookie a grandes rasgos: cada asignación crea o cambia UNA cookie con sus atributos (Max-Age, Path, SameSite); leer da un único string «nombre=valor; …» sin atributos; los valores se codifican; una cookie HttpOnly no se puede crear ni leer desde JS; se borra con Max-Age=0"
example_tags: "javascript|cookies|document-cookie|samesite|httponly|max-age"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Las cookies no distinguen puertos: las de esta vista previa (localhost:3001)
// también las ve la app de LearnWeb (localhost:5174). Este ejemplo borra las
// suyas al final, y solo lee las que empiezan por «lw-almacen-».
const PREFIX = 'lw-almacen-';
function ourCookies() {
  const result = {};
  for (const pair of document.cookie.split('; ')) {
    const [cookieName, ...rest] = pair.split('=');
    if (cookieName.startsWith(PREFIX)) result[cookieName] = rest.join('=');
  }
  return result;
}

// Escribir: cada asignación crea o actualiza UNA cookie (no sustituye las demás).
document.cookie = `${PREFIX}moneda=MXN; Max-Age=600; Path=/; SameSite=Lax`;
document.cookie = `${PREFIX}idioma=es-MX; Max-Age=600; Path=/; SameSite=Lax`;
console.log('nuestras cookies →', ourCookies());

document.cookie = `${PREFIX}moneda=USD; Max-Age=600; Path=/; SameSite=Lax`;
console.log('tras cambiar la moneda →', ourCookies());
// (En Chrome, la cookie actualizada pasa al final de document.cookie: no cuentes con
// ningún orden, busca cada cookie por su nombre.)

// Leer devuelve solo «nombre=valor»: los atributos no se ven.
console.log('¿se lee el Max-Age? →', document.cookie.includes('Max-Age'));

// «;», «,» y espacios rompen el formato: codifica el valor.
document.cookie = `${PREFIX}busqueda=${encodeURIComponent('café; de olla')}; Max-Age=600; Path=/; SameSite=Lax`;
const stored = ourCookies()[`${PREFIX}busqueda`];
console.log('guardado →', stored, '| leído →', decodeURIComponent(stored));

// HttpOnly es solo para el servidor (Set-Cookie): desde JS, el navegador ignora la cookie entera.
document.cookie = `${PREFIX}sesion=abc123; HttpOnly; Max-Age=600; Path=/`;
console.log('¿existe la cookie HttpOnly creada desde JS? →', `${PREFIX}sesion` in ourCookies());

// Borrar: la misma cookie (nombre + Path) con Max-Age=0.
for (const cookieName of Object.keys(ourCookies())) {
  document.cookie = `${cookieName}=; Max-Age=0; Path=/`;
}
console.log('tras borrar →', ourCookies());

// Cada cookie viaja en CADA petición a su sitio (cabecera Cookie): por eso son
// pequeñas (≈ 4 KB cada una) y para guardar datos de la página se prefiere
// localStorage o IndexedDB. Las cookies sirven sobre todo para que el
// SERVIDOR reconozca la sesión.
```
