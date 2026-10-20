// INTERFAZ DE LA TIENDA (ejemplo 01): el único módulo que toca el DOM.
// createElement, append, replaceChildren y addEventListener son del
// capítulo 6; aquí se usan lo justo para pintar el estado y escuchar clics.
// La interfaz no cambia el estado: llama a las acciones del store y se
// vuelve a pintar cuando el store avisa.
import { formatPrice, formatCount } from './format.js';
import { cartLines, cartTotalCents } from './store.js';

const CATEGORIES = [
  ['all', 'Todo'],
  ['cafe', 'Café'],
  ['equipo', 'Equipo'],
  ['accesorios', 'Accesorios'],
];

// h('button', { type: 'button', onClick: fn, 'aria-label': '…' }, 'texto')
function h(tag, props = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('on')) element.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key in element) element[key] = value; // propiedades: textContent, disabled, type, className…
    else element.setAttribute(key, value); // atributos: aria-*, data-*…
  }
  element.append(...children);
  return element;
}

export function mountShop(root, store) {
  const filters = h('nav', { className: 'filters', 'aria-label': 'Categorías' });
  const grid = h('ul', { className: 'products' });
  const catalog = h('section', { className: 'catalog', 'aria-labelledby': 'catalog-title' },
    h('h2', { id: 'catalog-title' }, 'Productos'), grid);
  const cartList = h('ul', { className: 'cart-lines' });
  const total = h('p', { className: 'cart-total' });
  const payButton = h('button', { type: 'button', className: 'pay', onClick: () => store.checkout() }, 'Pagar');
  const cart = h('aside', { className: 'cart', 'aria-labelledby': 'cart-title' },
    h('h2', { id: 'cart-title' }, 'Tu carrito'), cartList, total, payButton);
  const status = h('p', { className: 'status', role: 'status' });

  for (const [id, label] of CATEGORIES) {
    filters.append(h('button', { type: 'button', 'data-category': id, onClick: () => store.loadProducts(id) }, label));
  }
  root.replaceChildren(filters, h('div', { className: 'layout' }, catalog, cart), status);

  function render(state) {
    for (const button of filters.children) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-category') === state.category));
    }

    grid.setAttribute('aria-busy', String(state.status === 'loading'));
    grid.replaceChildren(...state.products.map((product) => h('li', { className: 'product' },
      h('h3', {}, product.name),
      h('p', { className: 'price' }, formatPrice(product.cents)),
      h('p', { className: 'stock' }, product.stock > 0 ? formatCount(product.stock, 'disponible', 'disponibles') : 'Agotado'),
      h('button', {
        type: 'button',
        disabled: product.stock === 0,
        'aria-label': `Añadir ${product.name}`,
        onClick: () => store.addToCart(product.sku),
      }, 'Añadir'),
    )));

    const lines = cartLines(state);
    cartList.replaceChildren(...lines.map((line) => h('li', {},
      h('span', {}, `${line.quantity} × ${line.name}`),
      h('button', { type: 'button', className: 'remove', 'aria-label': `Quitar ${line.name}`, onClick: () => store.removeFromCart(line.sku) }, 'Quitar'),
    )));
    total.textContent = lines.length > 0 ? `Total: ${formatPrice(cartTotalCents(state))}` : 'Todavía no hay productos';
    payButton.disabled = lines.length === 0 || state.status === 'ordering';
    status.textContent = state.message;
  }

  render(store.getState());
  return store.subscribe(render); // devuelve la función para desmontar
}
