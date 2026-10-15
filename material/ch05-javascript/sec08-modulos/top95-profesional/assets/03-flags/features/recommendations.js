// FUNCIÓN «recommendations» (ejemplo 03), con un error de despliegue: el
// archivo del modelo no se subió. El import falla, y con él este módulo.
import { recommend } from './model.js';

export default {
  label: 'Recomendaciones',
  render(order) {
    return `🛍️ ${recommend(order).join(', ')}`;
  },
};
