# Ejemplos profesionales

## Por qué importa

Este módulo cambia la forma de organizar un programa. Hasta ahora, los datos eran objetos sueltos y la lógica, funciones aparte; ahora un **tipo** reúne los dos: una función constructora que crea los datos, un prototipo que guarda los métodos una sola vez y una cadena que permite heredar, delegar y sombrear. Con esas piezas, más los atributos de las propiedades (accesores, solo lectura, no enumerables, objetos congelados), se construyen los modelos de dominio, los emisores de eventos, los objetos de valor, los almacenes de ajustes, los sistemas de *plugins* y los componentes de interfaz de las aplicaciones reales. Esta página reúne once programas de ese tipo.

Ninguno usa `class`, que llega en el módulo siguiente, «Clases y POO». Y ese es el punto: lo que verás aquí es **exactamente** lo que `class` escribirá por ti. Una constructora con `Child.prototype` enlazado a `Parent.prototype`, métodos no enumerables, estáticos heredados y una llamada al padre por su nombre son, línea a línea, lo que hay debajo de `class Book extends CatalogItem { … }`. Cuando llegues allí, reconocerás cada pieza.

## Qué tienen en común

- **Datos en cada objeto, métodos en el prototipo.** Lo que cambia (estado, listas, oyentes) se crea en la constructora; los métodos y los valores por defecto **inmutables** (días de préstamo, opciones congeladas) viven en el prototipo, donde cada tipo hijo puede sombrearlos.
- **Herencia con el patrón completo.** `Parent.call(this, …)`, el prototipo enlazado (con `Object.create` o `Object.setPrototypeOf` al preparar el tipo), el `constructor` intacto y el método del padre llamado por su nombre. Muchos ejemplos enlazan también las constructoras, para que los estáticos se hereden como en `class`.
- **Métodos no enumerables.** Un helper `extendPrototype` instala los métodos con `defineProperty`, como los nativos y como hará `class`: no aparecen en `for…in` ni en `Object.keys`.
- **Atributos que trabajan.** Accesores que validan y normalizan al asignar, propiedades de solo lectura, datos internos no enumerables, objetos sellados o no extensibles para que una errata falle, y valores congelados en profundidad.
- **Delegación como herramienta.** Capas de *plugins*, estados de una máquina y valores por defecto que delegan en otros objetos; con `Object.hasOwn` se pregunta qué es propio y qué heredado.
- **Nada depende del entorno.** Fechas como texto o en UTC, `Intl` siempre con su `locale` y su `timeZone`, relojes simulados: cada salida es exacta y comprobable.

Una trampa aparece en dos ejemplos de esta página (los ajustes y la máquina de estados) y en «Ajustes por capas» de la integración, y merece una línea propia: cuando un objeto base está **congelado**, sus propiedades son de solo lectura, y una propiedad heredada de solo lectura impide crear la propia con `=` (lección «La cadena de prototipos»). Por eso esos ejemplos crean las propiedades con `defineProperty` o con el segundo argumento de `Object.create`.

Los dos ejemplos con interfaz usan un mínimo de DOM y eventos (`querySelector`, `createElement`, atributos, `addEventListener`), que se estudian en el capítulo 6; cada uno lo indica en un comentario.

## Programas de consola

### Biblioteca y préstamos

El modelo de dominio de una biblioteca municipal: ejemplares (`CatalogItem` → `Book`, `Magazine`, `Film`), socios (`Member` → `StudentMember`), préstamos y la biblioteca que los gestiona. Las reglas que cambian con el tipo (días de préstamo, multa diaria, máximo de préstamos, coeficiente de la multa) son valores inmutables en cada prototipo: `Film.prototype.loanDays` sombrea al de `CatalogItem`, y la revista del mes sombrea a su vez `referenceOnly` con una propiedad propia. Las constructoras validan antes de asignar nada (el ISBN-13 con su dígito de control, el año, el prefijo del código) y lanzan errores con un `code` que el programa traduce en mensajes; un error sin código se relanza, porque es un fallo de programación. Fíjate en el préstamo: sus datos son de solo lectura y el objeto está sellado, así que la errata `loan.returnedon` no crea nada.

[[exercise:01-biblioteca-y-prestamos.md-]]

```text
▼ Alta del catálogo
  ⛔ ISBN con una errata [bad-isbn]: «Rayuela»: el ISBN 978-84-204-2471-3 no es válido
  ⛔ código de otro tipo [bad-id]: película: el código «LIB-0006» debe empezar por DVD-
  …
▼ Préstamos y devoluciones
  1 sept ✅ Lucía Moreno se lleva «Roma» hasta el 4 sept
  1 sept ⛔ préstamo [reference-only]: «National Geographic España, n.º 290» es de consulta en sala
  1 sept ⛔ préstamo [limit]: Pablo Ibáñez ya tiene 3 préstamos (máximo 3 para un estudiante)
  7 sept ✅ Lucía Moreno devuelve «Roma»: 3 día(s) tarde, multa 3,00 €
  10 sept ✅ Pablo Ibáñez devuelve «National Geographic España»: 2 día(s) tarde, multa 0,10 €
  24 sept ⛔ préstamo [suspended]: Lucía Moreno tiene préstamos vencidos
(tabla de vencidos y tabla de reglas por ejemplar)
¿se ha creado returnedon? → false | préstamo → Loan {item: Book, member: Member, …}
```

### Emisor de eventos y tareas observables

Un tablero kanban construido sobre un `EventEmitter` hecho con prototipos. Cada emisor crea **su** mapa de oyentes en la constructora (en el prototipo lo compartirían todos), `on` devuelve la función de baja, `once` se construye sobre `on` y `emit` recorre una copia de la lista y aísla los errores: el oyente con un bug falla y los demás se ejecutan. `Task` hereda de `EventEmitter`, y sus campos son accesores generados en `Task.prototype` que validan, ignoran los cambios que no cambian nada y emiten `change`; `update` valida todo el parche antes de tocar nada y agrupa los cambios en un solo evento. `Board` escucha a sus tareas con flechas (su `this` es el tablero) y reemite sus cambios. Mira cómo el oyente del límite de trabajo en curso usa `function` para que `emit` le dé el tablero como `this`.

[[exercise:02-emisor-y-tareas-observables.md-]]

```text
▼ Durante el sprint
  ✎ T-001 status: pendiente → en curso
  ✎ T-003 status: pendiente → en curso
  ⚠️ un oyente de «task-change» ha fallado: Cannot read properties of null (reading 'length')
  ✎ T-002 status: pendiente → en curso
  ⚠️ límite de trabajo en curso: 3 tareas (máximo 2)
  ✎ T-003 assignee: — → Carla, status: en curso → hecha
  🎉 primera tarea terminada del sprint: Enlaces legales en el pie
  ⛔ RangeError: T-004.points: 4 no es un valor de la escala (1, 2, 3, 5, 8)
  ⛔ RangeError: T-004.assignee: «Dani» no está en el equipo
  ¿la factura cambió a medias? → pendiente
▼ Sprint 14 · tienda online
  …
  HECHA      (6 pt) T-002 Búsqueda sin tildes [5 pt, Bruno] · T-003 Enlaces legales en el pie [1 pt, Carla]
oyentes de task-change → 2 | de la factura → 0
```

### Dinero y cantidades

Objetos de **valor** para una tostadora de café que vende a granel: inmutables, comparados por contenido con `equals` y con operaciones que devuelven objetos nuevos. El dinero se guarda en unidades mínimas enteras y se crea desde texto (`Money.of('19.99', 'EUR')`), así que no hay coma flotante en ningún paso; el reparto usa el método del mayor resto y no pierde ni inventa céntimos. `Currency` aprovecha el paso 4 de `new`: si la moneda ya existe, la constructora devuelve la guardada, y `===` funciona entre monedas. `Money` solo se congela si `new.target` es `Money`, para no bloquear a un tipo hijo. Y `valueOf` lanza un error, como hace `Temporal`: `price + 1` y `price < other` fallan en lugar de dar resultados absurdos, mientras que las plantillas siguen funcionando porque usan `toString`.

[[exercise:03-dinero-y-cantidades.md-]]

```text
▼ Venta a granel
  ES · 250 g (0,25 kg) × 32,00 €/kg = 8,00 €
  US · 12 oz (0,34 kg) × $34.50/kg = $11.74
▼ Sin coma flotante
  0.1 + 0.2 → 0.30000000000000004
  Money: 0,10 € + 0,20 € → 0,30 €
  redondeo del banquero: 1,25 € × 0,1 → 0,12 € · 1,35 € × 0,1 → 0,14 €
▼ Repartos sin perder céntimos
  cena de 3 → 33,34 € + 33,33 € + 33,33 €
  propinas por horas (6/4/2) → $625.00 · $416.67 · $208.33 (suma $1,250.00)
▼ Seguridad
  ⛔ euros + pesos → TypeError: no se mezclan monedas: EUR y MXN
  ⛔ precio + 1 → TypeError: Money no se convierte a número: usa plus(), compare() o equals()
  Money.of('1500', 'JPY') → ￥1,500
  misma moneda → new Currency('eur') === new Currency('EUR'): true
  valor → === : false | equals: true
```

### Ajustes con esquema

Los ajustes de un lector de libros electrónicos, descritos por un esquema congelado. `defineSettingsType` crea un **tipo** de ajustes: un prototipo con un accesor por clave, compartido por todos los almacenes de ese tipo, que hereda de los métodos comunes. Cada almacén guarda sus valores en un objeto que delega en los de fábrica: lo propio son los cambios del usuario, `toJSON` guarda solo eso (el spread copia lo propio), `snapshot` recorre con `for…in` también lo heredado y restablecer es borrar. Los almacenes no son extensibles: `live.fontsize = 22` (con minúscula) se ignora en un script clásico y lanza un `TypeError` en modo estricto, que el ejemplo provoca a propósito. `load` migra los datos de una versión anterior (claves renombradas, valores no válidos, claves desconocidas) y devuelve la lista de problemas en lugar de fallar a la primera.

[[exercise:04-ajustes-con-esquema.md-]]

```text
▼ Cargar los ajustes de la versión 1
  · «font_size» ahora se llama «fontSize»: migrado
  · «theme» admite claro, sepia, oscuro; llegó "noche": se usa "claro"
  · «goal» ahora se llama «dailyGoal»: migrado
  · «fontFamily»: ajuste desconocido, se descarta
(tabla: cada ajuste con su valor y su origen, de fábrica o usuario)
▼ El usuario cambia cosas
  ✎ theme: claro → oscuro
  ✎ fontSize: 20 → 18
  ✎ lineHeight: 1.6 → 1.8
  ⛔ fontSize = 40 → RangeError: «fontSize» va de 12 a 32; llegó 40
  ¿se creó 'fontsize'? → false
  ⛔ en modo estricto → TypeError: Cannot add property fontsize, object is not extensible
guardar → {"dailyGoal":30,"hyphenation":false,"lineHeight":1.8,"theme":"oscuro"}
¿accesores compartidos? → true | ¿theme es propia? → false
tras reset() → {} | theme → claro
```

### Formateador con *plugins*

Un formateador de texto a HTML para los artículos y comentarios de un blog de cocina. Cada *plugin* (código, enlaces, menciones, negrita, cursiva, tipografía, emojis) es una capa creada con `Object.create(capa de debajo)` que convierte lo suyo y delega el resto en la capa de debajo **por su nombre** y con el mismo `this`; lo que ya ha convertido no lo toca nadie más. Lo primero es escapar el HTML, así que un `<script>` en un comentario se ve como texto, y los enlaces solo admiten `https:`, `mailto:` y rutas internas. Las opciones (`baseUrl` de las menciones, `nofollowLinks`) son propiedades propias de cada formateador que los *plugins* leen con `this`: la misma pila sirve para artículos y comentarios. El final demuestra que el **orden** de la cadena importa. Todo sin expresiones regulares, a propósito: solo `split`, `indexOf` y recorridos, para que cada capa se lea paso a paso.

[[exercise:05-formateador-con-plugins.md-]]

```text
artículos → artículos → código → enlaces → menciones → negrita → cursiva → tipografía → emoji → base
<p>Para el <strong>mole poblano</strong> necesitas <em>paciencia</em>… y un buen metate 🌶️</p>
<p>La receta completa está en <a href="/recetas/mole-poblano">nuestro recetario</a> — la escribió <a href="/autores/lucia_rivas">@lucia_rivas</a> con su abuela, que decía: «sin prisa no hay mole».</p>
▼ Comentarios
  <p>Mi truco: &lt;script&gt;robarCookies()&lt;/script&gt; ¿se ve?</p>
  <p>Mira este premio y <a href="https://cocina.example.org/moles" rel="nofollow ugc">mi blog</a></p>
  <p>Atajo: escribe <code>**negrita**</code> para resaltar</p>
🐛 código debajo → <p>En Python, `a <strong> b<code> y </code>c </strong> d` son potencias</p>
✅ código arriba  → <p>En Python, <code>a ** b</code> y <code>c ** d</code> son potencias</p>
```

### Inspector de prototipos

Una versión en texto de lo que enseña la consola al expandir un objeto. `inspect` recorre la cadena de cualquier valor, anida cada `[[Prototype]]` dentro del anterior y marca cada propiedad con sus atributos (`E` enumerable, `W` escribible, `C` configurable), si es un accesor y si está **sombreada** por un eslabón más cercano. Nunca ejecuta un getter: los describe, como el `(...)` de la consola. Inspecciona un audiolibro de tres niveles (con una propiedad interna, una clave *symbol* y el objeto sellado), un array, un objeto congelado, un diccionario sin prototipo, una función (con `prototype` propio y las viejas `arguments` y `caller` de las funciones no estrictas), un string a través de su envoltorio y un objeto creado con `Object.create(AudioBook.prototype)` que nunca pasó por la constructora. Los prototipos nativos se resumen en una línea con su número de propiedades, que depende de la versión del navegador.

[[exercise:06-inspector-de-prototipos.md-]]

```text
▼ audio · 🔏 sellado
  EW-  title            'Pedro Páramo'
  …
  ---  _loadedAt        '2026-10-13T09:00:00Z'
  EW-  [Symbol(catalogId)] 'AUD-0042'
  ▼ [[Prototype]]: AudioBook.prototype · extensible
    -WC  constructor      ƒ AudioBook()
    EWC  describe         ƒ ()
    ▼ [[Prototype]]: Book.prototype · extensible
      -WC  constructor      ƒ Book()   ⤷ sombreada
      EWC  describe         ƒ ()   ⤷ sombreada
      ▼ [[Prototype]]: MediaItem.prototype · extensible
        …
        - C  age              get (accesor)
        [[Prototype]]: Object.prototype · nativo: … propiedades (resumidas)
        [[Prototype]]: null
▼ plan · 🔒 congelado
  E--  name             'Premium'
  …
(tabla: propias, heredadas, accesores y no enumerables de cada valor)
```

### Paquete de *polyfills*

Siete *polyfills* (`at` de arrays y de strings, `findLast`, `toSorted`, `with`, `Object.hasOwn` y `Object.groupBy`) descritos como registros: dónde van, su implementación, una detección **por comportamiento** y sus casos de prueba. `install` instala solo lo que falta o falla, con los atributos de un método nativo. Como Chrome ya lo tiene todo, el paquete se instala también en un navegador antiguo **simulado** (objetos vacíos que hacen de `Array.prototype`, `String.prototype` y `Object`), uno de ellos con un `with` defectuoso de una librería vieja; el Chrome real no se modifica nunca. Un mini ejecutor de pruebas compara cada implementación con el método nativo, prestado con `call`, en 30 casos, errores incluidos, y una auditoría final comprueba que los atributos instalados coinciden con los nativos.

[[exercise:07-paquete-de-polyfills.md-]]

```text
(tabla: en Chrome, «nativo correcto: no se toca»; en el navegador antiguo, «instalado», y en with, «⚠️ existía pero fallaba: reemplazado»)
▼ Pruebas (polyfill frente a nativo)
  ✓ Array.prototype.at         6/6
  …
  ✓ Object.groupBy             3/3
  30 pruebas · 0 fallos
▼ Uso en el navegador antiguo
  steps.at(-1) → confirmación
  steps.with(-1, "¡gracias!") → (4) ['carrito', 'envío', 'pago', '¡gracias!']
  for…in → 0,1,2,3 (ni un método: todos no enumerables)
  groupBy → [Object: null prototype] {cortas: Array(2), largas: Array(2)}
(tabla de auditoría: W-C en el nativo y en el polyfill)
```

### Registros con cambios pendientes

Un mini ORM en memoria para una herramienta de facturación. `defineModel` genera tipos (`Customer`, `Invoice`) que heredan de `Record` por las dos cadenas: los métodos (`save`, `revert`, `changes`) y el estático `find`, que usa `this` para saber qué modelo lo llama. Cada campo es un accesor del prototipo que normaliza (el email en minúsculas), valida y recuerda el valor original la primera vez que cambia; si el valor vuelve al original, el cambio desaparece. `save` envía solo las columnas cambiadas, con los valores como parámetros aparte (la forma de evitar la inyección SQL), y `find` crea los registros con `Object.create(Model.prototype)` **sin** pasar por la constructora: leer de la base no es un cambio, y `instanceof` sigue funcionando porque solo mira la cadena.

[[exercise:08-registros-con-cambios.md-]]

```text
▼ Editar un cliente
  hidratado → Ana Torres Studio | ¿cambios? → false | ¿instanceof Customer y Record? → true true
  (tabla: email y plan, antes y ahora)
  guardar → UPDATE customers SET email = ?, plan = ? WHERE id = ?  ["hola@anatorres.example","pro",1]
  guardar otra vez → (sin cambios: no se envía nada)
  ⛔ plan = 'vip' → RangeError: Customer.plan: admite gratis, pro, empresa ("vip")
▼ Altas
  cliente nuevo → INSERT INTO customers (name, email, plan, vatId) VALUES (?, ?, ?, ?)  [ … ]
  ⛔ con una errata → TypeError: Cannot add property emial, object is not extensible
  ⛔ sin email → RangeError: Customer: email es obligatorio
  ⛔ fecha imposible → RangeError: Invoice.issuedOn: fecha AAAA-MM-DD ("2026-02-31")
▼ Deshacer cambios
  tras revert → {customerId: 2, issuedOn: '2026-10-01', totalCents: 4840, paid: false, id: 1} | ¿cambios? → false
Object.keys(ana) → [] | JSON → {"id":1,"name":"Ana Torres Studio",…}
```

### Guardar y restaurar tipos

El estado de un planificador de viajes se guarda como JSON y vuelve con sus prototipos. Primero, el problema: tras `JSON.parse` un viaje ya no es un `Trip`, sus fechas son texto y el mismo viajero aparece copiado en cada reserva; `structuredClone` conserva las fechas, pero tampoco los prototipos. El serializador marca cada objeto con su tipo y un número (`$type`, `$id`), escribe referencias (`$ref`) a los repetidos y, al leer, recrea cada objeto con `Object.create(Type.prototype)` **sin** ejecutar la constructora (que cuenta altas y validaría datos ya validados). Los tipos se buscan en un registro sin prototipo, así que `"$type": "constructor"` no encuentra nada, y las propiedades se crean con `defineProperty`: con una asignación, una clave `"__proto__"` en los datos cambiaría el prototipo del objeto. Las fechas de los vuelos se muestran en la zona de cada aeropuerto.

[[exercise:09-guardar-y-restaurar-tipos.md-]]

```text
Navidad en Ciudad de México · 2 viajeros · 4138,00 €
  ✈️ MAD→MEX vie, 18 dic, 12:05 CET → vie, 18 dic, 17:10 GMT-6 · IB6401 · 1498,00 €
  🏨 Casa Roma Boutique, 9 noches · HTL-88213 · 1242,00 €
  ✈️ MEX→MAD dom, 27 dic, 19:35 GMT-6 → lun, 28 dic, 13:50 CET · IB6400 · 1398,00 €
▼ 🐛 JSON a secas
  ¿instanceof Trip? → false | plain.totalCents → undefined
  fecha de salida → string 2026-12-18T11:05:00.000Z
  ¿viajero compartido? → false
  structuredClone → ¿instanceof Trip? false | ¿Date? true
▼ ✅ Con el serializador
  ¿instanceof Trip, Flight y Booking? → true true true
  ¿Date? → true | ¿viajero compartido? → true
  ¿se ejecutó la constructora de Traveler? → no: siguen siendo 2 altas
  ✓ el viaje restaurado se describe igual que el original
▼ Datos manipulados
  ⛔ TypeError: tipo desconocido en los datos: «constructor»
  ⛔ RangeError: referencia rota: $ref 7
  🐛 con asignación → isAdmin: true
  ✅ con defineProperty → isAdmin: undefined | ¿Traveler? true | __proto__ propia: true
```

## Pequeñas aplicaciones con interfaz

Los dos ejemplos siguientes combinan este módulo con los capítulos de HTML y CSS: elementos semánticos, regiones `role="status"`, foco visible, atributos ARIA y un diseño que se adapta al ancho. La lógica (los tipos y sus prototipos) está separada de la interfaz, que solo traduce eventos en llamadas y pinta el resultado. Pruébalos con el ratón y con el teclado, y abre la consola: los dos registran lo que pasa por dentro.

### Seguimiento de pedidos

Una máquina de estados para el ciclo de vida de un pedido. Cada estado es un objeto **congelado** que delega en `baseState`, donde cada acción tiene un método que la rechaza con un mensaje claro; un estado solo escribe los métodos de las acciones que admite, y así sombrea el rechazo. Las acciones disponibles no están en ninguna lista aparte: son los métodos **propios** del estado (`Object.hasOwn`), y la consola los muestra en una tabla. La devolución acepta con condiciones: si han pasado más de 14 días desde la entrega, vuelve al rechazo del padre nombrándolo. Los botones no disponibles usan `aria-disabled`, así que siguen recibiendo el foco y, al pulsarlos, el aviso explica por qué no. Prueba a pedir la devolución después de «⏩ Avanzar 15 días».

[[exercise:10-seguimiento-de-pedidos.md]]

### Widgets accesibles

La ficha de un molinillo de café con pestañas y un acordeón de preguntas frecuentes. Los dos heredan de `Widget`, un tipo base con opciones por defecto (objetos congelados en cada prototipo, que el hijo sombrea), estado, oyentes que se limpian solos y un `render` «abstracto» que lanza un error si un widget no lo implementa. Es **mejora progresiva**: sin JavaScript se ven todos los paneles; los widgets añaden los roles y atributos ARIA y el teclado de los patrones de WAI-ARIA (flechas, <kbd>Inicio</kbd> y <kbd>Fin</kbd> en las pestañas). El botón «Pestañas activadas» llama a `destroy`, que quita los oyentes y devuelve el HTML a su estado original, y la casilla del acordeón lo vuelve a crear con otra opción.

[[exercise:11-widgets-accesibles.md]]

## Resumen

- Un tipo es una constructora (datos propios) más un prototipo (métodos y valores inmutables compartidos); los tipos hijos enlazan sus prototipos y, si quieren heredar los estáticos, también sus constructoras.
- Los accesores en el prototipo validan, normalizan y avisan de los cambios para todos los objetos de un tipo; los datos que manejan viven en propiedades propias no enumerables.
- Sellar, impedir extensiones o congelar convierte las erratas y las escrituras indebidas en errores (en modo estricto) o en nada (en un script clásico), nunca en datos corruptos.
- La delegación construye capas: *plugins*, ajustes que heredan de los de fábrica, estados que heredan un rechazo. `Object.hasOwn` dice qué es propio de cada capa.
- Crear con `Object.create(Type.prototype)` da un objeto del tipo sin ejecutar la constructora: es lo que necesitan la hidratación y la deserialización.
- Con datos que llegan de fuera, registros sin prototipo y `defineProperty` en lugar de `=`: `"constructor"` y `"__proto__"` no son claves inocentes.
- Todo esto es lo que `class` escribirá por ti en el módulo siguiente.

## Para profundizar

- [MDN: herencia y la cadena de prototipos](https://developer.mozilla.org/es/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [Martin Fowler: Value Object (en inglés)](https://martinfowler.com/bliki/ValueObject.html)
- [WAI-ARIA APG: patrón Tabs (en inglés)](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [WAI-ARIA APG: patrón Accordion (en inglés)](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/)
- [OWASP: contaminación de prototipos (en inglés)](https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html)
