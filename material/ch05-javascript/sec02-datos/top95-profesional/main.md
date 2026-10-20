# Ejemplos profesionales

## Por qué importa

Con este módulo ya tienes todas las piezas para trabajar con datos reales: números que no pierden céntimos, texto que respeta los emojis y las tildes, arrays, objetos, `Map` y `Set` para organizarlo todo, JSON para leer y guardar, y fechas e `Intl` para mostrarlo como espera cada persona. Esta página reúne doce programas como los que escribirías en un trabajo: informes, lectores de archivos, conciliaciones, configuraciones, agendas y una cesta de la compra. Ninguno usa una función avanzada; lo que los hace profesionales son las **decisiones**, y los comentarios de cada uno explican el porqué.

## Qué tienen en común

- **Cada dato con su estructura.** Registros con campos fijos en objetos; diccionarios con claves que llegan en ejecución en `Map` (nunca un objeto con claves que vienen de los datos); valores únicos y pertenencia en `Set`; lo que tiene orden, en arrays.
- **Dinero en céntimos enteros**, redondeado con `Math.round` en cuanto aparecen decimales y repartido de forma explícita cuando hay sobrantes. `Intl.NumberFormat` solo al mostrar.
- **Texto normalizado al recibirlo** (`trim`, `normalize`) y contado en grafemas cuando el límite lo ve una persona.
- **Fechas sin ambigüedad.** Instantes como ISO con zona; fechas de calendario como medianoche UTC; cálculos de calendario («¿qué día es en Madrid?») con `formatToParts` en la zona del negocio; y `locale` y `timeZone` explícitos en cada `Intl`, para que la salida no dependa del ordenador que ejecuta el código.
- **Validar todo antes de cambiar nada**, reunir todos los errores con su contexto (línea, ruta, campo) y separar el fallo del programa (`TypeError` que se relanza) del dato inválido (un mensaje para la persona).
- **No mutar lo que no es tuyo**: `toSorted`, `with`, spread y `structuredClone` crean copias; los datos de entrada se quedan como llegaron.

Los ejemplos usan funciones con la sintaxis básica y funciones flecha (módulo «Funciones y ámbito»). Los que tienen interfaz usan un mínimo de DOM y eventos (`querySelector`, `textContent`, `createElement`, `addEventListener`), que se estudian en el capítulo 6; cada uno lo indica en un comentario.

## Programas de consola

### Informe trimestral de ventas

Una tienda online exporta sus pedidos como líneas de texto. El programa valida cada línea (producto del catálogo, cantidad entera, estado conocido), aparta las inválidas con su motivo y agrupa los pedidos entregados con `Map.groupBy`: por mes, por región y por canal. Fíjate en la agrupación por mes: se hace en la zona del negocio, `Europe/Madrid`. Un pedido de las 00:40 del 1 de agosto en Madrid todavía es 31 de julio en UTC, y el informe lo señala. El crecimiento mensual usa `signDisplay: 'exceptZero'` para escribir el `+`, y el ranking de productos es un `Map` usado como contador sobre `flatMap` de todas las líneas.

[[exercise:01-informe-de-ventas-trimestral.md-]]

```text
INFORME DEL 3.er TRIMESTRE DE 2026 · Té y Café en Casa (tienda online)
⚠ 2 líneas apartadas para revisar:
    P-24170: producto desconocido «CAF-KEN»
    P-24176: cantidad no válida en TE-SEN («0»)
Pedidos: 22 (entregados 18, devueltos 2, cancelados 2)
Facturación neta: 744,50 € (solo pedidos entregados)
Ticket medio: 41,36 €
Tasa de devolución: 10 %
▼ Por mes (Europe/Madrid)
    julio         5 pedidos     165,00 €
    agosto        6 pedidos     223,40 €  +35,4 %
    septiembre    7 pedidos     356,10 €  +59,4 %
🐛 Si agruparas en UTC, P-24063 (2026-07-31T22:40:00.000Z) contaría en julio, no en agosto.
(tabla por región: Comunidad de Madrid 240,80 € 32,3 % · Cataluña 175,60 € 23,6 % · …)
Canales: web 49,8 %, app 29,2 % y marketplace 21 %
Más vendidos: 1. Café de Etiopía 250 g · 17 uds. 2. Café de Colombia 250 g · 13 uds. …
```

### Lector de CSV de Excel

Un CSV real no se lee con `split(';')`: los campos entre comillas pueden contener el separador, saltos de línea y comillas dobladas (`""`), Excel añade un BOM invisible al principio y usa `\r\n`. El lector es una pequeña máquina de estados que recorre el texto por code points, y un esquema convierte cada columna a su tipo: fechas `dd/mm/aaaa` (rechazando el 31 de septiembre, que `Date` aceptaría desbordándolo a octubre), importes `1.234,56` (exigiendo grupos de tres cifras para que un `11.90` mal escrito no se convierta en 1190 €) y «sí/no». Cada fila acumula todos sus errores con el número de línea donde empieza.

[[exercise:02-lector-de-csv.md-]]

```text
🐛 primera cabecera → 6 caracteres, el primero es U+FEFF
9 filas → 6 válidas, 3 con errores
(tabla: línea, fecha, cliente, producto, importe y pagado de las 6 filas válidas)
⚠ Filas rechazadas:
    línea 7: fecha «31/09/2026» no es una fecha válida (dd/mm/aaaa)
    línea 8: cliente es obligatorio
    línea 9: cantidad «dos» no es un entero positivo · precio «11.90» no es un importe válido (formato 1.234,56) · pagado «tal vez» no es «sí» ni «no»
Pendiente de cobro → 433,00 €
Nota con salto de línea (línea 3) → "Entregar por la tarde.\nLlamar antes"
```

### Estadísticas de notas

La nota final de un grupo de Bachillerato es una media ponderada (60 % examen, 30 % prácticas, 10 % participación) redondeada a una décima. Con decimales, `0.6 * 4.1 + 0.3 * 6.3 + 0.1 * 6` da `4.949999999999999` y un alumno que tiene un 4,95 (aprobado) recibe un 4,9 (suspenso). El programa pasa las notas a **décimas enteras** y los pesos a porcentajes enteros, así que la cuenta es exacta, y lo demuestra comparando las dos versiones. Después calcula media, desviación típica, mediana y percentiles (interpolación lineal, como NumPy y Excel), una distribución con barras de texto y la mejor nota con empates.

[[exercise:03-estadisticas-de-notas.md-]]

```text
(tabla con alumno, examen, prácticas, participación, final y calificación, ordenada con Intl.Collator)
⚠ Notas por revisar antes de publicar:
    Carmen Ruiz: falta la nota de prácticas
    Pau Vidal: «10,5» no es una nota de 0 a 10 (examen)
🐛 Óscar Benítez: con decimales 4.949999999999999 → 4,9 (Suspenso) · en enteros → 5,0 (Aprobado)
🐛 Martina García: con decimales 5.05 → 5,0 (Aprobado) · en enteros → 5,1 (Aprobado)
▼ Estadística de 11 presentados
    media 6,22 · desviación típica 2,25
    mínima 1,8 · máxima 9,5
    P25 5 · mediana 6,3 · P75 7,8 · P90 9,3
    aprobados 9 de 11 (81,8 %)
▼ Distribución
    Suspenso      ██████          2 (18,2 %)
    Aprobado      ████████████    4 (36,4 %)
    Notable       █████████       3 (27,3 %)
    Sobresaliente ██████          2 (18,2 %)
Mejor nota (9,5): Lucía Navarro
```

### Conciliación bancaria

Comprueba que cada movimiento del extracto del banco tiene su apunte en la contabilidad y al revés. Los importes se pasan a céntimos, el saldo se verifica línea a línea (y aparece una diferencia de 100 € que delata un movimiento perdido), y el emparejado usa un `Map` de importe → apuntes con un margen de ±3 días, con un `Set` de objetos para no usar dos veces el mismo apunte. Las referencias del banco tienen 19 cifras: como `Number` dos de ellas se vuelven iguales, así que se guardan como texto y se comparan con `BigInt`.

[[exercise:04-conciliacion-bancaria.md-]]

```text
🐛 referencias distintas como Number → 7 de 8
✅ referencias distintas como texto → 8 de 8
⚠ Línea 8 (16/10/2026): el saldo debería ser 15.288,08 € y el banco dice 15.388,08 €. Diferencia: +100,00 €. ¿Falta un movimiento?
▼ Conciliados (6)
    ✓ 02/10/2026  +2.420,00 €  Cobro factura 2026-0141 · Acme Iberia (1 día de diferencia)
    …
▼ Solo en el banco (2): hay que contabilizarlos
    + 09/10/2026      -6,00 €  COMISION MANTENIMIENTO CUENTA
    + 12/10/2026     +45,00 €  BIZUM DE MARTA GIL
▼ Solo en la contabilidad (1): aún no han llegado al banco
    ? 2026-10-12    +605,00 €  Cobro factura 2026-0144 · Restaurante Txoko
Saldo según el banco:         15.388,08 €
Saldo según la contabilidad:  15.854,08 €
Contabilidad ± pendientes:    15.288,08 €
⚠ Queda sin explicar +100,00 €: revisa la línea marcada arriba.
```

### Cargador de configuración

Un `config.json` escrito por personas tiene erratas, tipos equivocados (`"8080"` en vez de `8080`) y valores fuera de rango. El cargador lee con un **reviver** que convierte `'30s'` y `'15m'` en milisegundos y los textos ISO en `Date`, y que descarta la clave `"__proto__"`: el ejemplo muestra que copiarla con una asignación cambia el prototipo del objeto destino (lo entenderás del todo en «Objetos y prototipos»). Después valida contra un esquema guardado en un `Map` (tipo, rango, valores permitidos con `Set`, subconjuntos con `difference`), sugiere la clave correcta para las erratas con una distancia de edición y completa los valores por defecto sección a sección sobre una copia hecha con `structuredClone`. La ventana de mantenimiento cruza el cambio de hora: 01:00 → 04:00 en el reloj son 4 horas reales.

[[exercise:05-cargador-de-configuracion.md-]]

```text
⚠ config.json no es JSON válido: Expected double-quoted property name in JSON at position 16 (line 1 column 17)
🐛 copied.isAdmin → true | ¿propia? → false
▼ config.json: 4 errores, 2 avisos
  ⚠ ❌ se ignora la clave "__proto__" (no se admite en la configuración)
  ⚠ ❌ server.port: debe ser number, pero es string ("8080")
  ⚠ ❌ limits.maxCartItems: 0 es menor que 1
  ⚠ ❌ shipping.zones: valores desconocidos ceuta
    ⚠ clave desconocida «paymnets». ¿Quisiste decir «payments»?
    ⚠ features tiene repetidos: wishlist, gift-cards, wishlist, dark-mode
⚠ ⛔ La tienda NO arrancaría con esta configuración. Vista previa solo para depurar:
configuración efectiva → {version: 2, app: {…}, server: {…}, cache: {…}, maintenance: {…}, …}
mantenimiento: 25 oct, 01:00 CEST → 25 oct, 04:00 CET
duración real → 4 horas
caché → 15 min | timeout → 30 s
```

### Diferencias entre dos JSON

Compara dos versiones de un pedido y lista cada cambio con su ruta (`shipping.address.zip`), como un `git diff` de datos. El recorrido usa una **pila explícita** (un array con `push` y `pop`) en lugar de recursión, que llegará en el módulo de funciones; cada elemento de la pila es «compara esto con aquello en esta ruta». Las líneas del pedido se emparejan por `sku` y no por posición (si no, reordenarlas parecería un cambio enorme), y los cambios de tipo, como `46001` → `"46001"`, se señalan aparte porque rompen código sin hacer ruido. El principio del ejemplo muestra por qué comparar los JSON no basta: el orden de las claves cambia el texto pero no los datos.

[[exercise:06-diferencias-entre-json.md-]]

```text
¿customer igual según JSON.stringify? → false
¿customer igual según diff? → true
▼ Pedido P-24133: 11 cambios (sin contar updatedAt)
    ~ status: "pagado" → "enviado"
    ~ shipping.method: "estándar" → "urgente"
    ~ shipping.address.street: "Calle Mayor 12" → "Calle Mayor 12, 3.º B"
    ~ shipping.address.zip: 46001 → "46001"  ⚠ cambia el tipo (number → string)
    + shipping.trackingCode: "ES26CX0045812"
    ~ items[sku=CAF-COL].qty: 3 → 2
    - items[sku=MOL-MAN]: {"sku":"MOL-MAN","qty":1,"unitCents":3490}
    + items[sku=TAZ-CER]: {"sku":"TAZ-CER","qty":1,"unitCents":1250}
    - tags[1]: "primera-compra"
    - coupon: "BIENVENIDA5"
    ~ notes: null → "La clienta pide factura a nombre de su empresa"  ⚠ cambia el tipo (null → string)
resumen → {changed: 6, added: 2, removed: 3}
secciones tocadas → status, shipping, items, tags, coupon, notes
variación del importe → -32,30 €
si items se compara por posición → 16 cambios en lugar de 11
```

### Resumen semanal de horas

Las horas de una programadora autónoma con tres clientes. Cada entrada guarda instantes ISO con desfase, así que la duración (`end - start`) es correcta aunque cruce la medianoche o el cambio de hora: la urgencia de la madrugada del 25 de octubre va de las 01:30 a las 03:30 en el reloj, pero son 3 horas reales. Las duraciones se guardan en minutos enteros, las entradas se agrupan por semana ISO y por día de Madrid, se detectan los solapes ordenando por inicio y la facturación se redondea una sola vez por proyecto. Al final, `Intl.DurationFormat`, una API muy reciente, se usa solo si existe.

[[exercise:07-resumen-de-horas.md-]]

```text
⚠ Descartada: termina antes de empezar en Revisión de textos (2026-10-22 18:00)
⚠ Solape de 15 min: «Accesibilidad del checkout» y «Llamada con la bodega»
▼ Semana 2026-S43: 47 h 30 min
    (tabla por día: lun, 19 oct 8 h 15 min · mar, 20 oct 9 h 15 min · … · dom, 25 oct 3 h)
    Té y Café en Casa          20 h 30 min × 45,00 €/h = 922,50 €
    Clínica Dental Sonrisas    17 h 45 min × 52,00 €/h = 923,00 €
    Bodega Las Vides            9 h 15 min × 40,00 €/h = 370,00 €
    A facturar: 2.215,50 €
  ⚠ Horas extra: 7 h 30 min por encima de 40 h
▶ Semana 2026-S44: 1 h 30 min …
🕐 Urgencia: servidor caído: 01:30 → 03:30 en el reloj, pero 3 h reales (esa noche se atrasa la hora).
🌙 Despliegue nocturno: 2 h 45 min, contadas el día en que empezó.
Con Intl.DurationFormat → 7 horas y 45 minutos
```

### Mensajes en varios idiomas

`count === 1 ? 'producto' : 'productos'` funciona en español y en inglés, y falla en polaco, que tiene cuatro formas de plural. El programa guarda un catálogo de mensajes con una variante por categoría, deja que `Intl.PluralRules` elija la categoría de cada idioma, formatea los valores (números, monedas, listas, fechas y ordinales en inglés con `type: 'ordinal'`) con el `locale` y la moneda de cada mercado, y rellena las plantillas recorriéndolas con `indexOf`. Si falta un mensaje, busca en el idioma de reserva (`es-MX` → `es` → `en`) y avisa. La revisión final usa `Set.difference` para listar traducciones y categorías de plural que faltan; incluida una sorpresa: CLDR define la categoría `many` del español para los millones exactos.

[[exercise:08-mensajes-i18n.md-]]

```text
 1: count === 1 → produkt   ✓ · PluralRules → produkt
 5: count === 1 → produkty  🐛 · PluralRules → produktów
12: count === 1 → produkty  🐛 · PluralRules → produktów
▼ es-ES
    Tienes 3 productos en la cesta (1234,50 €).
    Lista de deseos compartida con Ana, Kuba y Ola.
    Es la 2.ª reseña más útil.
▼ en-US
    You have 3 items in your cart ($1,234.50).
    Wish list shared with Ana, Kuba, and Ola.
    This is the 2nd most helpful review.
▼ pl-PL
    Masz 3 produkty w koszyku (1234,50 zł).
    Zostały tylko 2 sztuki!
  ⚠ [pl-PL] falta «reviewRank»: se usa el de «en»
    This is the 2nd most helpful review.
▼ Revisión del catálogo
    es.cartSummary: sin la categoría many (se usará 'other')
    pl: sin traducir → reviewRank
```

## Pequeñas aplicaciones con interfaz

Los cuatro ejemplos siguientes combinan este módulo con los capítulos de HTML y CSS: tablas y listas semánticas, campos con su `label`, mensajes en regiones `aria-live`, estados pintados por el CSS con selectores de atributo (`[data-state='low']`) y un diseño que pasa a dos columnas en pantallas anchas. La lógica está separada de la interfaz: las funciones que calculan no tocan el DOM. Pruébalos en la vista previa y ábrelos a pantalla completa con el botón ↗ si quieres más espacio.

### Panel de inventario

Existencias de una tienda con un `Map` de productos, un `Map` de stock (recuento inicial más movimientos) y un `Set` de referencias descatalogadas. Las alertas son un `Set` que se recalcula a partir del stock y se ordenan por urgencia, el filtro de la tabla cambia lo que se pinta sin tocar los datos y el último movimiento se muestra en tiempo relativo («ayer», «hace 24 días») contando días de calendario en Madrid. Registra un movimiento: `applyMovement` lo valida entero antes de cambiar nada. Prueba a sacar 20 unidades de té sencha (aparece una alerta nueva), a reponer el té chai descatalogado o a vender un molinillo agotado.

[[exercise:09-inventario-con-alertas.md]]

### Analizador de texto

Cuenta un texto de tres maneras (unidades UTF-16, code points y grafemas) y lo divide en palabras y frases con `Intl.Segmenter`. El texto de ejemplo incluye una bandera, un emoji de familia y un «café» escrito en NFD, así que verás las tres cifras distintas y cómo `normalize()` cambia el `length`. El contador del límite de 280 caracteres cuenta grafemas y avisa de lo que diría `length`. Las palabras frecuentes salen de un `Map` (sin palabras vacías, guardadas en un `Set`) ordenado por frecuencia y alfabéticamente con `Intl.Collator`, y la búsqueda ignora tildes y mayúsculas.

[[exercise:10-analizador-de-texto.md]]

### Agenda con zonas horarias

Un equipo con personas en Madrid, Ciudad de México, Bogotá, Nueva York y Tokio. Las reuniones se guardan como instantes en UTC y se muestran en la zona que elijas, agrupadas por día **de esa zona** (cambia a Tokio y verás reuniones que pasan al día siguiente). Cada participante ve su hora local y un aviso si la reunión cae fuera de su horario o en su fin de semana. Al final, la diferencia entre Madrid y Nueva York reunión a reunión: 6 horas, luego 5 durante la semana en que Europa ya ha cambiado la hora y Estados Unidos todavía no, y de nuevo 6.

[[exercise:11-agenda-con-zonas-horarias.md]]

### Cesta con descuentos

Una cesta con IVA incluido y todas las reglas que complican un total: 3x2 en un té, 15 % en el molinillo, cupones guardados en un `Map` (importe fijo con compra mínima, porcentaje solo para el café, envío gratis) y envío gratis desde 50 €. Fíjate en dos detalles de redondeo. El cupón de 5 € se reparte entre las líneas en proporción a su importe, porque cada línea puede llevar un IVA distinto, y los céntimos que sobran van a la línea mayor. Y el desglose del IVA calcula la base con `Math.round` y la cuota como diferencia, así que base más cuota es siempre el total exacto (la consola lo comprueba).

[[exercise:12-carrito-con-descuentos.md]]

## Resumen

- Elige la estructura por el uso: objeto para registros, `Map` para diccionarios y contadores, `Set` para pertenencia y operaciones de conjuntos, arrays para lo ordenado.
- Dinero y notas en enteros (céntimos, décimas); redondea una vez y reparte los sobrantes de forma explícita.
- Lee formatos reales carácter a carácter cuando `split` no basta, valida con un esquema y reúne todos los errores con su contexto.
- `JSON.parse` dentro de `try/catch`; usa el reviver para reconstruir tipos y descartar claves peligrosas.
- Instantes con zona, calendario en la zona del negocio y `Intl` con `locale` y `timeZone` explícitos: el resultado no debe depender del ordenador que lo ejecuta.
- Separa la lógica de la interfaz y no mutes los datos de entrada.

## Para profundizar

- [MDN: Intl.PluralRules](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules)
- [MDN: Intl.DateTimeFormat.prototype.formatToParts](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts)
- [RFC 4180: el formato CSV](https://www.rfc-editor.org/rfc/rfc4180)
- [Unicode CLDR: reglas de plural por idioma](https://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html)
- [MDN: BigInt](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
