// IMPUESTOS (ejemplo 08 de «Organizar el código»).
// Lo que necesitaban los dos lados del ciclo, en un módulo propio que no
// importa nada: el ciclo desaparece.
export const TAX_RATE = 0.16;

export function withTax(cents) {
  return Math.round(cents * (1 + TAX_RATE));
}
