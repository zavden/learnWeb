---
example_description: "Máscaras y flags: los permisos de un álbum compartido guardados en un solo número, un bit por permiso; | combina, & pregunta, &= ~ apaga, ^= alterna, y los permisos de archivos de Unix (0o754) son lo mismo en octal"
example_tags: "javascript|python|bits|mascaras|flags|permisos|octal"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Permisos de un álbum de fotos compartido: cada permiso es UN bit (una potencia de 2).
const VIEW = 1 << 0;    // 0001
const COMMENT = 1 << 1; // 0010
const UPLOAD = 1 << 2;  // 0100
const REMOVE = 1 << 3;  // 1000
const bits4 = (n) => n.toString(2).padStart(4, '0');

// Combinar con | : un solo número guarda cuatro respuestas de sí/no.
let guest = VIEW | COMMENT;
console.log('invitada →', guest, bits4(guest)); // 3 0011

// Preguntar con & : la máscara deja pasar solo el bit que interesa.
const can = (flags, permission) => (flags & permission) !== 0;
console.log('¿puede comentar? →', can(guest, COMMENT)); // true
console.log('¿puede borrar? →', can(guest, REMOVE));    // false

// Encender con |= , apagar con &= ~ , alternar con ^= .
guest |= UPLOAD;
console.log('+ subir →', bits4(guest));          // 0111
guest &= ~COMMENT;                               // ~COMMENT = todos a 1 menos ese bit
console.log('- comentar →', bits4(guest));       // 0101
guest ^= REMOVE;
console.log('alternar borrar →', bits4(guest));  // 1101
guest ^= REMOVE;
console.log('alternar otra vez →', bits4(guest)); // 0101

// ¿Tiene TODOS los permisos de una máscara? (flags & mask) === mask
const EDITOR = VIEW | COMMENT | UPLOAD;
console.log('¿es editora? →', (guest & EDITOR) === EDITOR); // false: le falta comentar

// De número a lista legible, recorriendo los bits:
const NAMES = [[VIEW, 'ver'], [COMMENT, 'comentar'], [UPLOAD, 'subir'], [REMOVE, 'borrar']];
const describe = (flags) => NAMES.filter(([bit]) => flags & bit).map(([, name]) => name);
console.log('permisos →', describe(guest)); // ['ver', 'subir']

// Los permisos de archivos de Unix son lo mismo, en octal: cada cifra octal son 3 bits
// (leer 4, escribir 2, ejecutar 1) para el dueño, el grupo y el resto.
const mode = 0o754;
const rwx = (n) => (n & 4 ? 'r' : '-') + (n & 2 ? 'w' : '-') + (n & 1 ? 'x' : '-');
console.log('0o754 →', mode.toString(2), '→', rwx(mode >> 6) + rwx((mode >> 3) & 0b111) + rwx(mode & 0b111));
```
