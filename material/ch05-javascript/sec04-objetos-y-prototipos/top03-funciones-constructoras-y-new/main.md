# Funciones constructoras y new

## Por qué importa

En la lección «La palabra clave this» usaste `new Product('Lámpara', 2400)` con una función constructora mínima y quedó una promesa pendiente: explicar qué hace `new` paso a paso y para qué sirve `prototype`. Esta lección la cumple. Con la cadena de prototipos de la lección anterior ya tienes todas las piezas, y verás que `new` es poco más que `Object.create` más una llamada con `this`.

Las funciones constructoras fueron durante veinte años **la** forma de crear muchos objetos del mismo tipo en JavaScript, y siguen siendo el mecanismo que hay debajo de las clases del módulo siguiente. Aquí está además el nombre más confuso del lenguaje: la propiedad `prototype` de una función **no** es su prototipo. Cuando termines, sabrás distinguir los dos, implementar `new` e `instanceof` a mano y leer cualquier diagrama de prototipos.

## Muchos objetos del mismo tipo

Para crear cien productos necesitas una función que los fabrique. La versión más directa es una **fábrica** que devuelve un literal con sus métodos, pero así cada objeto lleva su propia copia de cada método: mil productos, mil funciones `describe` idénticas. La alternativa es la de la lección anterior: los métodos en un prototipo común, creado una vez, y cada objeto creado con `Object.create`:

[[exercise:01-fabrica-frente-a-prototipo.md-]]

```text
fábrica ingenua → 1000 funciones
con prototipo   → 1 función
```

La receta de la segunda fábrica (crear un objeto con el prototipo, rellenar sus datos, devolverlo) es tan habitual que el lenguaje la trae integrada: es lo que hacen `new` y la propiedad `prototype`.

## La propiedad `prototype` de las funciones

Toda función escrita con `function` nace con una propiedad llamada `prototype`. Su valor es un objeto casi vacío con una sola propiedad, `constructor`, que apunta de vuelta a la función. Ese objeto es el lugar previsto para los **métodos compartidos**:

```text
Product ── .prototype ──► Product.prototype { constructor, describe }
   ▲                                │
   └────────── .constructor ────────┘
```

Son dos objetos distintos que se apuntan mutuamente: la **función** `Product` (que inicializa los datos) y el objeto `Product.prototype` (que guarda los métodos). La consola enseña `Product.prototype` como `{constructor: ƒ, describe: ƒ}`: incluye `constructor` aunque no sea enumerable porque, al ser un prototipo, enseña también sus propiedades ocultas.

[[exercise:02-la-propiedad-prototype.md-]]

Solo las funciones que pueden usarse con `new` tienen `prototype`:

| Función | ¿Tiene `prototype`? | ¿`new` funciona? |
|---------|---------------------|------------------|
| `function Product() {}` (declaración o expresión) | sí | sí |
| flecha `() => {}` | no | `TypeError: … is not a constructor` |
| método abreviado `{ format() {} }` | no | `TypeError` |
| `class Product {}` (módulo siguiente) | sí | solo con `new` |

## Qué hace `new` paso a paso

`new Product('Lámpara de mesa', 2400)` hace cuatro cosas:

1. Crea un objeto vacío.
2. Le pone como `[[Prototype]]` el objeto `Product.prototype`.
3. Llama a `Product` con `this` apuntando a ese objeto y con los argumentos.
4. Devuelve el objeto (salvo que `Product` devuelva otro objeto).

```text
new Product('Lámpara de mesa', 2400)

  1.  obj = {}
  2.  obj ──[[Prototype]]──► Product.prototype { constructor, describe, applyDiscount }
  3.  Product.call(obj, 'Lámpara de mesa', 2400)    → obj.title, obj.cents
  4.  return obj

  lamp { title, cents } ──► Product.prototype ──► Object.prototype ──► null
```

El resultado es el reparto que recomendaba la lección anterior: los **datos**, propios de cada objeto (los escribe la constructora en `this`); los **métodos**, una sola vez en el prototipo. Ejecuta el ejemplo y expande `lamp` en la consola: verás `title` y `cents`, después `[[Prototype]]: Product.prototype` con los métodos y, dentro, `[[Prototype]]: Object.prototype`. Fíjate también en la vista previa: `Product {title: 'Lámpara de mesa', cents: 2400}`. La consola escribe delante el nombre de la constructora.

[[exercise:03-que-hace-new.md-]]

> **Desde Python:** llamar a una clase, `Product('Lámpara', 2400)`, hace lo mismo: `__new__` crea la instancia (pasos 1 y 2) y `__init__(self, …)` la inicializa (paso 3). La función constructora de JavaScript es el `__init__`, y `Product.prototype` hace el papel del `__dict__` de la clase, donde viven los métodos.

### `myNew`: `new` hecho a mano

Los pasos 1 y 2 son `Object.create(Product.prototype)`; el paso 3 es `Product.apply(obj, args)` (lección «La palabra clave this»). Con eso, `new` cabe en cuatro líneas:

```js
function myNew(Constructor, ...args) {
  const instance = Object.create(Constructor.prototype);         // 1 y 2
  const result = Constructor.apply(instance, args);               // 3
  const returnedObject = (typeof result === 'object' && result !== null) || typeof result === 'function';
  return returnedObject ? result : instance;                      // 4
}
```

El ejemplo la compara con el `new` de verdad en tres casos: una constructora normal, una que devuelve otro objeto y una que devuelve un primitivo.

[[exercise:04-implementar-mynew.md-]]

```text
new   → Booking {guest: 'Carmen Vidal', nights: 3}
myNew → Booking {guest: 'Carmen Vidal', nights: 3}
¿mismo prototipo? → true
instanceof → true
new Draft   → {title: 'Informe trimestral', status: 'borrador'}
myNew Draft → {title: 'Informe trimestral', status: 'borrador'}
new Counter   → Counter {count: 0}
myNew Counter → Counter {count: 0}
```

### Constructoras que devuelven un objeto

El paso 4 tiene un uso real: una constructora que **reutiliza** instancias. Si al crear una moneda ya existe una con ese código, la constructora devuelve la guardada y `new` descarta el objeto recién creado. Un `return` de un valor primitivo, en cambio, se ignora. Salvo para casos así, no escribas `return` en una constructora.

[[exercise:05-return-en-un-constructor.md-]]

## `F.prototype` no es el prototipo de `F`

Aquí está la confusión más famosa de JavaScript. Hay dos cosas con nombres casi iguales:

- `[[Prototype]]` es el **enlace interno** que tiene cada objeto (y que se lee con `Object.getPrototypeOf`).
- `prototype` es una **propiedad normal** que tienen las funciones constructoras.

La propiedad `Product.prototype` no es el `[[Prototype]]` de `Product`. `Product` es una función, y su `[[Prototype]]` es `Function.prototype` (de ahí sacan todas las funciones `call`, `apply` y `bind`). `Product.prototype` es el objeto que se convertirá en el `[[Prototype]]` de los objetos que **cree** `Product` con `new`:

```text
Product (función) ──[[Prototype]]──► Function.prototype  (call, apply, bind…)
   │
   └── .prototype ──► Product.prototype { constructor, describe } ──[[Prototype]]──► Object.prototype
                            ▲
lamp { title, cents } ──────┘ [[Prototype]]
```

Una forma de recordarlo: lee `Product.prototype` como «el prototipo **para las instancias** de `Product`». De ahí salen tres errores típicos: creer que `Object.getPrototypeOf(Product)` es `Product.prototype`, buscar `lamp.prototype` en una instancia (no existe: las instancias no tienen esa propiedad) y añadir métodos a la función (`Product.applyDiscount = …`) en lugar de a su `prototype`:

[[exercise:06-prototype-no-es-el-prototipo.md-]]

```text
🐛 ¿getPrototypeOf(Product) === Product.prototype? → false
✅ el [[Prototype]] de Product es Function.prototype → true
✅ Product.prototype es el [[Prototype]] de sus instancias → true
🐛 lamp.prototype → undefined
🐛 lamp.applyDiscount → TypeError | lamp.applyDiscount is not a function
```

Lo que se pone en la propia función (`Product.applyDiscount`) no lo hereda nadie: es una función **estática**, como `Object.keys` o `Array.from`, que se llama como `Product.algo(…)`. Tiene sus usos (lo verás en la lección «Prototipos nativos»), pero no sirve como método de las instancias.

> **Desde Python:** en Python un solo objeto, la clase, hace los dos papeles: se llama para crear instancias y guarda los métodos en su `__dict__`. En JavaScript son **dos** objetos: la función (que se llama) y su `prototype` (que guarda los métodos). Y `type(Product)` es `type` en Python, mientras que `Object.getPrototypeOf(Product)` es `Function.prototype` en JavaScript.

### Reemplazar `prototype` entero

Escribir `Product.prototype.metodo = …` una y otra vez es pesado, y es tentador sustituir el objeto completo por un literal: `Coupon.prototype = { apply() {…}, describe() {…} }`. Tiene dos efectos secundarios. Los objetos creados **antes** siguen enlazados al prototipo viejo (no tienen los métodos nuevos y, como `instanceof` busca el `prototype` actual, ya no son `instanceof Coupon`). Y el literal no tiene `constructor`, así que la búsqueda de `obj.constructor` llega a `Object.prototype` y devuelve `Object`:

[[exercise:07-reemplazar-el-prototype.md-]]

La solución más sencilla es **añadir** al objeto que ya existe, una propiedad cada vez o de golpe con `Object.assign(Product.prototype, { … })`. Si prefieres reemplazarlo, hazlo antes de crear ningún objeto y restaura `constructor` como no enumerable con `Object.defineProperty`.

## La propiedad `constructor`

Gracias a `Product.prototype.constructor`, todo objeto creado con `new Product` «sabe» qué función lo creó: `lamp.constructor` es una propiedad heredada que apunta a `Product`. Sirve para crear otro objeto del mismo tipo sin saber cuál es (`new source.constructor()`) y para mostrar nombres (`lamp.constructor.name`). Pero es una propiedad normal, que se puede tapar o cambiar, así que no sirve para comprobar tipos:

[[exercise:08-la-propiedad-constructor.md-]]

> **Desde Python:** `lamp.constructor` se parece a `type(lamp)`, y `lamp.constructor.name` a `type(lamp).__name__`. La diferencia es la fiabilidad: `type()` pregunta al intérprete, mientras que `constructor` es un dato que cualquiera puede sobrescribir.

## `instanceof` por dentro

`value instanceof F` no pregunta «¿lo creó `F`?», sino «¿aparece `F.prototype` en la cadena de `value`?». El algoritmo es el `whereIs` de la lección anterior con otra pregunta:

1. Si `value` es un primitivo, `false`.
2. Recorre la cadena de `value` con `Object.getPrototypeOf`.
3. Si algún eslabón es exactamente `F.prototype`, `true`; si llega a `null`, `false`.

La función `myInstanceOf` del ejemplo lo implementa y una tabla la compara con el `instanceof` real:

[[exercise:09-como-funciona-instanceof.md-]]

```text
(index)                                      instanceof   myInstanceOf
lamp, Product                                true         true
lamp, Object                                 true         true
Object.create(Product.prototype), Product    true         true
Object.create(null), Object                  false        false
'texto', String                              false        false
Product, Function                            true         true
```

De ahí salen sus sorpresas: un objeto creado con `Object.create(Product.prototype)` «es un `Product`» aunque la constructora no se haya ejecutado nunca; un objeto deja de serlo si cambias `Product.prototype`; y los primitivos nunca son `instanceof` de nada. La pregunta inversa, «¿está este objeto en la cadena de aquel?», es `Product.prototype.isPrototypeOf(lamp)`.

Un caso que verás en el capítulo 6: cada `<iframe>` tiene su propio `Array.prototype`, así que un array creado en otro marco no es `instanceof Array` en este. Por eso existe `Array.isArray`, que no depende de la cadena.

> **Desde Python:** `isinstance(lamp, Product)` comprueba si `Product` está en `type(lamp).__mro__`: busca una **clase** en una lista de clases. `instanceof` busca un **objeto** (`Product.prototype`) en la cadena de otro objeto.

## Olvidar `new`: `new.target`

En la lección «La palabra clave this» viste qué pasa si llamas a una constructora sin `new`: se ejecuta como llamada simple y escribe sus propiedades en `window`. Dentro de cualquier función, `new.target` vale la función si la llamaron con `new` y `undefined` si no. Con eso, la constructora puede lanzar un error claro o arreglar la llamada creando el objeto ella misma:

[[exercise:10-new-target.md-]]

Las clases hacen la primera opción automáticamente: llamar a una clase sin `new` lanza siempre un `TypeError`.

## De Python a JavaScript

Así se ve el mismo tipo en los dos lenguajes:

```python
class Product:
    def __init__(self, title, cents):
        self.title = title
        self.cents = cents

    def describe(self):
        return f"{self.title}: {self.cents / 100:.2f} €"

lamp = Product("Lámpara de mesa", 2400)
isinstance(lamp, Product)    # True
type(lamp).__name__          # 'Product'
```

```js
function Product(title, cents) {
  this.title = title;
  this.cents = cents;
}
Product.prototype.describe = function () {
  return `${this.title}: ${(this.cents / 100).toFixed(2)} €`;
};

const lamp = new Product('Lámpara de mesa', 2400);
lamp instanceof Product;     // true
lamp.constructor.name;       // 'Product'
```

En el módulo «Clases y POO» escribirás esto mismo con `class Product { constructor(title, cents) {…} describe() {…} }`. El resultado será idéntico: una función `Product`, un objeto `Product.prototype` con `describe` y objetos enlazados a él. Todo lo que has visto en esta lección seguirá siendo verdad.

## Bestiario

- **`F.prototype` no es el prototipo de `F`.**
  Síntoma: `Object.getPrototypeOf(Product) === Product.prototype` es `false`; `lamp.prototype` es `undefined`; un método añadido a `Product` da «is not a function» en las instancias.
  Causa: `prototype` es una propiedad de la función que se usa como `[[Prototype]]` de las **instancias**; el `[[Prototype]]` de la función es `Function.prototype`.
  Solución: los métodos, en `Product.prototype`; para leer el prototipo de un objeto, `Object.getPrototypeOf(obj)`.
  → [ver ejemplo](06-prototype-no-es-el-prototipo.md)
- **Los objetos viejos pierden sus métodos y su tipo.**
  Síntoma: tras `F.prototype = { … }`, los objetos creados antes no tienen los métodos nuevos, `obj instanceof F` es `false` y `obj.constructor` es `Object`.
  Causa: reemplazar `prototype` cambia la propiedad a otro objeto; los objetos existentes conservan su enlace al anterior, y el literal no trae `constructor`.
  Solución: añade al prototipo existente (`Object.assign(F.prototype, { … })`), o reemplázalo antes de crear objetos y restaura `constructor`.
  → [ver ejemplo](07-reemplazar-el-prototype.md)

## Resumen

- Toda función escrita con `function` tiene una propiedad `prototype`: un objeto con `constructor` donde se guardan los métodos compartidos.
- `new F(…)` crea un objeto enlazado a `F.prototype`, ejecuta `F` con `this` apuntando a él y lo devuelve (salvo que `F` devuelva otro objeto).
- `myNew` = `Object.create(F.prototype)` + `F.apply(obj, args)` + la regla del `return`.
- `F.prototype` es el `[[Prototype]]` de las instancias, no el de `F` (que es `Function.prototype`).
- `obj.constructor` se hereda del prototipo; es útil, pero se puede cambiar y se pierde al reemplazar `prototype`.
- `instanceof` busca `F.prototype` en la cadena del objeto; los primitivos siempre dan `false`.
- `new.target` detecta si la función se llamó con `new`.

## Para profundizar

- [javascript.info: constructor, operador «new»](https://es.javascript.info/constructor-new)
- [javascript.info: F.prototype](https://es.javascript.info/function-prototype)
- [MDN: operador new](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/new)
- [MDN: instanceof](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/instanceof)
- [MDN: new.target](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/new.target)
