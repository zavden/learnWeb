/** Una línea del carrito. Los precios van en centavos. */
export type CartLine = {
    sku: string;
    name: string;
    qty: number;
    cents: number;
};
/** Un carrito de la compra que suma líneas y calcula el total. */
export declare class Cart {
    #private;
    private readonly currency;
    constructor(currency?: 'MXN' | 'USD');
    /** Añade una línea; si el producto ya está, suma la cantidad. */
    add(line: CartLine): this;
    /** Número de unidades. */
    get count(): number;
    /** Total en centavos. */
    get totalCents(): number;
    summary(): string;
}
/** Da formato de moneda a un importe en centavos. */
export declare function formatPrice(cents: number, currency?: 'MXN' | 'USD'): string;
