---
example_description: "Llamar con menos argumentos no da error (valen undefined) y los que sobran se ignoran; en Python ambos casos lanzan TypeError"
example_tags: "javascript|python|funciones|parametros|argumentos"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
function describeTrip(origin, destination) {
  return `Viaje de ${origin} a ${destination}`;
}

// Con los argumentos justos, como en Python.
console.log(describeTrip('Quito', 'Lima')); // 'Viaje de Quito a Lima'

// Con MENOS argumentos no hay error: el parámetro que falta vale undefined.
// Python lanzaría: TypeError: describe_trip() missing 1 required positional argument
console.log(describeTrip('Quito')); // 'Viaje de Quito a undefined'

// Con MÁS argumentos tampoco: los que sobran se ignoran sin aviso.
// Python lanzaría: TypeError: describe_trip() takes 2 positional arguments but 3 were given
console.log(describeTrip('Quito', 'Lima', 'Cusco')); // 'Viaje de Quito a Lima'

// length dice cuántos parámetros DECLARA la función (no cuántos recibe).
console.log('describeTrip.length →', describeTrip.length); // 2

// Si un parámetro es obligatorio, compruébalo tú y lanza el error.
function describeTripStrict(origin, destination) {
  if (destination === undefined) {
    throw new TypeError('describeTripStrict: falta el destino');
  }
  return `Viaje de ${origin} a ${destination}`;
}
try {
  describeTripStrict('Quito');
} catch (error) {
  console.log('Atrapado →', error.name, '|', error.message);
}

// Por qué JavaScript es tan permisivo: muchas APIs llaman a tus funciones con
// MÁS argumentos de los que usas. map pasa (elemento, índice, array), y tu
// callback puede declarar solo el primero:
console.log(['a', 'b'].map((letter) => letter.toUpperCase())); // ['A', 'B']
```
