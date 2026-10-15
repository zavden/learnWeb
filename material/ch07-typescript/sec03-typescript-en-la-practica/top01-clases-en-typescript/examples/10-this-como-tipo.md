---
example_description: "Métodos encadenables que devuelven this: el tipo this es «la clase del objeto», así que una subclase conserva sus métodos propios en mitad de la cadena. Con un static de fábrica y un campo static #privado, como en el capítulo 5"
example_tags: "typescript|clases|this|static|encadenar|builder|urlsearchparams"
example_stage: minimal
example_importance: useful
console: true
---

# TypeScript

```typescript
// Construye la URL de una búsqueda del catálogo, paso a paso.
class SearchUrl {
  static #created = 0; // privado y de la clase, no de cada objeto
  protected params = new URLSearchParams();

  constructor(private readonly path: string) {
    SearchUrl.#created += 1;
  }

  static get created(): number {
    return SearchUrl.#created;
  }

  where(key: string, value: string): this { // this: el tipo del objeto, sea cual sea su clase
    this.params.set(key, value);
    return this;
  }

  limit(count: number): this {
    return this.where('limit', String(count));
  }

  toString(): string {
    return `${this.path}?${this.params}`;
  }
}

class ProductSearch extends SearchUrl {
  static forCategory(category: string): ProductSearch { // un static de fábrica
    return new ProductSearch('/api/demo/echo').where('category', category);
  }

  inStock(): this {
    return this.where('stock', 'available');
  }
}

// limit() se escribió en SearchUrl, pero devuelve un ProductSearch: inStock() sigue disponible.
const search = ProductSearch.forCategory('café').limit(5).inStock();
console.log(String(search));
console.log('¿ProductSearch? →', search instanceof ProductSearch, '| URLs creadas →', SearchUrl.created);
// Si limit() devolviera SearchUrl en vez de this, .inStock() sería TS2339:
// «Property 'inStock' does not exist on type 'SearchUrl'».
```
