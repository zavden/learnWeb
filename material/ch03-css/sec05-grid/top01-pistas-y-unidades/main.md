# Pistas y unidades

## Por qué importa

Flexbox coloca cajas en **una** dimensión: una fila o una columna. Con `flex-wrap` parece que da rejillas, pero cada línea hace sus propias cuentas sin mirar a las demás, y por eso los elementos de dos líneas no quedan en columna y la última tarjeta suelta se estira hasta ocupar la fila entera. Lo viste al final del módulo anterior.

**CSS Grid** es el sistema de layout en **dos** dimensiones. En lugar de dejar que cada elemento diga cuánto mide y repartir lo que sobra, primero dibujas una rejilla de filas y columnas, y después los elementos se colocan en sus celdas. Las columnas son de la rejilla, no de cada línea: todo lo que cae en la misma columna mide lo mismo y queda alineado. Lo soportan todos los navegadores desde 2017.

Este módulo tiene cinco lecciones: en esta verás cómo se definen las filas y las columnas y cómo calcula el navegador su tamaño, con la unidad `fr` como protagonista; después, cómo colocar elementos en la rejilla, qué pasa con los que no caben, la alineación y, por último, `subgrid` y los patrones de layout más habituales.

## El contenedor, las pistas y las líneas

Grid se activa en el **padre**, como flexbox: `display: grid` lo convierte en un **contenedor grid** y a sus hijos directos, en **elementos grid**. Después, dos propiedades dibujan la rejilla: `grid-template-columns` dice cuántas columnas hay y cuánto mide cada una, y `grid-template-rows` hace lo mismo con las filas.

```css
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;   /* tres columnas */
  grid-template-rows: 60px 60px;        /* dos filas de 60px */
  gap: 20px;                            /* separación entre pistas */
}
```

Grid tiene su propio vocabulario, y conviene aprenderlo bien porque todas las propiedades lo usan:

| Término | Qué es |
|---|---|
| **pista** (*track*) | una columna o una fila: el espacio entre dos líneas vecinas |
| **línea** (*line*) | la frontera entre dos pistas; se numeran desde 1 |
| **celda** (*cell*) | el cruce de una fila y una columna: la unidad mínima |
| **área** (*area*) | un rectángulo de una o varias celdas |
| **gap** (o canal, *gutter*) | la separación entre dos pistas vecinas |

Con tres columnas hay **cuatro** líneas verticales; con dos filas, **tres** horizontales. Cuando hay `gap`, la línea «engorda» y ocupa todo el hueco. En la próxima lección colocarás elementos diciendo entre qué líneas van; de momento, el navegador los pone uno por celda, en el orden del HTML.

```text
       1             2               3             4
     1 ┌───────────┐░░░┌───────────┐░░░┌───────────┐
       │   celda   │░░░│           │░░░│           │
       └───────────┘░░░└───────────┘░░░└───────────┘
     2 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
       ┌───────────┐░░░┌───────────┐░░░┌───────────┐
       │           │░░░│           │░░░│           │
     3 └───────────┘░░░└───────────┘░░░└───────────┘
       ◀── pista ──▶                        ░ = gap
```

Las líneas de los bordes son finas; las de dentro ocupan cada una su franja rayada. En los ejemplos de este módulo, el fondo de la rejilla imita el overlay de grid de DevTools: bordes de pista discontinuos, números de línea y huecos rayados.

[[exercise:01-display-grid.md]]

Igual que en flexbox, los elementos grid se **bloquifican** (un `span` pasa a ser `block`), sus márgenes **no colapsan**, `float` y `vertical-align` se ignoran y `z-index` funciona **sin `position`**. `display: inline-grid` hace lo mismo con un contenedor que va dentro de la línea de texto.

### `gap`

`gap` separa las pistas entre sí, nunca del borde del contenedor. Acepta uno o dos valores: `gap: 16px 8px` es `row-gap: 16px` (entre filas) y `column-gap: 8px` (entre columnas). Es la misma propiedad que usaste en flexbox; en grid nació primero, con el nombre `grid-gap`, que todavía funciona como alias.

## La unidad `fr`

Las pistas aceptan cualquier longitud (`120px`, `10rem`, `25%`), pero la unidad estrella de grid es `fr`, de **fracción**: una pista de `1fr` se lleva una fracción del **espacio libre**. El cálculo tiene tres pasos:

```text
espacio libre = ancho del contenedor − pistas fijas − gaps
1fr           = espacio libre ÷ suma de las fr
cada pista    = sus fr × 1fr
```

El ejemplo: un contenedor de 400px con `grid-template-columns: 120px 1fr 2fr` y `gap: 20px`.

```text
espacio libre = 400 − 120 − 2 × 20 = 240
suma de fr    = 1 + 2 = 3   →   1fr = 240 ÷ 3 = 80

pista 1: 120          (fija)
pista 2: 1 × 80 =  80
pista 3: 2 × 80 = 160      total: 120 + 20 + 80 + 20 + 160 = 400 ✓
```

[[exercise:02-la-unidad-fr.md]]

Compara con el `flex-grow` del módulo anterior: allí cada elemento partía de su base y `flex-grow` repartía solo lo que sobraba, así que un factor doble no daba un tamaño doble. En grid, las pistas `fr` parten de cero: `2fr` mide **exactamente** el doble que `1fr`. Se parece al atajo `flex: 1` (base 0), y comparte con él su trampa más famosa, que verás enseguida: el contenido tiene un mínimo.

La misma regla especial que en flexbox: si las `fr` de la rejilla suman **menos de 1**, solo se reparte esa fracción. Una única pista de `0.5fr` se queda con la mitad del espacio libre.

### Porcentajes y `gap`

Un porcentaje se calcula sobre el ancho del contenedor y no sabe nada del `gap`. Cuatro columnas de `25%` ya suman el 100 %, y los gaps se añaden encima: la rejilla se sale. Con `fr`, el `gap` se descuenta antes de repartir y siempre cabe.

[[exercise:03-porcentajes-y-gap.md]]

## `repeat()`

`repeat(veces, pistas)` repite una pista o un **patrón** de pistas. `repeat(4, 1fr)` es `1fr 1fr 1fr 1fr`; `repeat(2, 5rem 1fr)` es `5rem 1fr 5rem 1fr`. Se puede mezclar con pistas sueltas: `3rem repeat(3, 1fr) 3rem`.

[[exercise:04-repeat.md]]

Fíjate en la ficha técnica: es un `<dl>` sin ningún envoltorio por pareja. Sus `dt` y `dd` van ocupando celdas en orden, y el patrón de cuatro columnas hace que cada etiqueta caiga en su sitio. Y no hay `grid-template-rows`: las filas que hacen falta se crean solas. Cómo y con qué tamaño, lo verás en la lección del grid implícito.

## Pistas que miden su contenido

Una pista también puede medir lo que pida el contenido de sus elementos, con las palabras clave que conociste en la lección de tamaños:

| Tamaño | La pista mide… |
|---|---|
| `min-content` | lo mínimo sin desbordar: la palabra (o imagen) más ancha |
| `max-content` | el contenido sin ningún corte de línea |
| `fit-content(10rem)` | como `max-content`, pero sin pasar de 10rem |
| `auto` | entre `min-content` y `max-content`, según el sitio que haya |

[[exercise:05-pistas-segun-el-contenido.md]]

`auto` tiene un comportamiento doble. Junto a pistas `fr`, crece hasta su `max-content` y deja el resto a las `fr`. Sin ninguna `fr`, las pistas `auto` llegan a su `max-content` y, si aún sobra sitio, **se estiran** para llenar el contenedor (es el `justify-content: normal` de la lección de alineación). Por eso `grid-template-columns: auto auto` da dos columnas que llenan el ancho, no dos columnas a la medida de su texto.

## `minmax()`

`minmax(mínimo, máximo)` da a una pista un intervalo: mide lo que le toque, pero nunca menos que el mínimo ni más que el máximo. El caso más habitual es `minmax(100px, 1fr)`: «reparte como `1fr`, pero no bajes de 100px».

[[exercise:06-minmax.md]]

Dos detalles del ejemplo:

- El mínimo **manda aunque no quepa**. Tres columnas de al menos 100px no caben en 280px, y la rejilla se sale. El remedio no es otro `minmax`, sino cambiar el **número** de columnas según el sitio: `auto-fill`, más abajo.
- El orden del reparto: primero, cada pista que no es `fr` crece hasta su máximo si hay sitio; **después**, las `fr` se reparten lo que quede. Por eso `minmax(100px, 200px) 1fr` da 200 y 200, no 100 y 300.

Si escribes un máximo menor que el mínimo (`minmax(200px, 100px)`), el máximo se ignora y la pista mide 200px.

## `1fr` es `minmax(auto, 1fr)`

Aquí está la trampa que te anunciaba. Una pista de `1fr` no es «una fracción y punto»: es `minmax(auto, 1fr)`. Su mínimo, `auto`, es el **mínimo automático** de los elementos que contiene, su `min-content`. Es exactamente el `min-width: auto` de los elementos flex que descubriste en la lección de trampas, con una diferencia: en flexbox frenaba a un elemento; aquí frena a la **pista entera**, y con ella a todos los elementos de esa columna, fila tras fila.

Mientras el contenido quepa en su fracción, no notas nada. Pero cuando una pista contiene algo que no se puede partir (un correo, una URL, una línea de código en un `<pre>`, una imagen grande sin `max-width: 100%`), su fracción es menor que su mínimo. El navegador la trata entonces como una pista fija del tamaño de su contenido y reparte el resto entre las demás.

```text
repeat(3, 1fr), gap: 20px, en 400px; el correo mide unos 230px

1.ª vuelta: libre = 400 − 40 = 360 → 1fr = 120
            la pista del correo no puede bajar de 230 → pasa a ser fija
2.ª vuelta: libre = 360 − 230 = 130, para dos pistas → 1fr = 65
Resultado:  65, 230, 65
```

[[exercise:07-1fr-y-el-contenido-largo.md]]

Hay dos arreglos, y ya conoces el segundo: `minmax(0, 1fr)` en la pista (mínimo 0), o `min-width: 0` en los elementos de esa columna (sin mínimo automático en ninguno, la pista tampoco lo tiene). En los dos casos, el contenido que no cabe se desborda y tienes que decidir qué hacer con él: partirlo (`overflow-wrap: anywhere`), desplazarlo (`overflow-x: auto` en el `<pre>`) o recortarlo. En rejillas cuyas columnas deben medir lo mismo pase lo que pase, escribe `repeat(3, minmax(0, 1fr))` de serie.

## El algoritmo, en Python

> **Desde Python:** esta función reproduce el reparto de las pistas `fr` en un eje (pistas fijas y `fr`, sin `minmax` ni pistas de contenido). `mins` es el mínimo de cada pista `fr`, el `min-content` de su contenido. Pruébala con los números de los ejemplos.

```python
def resolve_fr_tracks(container, tracks, gap, mins=None):
    """Anchos de las pistas: tracks es una lista de ("px", 120) o ("fr", 2)."""
    mins = mins or [0] * len(tracks)
    sizes = [value if kind == "px" else None for kind, value in tracks]
    while True:
        flexible = [i for i, size in enumerate(sizes) if size is None]
        free = container - gap * (len(tracks) - 1) - sum(s for s in sizes if s is not None)
        fr_sum = max(1, sum(tracks[i][1] for i in flexible))   # si suman menos de 1, cuenta 1
        one_fr = free / fr_sum
        too_small = [i for i in flexible if tracks[i][1] * one_fr < mins[i]]
        if not too_small:
            break
        for i in too_small:            # no cabe en su fracción: pasa a ser fija
            sizes[i] = mins[i]
    for i in flexible:
        sizes[i] = tracks[i][1] * one_fr
    return sizes

print(resolve_fr_tracks(400, [("fr", 1)] * 4, 16))
print(resolve_fr_tracks(400, [("px", 120), ("fr", 1), ("fr", 2)], 20))
print(resolve_fr_tracks(400, [("fr", 1)] * 3, 20, mins=[50, 230, 50]))
```

```text
[88.0, 88.0, 88.0, 88.0]
[120, 80.0, 160.0]
[65.0, 230, 65.0]
```

## Tantas columnas como quepan: `auto-fill` y `auto-fit`

En lugar de un número, `repeat()` acepta dos palabras clave que calculan cuántas pistas caben:

```css
.products {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 20px;
}
```

El navegador toma el **mínimo** de cada pista (80px), mira cuántas caben con sus gaps (`4 × 80 + 3 × 20 = 380 ≤ 400`, pero 5 ya no) y crea esas cuatro. Después, cada una crece hasta su `1fr`: (400 − 60) ÷ 4 = 85. Más ancho, más columnas; menos ancho, menos columnas. Es la rejilla adaptable sin media queries que buscabas en el módulo de flexbox.

La diferencia entre las dos palabras clave solo aparece cuando hay **menos elementos que pistas**:

| | Pistas sin elementos | Los elementos… |
|---|---|---|
| `auto-fill` | se quedan, vacías | miden lo mismo que con la fila llena |
| `auto-fit` | se **colapsan** a 0, con sus gaps | se estiran para llenar la fila |

[[exercise:08-auto-fill-y-auto-fit.md]]

Ninguna es la correcta en general. `auto-fit` queda bien cuando los elementos deben llenar la fila (unos pocos botones, una galería que siempre está llena); `auto-fill`, cuando cada tarjeta debe medir lo mismo aunque haya pocas, como en una búsqueda con dos resultados.

### La última fila, resuelta

El módulo de flexbox terminaba con una promesa: la rejilla de tarjetas con `flex-wrap` estiraba la última tarjeta suelta, y grid lo resolvería con `repeat(auto-fill, minmax(9rem, 1fr))`. Aquí está, con las mismas plantas:

[[exercise:09-la-ultima-fila.md]]

La diferencia es de concepto: en flexbox cada línea reparte su espacio entre las tarjetas que le han tocado; en grid las columnas existen antes que las tarjetas, y la tarjeta suelta ocupa una columna como las demás.

## Filas: el alto que no existe

Todo lo anterior vale también para `grid-template-rows`, con una trampa. Para repartir espacio libre hace falta un tamaño del que partir. El **ancho** de un bloque casi siempre lo tiene (el de su padre), pero su **alto** suele ser `auto`: sale de su contenido. Y si el alto del contenedor depende de sus filas, las filas no tienen ningún alto del que sacar espacio libre.

- Una fila de `1fr` en un contenedor sin altura definida no tiene nada que repartir: mide lo que su contenido.
- Una fila en porcentaje se calcula en dos pasadas: el navegador mide el contenedor como si la fila fuera `auto` y después le da el porcentaje de **ese** alto. Si el contenido de una fila es más alto que su parte, se sale.

[[exercise:10-filas-sin-altura-definida.md]]

El arreglo es dar al contenedor un alto definido: `height` o `min-height` en `px`, `rem` o `dvh`, o un porcentaje de un padre que lo tenga. Hay una tercera vía, la que prometía la lección de tamaños: si el padre es a su vez un contenedor grid o flex, estira al panel hasta su alto, y un tamaño estirado cuenta como definido. En la lección de patrones lo usarás para la página con cabecera, contenido y pie (`grid-template-rows: auto 1fr auto` y `min-height: 100dvh`).

Un detalle curioso de la regla: sin altura definida, `1fr` no reparte nada, pero sí **iguala**. Con `grid-template-rows: 1fr 1fr`, cada fila mide lo que la más alta de las dos, porque una `fr` vale lo mismo en todas las pistas. Lo aprovecharás en la próxima lección del grid implícito.

## Cómo verlo en DevTools

Chrome tiene herramientas específicas para grid, parecidas a las de flexbox:

- En **Elements**, junto a cada contenedor grid aparece una insignia `grid`. Al pulsarla, la página muestra el **overlay**: el contorno de cada pista, los gaps rayados y los números de línea. Para usarlo en un ejemplo, ábrelo en su pestaña con el botón ↗ de la vista previa.
- La pestaña **Layout** (en el panel de **Elements**) tiene los ajustes del overlay: *Show line numbers*, *Show track sizes* (pinta encima de cada pista su tamaño calculado, como `1fr · 80px`), *Show area names* y *Extend grid lines*. Activa *Show track sizes*: es la forma más rápida de comprobar las cuentas de esta lección.
- En **Computed**, `grid-template-columns` de un contenedor muestra las pistas ya resueltas en píxeles: `120px 80px 160px`, no `120px 1fr 2fr`.

## Bestiario

- **La rejilla con porcentajes se sale del contenedor.** Síntoma: cuatro columnas de `25%` con `gap` desbordan por la derecha. Causa: los porcentajes se calculan sobre el ancho entero y los gaps se suman encima. Solución: `fr` (`repeat(4, 1fr)`), que reparte el espacio que dejan los gaps. → [ver ejemplo](03-porcentajes-y-gap.md)
- **Las columnas de `1fr` no son iguales.** Síntoma: una columna con un correo, una URL o un `<pre>` es mucho más ancha que las demás. Causa: `1fr` es `minmax(auto, 1fr)` y su mínimo es el `min-content` de su contenido, como el `min-width: auto` de flexbox. Solución: `minmax(0, 1fr)` (o `min-width: 0` en el elemento), y decide qué hace el contenido que no cabe (`overflow-wrap: anywhere`, `overflow-x: auto`). → [ver ejemplo](07-1fr-y-el-contenido-largo.md)
- **Con pocos elementos, la rejilla adaptable se ve rara.** Síntoma: con `auto-fit`, dos tarjetas ocupan la fila entera; o, con `auto-fill`, dos elementos que debían llenar la fila dejan un hueco a la derecha. Causa: `auto-fill` conserva las pistas vacías y `auto-fit` las colapsa. Solución: elige `auto-fill` si cada elemento debe medir siempre lo mismo y `auto-fit` si deben llenar la fila. → [ver ejemplo](08-auto-fill-y-auto-fit.md)
- **La fila de `1fr` no llena el alto, o el texto se sale de una fila en porcentaje.** Síntoma: el pie no baja al fondo del panel; o el contenido de una fila con `%` invade lo de debajo. Causa: el contenedor no tiene altura definida, así que no hay espacio libre que repartir y los porcentajes se calculan sobre el alto del propio contenido. Solución: un `height` o `min-height` definido en el contenedor. → [ver ejemplo](10-filas-sin-altura-definida.md)

## Resumen

- `display: grid` en el padre; `grid-template-columns` y `grid-template-rows` definen las pistas; `gap` las separa. Con N pistas hay N + 1 líneas, numeradas desde 1.
- `fr` reparte el espacio libre: contenedor − pistas fijas − gaps, dividido entre la suma de las `fr`. `2fr` mide exactamente el doble que `1fr`.
- Los porcentajes no descuentan el `gap`; `fr`, sí.
- `repeat()` repite pistas o patrones; `min-content`, `max-content`, `fit-content()` y `auto` miden el contenido; `minmax()` pone límites, y las pistas no `fr` crecen hasta su máximo antes de que las `fr` repartan.
- `1fr` es `minmax(auto, 1fr)`: no baja del contenido. Para columnas iguales pase lo que pase, `minmax(0, 1fr)`.
- `repeat(auto-fill, minmax(…, 1fr))` crea tantas columnas como quepan; `auto-fit` además colapsa las vacías.
- Sin altura definida en el contenedor, las filas `fr` miden su contenido y las filas en `%` pueden desbordarse.

## Para profundizar

- [MDN: Conceptos básicos de grid layout](https://developer.mozilla.org/es/docs/Web/CSS/CSS_grid_layout/Basic_concepts_of_grid_layout)
- [web.dev: Grid (Learn CSS)](https://web.dev/learn/css/grid)
- [CSS-Tricks: A Complete Guide to CSS Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Especificación: Grid Sizing Algorithm](https://www.w3.org/TR/css-grid-2/#algo-overview)
- [Chrome DevTools: Inspect CSS grid](https://developer.chrome.com/docs/devtools/css/grid)
