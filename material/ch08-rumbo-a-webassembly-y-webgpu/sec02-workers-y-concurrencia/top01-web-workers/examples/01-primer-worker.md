---
example_description: "El primer worker: new Worker('archivo.js') ejecuta un script en otro hilo; la página le envía una receta con postMessage, el worker la adapta a 10 personas y responde con su propio postMessage; la respuesta llega después del resto del script, como una tarea"
example_tags: "javascript|workers|postmessage|onmessage|self|terminate|hilos"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Un worker es un archivo de JavaScript que el navegador ejecuta en OTRO hilo.
// Este usa 01-recipe/recipe-worker.js (ábrelo con «Assets»). new Worker no espera
// a que el archivo se descargue: devuelve el objeto Worker y sigue en la línea siguiente.
const worker = new Worker('01-recipe/recipe-worker.js');

// Lo que envía el worker llega como un evento 'message'; los datos, en event.data.
worker.onmessage = (event) => {
  const { name, people, ingredients, scope } = event.data;
  console.log(`página: recibo «${name}» para ${people} personas`);
  for (const { item, amount, unit } of ingredients) console.log(`  ${amount} ${unit} de ${item}`);
  console.log('el worker se ejecutó en →', scope);
  worker.terminate(); // trabajo hecho: cerrar el hilo libera su memoria
};

const recipe = {
  name: 'Pozole rojo',
  people: 4,
  ingredients: [
    { item: 'maíz pozolero', amount: 1, unit: 'kg' },
    { item: 'carne de cerdo', amount: 1.2, unit: 'kg' },
    { item: 'chile guajillo', amount: 6, unit: 'piezas' },
    { item: 'ajo', amount: 4, unit: 'dientes' },
    { item: 'orégano', amount: 1, unit: 'cucharadas' },
  ],
};

console.log('página: envío la receta al worker');
// El mensaje se COPIA: el worker recibe su propio objeto, no este. Si el worker
// aún no ha cargado, el mensaje espera en su cola: no se pierde.
worker.postMessage({ recipe, people: 10 });
console.log('página: sigo con lo mío; la respuesta llegará en una tarea posterior');

// Python: es como multiprocessing.Process con una Queue de ida y otra de vuelta:
// otro «proceso» con su propia memoria, y datos que viajan copiados.
```
