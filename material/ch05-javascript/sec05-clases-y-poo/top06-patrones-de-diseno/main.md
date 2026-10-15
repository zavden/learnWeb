# Patrones de diseño

## Por qué importa

Un patrón de diseño es una solución con nombre a un problema que aparece una y otra vez: cómo esconder detalles, cómo crear objetos sin atarse a una clase concreta, cómo avisar a varias partes de un programa de que algo cambió. Conocer los nombres sirve para leer código ajeno («esto es un observador») y para no reinventar soluciones peor pensadas.

Muchos patrones clásicos se escribieron para lenguajes en los que todo tenía que ser una clase. En JavaScript, como en Python, las funciones son valores, y varios patrones se reducen a pasar una función o a devolver un objeto desde un closure. Esta lección presenta los seis que más vas a encontrar en código JavaScript (módulo, fábrica, observador, estrategia, *singleton* e inmutabilidad), con las clases de este módulo y los closures del módulo «Funciones y ámbito», y con los errores típicos de cada uno.

## Módulo

El patrón **módulo** agrupa en un bloque de código las piezas de una parte del programa y decide qué sale fuera. En la lección «Closures» lo viste con una IIFE que devolvía un objeto con funciones. Con clases, la IIFE puede devolver una **clase** y quedarse con todo lo demás: constantes, funciones auxiliares y estado que comparten **todas** las instancias:

[[exercise:01-patron-modulo.md-]]

```text
Pedido 1001 de Mariana Gómez: $487.20 (IVA incluido)
Pedido 1002 de Iker Salas: $636.84 (IVA incluido)
typeof VAT_RATE → undefined | typeof formatMoney → undefined
Order.name → Order
```

Así se combinan dos niveles de privacidad: lo que guarda el closure del módulo (el contador de números de pedido, el IVA, los formateadores) es privado y compartido; lo que guarda cada `#campo` es privado de cada objeto. Hoy, el contenedor natural de un módulo es un **archivo**: con `import` y `export` (módulo «Módulos y organización»), lo que un archivo no exporta queda privado, sin necesidad de IIFE. La idea de fondo es la misma.

## Fábrica

Una **fábrica** es una función que crea objetos. Parece poca cosa al lado de `new`, pero decide cosas que un constructor no puede decidir: devolver un objeto que **ya existe** (una caché), elegir **qué** crear según los argumentos (el registro de tipos de la lección «Clases») o devolver un objeto **sin** `this`, cuyas funciones viven en un closure y se pueden pasar como callbacks sin perder nada:

[[exercise:02-fabrica.md-]]

```text
México → $1,299.00 | España → 1299,00 € | EE. UU. → $1,299.00
rango → $499.00 – $1,299.00
¿el mismo? → true
map(format) → (3) ['9,90 €', '24,50 €', '120,00 €']
currency tras asignar → MXN
```

Fíjate en `map(format)`: con un método de clase, pasar `spain.format` suelto perdería `this` (lección «Clases»); con las flechas del closure, no hay `this` que perder. El precio es el de los «métodos propios» del módulo anterior: cada objeto lleva sus funciones, en lugar de compartirlas en un prototipo. Para muchos objetos con los mismos métodos, una clase; para objetos de configuración, servicios o envoltorios de los que hay pocos, una fábrica es a menudo más simple.

Las fábricas también se escriben como métodos **estáticos** de una clase (`Money.of('19.99')`, `Temperature.fromFahrenheit(212)`), que validan o convierten antes de llamar a `new`. Es el `@classmethod` de Python.

> **Desde Python:** una función que devuelve objetos, a menudo decorada con `@functools.cache` para reutilizarlos. La diferencia es que en Python llamar a una clase ya es llamar a una función (`Money(…)`); en JavaScript hace falta `new`, y una fábrica lo esconde.

## Observador

El patrón **observador** permite que un objeto avise de sus cambios a quien quiera escucharlos, sin saber quiénes son. Un **emisor de eventos** guarda, para cada nombre de evento, un conjunto de funciones (los oyentes); `on` añade una, `off` la quita y `emit` las llama a todas con los datos del evento. El carrito del ejemplo no sabe que existen un contador, una analítica y un mensaje de bienvenida: solo emite `change`:

[[exercise:03-observador.md-]]

```text
add Café de Chiapas
  🛒 contador: $210.00
  📊 analítica: add «Café de Chiapas»
  🎉 ¡primer producto! Envío gratis en tu primera compra
add Molinillo
  🛒 contador: $599.00
  📊 analítica: add «Molinillo»
remove Molinillo
  📊 analítica: remove «Molinillo»
```

Tres detalles de diseño del `EventEmitter`: `on` devuelve una función que da de baja al oyente (más cómoda y segura que `off`), `once` se apoya en `on` con un envoltorio que se da de baja antes de ejecutarse, y `emit` recorre una **copia** del conjunto, porque un oyente puede darse de baja (o añadir otros) mientras se avisa. Y una decisión: el carrito **tiene** un emisor (composición), en lugar de **ser** uno con `extends`; así su API no se mezcla con `on`, `off` y `emit`.

El navegador trae su propio emisor para el DOM, `EventTarget`, con `addEventListener`, `removeEventListener` y `dispatchEvent`; lo verás en el capítulo 6 y reconocerás esta misma estructura.

### Dos errores del observador

El primero es darse de baja con **otra** función. `off` busca la función exacta que se registró, pero `badge.update.bind(badge)` (o una flecha escrita en el sitio) crea una función **nueva** cada vez que se evalúa. El `off` no encuentra nada, el oyente se queda y, al volver a suscribirse, los avisos se duplican:

[[exercise:04-baja-con-otra-funcion.md-]]

```text
🐛 oyentes → 2 | avisos por un solo cambio → 2
   ¿bind da la misma función? → false
✅ oyentes → 1 | avisos → 1
```

La solución es guardar en una variable la función que registras y usar esa misma para la baja, o usar la función de baja que devuelve `on`. En el capítulo 6 verás que `removeEventListener` tiene exactamente este problema.

El segundo: un oyente que lanza un error corta el bucle de `emit`, y los oyentes que iban detrás no se enteran. Que falle la analítica no debería impedir que salga la factura:

[[exercise:05-un-oyente-que-lanza.md-]]

```text
🐛 emit se corta → el servicio de analítica no responde | recibieron: ['correo del pedido 1042']
✅ recibieron → (2) ['correo del pedido 1042', 'factura del pedido 1042'] | fallos → ['el servicio de analítica no responde']
```

La versión segura aísla a cada oyente con su propio `try/catch` y devuelve los fallos a quien emitió, que decide qué hacer con ellos. Fíjate en cómo la subclase `SafeEventEmitter` sobrescribe `emit` sin tocar `#listeners`: usa el método `listenersOf` del padre, porque los privados del padre no son accesibles desde la hija (lección «Herencia con extends»).

## Estrategia

El patrón **estrategia** convierte una parte variable de un algoritmo en una **pieza intercambiable**. El checkout de una tienda suma los productos y el envío; cómo se calcula el envío (estándar, exprés, por zona, recoger en tienda) es la estrategia, que el checkout **recibe** y que se puede cambiar cuando la usuaria elige otra opción. En JavaScript, una estrategia suele ser simplemente una **función**; cuando necesita estado o configuración, un objeto con un método:

[[exercise:06-estrategia.md-]]

```text
estándar           → envío  $149.00 · total $994.00
exprés             → envío  $309.00 · total $1154.00
recoger en tienda  → envío    $0.00 · total $845.00
por zona           → envío   $99.00 · total $944.00
```

Sin el patrón, `total()` tendría un `if/else` por cada opción de envío, y cada opción nueva obligaría a tocarlo. Con él, una opción nueva es una entrada más en el `Map`. Ya usabas estrategias sin llamarlas así: la función que recibe `sort`, `map` o `filter` es una estrategia.

## *Singleton*, y por qué evitarlo

Un ***singleton*** es una clase que garantiza que solo existe **una** instancia, accesible desde cualquier parte del programa (`CartStore.instance`). Resuelve un problema real (que toda la app comparta el mismo carrito), pero a costa de un estado **global** escondido: las funciones que lo usan no lo reciben como parámetro, así que no se ve de qué dependen, no se puede tener una segunda instancia (el carrito de una lista de deseos) y lo que hace una parte del programa afecta a otra que debería ser independiente. Las pruebas automáticas son el ejemplo más claro:

[[exercise:07-singleton.md-]]

```text
🐛 testAddOne → ✓
🐛 testStartsEmpty → ✗ (el carrito de la prueba anterior sigue ahí)
✅ testAddOne → ✓
✅ testStartsEmpty → ✓
```

La alternativa conserva lo bueno: la app crea **una** instancia al arrancar y se la **pasa** a quien la necesita, como parámetro o en el constructor (*inyección de dependencias*). Sigue habiendo un solo carrito, pero las dependencias están a la vista y cada prueba puede crear el suyo. Y en JavaScript, un objeto creado una vez dentro de un módulo ya es único: no hace falta ninguna maquinaria de `static instance`.

> **Desde Python:** el mismo consejo. Un módulo de Python ya es un *singleton*, y las pruebas sufren igual con el estado global.

## Inmutabilidad

Un **objeto de valor** representa un valor (una cantidad de dinero, una fecha, una dirección) y no tiene identidad propia: dos objetos con el mismo contenido son intercambiables. Lo más seguro es que sean **inmutables**: si nadie puede cambiar un `Money`, se puede compartir entre partes del programa sin miedo y nunca hace falta copiarlo. Con las herramientas de este módulo, la receta es:

1. Los datos en campos **privados**, expuestos solo con getters (sin setters).
2. `Object.freeze(this)` al final del constructor, para que tampoco se puedan añadir ni cambiar propiedades públicas.
3. Las operaciones devuelven un objeto **nuevo** (`add`, `times`), como los métodos `toSorted` o `with` de los arrays.
4. Un método `equals` que compara el contenido, porque `===` sigue siendo identidad.

[[exercise:08-objetos-de-valor-inmutables.md-]]

```text
precio $249.90 · envío $99.00 · total $598.80
¿price sigue igual? → $249.90
tras «cambiarlo» → $249.90 | discount → undefined
equals → true | === → false
⛔ No se pueden sumar MXN y EUR
```

Recuerda lo que viste en la lección «Encapsulación»: `Object.freeze` no congela los campos privados. Lo que hace inmutable a `Money` no es el `freeze`, sino que ningún método cambia `#cents` después del constructor; el `freeze` cubre las propiedades públicas.

> **Desde Python:** `@dataclass(frozen=True)` da todo esto de serie: `__init__`, `__eq__` por contenido, error al asignar, y `dataclasses.replace()` para crear una copia cambiada. En JavaScript se escribe a mano.

### Congelar en el constructor del padre

`Object.freeze(this)` tiene una trampa cuando la clase tiene hijas. En la lección «Herencia con extends» viste el orden de inicialización: los campos y el constructor de la hija se ejecutan **después** de `super()`. Si el padre se congela al final de su constructor, la hija recibe un objeto que ya no admite propiedades nuevas, y su primer campo o su primera asignación lanzan un `TypeError`:

[[exercise:09-congelar-en-el-constructor-del-padre.md-]]

```text
🐛 campo de la hija → TypeError | Cannot define property instructions, object is not extensible
🐛 asignación de la hija → TypeError | Cannot add property taxId, object is not extensible
✅ hija → SafeShippingAddress {street: 'Av. Juárez 15', city: 'Puebla', instructions: 'Dejar en recepción'} | ¿congelada? → true
✅ base → SafeAddress {street: 'Reforma 222', city: 'Ciudad de México'} | ¿congelada? → true
```

La solución es congelar solo cuando el objeto se crea con **esa** clase exacta, `if (new.target === SafeAddress) Object.freeze(this)`, y que cada subclase haga lo mismo al final de su constructor. Muchas veces es mejor no heredar de un objeto de valor y crear otro tipo que lo **contenga**.

## Bestiario

- **Los avisos que se duplican.**
  Síntoma: después de `off`, un oyente sigue recibiendo avisos, a veces dos veces por cambio.
  Causa: `off` recibe una función distinta de la registrada: `bind` y las flechas escritas en el sitio crean una nueva cada vez.
  Solución: guarda la función registrada y usa esa para la baja, o usa la función de baja que devuelve `on`.
  → [ver ejemplo](04-baja-con-otra-funcion.md)
- **Los oyentes que no se enteran.**
  Síntoma: si un oyente lanza un error, los que van detrás no se ejecutan, y el error sale por quien llamó a `emit`.
  Causa: un error dentro del bucle de `emit` lo corta.
  Solución: un `try/catch` por oyente dentro de `emit`, que recoja los fallos y los devuelva.
  → [ver ejemplo](05-un-oyente-que-lanza.md)
- **Las pruebas que dependen del orden.**
  Síntoma: una prueba pasa sola y falla después de otra; no se puede tener una segunda instancia ni reiniciar el estado.
  Causa: un *singleton* es estado global escondido detrás de `Clase.instance`.
  Solución: crea la instancia una vez al arrancar y pásala como parámetro (inyección de dependencias).
  → [ver ejemplo](07-singleton.md)
- **La subclase que no puede añadir nada.**
  Síntoma: `TypeError: Cannot define property … , object is not extensible` (o `Cannot add property`) al crear un objeto de una clase hija.
  Causa: el constructor del padre congela `this` antes de que se ejecuten los campos y el constructor de la hija.
  Solución: congela solo si `new.target` es la propia clase, o usa composición en lugar de herencia.
  → [ver ejemplo](09-congelar-en-el-constructor-del-padre.md)

## Resumen

- Módulo: un bloque que guarda en un closure lo privado y compartido y devuelve solo la API (hoy, un archivo con `export`).
- Fábrica: una función que crea objetos y decide cómo (caché, tipo, objeto sin `this`); los estáticos como `Money.of` son fábricas.
- Observador: un emisor con `on`/`off`/`emit` desacopla a quien cambia de quien reacciona; da de baja con la misma función y aísla los errores.
- Estrategia: la parte variable de un algoritmo es una pieza intercambiable, a menudo solo una función.
- *Singleton*: evítalo; crea una instancia y pásala como parámetro.
- Objetos de valor inmutables: privados sin setters, `freeze`, operaciones que devuelven objetos nuevos y `equals`.
- No congeles `this` en el constructor de una clase que tiene hijas, salvo comprobando `new.target`.

## Para profundizar

- [Refactoring Guru: catálogo de patrones de diseño](https://refactoring.guru/es/design-patterns/catalog)
- [patterns.dev: patrones de diseño en JavaScript (en inglés)](https://www.patterns.dev/)
- [javascript.info: mixins y EventMixin](https://es.javascript.info/mixins)
- [MDN: Object.freeze](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
