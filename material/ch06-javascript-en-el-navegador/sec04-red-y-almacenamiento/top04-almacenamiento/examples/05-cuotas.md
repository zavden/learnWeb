---
example_description: "Los límites del almacenamiento: localStorage admite unos pocos MB por origen y setItem lanza QuotaExceededError al pasarse (hay que atraparlo); navigator.storage.estimate() da la cuota mucho mayor de IndexedDB y la Cache API"
example_tags: "javascript|localstorage|cuota|quotaexceedederror|storage-estimate|indexeddb"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// 1. localStorage: unos pocos MB por origen. Intentamos guardar 12 millones
//    de caracteres (y lo borramos pase lo que pase).
const BIG_KEY = 'lw-almacen-prueba-cuota';
try {
  localStorage.setItem(BIG_KEY, 'x'.repeat(12 * 1024 * 1024));
  console.log('se guardó: esto no es un localStorage real (¿una tarjeta de la teoría?)');
} catch (error) {
  console.log('setItem de 12 M caracteres →', error.name, '| ¿DOMException? →', error instanceof DOMException);
} finally {
  localStorage.removeItem(BIG_KEY);
}

// Un guardado que no tumba la página: avisa y sigue.
function trySave(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (error.name !== 'QuotaExceededError') throw error;
    console.warn(`sin espacio para «${key}»: la app sigue sin guardarlo`);
    return false;
  }
}
console.log('trySave pequeño →', trySave('lw-almacen-preferencia', 'mxn'));
localStorage.removeItem('lw-almacen-preferencia');

// 2. Para IndexedDB y la Cache API, la cuota es una parte del disco.
//    estimate() da bytes aproximados; aquí solo imprimimos hechos estables.
try {
  const { usage, quota } = await navigator.storage.estimate();
  console.log('cuota del origen mayor que 1 GB →', quota > 1024 ** 3);
  console.log('lo usado cabe en la cuota →', usage < quota);
} catch (error) {
  console.log(`estimate() no está disponible aquí (${error.name}): ábrelo con ▶ o en el editor`);
}

// navigator.storage.persist() pide que el navegador no borre los datos del
// origen cuando falte espacio; sin él, son «de mejor esfuerzo».
```
