---
example_description: "Modificadores en los tipos mapeados: readonly y ? se añaden; -readonly y -? se quitan (y -? también quita el undefined). Un mapeo sobre keyof T conserva los modificadores originales"
example_tags: "typescript|tipos-mapeados|readonly|opcionales|modificadores"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// Opciones de la tienda: currency es de solo lectura y dos son opcionales.
type ShopOptions = { readonly currency?: string; taxRate?: number; storeName: string };

// Añadir modificadores: readonly delante, ? detrás de [K in keyof T].
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type MyPartial<T> = { [K in keyof T]?: T[K] };
// Quitarlos: -readonly y -? (el ? también se lleva el undefined que añadía).
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type Complete<T> = { [K in keyof T]-?: T[K] };

type Checks = [
  Expect<Equal<MyPartial<ShopOptions>, { readonly currency?: string; taxRate?: number; storeName?: string }>>,
  Expect<Equal<Mutable<ShopOptions>, { currency?: string; taxRate?: number; storeName: string }>>,
  // Sin -readonly, el mapeo CONSERVA el readonly de currency:
  Expect<Equal<Complete<ShopOptions>, { readonly currency: string; taxRate: number; storeName: string }>>,
];

const DEFAULTS: Complete<ShopOptions> = { currency: 'MXN', taxRate: 0.16, storeName: 'Tienda' };

// Las opciones pueden venir incompletas; el resultado está completo y es de solo lectura.
function withDefaults(options: ShopOptions): MyReadonly<Complete<ShopOptions>> {
  return { ...DEFAULTS, ...options };
}

const settings = withDefaults({ storeName: 'La Casa del Mole', taxRate: 0.08 });
console.log(settings.storeName, '·', settings.currency, '·', `${settings.taxRate * 100} %`);
// settings.taxRate = 0 sería un error TS2540: MyReadonly lo hizo de solo lectura.
```
