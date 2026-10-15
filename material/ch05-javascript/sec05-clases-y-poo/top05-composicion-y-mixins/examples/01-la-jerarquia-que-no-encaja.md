---
example_description: "Una jerarquía rígida: una subclase hereda un método que no tiene sentido para ella y lo anula con un error que rompe el código polimórfico; y combinar opciones con herencia multiplica las clases"
example_tags: "javascript|python|clases|herencia|composicion|diseno|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Todos los documentos se pueden imprimir y compartir… ¿todos?
class OfficeDocument {
  constructor(title) {
    this.title = title;
  }
  print() {
    return `🖨️ ${this.title}`;
  }
  share(email) {
    return `📤 «${this.title}» compartido con ${email}`;
  }
}
class Invoice extends OfficeDocument {}
class Contract extends OfficeDocument {}

// 🐛 Una nota privada ES un documento… pero no se debe compartir.
// La única salida dentro de la jerarquía es sobrescribir y lanzar un error.
class PrivateNote extends OfficeDocument {
  share() {
    throw new Error(`«${this.title}» es privada: no se puede compartir`);
  }
}

// El código polimórfico confiaba en que todo OfficeDocument sabe share():
const documents = [new Invoice('Factura F-118'), new PrivateNote('Claves del banco'), new Contract('Contrato de alquiler')];
try {
  for (const doc of documents) console.log(doc.share('gestoria@example.com'));
} catch (error) {
  console.log('🐛 el bucle se corta →', error.message);
}
// La subclase no puede sustituir a su padre: rompe lo que el padre prometía.

// 🐛 Segundo síntoma: combinar opciones independientes con herencia.
// Canales (email, SMS, push) × «con reintentos» × «con registro» × «cifrado»:
const channels = ['Email', 'Sms', 'Push'];
const options = ['Retrying', 'Logging', 'Encrypted'];
const classesNeeded = channels.length * 2 ** options.length; // cada opción: con o sin
console.log(`🐛 clases necesarias → ${classesNeeded}, como LoggingEncryptedRetryingSmsNotifier`);

// ✅ Las dos cosas se arreglan dejando de meter capacidades en el árbol:
//    compartir es algo que algunos documentos TIENEN (doc.share?.(), o un objeto
//    «compartidor» aparte), y reintentos, registro y cifrado son piezas que se
//    combinan (composición, en el ejemplo siguiente).

// > Desde Python: el mismo problema; Python lo suaviza con la herencia múltiple,
//   que JavaScript no tiene.
```
