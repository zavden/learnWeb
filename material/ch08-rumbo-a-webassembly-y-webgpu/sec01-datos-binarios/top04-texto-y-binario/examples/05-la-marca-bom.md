---
example_description: "La marca BOM (ef bb bf en UTF-8, ff fe en UTF-16LE) al principio de un CSV de Excel: TextDecoder la quita por defecto, con ignoreBOM la deja como un U+FEFF invisible que rompe comparaciones, y leída como windows-1252 aparece como «ï»¿»"
example_tags: "javascript|python|textdecoder|bom|utf-8|csv|excel"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Excel, al exportar «CSV UTF-8», empieza el archivo con tres bytes: ef bb bf.
// Es la BOM (byte order mark): U+FEFF codificado en UTF-8. Dice «esto es UTF-8».
const bom = Uint8Array.of(0xef, 0xbb, 0xbf);
const body = new TextEncoder().encode('fecha;ventas\n2026-10-14;1290');
const csv = new Uint8Array(bom.length + body.length);
csv.set(bom);
csv.set(body, bom.length);

// Por defecto, TextDecoder reconoce la BOM de su codificación y la quita.
const header = (text) => text.split('\n')[0].split(';')[0];
const clean = new TextDecoder().decode(csv);
console.log('por defecto →', JSON.stringify(header(clean)), '| === "fecha" →', header(clean) === 'fecha');

// Con ignoreBOM: true, la conserva como el carácter U+FEFF, que no se ve…
const kept = new TextDecoder('utf-8', { ignoreBOM: true }).decode(csv);
console.log('ignoreBOM →', JSON.stringify(header(kept)), '| length →', header(kept).length, '| === "fecha" →', header(kept) === 'fecha');
console.log('primer carácter →', kept.codePointAt(0).toString(16)); // feff: ahí está
// …y leída con otra codificación aparece como basura al principio del texto:
console.log('windows-1252 →', header(new TextDecoder('windows-1252').decode(csv)));

// En UTF-16 la BOM además dice el orden de los bytes: ff fe = little-endian.
const utf16 = Uint8Array.of(0xff, 0xfe, 0x4f, 0x00, 0x6b, 0x00); // BOM + «Ok»
console.log('utf-16le →', JSON.stringify(new TextDecoder('utf-16le').decode(utf16))); // "Ok"

// response.text(), blob.text() y file.text() decodifican como UTF-8 y también la quitan.
// Python: datos.decode('utf-8') la CONSERVA ('﻿…'); hay que usar 'utf-8-sig' para quitarla.
```
