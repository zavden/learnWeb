// WORKER DEL EJEMPLO 08 (de módulo): precio por unidad de un lote.
self.onmessage = (event) => {
  const { product, total, units } = event.data;
  if (units <= 0) throw new RangeError(`unidades no válidas para ${product}: ${units}`); // nadie lo atrapa aquí
  self.postMessage(`${product}: $${total / units} por unidad`);
};
