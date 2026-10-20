---
example_description: "Introducción a IndexedDB con una envoltura de promesas mínima: abrir una base con versión (upgradeneeded crea el almacén), escribir en una transacción readwrite, leer por clave y todo, y subir a la versión 2 para añadir un índice; los objetos se guardan con clonado estructurado (una fecha sigue siendo Date)"
example_tags: "javascript|indexeddb|transacciones|versiones|indices|promesas"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// IndexedDB es anterior a las promesas: cada operación es una «petición»
// (IDBRequest) que avisa con los eventos success y error. Dos envolturas:
function promisify(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

// Abrir con una versión: si la base es más antigua (o no existe), salta
// upgradeneeded, el ÚNICO momento en que se pueden crear almacenes e índices.
function openDatabase(dbName, version, upgrade) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);
    request.onupgradeneeded = (event) => upgrade(request.result, event.oldVersion, request.transaction);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const DB_NAME = 'lw-almacen-recetario';
try {
  await promisify(indexedDB.deleteDatabase(DB_NAME)); // empezar de cero en cada ejecución

  // Versión 1: un almacén «recipes» cuya clave es la propiedad id.
  let db = await openDatabase(DB_NAME, 1, (database, oldVersion) => {
    console.log(`⬆️ upgrade v${oldVersion} → v1: creo el almacén «recipes»`);
    database.createObjectStore('recipes', { keyPath: 'id' });
  });

  const writing = db.transaction('recipes', 'readwrite');
  const store = writing.objectStore('recipes');
  store.put({ id: 'mole-poblano', title: 'Mole poblano', minutes: 180, tags: ['salado', 'fiesta'], addedAt: new Date('2026-10-14T18:30:00Z') });
  store.put({ id: 'flan', title: 'Flan napolitano', minutes: 60, tags: ['postre'], addedAt: new Date('2026-10-12T16:00:00Z') });
  store.put({ id: 'sopa-de-lima', title: 'Sopa de lima', minutes: 75, tags: ['salado'], addedAt: new Date('2026-10-10T20:15:00Z') });
  await transactionDone(writing); // las tres escrituras, todas o ninguna
  console.log('✅ 3 recetas guardadas');

  const mole = await promisify(db.transaction('recipes').objectStore('recipes').get('mole-poblano'));
  console.log('get(mole-poblano) →', mole.title, '| tags:', mole.tags, '| addedAt es Date:', mole.addedAt instanceof Date);
  const all = await promisify(db.transaction('recipes').objectStore('recipes').getAll());
  console.log('getAll() (en orden de clave) →', all.map((recipe) => recipe.id));
  db.close();

  // Versión 2: un índice para buscar por tiempo de preparación.
  db = await openDatabase(DB_NAME, 2, (database, oldVersion, upgradeTransaction) => {
    console.log(`⬆️ upgrade v${oldVersion} → v2: añado el índice «byMinutes»`);
    upgradeTransaction.objectStore('recipes').createIndex('byMinutes', 'minutes');
  });
  const quick = await promisify(
    db.transaction('recipes').objectStore('recipes').index('byMinutes').getAll(IDBKeyRange.upperBound(90)),
  );
  console.log('90 minutos o menos →', quick.map((recipe) => `${recipe.title} (${recipe.minutes})`));
  db.close();
  await promisify(indexedDB.deleteDatabase(DB_NAME)); // limpieza
  console.log('🗑️ base borrada');
} catch (error) {
  // En una tarjeta de la teoría (iframe aislado), indexedDB.open lanza SecurityError.
  console.log(`⚠️ ${error.name}: esta tarjeta es un iframe aislado (origen null); ábrela con ▶ o en el editor`);
}

// Las transacciones se cierran solas en cuanto no les queda trabajo: dentro
// de una, no esperes a otra cosa (un fetch, un setTimeout) o la siguiente
// operación fallará con TransactionInactiveError.
```
