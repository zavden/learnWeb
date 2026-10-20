---
example_description: "Un tipo de objeto lista sus propiedades y el tipo de cada una: en línea en un parámetro o con nombre (type), con objetos anidados y arrays de objetos; equivale a un TypedDict de Python"
example_tags: "typescript|python|objetos|type|typeddict"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
// Un tipo de objeto: qué propiedades tiene y de qué tipo es cada una.
// Se puede escribir en línea, directamente en el parámetro…
function formatAddress(address: { street: string; city: string; zip: string }): string {
  return `${address.street}, ${address.zip} ${address.city}`;
}

// …pero lo normal es darle un nombre con type y reutilizarlo.
type Address = {
  street: string;
  city: string;
  zip: string; // los códigos postales son texto: '68000', no 68000
};

type Restaurant = {
  name: string;
  address: Address; // un tipo de objeto dentro de otro
  dishes: string[];
  rating: number;
};

const fonda: Restaurant = {
  name: 'Fonda Doña Mica',
  address: { street: 'Calle Macedonio Alcalá 302', city: 'Oaxaca', zip: '68000' },
  dishes: ['Tlayuda', 'Mole negro', 'Tasajo'],
  rating: 4.7,
};

// Un array de objetos de ese tipo: Restaurant[]
const guide: Restaurant[] = [fonda];

console.log(fonda.name, '·', formatAddress(fonda.address));
console.log('platos →', fonda.dishes.join(', '), '| nota →', fonda.rating);
console.log('restaurantes en la guía →', guide.length);

// > Desde Python: class Address(TypedDict): street: str; city: str; zip: str
//   Igual que un TypedDict, el tipo describe un objeto normal (un dict en
//   Python): no crea ninguna clase ni cambia el objeto en ejecución.
```
