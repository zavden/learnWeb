---
example_description: "Partial<T> acepta también undefined escrito a mano ({ price: undefined }), y al mezclarlo con ... borra el precio; TypeScript dice que el resultado es un Product con price: number. Arreglo: quitar las claves undefined antes de mezclar"
example_tags: "typescript|tipos-de-utilidad|partial|undefined|spread|bug"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
type Product = { id: number; name: string; price: number; stock: number };
type ProductPatch = Partial<Product>;

function applyPatch(product: Product, patch: ProductPatch): Product {
  return { ...product, ...patch };
}

const mole: Product = { id: 7, name: 'Mole negro', price: 165, stock: 12 };

// Un formulario de edición crea el parche con TODAS las claves, y las vacías como undefined:
const priceInput = ''; // el usuario borró el precio sin querer
const patch: ProductPatch = {
  name: 'Mole negro oaxaqueño',
  price: priceInput === '' ? undefined : Number(priceInput),
};

// 🐛 «Opcional» admite tanto «sin la clave» como «la clave con undefined».
// El ... copia el undefined encima del precio, y el tipo sigue diciendo price: number.
const broken = applyPatch(mole, patch);
console.log('🐛 precio →', broken.price);
try {
  console.log(broken.price.toFixed(2));
} catch (error) {
  console.log('🐛', String(error));
}

// ✅ Quitar las claves con undefined antes de mezclar. (Object.fromEntries devuelve un
// objeto con claves string cualesquiera; el tipo de retorno vuelve a decir qué es.)
function definedOnly(patch: ProductPatch): ProductPatch {
  return Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined));
}
const fixed = applyPatch(mole, definedOnly(patch));
console.log('✅', fixed.name, '→', fixed.price.toFixed(2));
// La opción exactOptionalPropertyTypes de tsconfig (no incluida en strict ni activa en
// LearnWeb) haría que price: undefined fuera un error de tipos en el parche.
```
