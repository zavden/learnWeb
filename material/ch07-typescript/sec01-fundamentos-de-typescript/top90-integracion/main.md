# Integración: fundamentos de TypeScript

## Por qué importa

Las seis lecciones del módulo enseñan las piezas por separado: anotaciones e inferencia, `unknown` y `null`, tipos de objeto, uniones y estrechamiento, literales y `as const`, funciones tipadas. En un programa de verdad aparecen todas a la vez, y lo que importa es cómo se apoyan unas en otras: una unión de literales solo es útil si el texto que llega del HTML se **convierte** en ella; una unión discriminada solo es segura con un `switch` exhaustivo; un tipo de objeto solo protege si los datos de fuera se **comprueban** antes de recibirlo.

Los siete ejemplos de esta página combinan dos, tres o cuatro lecciones cada uno. Ninguno tiene errores de tipos: ábrelos en el editor y fíjate en que, aun así, casi no hay anotaciones dentro de las funciones. En los tres ejercicios del final, el objetivo es doble: que las comprobaciones salgan ✓ y que el verificador no marque nada. Dos empiezan con errores de tipos; en el otro, el problema es justo que el verificador no puede ver nada.

## Las decisiones que se repiten

| Necesitas… | Usa… | Lección |
|---|---|---|
| que una función deje claro lo que acepta | parámetros anotados; retorno anotado si tiene varios caminos | «Funciones tipadas» |
| una lista cerrada de valores | una unión de literales (`'local' \| 'national'`), o un objeto `as const` si necesitas los valores en ejecución | «Literales y `as const`» |
| convertir un texto (HTML, formulario) en esa unión | un `switch` (o comparaciones) que devuelve el literal o `null` | «Literales y `as const`» |
| datos con formas distintas según el caso | una unión discriminada con `kind`/`method` y un `switch` | «Uniones y estrechamiento» |
| que un caso nuevo no se olvide | `default: return assertNever(valor)` | «Uniones y estrechamiento» |
| datos de fuera (JSON, `localStorage`) | `unknown` + `typeof`/`in`/`Array.isArray`, y un resultado `ok`/`error` | «Tipos básicos» y «Uniones» |
| elementos del DOM que deben existir | una función que lanza si falta y estrecha con `instanceof` | «Tipos básicos» y «Uniones» |
| objetos que no deben cambiar | `readonly` en propiedades y `readonly T[]` en listas; devolver copias | «Tipos de objeto» |
| un comportamiento configurable | un tipo de función como parámetro, opcional con `?` y llamado con `?.()` | «Funciones tipadas» |

## Ejemplos combinados

### Un ticket con IVA

Un ticket de una tienda de abarrotes con el IVA desglosado: 16 % para los productos generales y tasa 0 para los alimentos básicos. Las tasas viven en un objeto `as const`, y como el tipo de cada línea dice `tax: 'general' | 'basicFood'`, `TAX_RATES[item.tax]` siempre encuentra su valor. El pago es una unión discriminada con tres formas (efectivo, tarjeta y vale), tratada con un `switch` exhaustivo. `printTicket` recibe la función que escribe cada línea: por defecto `console.log`, y en la segunda llamada, una flecha que guarda las líneas en un array (y devuelve el número de `push`, cosa que un callback `void` admite).

[[exercise:01-ticket-con-iva.md-]]

```text
🧾 Abarrotes La Esperanza
2 × Tortillas de maíz 1 kg     $44.00 E
1 × Frijol negro 1 kg          $45.00 E
3 × Jabón de lavandería        $55.50 G
1 × Pilas AA (4 piezas)        $89.00 G
Subtotal                      $233.50
IVA 16 %                       $23.12
TOTAL                         $256.62
Efectivo $300.00 · cambio $43.38
📄 ticket guardado: 8 líneas · total $256.62 · pago: Vale DESPENSA-200 · por pagar $56.62
```

### Reservas con estados

Una reserva de hostal pasa por tres estados, y cada uno tiene sus datos: una pendiente caduca en una fecha, una confirmada tiene habitación, una cancelada tiene motivo. Con una unión discriminada es imposible una «confirmada sin habitación». La estancia es una tupla `readonly` con nombres en sus posiciones. Las transiciones (`confirmBooking`, `cancelBooking`) nunca cambian la reserva: comprueban que el cambio está permitido y devuelven una reserva nueva con `{ ...booking, state }`. Por eso, al final, la reserva original sigue pendiente.

[[exercise:02-reservas-con-estados.md-]]

```text
⏳ R-301 Lucía Méndez (2026-12-20 → 2026-12-23, 3 noches): pendiente hasta 2026-11-30
¿se solapan? → true
✅ R-301 Lucía Méndez (2026-12-20 → 2026-12-23, 3 noches): habitación 4
✖️ R-302 Diego Ríos (2026-12-22 → 2026-12-26, 4 noches): cancelada (cambio de planes)
¿la original sigue pendiente? → pending
⛔ R-302: solo se confirma una reserva pendiente (está «cancelled»)
⛔ R-302: ya estaba cancelada
```

Fíjate en `describe`: copia `booking.state` a una `const` antes del `switch`. Con la propiedad directamente también funcionaría aquí, pero es la costumbre que evita el problema de la lección 4 cuando hay callbacks de por medio.

### Los datos de fuera, comprobados a mano

La carta de un restaurante llega como JSON, con dos entradas rotas. La versión con `any` se lo traga todo y falla al usar los datos. La versión con `unknown` comprueba cada propiedad con `typeof` e `in` (desde TypeScript 4.9, después de `'name' in data`, TypeScript deja leer `data.name` como `unknown` y estrecharlo). El resultado de `readItem` es una unión discriminada, `{ ok: true; item } | { ok: false; error }`, que obliga a quien la llama a tratar los dos casos.

[[exercise:03-datos-de-fuera.md-]]

```text
🐛 con any → TypeError: Cannot read properties of undefined (reading 'toUpperCase')
⚠️ taj: falta name
⚠️ poz: price debe ser un número ≥ 0
✅ Tlayuda · $120.00 oaxaqueña
✅ Mole negro · $165.00 🌶️ oaxaqueña temporada
✅ Agua de jamaica · $35.00
```

Un detalle de `Array.isArray`: sobre un `unknown`, estrecha a `any[]`, y el `any` volvería a colarse. Por eso el resultado se guarda enseguida en una variable `unknown[]`, y cada elemento se comprueba igual que el resto. El módulo 2 convierte este trabajo manual en funciones reutilizables (las *type guards*).

### Un selector de cantidad

La ficha de un café con un selector de cantidad. Todos los botones comparten un listener delegado en la tarjeta. `event.target` es `EventTarget | null`, así que primero se estrecha con `instanceof Element`. El `data-action` de cada botón es un `string` cualquiera escrito en el HTML: `toAction` lo convierte en la unión `'increment' | 'decrement' | 'reset'` o en `null`. El botón «×2», que no forma parte de la unión, se ignora con un aviso en lugar de hacer algo raro. `nextQuantity` cubre los tres casos con un `switch` exhaustivo.

[[exercise:04-selector-de-cantidad.md]]

```text
Listo: pulsa + y − (hay 5 bolsas), «Vaciar» o «×2»
// Tras pulsar + cuatro veces (el botón + se desactiva al llegar a 5):
increment → 2 · $420.00
increment → 3 · $630.00
increment → 4 · $840.00
increment → 5 · $1050.00
// Tras pulsar «×2» y «Vaciar»:
⚠️ acción desconocida «double»: se ignora
reset → 0 · $0.00
```

[[exercise:04-selector-de-cantidad.md-(script.ts)]]

### Estancias con sobrecargas

`describeStay` acepta tres formas de dar una estancia: una tupla con dos fechas, dos fechas sueltas, o una fecha y un número de noches. Las tres sobrecargas documentan esas formas y devuelven `string`. La implementación, invisible desde fuera, estrecha el primer argumento con `instanceof Date` y el segundo con `typeof`. Las fechas se escriben con `Intl.DateTimeFormat` en UTC, para que el resultado no dependa de la zona horaria de quien lo ejecuta.

[[exercise:05-estancias-con-sobrecargas.md-]]

```text
tupla        → jue 24 de dic → dom 27 de dic (3 noches)
dos fechas   → jue 24 de dic → dom 27 de dic (3 noches)
fecha+noches → jue 24 de dic → vie 25 de dic (1 noche)
⛔ RangeError: Una estancia necesita al menos 1 noche (hay -3)
parámetros en ejecución → 2
```

Las fechas al revés compilan sin error, porque los tipos no saben qué fecha es anterior: es una comprobación de ejecución, y la función la hace.

### Reglas de precio

Un pequeño motor de descuentos. Cada regla es un objeto con un nombre y una función `apply` de centavos a centavos. `runRules` las aplica en orden con `reduce` y, si recibe el callback opcional `onStep`, lo llama con cada paso (`onStep?.(…)`: el encadenamiento opcional también sirve para llamar a una función que puede no estar). El cupón que escribe la persona se convierte en la unión `CouponCode` con un `switch`, y la tabla `COUPON_PERCENT` es `as const`.

[[exercise:06-reglas-de-precio.md-]]

```text
🛒 carrito $840.00
   cupón BUENFIN: $840.00 → $630.00
   socio: $630.00 → $580.00
   total $580.00
⚠️ cupón «GRATIS» no válido
🛒 carrito $320.00
   total $320.00
sin informe → $714.00
```

### Un catálogo filtrable

Dos `<select>` filtran y ordenan un catálogo. Su `value` es un `string`, así que `toCategory` y `toSortKey` lo convierten en las uniones del programa. Si alguien añade al HTML una opción que el código no conoce, se usa el valor por defecto en lugar de filtrar por algo inexistente. Los elementos se obtienen con `byId` y `selectById`, que lanzan un error si falta alguno y estrechan con `instanceof HTMLSelectElement`. El comparador de cada orden lo devuelve un `switch` exhaustivo con el tipo de función `Comparator`; gracias a ese tipo de retorno, las flechas no necesitan anotar `a` ni `b`.

[[exercise:07-filtro-de-catalogo.md]]

```text
🔎 todo · price-asc → TE-LIM, TE-HIB, CAF-VER, CAF-CHI, PRE-FR, MOL-MAN
Listo: cambia la categoría o el orden
// Tras elegir la categoría «Café»:
🔎 Café · price-asc → CAF-VER, CAF-CHI
// Tras elegir el orden «Nombre»:
🔎 Café · name → CAF-CHI, CAF-VER
```

[[exercise:07-filtro-de-catalogo.md-(script.ts)]]

## Ejercicios

Los tres ejercicios se corrigen solos: al cargar, cada comprobación imprime `✓` o, en rojo, `✗` con el valor esperado y el obtenido. Pero en TypeScript eso es solo la mitad del objetivo: el ejercicio está terminado cuando las comprobaciones salen ✓ **y** el verificador no marca ningún error de tipos. Míralo en el editor (subrayados y lista «Compile») o en la franja «Errores de tipos» del diálogo «▶ Run». Las comprobaciones están escritas sin errores de tipos, así que no hace falta tocarlas: si una línea suya sale en rojo, el problema está en tu código.

### Tipa el ticket

Un módulo de tickets escrito como JavaScript sin tipos: con `strict`, cada parámetro es un error `TS7006`. Al declarar el tipo `LineItem` y anotar las funciones, el verificador encuentra los cuatro bugs que escondía el módulo, los mismos que hacen fallar las comprobaciones. Cinco comprobaciones.

[[exercise:08-ej-tipa-el-ticket.md]]

### Envíos sin strings sueltos

El cálculo de envíos recibe la zona y la velocidad como `string`, y compara con dos textos mal escritos que nadie detecta: con `string`, cualquier comparación es válida, así que este ejercicio empieza sin ningún error de tipos. Cámbialos por uniones de literales, deja que el verificador señale las comparaciones imposibles y reescribe la lógica con un `switch` exhaustivo. Cinco comprobaciones; la última simula una zona desconocida que llega en un JSON.

[[exercise:09-ej-envios-sin-strings.md]]

### Un boletín sin `null`

El formulario de un boletín toma sus elementos con `querySelector` y los usa sin comprobar nada: cinco errores `TS18047` y un `TS2339`, porque un `Element` no tiene `value`. Escribe funciones que exijan cada elemento y lo estrechen con `instanceof`. Al usarlas, aparecerá el bug que las comprobaciones detectan. Las comprobaciones simulan el envío con `dispatchEvent`. Cuatro comprobaciones.

[[exercise:10-ej-boletin-sin-null.md]]
