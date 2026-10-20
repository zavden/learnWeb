// Declaraciones de precios.js: los mismos nombres, solo con tipos y sin cuerpos.
// En un proyecto real, TypeScript encuentra este archivo solo, porque está junto a
// precios.js y se llama igual. El verificador de LearnWeb NO lo lee: los ejemplos
// copian estas líneas dentro de un bloque `declare module` (ejemplo 4).
export declare const VAT_RATE: number;
export type Currency = 'MXN' | 'USD';
export declare function formatPrice(cents: number, currency?: Currency): string;
export declare function withVat(cents: number): number;
