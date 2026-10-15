// PLUGIN «chart» (ejemplo 02), a medio escribir: falla AL EVALUARSE (usa una
// función que no existe en su nivel superior). Un módulo que falla al
// evaluarse se queda así en el mapa de módulos: reintentar da el mismo error.
const palette = createPalette(['#7c2d12', '#b45309', '#15803d']);

export default {
  id: 'chart',
  apiVersion: 2,
  run(orders) {
    return `${orders.length} barras con ${palette.length} colores`;
  },
};
