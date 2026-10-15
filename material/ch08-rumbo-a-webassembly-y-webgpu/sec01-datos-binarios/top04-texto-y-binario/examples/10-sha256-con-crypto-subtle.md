---
example_description: "crypto.subtle.digest('SHA-256', bytes) calcula la huella de unos bytes: siempre 32 bytes, que se escriben en hex; un punto de diferencia cambia la huella entera, y comparar huellas comprueba que un archivo llegó intacto"
example_tags: "javascript|python|crypto|sha-256|hash|bytes|hex"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Ayudante: bytes → hex (en Chrome también vale new Uint8Array(buffer).toHex()).
const toHex = (buffer) => Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');
const encoder = new TextEncoder();

// SHA-256 resume CUALQUIER cantidad de bytes en 32 bytes: su «huella».
// Recibe bytes (no texto) y devuelve una promesa de un ArrayBuffer.
async function sha256(text) {
  return toHex(await crypto.subtle.digest('SHA-256', encoder.encode(text)));
}

console.log('Web a fondo  →', await sha256('Web a fondo'));
// Un solo carácter de diferencia cambia la huella entera (efecto avalancha):
console.log('Web a fondo. →', await sha256('Web a fondo.'));
// La misma entrada da siempre la misma huella, en cualquier máquina y lenguaje:
console.log('¿determinista? →', (await sha256('Web a fondo')) === (await sha256('Web a fondo')));
const digest = await crypto.subtle.digest('SHA-256', encoder.encode(''));
console.log('huella →', digest.byteLength, 'bytes =', toHex(digest).length, 'cifras hex');

// Uso real: comprobar que un archivo descargado está intacto comparando su huella
// con la que publica el autor (los atributos integrity de <script> hacen esto mismo).
const published = 'a4811f6f8a2b1312563978b8ed52f957bf84cf33249defc8af96ea76b861ae61';
const received = 'fecha;ventas\n2026-10-14;1290\n';
const tampered = 'fecha;ventas\n2026-10-14;9290\n'; // alguien cambió una cifra
console.log('¿intacto? →', (await sha256(received)) === published);
console.log('¿intacto el alterado? →', (await sha256(tampered)) === published);

// crypto.getRandomValues llena un typed array con bytes aleatorios de calidad criptográfica.
// (Nunca imprimas el valor en un ejemplo: cambia en cada ejecución.)
const token = crypto.getRandomValues(new Uint8Array(16));
console.log('token →', token.length, 'bytes aleatorios | ¿todos de 0 a 255? →', token.every((byte) => byte >= 0 && byte <= 255));

// Python: hashlib.sha256('Web a fondo'.encode()).hexdigest() da la misma huella,
// y secrets.token_bytes(16) son 16 bytes aleatorios.
```
