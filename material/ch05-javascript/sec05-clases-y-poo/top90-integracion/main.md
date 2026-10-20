# Integración: clases y POO

## Por qué importa

Cada lección de este módulo añadió una pieza a la sintaxis `class`: la clase como función con su prototipo, los campos privados y estáticos, la herencia con `extends` y `super`, los protocolos del lenguaje, los mixins y la composición, y los patrones que se construyen con todo ello. En un programa real se usan juntas, y sus sorpresas se combinan: un registro de tipos estático necesita nombrar la clase que guarda el mapa privado, un mixin que coopera con `super` solo funciona si es una subclase, un objeto de valor inmutable no puede congelarse en el constructor de su padre. Los ejemplos de esta página mezclan varias lecciones en cada programa, y los ejercicios te piden reescribir, completar y depurar clases.

## Las decisiones que se repiten

Si dudas en un ejercicio, vuelve a esta tabla:

| Necesitas… | Usa… | Lección |
|------------|------|---------|
| muchos objetos del mismo tipo | `class` con `constructor` y métodos; campos para los valores iniciales | «Clases» |
| datos que nadie toque desde fuera | campos `#privados`, expuestos con getters sin setter | «Encapsulación» |
| crear objetos de varias formas, o validar antes de crear | métodos estáticos (`Wallet.open`, `Quantity.parse`), con `new this(…)` si las subclases deben heredarlos | «Encapsulación» |
| comprobar que un objeto es de verdad de tu clase | `#campo in obj` (tras comprobar que es un objeto) | «Encapsulación» |
| un tipo que es un caso particular de otro | `extends`, `super(…)` antes de `this` y `super.metodo()` | «Herencia con extends» |
| errores que el `catch` pueda distinguir | `class XError extends Error` con `name`, un `code` y `cause` | «Herencia con extends» |
| que tu clase funcione con `for…of`, plantillas, comparaciones y JSON | `[Symbol.iterator]`, `toString` o `Symbol.toPrimitive`, `toJSON` | «Polimorfismo y protocolos» |
| la misma capacidad en clases sin relación | mixins como subclases (`(Base) => class X extends Base`) | «Composición y mixins» |
| piezas que se combinan o se cambian en tiempo de ejecución | composición: objetos que se pasan y en los que se delega | «Composición y mixins» |
| avisar a varias partes de un cambio | un `EventEmitter` con baja y errores aislados | «Patrones de diseño» |
| valores que se comparten sin miedo | objetos de valor inmutables: privados, `freeze`, operaciones que devuelven otro objeto, `equals` | «Patrones de diseño» |

Dos reglas atraviesan la tabla. La primera: en un estático, `this` es la clase sobre la que se llama; úsalo para crear (`new this(…)`), pero nombra la clase para leer sus datos privados o compartidos (`Shape.#types`, `Wallet.#nextId`). La segunda: lo que una clase no debe exponer (saldo, lista interna, códigos) va en campos privados, y lo que sí expone se lee con getters y se cambia con métodos que validan.

Los ejemplos imprimen instancias, tablas y errores. Ábrelos con «▶ Run» o en el editor y **expande** los objetos: cada `[[Prototype]]` es un eslabón de la cadena (un mixin, una clase padre).

## Ejemplos combinados

### Figuras con clases

El presupuesto de corte láser de la integración del módulo anterior, escrito dos veces en el mismo archivo: con funciones constructoras y prototipos enlazados a mano, y con `class`. Las dos versiones calculan el mismo presupuesto (el ejemplo lo comprueba), pero la de clases gana tres cosas que la tabla final enseña: los métodos ya no salen en `for…in`, `Square` hereda los estáticos de `Rectangle` (enlace ② de `extends`) y las piezas se crean desde JSON con un **registro de tipos**: cada subclase se registra con un estático heredado, `Circle.register('circle')`, en el que `this` es la subclase, y `Shape.fromJSON` busca la clase por su nombre. El `label` de cada figura es un getter del prototipo: no enumerable y de solo lectura, como el valor inmutable que antes vivía en `prototype`.

[[exercise:01-figuras-con-clases.md-]]

```text
rectángulo «Tapa de caja»: 600,0 cm², corte 100,0 cm
cuadrado «Base»: 400,0 cm², corte 80,0 cm (lado 20 cm)
círculo «Esfera de reloj»: 706,9 cm², corte 94,2 cm
total → 7,44 €
¿el mismo presupuesto con A y con B? → true
plantilla → Square(Base)
(index)                                    A. a mano                                                B. class
for…in de un cuadrado                      'name, width, height, label, describe, area, perimeter'  'name, width, height'
estáticos heredados (Square → Rectangle)   false                                                    true
¿instanceof la base?                       true                                                     true
⛔ TypeError: Figura desconocida: «triangle»
```

### Un monedero con errores propios

El monedero de una app de pagos guarda su saldo y sus movimientos en campos privados, y solo se crea con la fábrica `Wallet.open`, que valida al titular: un estático privado hace de «llave» y el constructor rechaza cualquier `new Wallet(…)` que no venga de la fábrica. Los fallos son errores de una jerarquía propia (`WalletError` → `InsufficientFundsError`) con un `code` que el programa puede consultar; cuando un importe no se entiende, el `RangeError` original viaja como `cause`. La transferencia comprueba la **marca** del destino con `#balanceCents in other`, así que un objeto parecido no cuela, y suma en el privado del otro monedero, algo permitido porque el código está dentro de la clase.

[[exercise:02-monedero-con-errores-propios.md-]]

```text
✅ Ana transfiere 320.50 a Luis
⛔ Luis retira 500 → InsufficientFundsError [insufficient-funds] Luis Pérez: faltan $179.50
⛔ Ana deposita «mil» → WalletError [bad-amount] Importe no válido en W-001 | causa: RangeError: «mil» no es un importe
⛔ Ana transfiere a un objeto parecido → WalletError [not-a-wallet] El destino no es un monedero
⛔ alta con titular vacío → WalletError [bad-owner] Titular no válido: « »
⛔ new Wallet sin la fábrica → TypeError [sin código] Usa Wallet.open(titular)
saldos → $1,179.50 | $320.50
JSON → [{"id":"W-001","owner":"Ana Ruiz","balanceCents":117950,"movements":2},{"id":"W-002","owner":"Luis Pérez","balanceCents":32050,"movements":1}]
Object.keys(ana) → (2) ['id', 'owner']
¿instanceof? → true | saldo de Ana → $1,179.50
```

### Una lista de reproducción iterable

Una lista de reproducción que se comporta como un tipo nativo. Se recorre con `for…of`, el spread, la desestructuración, `Array.from` o `new Set`, gracias a un `[Symbol.iterator]()` que devuelve un objeto con `next()` escrito a mano. Su `Symbol.toPrimitive` da la duración en segundos cuando el contexto pide un número (así se comparan y se ordenan listas con `>` y `a - b`) y un resumen cuando pide texto. `toJSON` y el estático `fromJSON` hacen la ida y vuelta por JSON recuperando el prototipo. Las canciones están congeladas y las operaciones (`filter`, `with`) devuelven una lista **nueva**, como los métodos `toSorted` y `with` de los arrays.

[[exercise:03-lista-de-reproduccion-iterable.md-]]

```text
1. La Llorona · 4:12
2. Oye cómo va · 3:58
3. Bésame mucho · 2:51
4. Cielito lindo · 3:05
plantilla → Carretera a Oaxaca (4 canciones, 14:06)
+roadTrip → 846 segundos | ¿más larga que la filtrada? → true
desestructuración → La Llorona | Bésame mucho
artistas → 4 | la más corta → 2:51
ordenadas por duración → (2) ['Carretera a Oaxaca (filtrada) (3 canciones, 9:54)', 'Carretera a Oaxaca (4 canciones, 14:06)']
with → tamaños 4 5
at(0) tras «cambiarla» → 252
JSON → {"name":"Carretera a Oaxaca (filtrada)","songs":[…]}
restaurada → Carretera a Oaxaca (filtrada) (3 canciones, 9:54) | etiqueta → [object Playlist]
```

### Mixins frente a jerarquía

Una app de notas y contactos necesita que los dos tipos avisen de sus cambios y se guarden en JSON con su tipo. Con herencia, cada combinación es una clase y el mismo `toJSON` se copia en varias (el ejemplo lo comprueba: no son la misma función). Con dos mixins como subclases, cada capacidad se escribe **una vez** y se aplica a las dos bases: `Observable` tiene sus oyentes en un campo privado (uno por objeto, nada compartido) y `Serializable` coopera con el `toJSON` de la base mediante `super.toJSON()` y aporta un estático `fromJSON` que, gracias a `new this(…)`, crea un objeto de la clase final. La cadena de un contacto es la línea que en Python calcularía el MRO.

[[exercise:04-mixins-frente-a-jerarquia.md-]]

```text
🐛 ¿el mismo toJSON? → false
  ✎ SmartNote: {"body":"tortillas, aguacates, limones"}
  ✎ SmartContact: {"phone":"+52 55 8765 4321"}
⛔ TypeError: Campos desconocidos: email
JSON → {"type":"Note","title":"Súper del sábado","body":"tortillas, aguacates, limones"}
restaurada → SmartNote {title: 'Súper del sábado', body: 'tortillas, aguacates, limones'} | ¿instanceof Note? → true
cadena de un contacto → SmartContact → Observable → Serializable → Contact
```

### Un emisor con oyentes seguros

Un `EventEmitter` con todo lo de la lección «Patrones de diseño»: `on` devuelve la baja, `once` se construye sobre `on`, `emit` recorre una copia y **aísla** cada oyente, y un oyente que falla no detiene a los demás: su error se reemite como evento `error`, como hacen los emisores de Node.js. Añade una defensa contra el bug de la baja con otra función: si un evento acumula más oyentes de los esperados (un estático, `MAX_LISTENERS`), avisa de una posible fuga. El monitor de stock **tiene** un emisor (composición) y el panel usa un campo con una flecha como manejador, que se puede pasar suelto sin perder `this`.

[[exercise:05-emisor-con-oyentes-seguros.md-]]

```text
▶ movimientos de stock
  🧯 fallo en «out-of-stock»: el servicio de analítica no responde
  📧 aviso a quien esperaba MOL-RUTA-01: ¡ya hay!
  🧯 fallo en «out-of-stock»: el servicio de analítica no responde
panel → (3) ['CAF-CHIA-500: 2 uds', 'MOL-RUTA-01: 0 uds', 'MOL-RUTA-01: 0 uds']
▶ un componente que se suscribe con bind en cada render
⚠️ 4 oyentes de «low-stock»: ¿alguien se suscribe sin darse de baja?
veces que se refrescó el widget por UN cambio → 3
```

### Una calculadora de precios

La caja de una tienda de café y pan aplica reglas de descuento que cambian cada temporada. Cada regla es una **estrategia**: una subclase de `PricingRule` (una base abstracta que se protege con `new.target`) con su `apply` y su `describe`. Las reglas se crean desde una configuración JSON con una **fábrica** estática y un registro privado, así que una temporada nueva es un JSON nuevo, no código nuevo. El `Checkout` es inmutable: `withRules` devuelve otro checkout con otras reglas. Y como la caja solo llama a `apply` y `describe`, una regla puntual puede ser un objeto literal sin herencia (*duck typing*).

[[exercise:06-calculadora-de-precios.md-]]

```text
▶ Temporada normal
(tabla: subtotal $1,016.00 · 10 % en pan -$10.80 · total $1,005.20)
▶ El Buen Fin
(tabla: subtotal $1,016.00 · 3×2 en PAN-CONCHA -$36.00 · 15 % en loza -$104.70 · cupón BUENFIN150 -$150.00 · total $725.30)
▶ Martes, con una regla escrita como objeto literal
(tabla: subtotal $1,016.00 · martes de café -$25.00 · total $991.00)
⛔ TypeError: Regla desconocida: «two-for-one»
⛔ TypeError: PricingRule es abstracta
⛔ Error: FreeGift debe implementar apply(lines, subtotal)
```

### Cantidades inmutables

Un objeto de valor para un recetario: una cantidad con su unidad (gramos, litros, tazas, cucharadas). Sus datos son privados, se congela solo cuando `new.target` es `Quantity` (para no bloquear a una subclase) y todas sus operaciones (`to`, `with`, `plus`, `times`) devuelven una cantidad **nueva**, así que escalar una receta crea otra receta. Su `Symbol.toPrimitive` decide qué operadores tienen sentido: con la pista `number` devuelve la cantidad en gramos o mililitros, así que `<` y el comparador `a - b` funcionan; con la pista `default` lanza un error, porque `taza + taza` daría un número sin unidad. Para sumar está `plus`, que convierte unidades y se niega a mezclar masa con volumen.

[[exercise:07-cantidades-inmutables.md-]]

```text
  chile ancho: 300 g (eran 120 g)
  chocolate de mesa: 225 g (eran 90 g)
  caldo de pollo: 3.75 l (eran 1.5 l)
  ajonjolí: 7.5 cda (eran 3 cda)
🛒 caldo de pollo: 4.23 l
🛒 chile ancho: 350 g
1 taza en ml → 240 ml | ¿igual a 240 ml? → true | === → false
¿1 taza > 200 ml? → true
ordenadas → (3) ['3 cda', '1 taza', '1 l']
⛔ TypeError: Quantity no se suma con + ni se compara con ==: usa plus() o equals()
⛔ TypeError: No se mezclan volumen y masa
⛔ RangeError: Unidad desconocida: «pizcas»
cup sigue siendo → 1 taza | ¿congelada? → true
```

## Ejercicios

Los tres ejercicios se corrigen solos, como los de los módulos anteriores: al final del código hay una función `check` que compara lo que obtienes con lo esperado e imprime `✓` o, en rojo, `✗` con el valor esperado y el obtenido. Las instrucciones, las pistas y la solución están en el panel del ejercicio.

### De constructoras a clases

Una flota de bicicletas escrita como en el módulo anterior: `Vehicle`, `Bike` y `EBike` con funciones constructoras, `call`, `Object.create` y `defineProperty`. Funciona, y las cinco primeras comprobaciones ya salen ✓. Tu tarea es reescribirla con `class` sin cambiar su comportamiento; las otras cinco comprobaciones detectan lo que gana la versión con clases: métodos no enumerables, estáticos heredados y una batería privada.

[[exercise:08-ej-de-constructoras-a-clases.md-]]

### Una tarjeta de regalo

Las tarjetas de regalo de una cafetería: datos privados, una fábrica estática que valida el formato del código y los repetidos, errores propios con `code`, getters de solo lectura, una comprobación de marca en las transferencias y un error envuelto con `cause` cuando una transferencia falla a medias. Al abrirlo, todas las comprobaciones salen en rojo.

[[exercise:09-ej-tarjeta-de-regalo.md-]]

### Caza los seis bugs del restaurante

La app de reservas de una fonda tiene seis bugs, uno por cada lección del módulo: un método que pierde `this`, una validación que no se ejecuta, una clase hija que no se puede crear, un ticket con los centavos, un mixin cuyo `super` no encuentra al padre y una subclase que no puede crear sus campos. Ninguno detiene el script: las comprobaciones atrapan los errores y los muestran como texto.

[[exercise:10-ej-caza-los-bugs.md-]]

## Resumen

- Una clase es la constructora y el prototipo del módulo anterior en un bloque, con métodos no enumerables, estáticos heredados y campos; reescribir con `class` no cambia el comportamiento.
- Los campos privados protegen el estado; las fábricas estáticas validan antes de crear, y `#campo in obj` comprueba la marca de un objeto que llega de fuera.
- Una jerarquía de errores propios (`name`, `code`, `cause`) permite al `catch` distinguir los fallos y conservar su origen.
- Los protocolos (`Symbol.iterator`, `Symbol.toPrimitive`, `toJSON`) hacen que una clase se use como un tipo nativo; `Symbol.toPrimitive` también puede **prohibir** operadores que no tienen sentido.
- Los mixins como subclases reparten capacidades entre clases sin relación y cooperan con `super`; la composición combina piezas y las cambia en tiempo de ejecución.
- Estrategia, fábrica, observador y objeto de valor resuelven, con clases, problemas que se repiten en cualquier aplicación.

## Para profundizar

- [javascript.info: clases](https://es.javascript.info/classes)
- [MDN: usar clases (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_classes)
- [Refactoring Guru: patrones de diseño](https://refactoring.guru/es/design-patterns)
- [Node.js: EventEmitter (en inglés)](https://nodejs.org/api/events.html#class-eventemitter)
