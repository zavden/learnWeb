# El algoritmo de flex

## Por qué importa

Pones tres columnas con `flex-grow` y una mide 133,33px, otra 166,67px y la tercera se niega a encoger. Lo habitual es probar números hasta que «queda bien». Pero el navegador no adivina: aplica un algoritmo con unas pocas sumas y divisiones, el mismo en todos los navegadores, y cuando lo conoces puedes calcular el resultado con papel y lápiz antes de escribir una línea.

En esta lección vas a recorrer ese algoritmo paso a paso con números redondos. Cada ejemplo tiene una regla de 400px debajo del contenedor (que mide exactamente 400px) para que compruebes cada resultado con tus ojos. Al final verás el atajo `flex` y su trampa más famosa: `flex: 1` no significa lo que parece.

## El algoritmo en cuatro pasos

Para cada línea de un contenedor flex, en el eje principal:

1. **Tamaño base.** Cada elemento parte de su `flex-basis`.
2. **Espacio libre.** Tamaño del contenedor menos la suma de las bases (y de los `gap`). Puede ser positivo (sobra sitio) o negativo (falta).
3. **Reparto.** Si sobra, los elementos **crecen** según `flex-grow`; si falta, **encogen** según `flex-shrink`, ponderado por su base. Nunca las dos cosas a la vez.
4. **Límites.** Si alguno se sale de su `min-width` o `max-width`, se queda en el límite y se vuelve a repartir entre los demás.

Las tres propiedades se escriben en los **elementos**, no en el contenedor: cada uno dice cuánto quiere medir, cuánto quiere crecer y cuánto está dispuesto a encoger.

## Paso 1: el tamaño base (`flex-basis`)

`flex-basis` es el tamaño del que parte el elemento **en el eje principal** (el ancho en una fila, el alto en una columna):

| `flex-basis` | Tamaño base |
|---|---|
| `auto` (inicial) | el `width` del elemento (`height` en una columna); si también es `auto`, el tamaño de su contenido |
| una longitud (`150px`, `10rem`) | esa longitud, **aunque** el elemento tenga `width` |
| un porcentaje (`25%`) | ese porcentaje del tamaño del contenedor |
| `content` | el tamaño de su contenido, aunque tenga `width` |

El «tamaño del contenido» es el `max-content` que viste en la lección de tamaños: el texto en una sola línea, sin cortes. El navegador encaja además la base entre `min-width` y `max-width`; ese resultado se llama **tamaño hipotético**, y es el que se usa para decidir qué cabe en cada línea cuando hay `flex-wrap`.

[[exercise:01-flex-basis.md]]

## Paso 2: el espacio libre

```text
espacio libre = tamaño del contenedor
              − suma de las bases (más márgenes, padding y bordes de cada elemento)
              − los gap
```

Si es **positivo**, sobra sitio y se usará `flex-grow`. Si es **negativo**, el contenido no cabe y se usará `flex-shrink`. El valor inicial de `flex-grow` es `0`: por defecto los elementos no crecen y el espacio libre se queda al final de la línea (o donde diga `justify-content`). El de `flex-shrink` es `1`: por defecto sí encogen.

[[exercise:02-el-espacio-libre.md]]

## Paso 3a: crecer con `flex-grow`

Con espacio libre positivo, cada elemento recibe una parte proporcional a su `flex-grow`:

```text
recibe = espacio libre × flex-grow ÷ (suma de los flex-grow)
final  = base + recibe
```

El ejemplo: un contenedor de 400px con bases 100, 50 y 50, y `flex-grow` 1, 2 y 1.

```text
espacio libre = 400 − (100 + 50 + 50) = 200
suma de factores = 1 + 2 + 1 = 4   →   cada parte vale 200 ÷ 4 = 50

A: 100 + 1 × 50 = 150
B:  50 + 2 × 50 = 150
C:  50 + 1 × 50 = 100            total: 150 + 150 + 100 = 400 ✓
```

[[exercise:03-flex-grow-reparte.md]]

La lección importante está en B: tiene el doble de `flex-grow` que A y recibe el doble de espacio, pero **no mide el doble**, porque empezó con la mitad. `flex-grow` reparte el espacio libre, no el tamaño final. Si quieres que una columna mida el doble que otra, las dos tienen que partir de la misma base (normalmente `0`, como verás con el atajo `flex`).

### Factores que suman menos de 1

Hay una regla especial: si los `flex-grow` de la línea suman **menos de 1**, solo se reparte esa fracción del espacio libre. Un único elemento con `flex-grow: 0.5` se queda con la mitad de lo que sobra, y la otra mitad sigue libre. Gracias a esto, pasar de `0` a `1` es gradual. Con `flex-shrink` ocurre lo mismo.

[[exercise:04-factores-menores-que-uno.md]]

## Paso 3b: encoger con `flex-shrink`

Con espacio libre negativo, lo lógico parecería quitar lo mismo a todos. No es así: el exceso se reparte según el **factor de encogimiento ponderado**, que es `flex-shrink × base`.

```text
peso   = flex-shrink × base
pierde = exceso × peso ÷ (suma de los pesos)
final  = base − pierde
```

El ejemplo: bases 220, 132 y 88 en 400px, todos con `flex-shrink: 1` (el valor inicial).

```text
exceso = (220 + 132 + 88) − 400 = 40
pesos  = 1 × 220, 1 × 132, 1 × 88   →   suma 440

A: 220 − 40 × 220/440 = 220 − 20 = 200
B: 132 − 40 × 132/440 = 132 − 12 = 120
C:  88 − 40 ×  88/440 =  88 −  8 =  80      total: 400 ✓
```

Los tres pierden el mismo **porcentaje** (el 9,09 %), no la misma cantidad. Si se quitaran 13,33px a cada uno, un elemento pequeño acabaría desapareciendo mucho antes que uno grande. Si A tiene `flex-shrink: 0`, su peso es cero: no encoge y el exceso se lo reparten B y C con pesos 132 y 88 (pierden 24 y 16, y quedan en 108 y 72).

[[exercise:05-flex-shrink-pondera.md]]

Un detalle de la especificación que solo importa si haces cuentas exactas: el peso usa la base **del contenido**, sin padding ni borde. Por eso los elementos de estos ejemplos no tienen padding horizontal.

## Paso 4: los límites y la segunda vuelta

Después de repartir, el navegador comprueba que cada elemento respete su `min-width` y su `max-width`. Si alguno se ha salido, lo **congela** en el límite y repite el reparto **solo con los demás**, con el espacio que queda. El bucle acaba cuando nadie se sale.

```text
Tres elementos con base 0 y flex-grow: 1; A tiene max-width: 100px.

1.ª vuelta: 400 ÷ 3 = 133,33 para cada uno
            A se pasa de 100  →  A se congela en 100
2.ª vuelta: quedan 400 − 100 = 300 para B y C  →  150 cada uno
Resultado:  100, 150, 150
```

[[exercise:06-limites-y-segunda-vuelta.md]]

Este paso tiene una consecuencia enorme. Los elementos flex no tienen `min-width: 0`, sino `min-width: auto`, que en flexbox significa «no menos que el contenido» (normalmente, la palabra más larga). Ese mínimo automático es el que congela a un elemento cuando intentas encogerlo más allá de su contenido, y es el protagonista de la próxima lección.

## El algoritmo completo, en Python

> **Desde Python:** esta función reproduce los pasos 2 a 4 para una línea, con las bases ya calculadas (sin márgenes, padding ni `gap`, para simplificar). Cópiala en un intérprete y pruébala con los números de los ejemplos.

```python
def resolve_flex_line(container, bases, grow, shrink, mins, maxs):
    """Tamaños finales de una línea flex (sin márgenes, padding ni gap)."""
    n = len(bases)
    initial_free = container - sum(bases)
    growing = initial_free > 0
    factors = grow if growing else shrink
    sizes = list(bases)
    frozen = [f == 0 for f in factors]            # con factor 0 no se mueve
    while not all(frozen):
        active = [i for i in range(n) if not frozen[i]]
        # libre = contenedor − (congelados con su tamaño, activos con su base)
        free = container - sum(sizes[i] if frozen[i] else bases[i] for i in range(n))
        factor_sum = sum(factors[i] for i in active)
        if factor_sum < 1 and abs(initial_free * factor_sum) < abs(free):
            free = initial_free * factor_sum      # factores que suman menos de 1
        if growing:
            weights = {i: grow[i] for i in active}
        else:
            weights = {i: shrink[i] * bases[i] for i in active}   # ponderado por la base
        total = sum(weights.values())
        targets = {i: bases[i] + free * weights[i] / total for i in active}
        for i in active:                          # encaja cada uno entre min y max
            sizes[i] = min(max(targets[i], mins[i]), maxs[i])
        violation = sum(sizes[i] - targets[i] for i in active)
        for i in active:                          # congela a los que han chocado
            if (violation == 0
                    or (violation > 0 and sizes[i] > targets[i])
                    or (violation < 0 and sizes[i] < targets[i])):
                frozen[i] = True
    return sizes

INF = float("inf")
print(resolve_flex_line(400, [100, 50, 50], [1, 2, 1], [1, 1, 1], [0] * 3, [INF] * 3))
print(resolve_flex_line(400, [220, 132, 88], [0, 0, 0], [1, 1, 1], [0] * 3, [INF] * 3))
print(resolve_flex_line(400, [0, 0, 0], [1, 1, 1], [1, 1, 1], [0] * 3, [100, INF, INF]))
```

```text
[150.0, 150.0, 100.0]
[200.0, 120.0, 80.0]
[100, 150.0, 150.0]
```

## Con varias líneas

Con `flex-wrap: wrap`, el navegador primero **reparte los elementos en líneas**: va metiendo elementos en la línea mientras la suma de sus tamaños hipotéticos (con márgenes y `gap`) quepa. Después, **cada línea** pasa por los pasos 2 a 4 por su cuenta. Por eso un elemento que se queda solo en la última línea crece hasta ocuparla entera, y por eso los elementos de dos líneas no forman columnas: cada línea hace sus propias cuentas.

## El atajo `flex`

`flex` fija las tres propiedades a la vez: `flex: <grow> <shrink> <basis>`. La especificación recomienda usar siempre el atajo, porque deja las tres en valores coherentes. Pero sus formas cortas esconden sorpresas:

| Escribes | Equivale a | Significa |
|---|---|---|
| (nada) o `flex: initial` | `0 1 auto` | no crece; encoge si no cabe |
| `flex: auto` | `1 1 auto` | crece y encoge a partir de su tamaño |
| `flex: none` | `0 0 auto` | rígido: siempre su tamaño |
| `flex: 1` | `1 1 0%` | reparte a partir de 0: ignora el contenido |
| `flex: 2` | `2 1 0%` | lo mismo con el doble de parte |
| `flex: 0` | `0 1 0%` | base 0 sin crecer: se queda en su mínimo |
| `flex: 200px` | `1 1 200px` | base 200px, y **sí crece** |

La regla escondida: cuando el atajo lleva un número sin unidad, la base pasa a `0%`; y cuando omites `flex-grow` o `flex-shrink`, valen `1`, no su valor inicial.

En este ejemplo, un pequeño script lee del navegador los valores calculados de cada forma de escribir el atajo (con `getComputedStyle`, que ya usaste en el módulo del modelo de cajas):

[[exercise:07-el-atajo-flex.md]]

Fíjate en la última fila: `flex: 2 1 10rem` da una base calculada de `160px`, porque el navegador ya ha convertido los `rem` a píxeles.

## `flex: 1` no es `flex-grow: 1`

Es la confusión más común de flexbox. Quieres cuatro pestañas iguales y escribes `flex-grow: 1`. Pero eso solo cambia el factor de crecimiento: la base sigue en `auto`, es decir, en el ancho del texto. Cada pestaña recibe la misma cantidad de espacio libre, y la de texto más largo acaba siendo la más ancha. `flex: 1` pone además la base a `0%`: todo el contenedor es espacio libre y se reparte a partes iguales, 100px para cada una.

[[exercise:08-flex-1-no-es-flex-grow-1.md]]

Y una advertencia: `flex: 1` iguala el espacio **repartido**, no el tamaño final. La base 0 es la del contenido; el padding y el borde se suman a ella. Una pestaña con más padding parte con ventaja y acaba más ancha. Lo mismo pasa si un elemento no puede encoger por debajo de su contenido, como verás en la próxima lección.

## Cómo verlo en DevTools

Pasa el ratón por un elemento en **Elements**: la etiqueta flotante de la página muestra su tamaño con decimales (`133.33 × 24`). En **Computed** encontrarás `flex-grow`, `flex-shrink` y `flex-basis` ya resueltos (es lo que lee el ejemplo del atajo), y el ancho final en el diagrama de cajas. Con el overlay de flexbox activado, el espacio libre que no se ha repartido aparece rayado, como en los ejemplos de esta lección.

## Bestiario

- **`flex-grow: 1` no da columnas iguales.** Síntoma: elementos con `flex-grow: 1` acaban con anchos distintos, más anchos los de texto más largo. Causa: `flex-grow` reparte el espacio libre a partes iguales, pero cada elemento parte de su base (`auto`, el ancho de su contenido). Solución: `flex: 1` (`1 1 0%`), que pone la base a 0; y el mismo padding en todos. → [ver ejemplo](08-flex-1-no-es-flex-grow-1.md)

## Resumen

- Para cada línea: base de cada elemento → espacio libre → reparto con `flex-grow` o `flex-shrink` → límites y nueva vuelta.
- `flex-basis` manda sobre `width` en el eje principal; en `auto` usa `width` o, si no hay, el contenido.
- Espacio libre = contenedor − bases (con márgenes, padding y bordes) − `gap`.
- `flex-grow` reparte el espacio libre en proporción a los factores; si suman menos de 1, solo reparte esa fracción.
- `flex-shrink` reparte el exceso según `flex-shrink × base`: todos pierden el mismo porcentaje.
- Quien choca con su `min-width` o `max-width` se congela en el límite y el resto se reparte otra vez; en flexbox, `min-width: auto` es el tamaño del contenido.
- `flex: 1` es `1 1 0%`, `flex: auto` es `1 1 auto`, `flex: none` es `0 0 auto`; con `flex-grow: 1` a secas, la base sigue siendo el contenido.

## Para profundizar

- [Especificación: Resolving Flexible Lengths (el algoritmo exacto)](https://www.w3.org/TR/css-flexbox-1/#resolve-flexible-lengths)
- [MDN: Controlar las proporciones de los elementos flex](https://developer.mozilla.org/es/docs/Web/CSS/CSS_flexible_box_layout/Controlling_ratios_of_flex_items_along_the_main_axis)
- [MDN: flex](https://developer.mozilla.org/es/docs/Web/CSS/flex)
- [Josh W. Comeau: An Interactive Guide to Flexbox](https://www.joshwcomeau.com/css/interactive-guide-to-flexbox/)
- [web.dev: Flexbox, flexible sizing (Learn CSS)](https://web.dev/learn/css/flexbox#flexible_sizing)
