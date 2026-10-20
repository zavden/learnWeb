// CATÁLOGO DE TEXTOS EN ESPAÑOL (ejemplo 05 de «Import dinámico»).
// La tienda carga solo el catálogo del idioma de la persona, con import().
export const locale = 'es-MX';

export const messages = {
  cartTitle: 'Tu carrito',
  items: (count) => (count === 1 ? '1 producto' : `${count} productos`),
};
