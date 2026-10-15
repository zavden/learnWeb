# Organizar el código

## Por qué importa

Con `import` y `export` ya puedes partir un programa en archivos. Lo difícil es decidir **dónde va cada cosa**: qué módulo conoce a cuál, qué es público y qué no, dónde vive el estado. Un proyecto mal repartido se nota pronto: cambiar el formato de un precio obliga a tocar diez archivos, un módulo de «utilidades» crece hasta tener de todo, y dos archivos que se importan mutuamente fallan según el orden en que alguien escribió los `import`.

Esta lección reúne las ideas que más se repiten en proyectos reales: separar por **responsabilidades** con dependencias en un solo sentido, entender el **orden de evaluación**, dar a cada carpeta una **API pública** con un *barrel file*, evitar las **dependencias circulares** y no compartir **objetos modificables** sin querer. Las tres últimas traen sus propios bugs.

## Separar por responsabilidades

La regla más útil para repartir el código es que cada módulo tenga **una sola razón para cambiar**. En una tienda, las razones son distintas: los datos de los productos (de dónde salen), las reglas del carrito (qué se puede comprar), el formato (cómo se escribe un precio) y la presentación (cómo se ve un ticket). Cada una, un módulo:

[[exercise:01-separar-responsabilidades.md-]]

```text
3 × Café de Chiapas 500 g .. $630.00
1 × Molinillo manual ....... $549.00
TOTAL .................... $1,179.00
⛔ No existe el producto TE-404
```

Fíjate en el diagrama del ejemplo: las dependencias van **en un solo sentido**, de lo general a lo concreto. La presentación conoce el carrito, el carrito conoce el catálogo, y el catálogo y el formato no conocen a nadie. Así, cambiar el ticket no toca el carrito, y `format.js` se puede probar solo.

Algunas pautas que salen de aquí:

- **Funciones puras en los módulos de abajo.** Formato, cálculos y validaciones reciben datos y devuelven datos: sin estado, sin DOM, sin red. Son los más fáciles de reutilizar y de probar.
- **Los efectos, en los bordes.** Tocar el DOM, hacer peticiones o leer el almacenamiento se concentra en pocos módulos, cerca del script que arranca la aplicación.
- **El script de entrada solo conecta.** Crea los objetos, los pasa a quien los necesita y arranca; la lógica está en los módulos.
- **Nada de `utils.js` cajón de sastre.** Un módulo llamado «utilidades» acaba importado por todos y dependiendo de todo. Mejor `format.js`, `dates.js`, `validation.js`: el nombre dice qué hay dentro.

## El orden de evaluación

En la lección «Módulos ES» viste que los módulos importados se evalúan antes que el script que los importa. La regla exacta: antes de evaluar un módulo, se evalúan sus dependencias **en el orden de sus `import`**, bajando en profundidad, y cada módulo **una sola vez**. Es un recorrido en profundidad en *postorden*: las hojas del grafo primero, el script principal al final.

[[exercise:02-orden-de-evaluacion.md-]]

```text
1. polyfills.js
2. config.js
3. api.js
4. cart.js
5. analytics.js
6. el script principal, el último
cartUrl('C-77') → https://api.example.com/v1/carts/C-77
track('checkout') → checkout → https://api.example.com/v1/events
```

`import './polyfills.js'`, sin llaves ni nombres, es un **import por sus efectos**: ejecuta el módulo y no importa nada. Se usa para código que tiene que correr antes que el resto (*polyfills*, configurar un registro de errores) y para hojas de estilo en proyectos con empaquetador. Como el orden de evaluación depende del orden de los `import`, un import por sus efectos va siempre el primero.

Este orden importa en cuanto un módulo hace algo en su nivel superior: un `console.log`, leer un ajuste, registrarse en una lista. Cuanto menos haga un módulo al evaluarse (definir funciones y constantes, nada más), menos depende el programa de este orden.

## Barrel files: la API pública de una carpeta

Cuando una parte de la aplicación tiene varios archivos, el resto del código no debería tener que saber en cuál vive cada función. Un ***barrel file*** (barril), casi siempre llamado `index.js`, reúne y **reexporta** lo que la carpeta ofrece al exterior, sin código propio:

```js
// assets/03-tienda/index.js
export * from './money.js';                 // todas las exportaciones con nombre
export { findProduct } from './catalog.js'; // solo estas
export { default as Cart } from './cart.js'; // el default, con un nombre
```

[[exercise:03-barrel-index.md-]]

```text
  (evaluando money.js)
  (evaluando catalog.js)
  (evaluando cart.js)
1. el script empieza
total → $759.00
findProduct('CAF-500') → Café de Chiapas 500 g
API de la tienda → (4) ['Cart', 'addVat', 'findProduct', 'formatPrice']
¿normalizeSku es pública? → false
```

El barrel decide qué es **público**: `normalizeSku` se exporta en `catalog.js` (otros archivos de la carpeta pueden usarla), pero `index.js` no la reexporta, así que no forma parte de la API de la tienda. Si mañana `formatPrice` se muda a otro archivo, solo cambia el barrel.

El precio: importar **un** nombre del barrel evalúa **todos** sus módulos (las tres líneas «evaluando» del principio). En el navegador sin empaquetador, eso son descargas de más; con empaquetador, el *tree-shaking* suele quitarlas, salvo que los módulos hagan cosas en su nivel superior. Por eso los barrels se usan para las fronteras grandes de una aplicación (la tienda, los pagos), no en cada carpeta.

> **Desde Python:** `index.js` es el `__init__.py` de un paquete, y `export * from './money.js'` es `from .money import *`. Una diferencia que sorprende: el navegador **no** busca `index.js` solo. `import … from './03-tienda'` pide un archivo llamado `03-tienda`, que no existe: hay que escribir `./03-tienda/index.js`. (Node.js y los empaquetadores sí lo buscan, y por eso verás `from './tienda'` en muchos proyectos.)

### `export *` no reexporta el `default`

`export * from './cart.js'` reexporta las exportaciones **con nombre** de `cart.js`, pero no su exportación por defecto. Un barrel así pierde la clase `Cart` sin ningún aviso, y el error aparece en otro archivo, el que intenta importarla:

[[exercise:04-export-asterisco-sin-default.md-]]

```text
🐛 index.js exporta → ['MAX_ITEMS']
✅ index-fixed.js exporta → (2) ['Cart', 'MAX_ITEMS']
🐛 checkout.js → SyntaxError | The requested module './index.js' does not provide an export named 'default'
✅ new Cart() desde el barrel arreglado → 2 productos
```

Tiene sentido: si `export *` incluyera los `default`, dos `export *` en el mismo barrel chocarían siempre. La exportación por defecto se reexporta a mano, `export { default as Cart } from './cart.js'`, y de paso recibe un nombre.

### Dos `export *` con el mismo nombre

¿Y si dos módulos reexportados con `export *` tienen una exportación con el mismo nombre? No hay error al cargar el barrel: el nombre **ambiguo desaparece** de él en silencio. El error solo salta cuando alguien lo pide explícitamente:

[[exercise:05-nombres-en-conflicto.md-]]

```text
🐛 index.js exporta → (2) ['CURRENCY', 'UNIT']
🐛 units.format → undefined
🐛 label.js → SyntaxError | The requested module './index.js' contains conflicting star exports for name 'format'
✅ index-fixed.js exporta → (4) ['CURRENCY', 'UNIT', 'formatMoney', 'formatWeight']
✅ $487.20 · 1.5 kg
```

Una exportación explícita gana siempre a las de `export *`, así que la solución es reexportar cada `format` con un nombre propio. Y la lección general: un barrel con la lista explícita de lo que exporta es más largo, pero no esconde sorpresas.

## Dependencias circulares

Hay un **ciclo** cuando un módulo A importa B y B importa A (directamente o pasando por otros). El navegador lo permite: al encontrar un módulo que ya está «en curso», no lo espera y sigue. Pero entonces uno de los dos se evalúa **antes** que el otro, y si en su nivel superior usa algo del otro (que todavía no se ha ejecutado), se encuentra con una variable sin inicializar. Para una `const`, `let` o `class`, eso es la **zona muerta temporal** de la lección «Variables»:

[[exercise:06-dependencia-circular.md-]]

```text
  (evaluando customers.js)
🐛 ReferenceError | Cannot access 'TAX_RATE' before initialization
🐛 otra vez → ReferenceError | Cannot access 'TAX_RATE' before initialization
```

Lo traicionero de los ciclos es que el bug depende de **quién se importa primero**. Los mismos dos archivos, sin cambiar una línea, funcionan si el script importa primero `customers.js`: entonces `orders.js` se evalúa antes, y su nivel superior no usa nada de `customers.js`.

[[exercise:07-el-orden-lo-cambia-todo.md-]]

```text
  (evaluando orders.js)
  (evaluando customers.js)
Precios con IVA (16 %)
P-1042 · Mariana Gómez · $487.20
```

Funciona por casualidad: basta con que alguien reordene los `import` (o que otro archivo de la aplicación importe `orders.js` antes) para que vuelva el error. Una función declarada con `function` no tiene este problema, porque se eleva (*hoisting*) y existe desde el principio; por eso muchos ciclos «funcionan» durante meses hasta que alguien convierte una función en una `const` con una flecha.

La salida limpia es **romper el ciclo**. Casi siempre, lo que los dos módulos necesitaban el uno del otro es una tercera cosa que merece su propio módulo:

```text
antes:  orders.js ⇄ customers.js

ahora:  orders.js ──→ customers.js
            │              │
            └──→ tax.js ←──┘
```

[[exercise:08-romper-el-ciclo.md-]]

```text
  (evaluando customers.js)
  (evaluando orders.js)
Precios con IVA (16 %)
P-1042 · Mariana Gómez · $487.20
P-1043 · Iker Salas · $636.84
```

Si no hay nada que extraer, la segunda opción es **invertir** una dependencia: que `orders.js` reciba como parámetro la función que necesita en vez de importarla. La tercera, usar lo importado solo dentro de funciones, funciona, pero deja el ciclo donde estaba.

> **Desde Python:** los ciclos dan el mismo problema por la misma causa, con otro mensaje: `ImportError: cannot import name 'TAX_RATE' from partially initialized module 'orders' (most likely due to a circular import)`. Y el mismo truco de mover el `import` dentro de la función que lo usa.

## Estado compartido: objetos exportados

Un módulo se evalúa una vez y todos sus importadores reciben lo mismo. Si exporta un **objeto**, todos comparten ese objeto, y la protección del import (no se puede reasignar) no alcanza a su contenido: cualquier módulo puede cambiar sus propiedades, y todos los demás lo verán.

[[exercise:09-objeto-exportado-mutable.md-]]

```text
envío de un pedido de $500.00 → 14900
vista previa de la promo de verano
🐛 envío de un pedido de $500.00 → 0
🐛 settings.freeShippingFromCents → 0
✅ TypeError | Cannot assign to read only property 'freeShippingFromCents' of object '#<Object>'
✅ promo → 0 | tienda → 99900
```

Congelar con `Object.freeze` convierte el cambio accidental en un `TypeError` justo donde ocurre (los módulos están en modo estricto, así que no falla en silencio), y quien necesita otros valores crea un objeto nuevo. Recuerda que `freeze` es superficial (lección «Propiedades a fondo»).

Esto no significa que el estado en módulos sea malo: un módulo es la forma natural de tener **una** caché, **un** registro o **una** conexión para toda la aplicación (el *singleton* de la lección «Patrones de diseño», sin maquinaria). El problema es el estado que se cambia **sin que se note**. Dos reglas: que cada estado tenga un módulo dueño que exporta funciones para cambiarlo (como `setCurrency` en «Módulos ES»), y que lo que no debe cambiar esté congelado. En los ejemplos profesionales verás cuándo conviene, además, que el estado se **pase** como parámetro en vez de importarse.

## Señales de alarma

| Si ves… | Probablemente… |
|---------|----------------|
| un módulo que importa de casi todos los demás | mezcla responsabilidades; pártelo |
| un `utils.js` o `helpers.js` enorme | le faltan nombres: un módulo por tema |
| dos módulos que se importan mutuamente | un ciclo: extrae lo común a un tercero |
| un `ReferenceError … before initialization` que aparece al reordenar imports | un ciclo con uso en el nivel superior |
| código que hace cosas al importarse (peticiones, DOM) | efectos en el nivel superior: muévelos a una función `init()` |
| `export *` encadenados en varios barrels | nombres que pueden desaparecer y descargas de más |
| un objeto exportado que varios módulos modifican | estado sin dueño: congélalo o encapsúlalo en funciones |

## Bestiario

- **El barrel que pierde la clase.**
  Síntoma: `SyntaxError: The requested module './index.js' does not provide an export named 'default'` (o la clase no aparece en `import * as`).
  Causa: `export * from './cart.js'` no reexporta la exportación por defecto.
  Solución: `export { default as Cart } from './cart.js'`.
  → [ver ejemplo](04-export-asterisco-sin-default.md)
- **El nombre que desaparece del barrel.**
  Síntoma: un nombre falta en `import * as` sin ningún error, e importarlo por su nombre da `SyntaxError: … contains conflicting star exports for name 'format'`.
  Causa: dos `export *` del mismo barrel aportan el mismo nombre; el ambiguo se descarta.
  Solución: reexporta cada uno con un nombre propio (`export { format as formatMoney } from …`); mejor aún, listas explícitas en lugar de `export *`.
  → [ver ejemplo](05-nombres-en-conflicto.md)
- **El ciclo que depende del orden.**
  Síntoma: `ReferenceError: Cannot access 'TAX_RATE' before initialization` al cargar, que aparece o desaparece al reordenar los `import`.
  Causa: dos módulos se importan mutuamente y uno usa, en su nivel superior, algo del otro que aún no se ha evaluado (zona muerta temporal).
  Solución: rompe el ciclo extrayendo lo común a un tercer módulo, o invierte la dependencia pasando lo necesario como parámetro.
  → [ver ejemplo](06-dependencia-circular.md)
- **El ajuste que cambia para todos.**
  Síntoma: después de que una parte del programa «pruebe» un valor, otras partes que no tienen nada que ver se comportan distinto.
  Causa: el módulo exporta un objeto modificable; todos los importadores comparten la misma instancia.
  Solución: `Object.freeze` en lo que no debe cambiar, objetos nuevos para las variantes (`withOverrides`) y un módulo dueño con funciones para el estado que sí cambia.
  → [ver ejemplo](09-objeto-exportado-mutable.md)

## Resumen

- Un módulo, una responsabilidad; dependencias en un solo sentido, con funciones puras abajo y efectos en los bordes.
- Las dependencias se evalúan antes que su importador, en el orden de los `import`, en profundidad y una sola vez.
- `import './x.js'` ejecuta un módulo por sus efectos; va el primero.
- Un barrel (`index.js`) reexporta la API pública de una carpeta: `export * from`, `export { x } from`, `export { default as X } from`.
- `export *` no incluye el `default`, y los nombres repetidos entre dos `export *` desaparecen.
- Los ciclos hacen que el código dependa del orden de evaluación; rómpelos con un tercer módulo o invirtiendo la dependencia.
- Un objeto exportado es compartido y modificable: congélalo o dale un módulo dueño.
- El navegador no busca `index.js` en una carpeta: la ruta siempre es completa.

## Para profundizar

- [MDN: export (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export)
- [javascript.info: export e import](https://es.javascript.info/import-export)
- [Lin Clark: ES modules, una inmersión con dibujos (en inglés)](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/)
- [Python: paquetes](https://docs.python.org/es/3/tutorial/modules.html#packages)
