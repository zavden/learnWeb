# Integración: objetos y prototipos

## Por qué importa

Cada lección de este módulo desmontó una pieza: los atributos de las propiedades, la cadena de prototipos, las funciones constructoras con `new`, la herencia entre prototipos y los prototipos nativos. En un programa real aparecen todas juntas, y sus sorpresas se combinan. Una configuración congelada impide que las capas que heredan de ella sombreen sus valores con una asignación. Un *mixin* copiado con `Object.assign` ejecuta sus getters y comparte sus arrays. Un polyfill instalado con una asignación aparece en los `for…in` de toda la página. Los ejemplos de esta página mezclan varias lecciones en cada programa, y los ejercicios te piden escribir tú las piezas que hay debajo de `new`, `instanceof` y la herencia.

## Las decisiones que se repiten

Casi todas las decisiones de esta página salen de una tabla corta. Si dudas en un ejercicio, vuelve aquí:

| Necesitas… | Usa… | Lección |
|------------|------|---------|
| muchos objetos del mismo tipo | una constructora: datos en `this`, métodos en `F.prototype` | «Funciones constructoras y new» |
| que un tipo herede de otro | `Parent.call(this, …)` + `Object.create(Parent.prototype)` + `constructor` restaurado | «Herencia prototípica» |
| reutilizar el método que sobrescribes | `Parent.prototype.metodo.call(this, …)`: nombra al padre | «Herencia prototípica» |
| validar al asignar o calcular al leer | un setter o un getter, con el dato en otra propiedad (`_stock`) | «Propiedades a fondo» |
| datos internos que no salgan en `Object.keys` ni en JSON | `defineProperty` con `enumerable: false` (o un `WeakMap`) | «Propiedades a fondo» |
| constantes que nadie pueda cambiar | `deepFreeze`: `freeze` es superficial | «Propiedades a fondo» |
| valores por defecto que se puedan sobrescribir por partes | delegación: `Object.create(base)` y propiedades propias que sombrean | «La cadena de prototipos» |
| un diccionario con claves que llegan de fuera | `Map`, u `Object.create(null)` con `Object.hasOwn` | «La cadena de prototipos» |
| combinar comportamiento de varias fuentes | copiar descriptores en el prototipo (*mixin*), sin estado mutable | «Herencia prototípica» |
| un método estándar que falta en un navegador | un polyfill: detección + `defineProperty` no enumerable | «Prototipos nativos» |

Una regla atraviesa toda la tabla: **en un prototipo van los métodos y, como mucho, valores por defecto inmutables**. Los datos que cambian (arrays, contadores, oyentes) se crean en cada objeto. Varios de los bichos de esta página son esa regla rota de formas distintas.

Una nota sobre la consola: los ejemplos imprimen objetos con prototipos, getters y propiedades no enumerables. Ábrelos con «▶ Run» o en el editor y **expándelos**: la consola enseña cada `[[Prototype]]`, las propiedades no enumerables en gris y los getters como `(...)`.

## Ejemplos combinados

### Presupuesto de corte láser

Un taller de corte láser cobra el material por cm² y el corte por cm de contorno. Cada pieza es una figura de una jerarquía de tres niveles: `Shape`, `Circle` y `Rectangle`, y `Square`, que hereda de `Rectangle`. El helper `inherit` hace los pasos 2 y 3 del patrón (prototipo que hereda y `constructor` no enumerable), `Square` reutiliza el `describe` de `Rectangle` nombrándolo, y un `toString` propio cambia lo que imprime una plantilla. Fíjate en `label`: un string inmutable en cada prototipo, el único tipo de dato que puede vivir ahí. La tabla final es el «MRO» de un cuadrado: dónde se resuelve cada propiedad.

[[exercise:01-jerarquia-de-figuras.md-]]

```text
rectángulo «Tapa de caja»: 600,0 cm², corte 100,0 cm
…
cuadrado «Posavasos»: 81,0 cm², corte 36,0 cm (lado 9 cm)
círculo «Esfera de reloj»: 706,9 cm², corte 94,2 cm
material 2027,9 cm² · corte 386,2 cm → 8,58 €
base → Square {name: 'Base', width: 20, height: 20}
propias de base → (3) ['name', 'width', 'height']
plantilla → Square(Base)
¿instanceof Square, Rectangle, Shape? → true true true
¿un solo area para todos los rectángulos? → true
(tabla: describe → Square.prototype · area → Rectangle.prototype · label → Square.prototype · toString → Shape.prototype · hasOwnProperty → Object.prototype)
```

### Inventario con accesores

Los productos de una tienda de bicicletas validan su precio, su categoría y su stock **al asignarlos**. Los accesores viven en `Product.prototype` y guardan el dato en propiedades propias no enumerables (`_stock`); por eso `this.stock = stock` en la constructora no crea ninguna propiedad, sino que encuentra el setter heredado y lo ejecuta (la excepción de la lección «La cadena de prototipos»). `price` e `isLow` son getters sin setter, `toJSON` decide qué se guarda y las reglas del negocio están congeladas en profundidad. Mira las dos formas de fallar de lo congelado: la asignación a `RULES.stock.max` no hace nada, pero `push` lanza un error.

[[exercise:02-inventario-con-accesores.md-]]

```text
✅ vender 3 cadenas
⛔ vender 5 bicicletas → RangeError: BIC-URB-01: stock fuera de rango (-1)
⛔ precio de la luz a 0 → RangeError: ACC-LUZ-02: precio no válido (0)
⛔ categoría «ropa» → RangeError: ROP-MAI-01: categoría desconocida «ropa»
⛔ reponer 200 luces → RangeError: ACC-LUZ-02: stock fuera de rango (202)
bike.price tras asignar «gratis» → 549,00 €
▼ Stock
  BIC-URB-01    4 uds · 549,00 €
  REC-CAD-08    9 uds · 18,95 €
  ACC-LUZ-02    2 uds · 24,50 € ⚠️ stock bajo
bike → Product {sku: 'BIC-URB-01', name: 'Bicicleta urbana Lisboa'}
Object.keys(bike) → (2) ['sku', 'name']
¿'stock' es propia? → false | ¿está en la cadena? → true
JSON → {"sku":"REC-CAD-08","name":"Cadena 8 velocidades","category":"recambios","priceCents":1895,"stock":9}
descriptor de stock → {get: ƒ, set: ƒ, enumerable: false, configurable: false}
RULES.stock.max → 200
⛔ añadir la categoría «ropa» → TypeError: Cannot add property 3, object is not extensible
```

### Un asistente con plugins

El asistente de soporte de una tienda crece por capas. Cada plugin es un objeto creado con `Object.create(capa de debajo)`: si sabe responder al mensaje, responde; si no, llama a `below.reply.call(this, text)`, la capa de debajo **por su nombre**, con el mismo `this`. Los bots son un eslabón más, con sus datos propios (nombre e historial). La ayuda se construye recorriendo la cadena y reuniendo el `topic` propio de cada capa, el plugin de envíos usa `Object.hasOwn` para que «constructor» no parezca un país, y al final un cambio en la capa base llega en el acto a todos los bots ya creados: la delegación es un enlace en vivo.

[[exercise:03-plugins-por-delegacion.md-]]

```text
👤 Hola
🤖 ¡Hola! Soy Lucía. ¿En qué te ayudo?
👤 ayuda
🤖 Prueba con «hola», «pedido 1042», «envío a méxico» o «ayuda».
👤 Pedido 1042
🤖 El pedido 1042 está en reparto (Correos Express).
…
👤 envío a constructor
🤖 Todavía no enviamos a «constructor».
…
cadena → bot Lucía → ayuda → envíos → pedidos → saludos → base → Object.prototype → null
reply → ayuda | handle → base | botName → bot Lucía
historiales → 7 y 1
Mateo → Ahora mismo no sé responder a eso: escribe a soporte@example.com.
```

### Un polyfill con pruebas

El polyfill de `Array.prototype.at` de la lección «Prototipos nativos», llevado un paso más allá. Como Chrome ya tiene `at`, el ejemplo simula dos navegadores antiguos con un `Array.prototype` de mentira: uno sin `at` y otro donde una «librería vieja» instaló una versión que no admite índices negativos, con una asignación (así que aparece en los `for…in`). Comprobar que el método **existe** no basta: `installAt` también comprueba que **funciona**, y reemplaza la versión defectuosa con `defineProperty` no enumerable. La tabla de pruebas compara el polyfill con el método nativo, prestado con `apply`, en los casos límite.

[[exercise:04-polyfill-con-pruebas.md-]]

```text
🐛 for…in con la librería → 0,1,2,at
🐛 steps.at(-1) con la librería → undefined
Chrome         → ya existe y funciona: no se toca
antiguo        → no existía: instalado
con librería   → existía pero fallaba: reemplazado
✅ for…in → 0,1,2 | steps.at(-1) → pago
descriptor → {value: ƒ, writable: true, enumerable: false, configurable: true}
(tabla: at(-1), at(1.7), at(), at(NaN)… nativo / polyfill / librería vieja / ¿igual?)
polyfill: 12/12 pruebas iguales al nativo
con 'Oaxaca' → polyfill: a | nativo: a
```

### Un «class» hecho a mano

Tres helpers que hacen lo que la sintaxis `class` del módulo siguiente hará por ti: `defineMethods` (métodos **no enumerables**, como los de `class`), `extend` (enlaza las dos cadenas de `class … extends`: la de los prototipos y la de las constructoras, para que los métodos estáticos también se hereden) y `myNew`. Se aplican a dos tipos de cuenta bancaria. Fíjate en dos detalles: el estático `Account.open` usa `new this(owner)`, así que `CreditAccount.open(…)` crea una cuenta de crédito; y la guardia contra olvidar `new` no puede usar `new.target`, porque la constructora hija llama a `Account.call(this, …)` sin `new`. Ese hueco es el que `class` rellena con `super()`.

[[exercise:05-un-class-hecho-a-mano.md-]]

```text
Account de Valeria Ortiz: $12,500.00
CreditAccount de Diego Hernández: -$2,400.00 (límite $5,000.00)
⛔ Diego Hernández: fondos insuficientes para $3,000.00
for…in → (3) ['owner', 'balanceCents', 'limitCents']
for…in con asignación → (2) ['owner', 'deposit']
cadena de prototipos → true
cadena de constructoras → true
card.constructor → CreditAccount
¿instanceof las dos? → true true
myNew → CreditAccount {owner: 'Sofía Ramírez', balanceCents: 0, limitCents: 200000} | CreditAccount de Sofía Ramírez: $0.00 (límite $2,000.00)
⛔ sin new → TypeError: Account se crea con new
```

### Un glosario sin prototipo

Un glosario de este mismo curso, con términos que llegan de un formulario. Dos de ellos, `constructor` y `__proto__`, son justo los que rompen un diccionario hecho con `{}`. El ejemplo guarda los mismos cinco términos en cuatro diccionarios: `{}` con `in`, `{}` con `Object.hasOwn`, `Object.create(null)` y un `Map`. Con `in`, `constructor` y `__proto__` «ya existen». Con `hasOwn` se arregla `constructor`, pero no `__proto__`: la asignación encuentra el **setter heredado** de `Object.prototype` y cambia el prototipo del glosario en lugar de guardar el término. Solo `Object.create(null)` y `Map` guardan los cinco. El final recuerda el precio de no tener prototipo, y que `Object.groupBy` devuelve objetos así.

[[exercise:06-glosario-sin-prototipo.md-]]

```text
(tabla de altas: {} + in → constructor (repetido), __proto__ (repetido) · los demás → los cinco)
(tabla de consultas: constructor → 🐛 ƒ heredada con in · __proto__ → 🐛 Object.prototype con in, — con hasOwn)
🐛 Object.keys → (4) ['closure', 'hoisting', 'constructor', 'prototype']
🐛 su prototipo ahora es → {text: 'getter/setter antiguo para el [[Prototype]]', lesson: 'La cadena de prototipos'}
🐛 withHasOwn.lesson → La cadena de prototipos
✅ Object.keys(clean) → (5) ['closure', 'hoisting', 'constructor', '__proto__', 'prototype']
plantilla → TypeError | Cannot convert object to primitive value
clean.hasOwnProperty → TypeError | clean.hasOwnProperty is not a function
Object.hasOwn(clean, 'closure') → true
agrupado → [Object: null prototype] {Closures: Array(1), 'Ámbito y hoisting': Array(1), …}
¿'constructor' in byLesson? → false
```

### Ajustes por capas

Los ajustes de un editor de código en tres capas: los de fábrica, los de la empresa y los del usuario, cada una delegando en la anterior. El primer intento, una capa plana, tiene dos bichos encadenados. `flatUser.editor.tabSize = 4` **lee** `editor` (heredado) y escribe dentro del objeto de la fábrica, así que el cambio llega a todos los usuarios; y una vez congelada la fábrica, la misma línea falla en silencio. La versión buena crea una capa por **sección** y se encuentra con la segunda excepción de la asignación: una propiedad heredada de solo lectura (todas, en una fábrica congelada) impide crear la propia con `=`. `defineProperty` no consulta la cadena y sí puede. La tabla dice de qué capa sale cada valor, `ownChanges` guarda solo lo que el usuario cambió y `delete` restablece un ajuste.

[[exercise:07-ajustes-por-capas.md-]]

```text
🐛 tabSize de otro usuario → 4
🐛 con la fábrica congelada → 2
🐛 minimap con una asignación → true
✅ minimap con setOwn → false
(tabla: editor.minimap false usuario · editor.tabSize 4 empresa · editor.wordWrap true empresa · notifications.push true usuario · notifications.email true fábrica · theme 'oscuro' usuario · fontSize 15 empresa)
guardar → {"editor":{"minimap":false},"notifications":{"push":true},"theme":"oscuro"}
fontSize del usuario → 16 (de la empresa)
theme tras restablecer → claro
¿la fábrica sigue intacta? → {"tabSize":2,"wordWrap":false,"minimap":true}
```

### Mixins: copiar o delegar

Las notas de una app reúnen comportamiento de tres fuentes: poder emitir eventos, contar palabras y llevar etiquetas. Una cadena solo admite un prototipo, así que la forma de combinar varias fuentes es **copiar** sus métodos en el prototipo (un *mixin*). Hacerlo con `Object.assign` tiene tres bichos: ejecuta el getter `wordCount` una vez y copia el resultado (0 para siempre), copia la **referencia** al array `tags` (compartido por todas las notas) y, si dos fuentes tienen un `describe`, gana la última sin avisar. La función `mixin` del ejemplo comprueba los nombres antes de copiar nada, copia **descriptores** no enumerables y obliga a resolver el choque a mano; el estado vive en cada nota o en un `WeakMap`. El final compara con delegar: la delegación ve en vivo la nueva versión de `emit`, la copia se queda con la antigua.

[[exercise:08-mixins-copiar-o-delegar.md-]]

```text
🐛 wordCount → 0 0
🐛 etiquetas de ideas → ['casa']
🐛 describe → Compra #casa
⚠️ mixin: «describe» está repetido; resuélvelo a mano
  🔔 «Receta de mole» → etiqueta cocina
  🔔 «Receta de mole» → etiqueta méxico
✅ wordCount → 4 2
✅ etiquetas → (2) ['cocina', 'méxico'] []
✅ Receta de mole: 4 palabras · #cocina #méxico
JSON → {"title":"Receta de mole","text":"chiles chocolate ajonjolí especias","tags":["cocina","méxico"]}
  delegando → v2 · hola
  🔔 «Receta de mole» → hola
```

## Ejercicios

Los tres ejercicios se corrigen solos, como los de los módulos anteriores: al final del código hay una función `check` que compara lo que obtienes con lo esperado e imprime `✓` o, en rojo, `✗` con el valor esperado y el obtenido. Al abrir cada ejercicio verás casi todo en rojo; tu objetivo es dejarlo todo en verde. Las instrucciones, las pistas y la solución están en el panel del ejercicio.

### Escribe `new`, `instanceof` y la herencia a mano

Cuatro funciones: `myNew` (con la regla del `return`), `myInstanceOf` (primitivos incluidos), `inherit` (con `constructor` no enumerable) y `findOwner`, que dice en qué eslabón de la cadena está una propiedad. Se prueban con una jerarquía de tres niveles: vehículos, bicicletas y bicicletas eléctricas.

[[exercise:09-ej-new-instanceof-y-herencia.md-]]

### Un monedero con accesores

El monedero de una app de pagos: una moneda de solo lectura pero visible, datos internos no enumerables, un titular que se valida al asignarlo, un saldo calculado de solo lectura y una retirada que no deja la cuenta en negativo. Hay además un bicho que ya conoces: el historial de movimientos está en el prototipo.

[[exercise:10-ej-monedero-con-accesores.md-]]

### Caza los cinco bugs de la app de música

La app de una plataforma de música tiene cinco bugs, uno por cada lección del módulo: un setter que se llama a sí mismo, un array compartido en el prototipo, un `prototype` reemplazado después de crear objetos, `Child.prototype = Parent.prototype` y un método añadido a `Array.prototype`. Ninguno detiene el script: las comprobaciones atrapan los errores y los muestran como texto.

[[exercise:11-ej-caza-los-bugs.md-]]

## Resumen

- Los datos van en cada objeto; los métodos, una vez en el prototipo. Un array, un contador o una lista de oyentes en un prototipo (o en un *mixin*) se comparte entre todos.
- Para heredar: `Parent.call(this, …)`, `Object.create(Parent.prototype)`, `constructor` restaurado, y el padre nombrado al reutilizar sus métodos.
- Los accesores en el prototipo validan y calculan para todos los objetos; una asignación a una propiedad heredada con setter ejecuta el setter.
- Una propiedad heredada de solo lectura impide sombrearla con `=`; `defineProperty` sí puede, porque no consulta la cadena.
- `freeze` es superficial: congela en profundidad lo que deba ser constante.
- Para diccionarios con claves externas, `Map` u `Object.create(null)`; con `{}`, ni `in` ni `hasOwn` te salvan de `__proto__`.
- Copiar (*mixins*) combina varias fuentes en una foto; delegar ve los cambios en vivo, pero con un solo prototipo.
- Lo que añadas a un prototipo nativo, solo como polyfill: con detección (de existencia y de comportamiento) y no enumerable.

## Para profundizar

- [javascript.info: herencia prototípica](https://es.javascript.info/prototype-inheritance)
- [javascript.info: mixins](https://es.javascript.info/mixins)
- [MDN: Object.getOwnPropertyDescriptors (copiar getters y setters)](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptors)
- [MDN: contaminación de prototipos (en inglés)](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/Prototype_pollution)
- [core-js: la colección de polyfills más usada (en inglés)](https://github.com/zloirock/core-js)
