// CATÁLOGO DE TEXTOS EN INGLÉS (ejemplo 05 de «Import dinámico»).
// Las mismas claves que es.js: quien lo use no necesita saber qué idioma cargó.
export const locale = 'en-US';

export const messages = {
  cartTitle: 'Your cart',
  items: (count) => (count === 1 ? '1 item' : `${count} items`),
};
