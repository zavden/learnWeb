// AJUSTES DE LA TIENDA (ejemplos 08 y 09 de «Módulos ES»).
// currency es un «let» exportado: quien lo importa ve SIEMPRE su valor
// actual (enlace vivo), pero solo este módulo puede reasignarlo.

export let currency = 'MXN';

export function setCurrency(code) {
  currency = code; // la única forma de cambiarlo: desde dentro
}
