// INTERFAZ (ejemplo 01): lo único que toca el DOM.
// createElement, textContent, append, addEventListener: capítulo 6.
// Dentro de la carpeta se importa de los archivos hermanos, no del barrel:
// así un barrel que algún día reexporte ui.js no crearía un ciclo.
import { cartLines, cartTotalCents, itemCount } from './cart.js';
import { formatPrice, plural } from './format.js';

export function renderCatalog(list, products, onAdd) {
  for (const product of products) {
    const item = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = `${product.name} · ${formatPrice(product.cents)}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Añadir';
    button.setAttribute('aria-label', `Añadir ${product.name}`);
    button.addEventListener('click', () => onAdd(product.sku)); // sin onclick="…"
    item.append(label, button);
    list.append(item);
  }
}

export function renderSummary(output) {
  const names = cartLines().map((line) => `${line.quantity} × ${line.name}`);
  output.textContent = itemCount === 0
    ? 'Tu carrito está vacío'
    : `🛒 ${plural(itemCount, 'producto', 'productos')} · ${formatPrice(cartTotalCents())} (${names.join(', ')})`;
}
