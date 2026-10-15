---
example_description: "TextDecoder convierte bytes en texto con la codificación que le digas: los mismos bytes leídos como utf-8, windows-1252 y utf-16le; un CSV antiguo de Excel en windows-1252 y un .txt «Unicode» de Windows en UTF-16; 'latin1' y 'ascii' son alias de windows-1252"
example_tags: "javascript|python|textdecoder|codificaciones|windows-1252|utf-16|mojibake"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// TextDecoder: bytes → texto, con la codificación que le digas (por defecto, UTF-8).
// Seis bytes, «Café!» escrito en UTF-8, leídos con tres codificaciones:
const bytes = Uint8Array.of(0x43, 0x61, 0x66, 0xc3, 0xa9, 0x21);
for (const label of ['utf-8', 'windows-1252', 'utf-16le']) {
  console.log(`${label.padEnd(12)} → ${new TextDecoder(label).decode(bytes)}`);
}
// windows-1252 lee cada byte como un carácter: c3 a9 («é») se vuelve «Ã©», el mojibake
// de la lección «Anatomía de un documento». utf-16le junta los bytes de 2 en 2.

// Un CSV exportado por un Excel antiguo, en windows-1252: la «ñ» es UN byte (f1) y el «€», 80.
const legacyCsv = Uint8Array.of(
  0x41, 0xf1, 0x6f, 0x3b, 0x50, 0x72, 0x65, 0x63, 0x69, 0x6f, 0x0a, // Año;Precio\n
  0x32, 0x30, 0x32, 0x36, 0x3b, 0x34, 0x35, 0x20, 0x80,             // 2026;45 €
);
console.log('🐛 como UTF-8 →', JSON.stringify(new TextDecoder().decode(legacyCsv)));
console.log('✅ como windows-1252 →', JSON.stringify(new TextDecoder('windows-1252').decode(legacyCsv)));

// Un .txt guardado como «Unicode» en el Bloc de notas de Windows: UTF-16 little-endian.
const notepad = Uint8Array.of(0x48, 0x00, 0x6f, 0x00, 0x6c, 0x00, 0x61, 0x00);
console.log('✅ como utf-16le →', new TextDecoder('utf-16le').decode(notepad));

// Las etiquetas tienen alias; encoding dice el nombre real. Ojo: 'latin1' y 'ascii'
// son windows-1252 para el navegador (es lo que hace la web con las páginas antiguas).
for (const label of ['utf8', 'latin1', 'ascii', 'utf-16']) {
  console.log(`'${label}' →`, new TextDecoder(label).encoding);
}

// TextEncoder no tiene etiquetas: solo escribe UTF-8. Leer, cualquier codificación;
// escribir, solo UTF-8 (la que debes usar siempre).
// Python: datos.decode('cp1252'), datos.decode('utf-16-le'); 'ñ'.encode('cp1252') → b'\xf1'.
```
