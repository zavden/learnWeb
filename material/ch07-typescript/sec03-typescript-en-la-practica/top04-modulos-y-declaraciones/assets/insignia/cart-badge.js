// Define el elemento <cart-badge>: el contador del icono del carrito.
// Importar este módulo tiene un EFECTO: registra el elemento con customElements.define.
export class CartBadge extends HTMLElement {
  #count = 0;

  get count() {
    return this.#count;
  }

  set count(value) {
    this.#count = value;
    this.textContent = `🛒 ${value}`;
    this.setAttribute('aria-label', `${value} productos en el carrito`);
  }

  connectedCallback() {
    this.count = Number(this.getAttribute('count') ?? 0);
  }
}

customElements.define('cart-badge', CartBadge);
console.log('cart-badge.js: <cart-badge> definido');
