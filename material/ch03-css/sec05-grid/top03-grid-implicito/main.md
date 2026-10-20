# El grid implícito

## Por qué importa

En las dos lecciones anteriores dibujabas la rejilla entera: tantas columnas y tantas filas. Pero el contenido real no avisa de cuánto va a ocupar: una tienda tiene hoy 7 productos y mañana 23, un panel recibe un widget nuevo, alguien escribe `grid-column: 4` en una rejilla de tres columnas. Grid nunca descarta un elemento ni lo deja fuera: si no cabe en la rejilla que has definido, **crea las filas o columnas que hagan falta**.

Esas pistas creadas sobre la marcha forman el **grid implícito**. Casi todas las rejillas reales dependen de él (defines las columnas y dejas que las filas salgan solas), y casi todas sus sorpresas vienen de no saber que existe: filas que no miden lo que diste, columnas que aparecen de la nada, un `-1` que no llega al final y huecos que se quedan vacíos.

## Rejilla explícita y rejilla implícita

- La rejilla **explícita** es la que defines con `grid-template-columns`, `grid-template-rows` y `grid-template-areas`.
- La rejilla **implícita** son las pistas que el navegador añade cuando un elemento cae fuera de la explícita, porque no cabe o porque lo colocas ahí.

El tamaño de las pistas implícitas no sale de `grid-template-*`, sino de otras dos propiedades: `grid-auto-rows` y `grid-auto-columns`. Su valor inicial es `auto`: una fila implícita mide lo que su contenido. Por eso este es el error más común de la lección:

[[exercise:01-las-filas-que-sobran.md]]

## `grid-auto-rows` y `grid-auto-columns`

Dan tamaño a las pistas implícitas, y aceptan lo mismo que una pista explícita: longitudes, `fr`, `minmax()`, palabras clave de contenido. Lo más habitual es definir solo las columnas y dejar **todas** las filas como implícitas:

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
  grid-auto-rows: minmax(8rem, auto);   /* al menos 8rem; más si el contenido lo pide */
}
```

[[exercise:02-grid-auto-rows.md]]

La segunda rejilla del ejemplo cumple una promesa de la lección de pistas: sin altura en el contenedor, `1fr` no reparte nada, pero vale lo mismo en todas las filas. El navegador busca el valor de `1fr` que deja caber el contenido de todas y se lo da a cada una: `grid-auto-rows: 1fr` iguala todas las filas a la más alta.

Si escribes varias pistas, se repiten en ciclo: con `grid-auto-rows: 3rem 6rem`, las filas implícitas alternan 3rem y 6rem.

## Colocar fuera de la rejilla

La rejilla implícita también crece cuando colocas un elemento en una línea que no existe. No hay error, ni aviso en la consola: la rejilla gana pistas nuevas, de tamaño `grid-auto-columns` o `grid-auto-rows`, y el layout cambia para **todos** los elementos.

El caso típico es contar mal: con 3 columnas, la última es la que **empieza** en la línea 3 (o en la `-2`). `grid-column: 4` empieza en la línea 4, donde ya no queda ninguna columna, y crea una cuarta.

[[exercise:03-una-columna-de-mas.md]]

Las pistas implícitas se añaden siempre por el final… salvo que coloques algo en una línea negativa más allá del principio (`grid-column: -6` en una rejilla de 3 columnas): entonces aparecen por el principio y la línea 1 deja de ser la primera. Es raro verlo a propósito, pero explica algunos layouts que «se desplazan» sin motivo aparente.

### `-1` no llega a las pistas implícitas

La lección anterior lo advertía: las líneas negativas cuentan desde el final de la rejilla **explícita**. Si las filas son todas implícitas (no hay `grid-template-rows`), la única línea horizontal explícita es la 1, y `-1` es… la línea 1. `grid-row: 1 / -1` acaba siendo «una fila».

[[exercise:04-menos-uno-no-llega-al-final.md]]

Si sabes cuántas filas habrá, decláralas (`grid-template-rows: repeat(3, auto)`) o usa `span 3`. Si no lo sabes, la columna lateral no debería estar en la misma rejilla que los elementos que se repiten: ponla en una rejilla exterior de dos columnas y la lista de plantas, en otra interior.

## La colocación automática

Todo elemento al que no le das posición lo coloca el **algoritmo de colocación automática**. Simplificado, trabaja en tres pasadas:

1. Coloca los elementos que tienen fila **y** columna.
2. Coloca los que solo tienen la **fila** fijada, en el primer sitio libre de esa fila.
3. Coloca el resto en el orden del HTML con un **cursor** que recorre la rejilla fila a fila (o columna a columna) y que **solo avanza**: cada elemento busca sitio desde donde se quedó el anterior.

Por eso, en la primera lección de colocación, el elemento sin posición fue al primer hueco libre: los colocados ya ocupaban su sitio cuando llegó.

### `grid-auto-flow: row` y `column`

`grid-auto-flow` elige la dirección del cursor. Con `row` (el valor inicial) recorre fila a fila y, cuando se acaba la rejilla, crea **filas** implícitas. Con `column` recorre columna a columna y crea **columnas** implícitas. Con `column` y sin filas definidas, todos los elementos quedan en una sola fila: la base de un carrusel horizontal.

[[exercise:05-grid-auto-flow-column.md]]

### Huecos y `dense`

Como el cursor solo avanza, un elemento que abarca varias pistas y no cabe al final de una fila salta a la siguiente y deja atrás celdas vacías. Ningún elemento posterior volverá a rellenarlas, aunque quepa.

[[exercise:06-huecos-y-dense.md]]

`grid-auto-flow: dense` (o `row dense`, `column dense`) cambia la regla: para cada elemento, el cursor vuelve al principio y busca el **primer** hueco donde quepa. La rejilla queda compacta, pero los elementos posteriores «adelantan» a los anteriores.

> **Desde Python:** esta función reproduce la tercera pasada para elementos de una fila de alto que abarcan `span` columnas. La única diferencia entre los dos modos es una línea: con `dense`, el cursor vuelve a `(0, 0)` antes de cada elemento.

```python
def auto_place(columns, spans, dense=False):
    """(fila, columna) de cada elemento, contando desde 1 como en CSS."""
    occupied = set()
    positions = []
    row, col = 0, 0                          # el cursor
    for span in spans:
        if dense:
            row, col = 0, 0                  # dense: cada elemento busca desde el principio
        while not (col + span <= columns
                   and all((row, c) not in occupied for c in range(col, col + span))):
            col += 1
            if col + span > columns:         # no cabe en esta fila: a la siguiente
                row, col = row + 1, 0
        occupied.update((row, c) for c in range(col, col + span))
        positions.append((row + 1, col + 1))
    return positions

def draw(columns, spans, positions):
    rows = max(r for r, _ in positions)
    grid = [["··"] * columns for _ in range(rows)]
    for n, ((r, c), span) in enumerate(zip(positions, spans), start=1):
        for k in range(span):
            grid[r - 1][c - 1 + k] = f"{n:>2}"
    return "\n".join(" ".join(row) for row in grid)

spans = [1, 1, 1, 2, 1, 3, 1, 1, 2, 1]      # la galería del ejemplo
print(draw(4, spans, auto_place(4, spans)), end="\n\n")
print(draw(4, spans, auto_place(4, spans, dense=True)))
```

```text
 1  2  3 ··
 4  4  5 ··
 6  6  6  7
 8  9  9 10

 1  2  3  5
 4  4  7  8
 6  6  6 10
 9  9 ·· ··
```

### `dense` y el orden de lectura

En la segunda rejilla, la primera fila se lee 1, 2, 3, 5. Pero el HTML sigue diciendo 1, 2, 3, 4, 5: la tecla <kbd>Tab</kbd>, el lector de pantalla y la selección de texto van en ese orden. Es el problema de `order` en flexbox, ahora sin escribir ningún `order`: lo provoca el propio algoritmo.

[[exercise:07-dense-y-el-orden-de-lectura.md]]

`dense` está bien cuando el orden no significa nada y los elementos no se recorren con el teclado: un muro de logos, una galería de fotos decorativa. En una lista de productos, de artículos o de enlaces, el orden del HTML es el orden de lectura, y `dense` lo rompe.

### `reading-flow` en grid

El módulo de flexbox te presentó `reading-flow: flex-visual` y prometía sus valores para grid. Aquí están. Se escriben en el contenedor y hacen que el tabulador y el lector de pantalla recorran sus hijos directos en otro orden, sin mover nada en pantalla:

| Valor | Orden de lectura de los elementos grid |
|---|---|
| `normal` (inicial) | el del HTML |
| `grid-rows` | el que se ve, fila a fila |
| `grid-columns` | el que se ve, columna a columna |
| `grid-order` | el del HTML, pero respetando la propiedad `order` |

[[exercise:08-reading-flow-en-grid.md]]

Llegó en Chrome 137, en 2025, y un navegador que no lo entienda lo ignora sin avisar. Úsalo como red de seguridad cuando el orden visual tenga que cambiar de verdad, no como permiso para descuidar el HTML.

## Cómo verlo en DevTools

- Con el overlay de grid activado, las pistas implícitas aparecen a continuación de las explícitas: si cuentas más columnas de las que escribiste en `grid-template-columns`, alguien ha colocado un elemento fuera.
- *Show track sizes* escribe el tamaño de cada pista, también de las implícitas: si una fila mide 20px cuando esperabas 60px, falta `grid-auto-rows`.
- Para el orden de lectura, la casilla *Show source order* de la pestaña **Accessibility** numera los elementos en el orden del HTML sobre la propia página.

## Bestiario

- **Las filas de más no tienen el alto que di.** Síntoma: las primeras filas miden lo que dice `grid-template-rows` y las siguientes, solo lo que su contenido. Causa: las filas que no caben en la plantilla son implícitas y su tamaño lo da `grid-auto-rows` (por defecto `auto`). Solución: `grid-auto-rows`. → [ver ejemplo](01-las-filas-que-sobran.md)
- **Aparece una columna que no existía.** Síntoma: la rejilla tiene una columna más de las que definiste, las demás encogen y los elementos se recolocan. Causa: un elemento colocado en una línea más allá de la rejilla explícita (`grid-column: 4` con 3 columnas) crea pistas implícitas. Solución: la última columna empieza en la línea N (o en `-2`); revisa las líneas con el overlay. → [ver ejemplo](03-una-columna-de-mas.md)
- **`1 / -1` no llega hasta abajo.** Síntoma: una columna lateral con `grid-row: 1 / -1` ocupa solo la primera fila. Causa: `-1` es la última línea de la rejilla explícita, y sin `grid-template-rows` las filas son todas implícitas. Solución: declara las filas, usa `span N` o separa la columna lateral en otra rejilla. → [ver ejemplo](04-menos-uno-no-llega-al-final.md)
- **La rejilla tiene huecos.** Síntoma: celdas vacías al final de algunas filas, aunque luego hay elementos que cabrían. Causa: el cursor de la colocación automática solo avanza; un elemento ancho que no cabe salta de fila y deja el hueco atrás. Solución: `grid-auto-flow: dense`, si el orden no importa. → [ver ejemplo](06-huecos-y-dense.md)
- **Con `dense`, el foco salta de un lado a otro.** Síntoma: al pulsar <kbd>Tab</kbd> el foco no sigue el orden visual de la rejilla. Causa: `dense` mueve elementos en pantalla, pero el teclado y el lector de pantalla siguen el HTML. Solución: no uses `dense` con contenido que se lee en orden, o añade `reading-flow: grid-rows` (Chrome 137+). → [ver ejemplo](07-dense-y-el-orden-de-lectura.md)

## Resumen

- La rejilla explícita es la que defines; la implícita, las pistas que el navegador añade para los elementos que caen fuera.
- `grid-auto-rows` y `grid-auto-columns` dan tamaño a las pistas implícitas (por defecto `auto`); `minmax(…, auto)` da un mínimo que crece y `1fr` iguala las filas a la más alta.
- Colocar en una línea que no existe crea pistas implícitas sin avisar; con N columnas, la última empieza en la línea N o en `-2`.
- Las líneas negativas solo cuentan la rejilla explícita: con filas implícitas, `1 / -1` es una sola fila.
- La colocación automática va en el orden del HTML con un cursor que solo avanza; `grid-auto-flow` elige la dirección (`row` o `column`) y `dense` rellena huecos.
- `dense` rompe el orden de lectura; `reading-flow: grid-rows` (Chrome 137+) hace que el teclado siga el orden visual.

## Para profundizar

- [MDN: Colocación automática en grid layout](https://developer.mozilla.org/es/docs/Web/CSS/CSS_grid_layout/Auto-placement_in_grid_layout)
- [MDN: grid-auto-flow](https://developer.mozilla.org/es/docs/Web/CSS/grid-auto-flow)
- [MDN: Grid layout and accessibility](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Grid_layout_and_accessibility)
- [Especificación: Grid Item Placement Algorithm](https://www.w3.org/TR/css-grid-2/#auto-placement-algo)
- [Chrome for Developers: reading-flow y reading-order](https://developer.chrome.com/blog/reading-flow)
