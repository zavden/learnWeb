// carrito.ts: el código fuente. Con la opción declaration: true, tsc genera a partir
// de él dos archivos: carrito.js (lo que se ejecuta) y carrito.d.ts (solo los tipos).
/** Un carrito de la compra que suma líneas y calcula el total. */
export class Cart {
    currency;
    #lines = [];
    constructor(currency = 'MXN') {
        this.currency = currency;
    }
    /** Añade una línea; si el producto ya está, suma la cantidad. */
    add(line) {
        const existing = this.#lines.find((item) => item.sku === line.sku);
        if (existing)
            existing.qty += line.qty;
        else
            this.#lines.push({ ...line });
        return this;
    }
    /** Número de unidades. */
    get count() {
        return this.#lines.reduce((sum, line) => sum + line.qty, 0);
    }
    /** Total en centavos. */
    get totalCents() {
        return this.#lines.reduce((sum, line) => sum + line.qty * line.cents, 0);
    }
    summary() {
        return `${this.count} productos · ${formatPrice(this.totalCents, this.currency)}`;
    }
}
/** Da formato de moneda a un importe en centavos. */
export function formatPrice(cents, currency = 'MXN') {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(cents / 100);
}
