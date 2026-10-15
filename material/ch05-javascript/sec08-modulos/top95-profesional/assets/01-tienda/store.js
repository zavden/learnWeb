// ESTADO DE LA TIENDA (ejemplo 01).
// createStore RECIBE la API (inyección de dependencias): la aplicación le
// pasa la de verdad y una prueba podría pasarle una falsa. El estado es
// privado; getState() devuelve una instantánea congelada y subscribe()
// avisa de cada cambio (el patrón observador del módulo 5).

export function createStore(api) {
  let state = Object.freeze({
    category: 'all',
    products: [],
    cart: Object.freeze({}), // sku → cantidad
    status: 'idle', // idle | loading | ready | ordering | error
    message: '',
    lastOrderId: null,
  });
  const listeners = new Set();

  function setState(changes) {
    state = Object.freeze({ ...state, ...changes });
    for (const listener of [...listeners]) listener(state);
  }

  async function loadProducts(category = state.category) {
    setState({ category, status: 'loading', message: 'Cargando productos…' });
    const products = await api.listProducts({ category });
    setState({ products: Object.freeze(products.map(Object.freeze)), status: 'ready', message: '' });
  }

  function productBySku(sku) {
    return state.products.find((product) => product.sku === sku);
  }

  return {
    getState: () => state,

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    loadProducts,

    addToCart(sku) {
      const product = productBySku(sku);
      if (!product) throw new RangeError(`Producto desconocido: ${sku}`);
      const quantity = (state.cart[sku] ?? 0) + 1;
      if (quantity > product.stock) {
        setState({ message: product.stock === 0 ? `${product.name} está agotado` : `No hay más existencias de ${product.name}` });
        return false;
      }
      setState({ cart: Object.freeze({ ...state.cart, [sku]: quantity }), message: `${product.name} en el carrito` });
      return true;
    },

    removeFromCart(sku) {
      const { [sku]: removed, ...rest } = state.cart;
      if (removed !== undefined) setState({ cart: Object.freeze(rest), message: 'Producto quitado' });
    },

    async checkout() {
      const lines = Object.entries(state.cart).map(([sku, quantity]) => ({ sku, quantity }));
      if (lines.length === 0) return null;
      setState({ status: 'ordering', message: 'Enviando el pedido…' });
      try {
        const { orderId } = await api.placeOrder(lines);
        await loadProducts(); // las existencias cambiaron
        setState({ cart: Object.freeze({}), message: `Pedido ${orderId} confirmado`, lastOrderId: orderId });
        return orderId;
      } catch (error) {
        setState({ status: 'error', message: error.message });
        return null;
      }
    },
  };
}

// Selectores: funciones puras que calculan datos derivados del estado.
export function cartLines(state) {
  return Object.entries(state.cart).map(([sku, quantity]) => {
    const product = state.products.find((item) => item.sku === sku);
    return { sku, quantity, name: product?.name ?? sku, cents: product?.cents ?? 0 };
  });
}

export function cartTotalCents(state) {
  return cartLines(state).reduce((sum, line) => sum + line.cents * line.quantity, 0);
}
