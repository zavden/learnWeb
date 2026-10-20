---
example_description: "Un programa pequeño en JavaScript con su línea equivalente de Python al lado"
example_tags: "javascript|python|sintaxis"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Cada línea lleva al lado su equivalente en Python.
// No hace falta entender cada detalle: cada pieza tiene su lección más adelante.

const shopName = 'La Tiendita';             // shop_name = "La Tiendita"
const isOpen = true;                        // is_open = True
let discount = null;                        // discount = None
const prices = [3.5, 12, 7.25];             // prices = [3.5, 12, 7.25]
const product = { name: 'Café', stock: 3 }; // product = {"name": "Café", "stock": 3}

function applyTax(price, rate = 0.21) {     // def apply_tax(price, rate=0.21):
  return price * (1 + rate);                //     return price * (1 + rate)
}                                           // (el bloque acaba con la llave)

let total = 0;                              // total = 0
for (const price of prices) {               // for price in prices:
  total += applyTax(price);                 //     total += apply_tax(price)
}

if (product.stock === 0) {                  // if product["stock"] == 0:
  console.log(`${product.name}: agotado`);  //     print(f"{product['name']}: agotado")
} else if (product.stock < 5) {             // elif product["stock"] < 5:
  console.log('Quedan pocas unidades');     //     print("Quedan pocas unidades")
} else {                                    // else:
  console.log('Hay stock');                 //     print("Hay stock")
}

console.log('Abierta:', isOpen && !discount); // print("Abierta:", is_open and not discount)
console.log('Precios:', prices.length);       // print("Precios:", len(prices))
console.log(shopName, '→ total:', total.toFixed(2)); // print(shop_name, "→ total:", f"{total:.2f}")
```
