// WORKER CLÁSICO (ejemplo 03): un script normal, como los de <script> sin type.
// No puede usar import. Para cargar otros scripts tiene importScripts('a.js', 'b.js'),
// que los descarga y ejecuta en orden, de forma síncrona, y deja sus funciones
// globales en self. Este no lo necesita.
self.onmessage = (event) => {
  const total = event.data.reduce((sum, price) => sum + price, 0);
  const text = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(total);
  self.postMessage(text);
};
