// MÓDULO DE DINERO DE LA TIENDA (ejemplos 01 y 05 de «Módulos ES»).
// Lo que lleva «export» se puede importar desde otros archivos;
// todo lo demás es privado de este archivo, sin IIFE ni closures.

const VAT_RATE = 0.16; // IVA en México: privado (no se exporta)

const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

function roundCents(value) { // privada: solo la usa este archivo
  return Math.round(value);
}

export const CURRENCY = 'MXN';

export function addVat(cents) {
  return roundCents(cents * (1 + VAT_RATE));
}

export function formatPrice(cents) {
  return formatter.format(cents / 100);
}
