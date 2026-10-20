# Colocación

## Por qué importa

En la lección anterior los elementos entraban en la rejilla uno por celda, en el orden del HTML. Eso basta para una galería, pero no para una página: la cabecera debe ocupar toda la fila, la foto de una ficha se extiende a lo alto de dos filas y la barra lateral va a la derecha aunque en el HTML esté al final.

Grid te deja colocar cada elemento **donde quieras** sin tocar el HTML: diciendo entre qué líneas va, cuántas pistas abarca, con nombres de líneas o dibujando el layout con texto. En esta lección verás las cuatro formas y los errores silenciosos de cada una, porque en grid una colocación mal escrita casi nunca da un error: el elemento simplemente aparece en otro sitio.

## Colocar entre líneas: `grid-column` y `grid-row`

Recuerda que las líneas se numeran desde 1: con 4 columnas hay 5 líneas verticales. Para colocar un elemento dices en qué línea **empieza** y en cuál **termina**:

```css
.featured {
  grid-column: 1 / 3;   /* de la línea vertical 1 a la 3: columnas 1 y 2 */
  grid-row: 1 / 3;      /* de la línea horizontal 1 a la 3: filas 1 y 2 */
}
```

`grid-column` es el atajo de `grid-column-start` y `grid-column-end`, y `grid-row`, el de `grid-row-start` y `grid-row-end`. Si escribes un solo número, es la línea de inicio y el elemento ocupa una pista: `grid-column: 2` equivale a `grid-column: 2 / 3`.

En los ejemplos de esta lección, todas las rejillas son el mismo **tablero** de 4 columnas y 3 filas, con los números de línea dibujados alrededor como en el overlay de DevTools.

[[exercise:01-lineas-numeradas.md]]

Fíjate en D: no tiene ninguna posición. El navegador coloca primero los elementos que la tienen y después reparte el resto en los huecos libres, fila a fila. Ese algoritmo de **colocación automática** tiene sus propias sorpresas, y es el tema de la próxima lección.

### Líneas, no celdas

El error de colocación más común es contar celdas en lugar de líneas. «De la 1 a la 3» suena a tres columnas, pero entre la línea 1 y la 3 solo hay dos. Si quieres que algo ocupe tres columnas, termina en la línea 4.

> **Desde Python:** las líneas funcionan como los índices de un *slice*. `columns[0:2]` toma dos elementos porque los índices señalan las fronteras **entre** elementos, y el final no se incluye. `grid-column: 1 / 3` es lo mismo con fronteras numeradas desde 1. Pero cuidado con los negativos: en Python, `columns[0:-1]` deja fuera el último elemento; en grid, `-1` es la última **línea**, así que `1 / -1` incluye la última columna.

[[exercise:02-lineas-no-celdas.md]]

## `span`: cuántas pistas

`span N` dice cuántas pistas abarca el elemento, sin calcular la línea final. Se combina con una línea de inicio (`1 / span 3`), se usa solo (`span 2`: «dos columnas, donde quepan») o, menos habitual, al principio (`span 2 / 5`: «termina en la 5 y abarca dos», es decir, empieza en la 3).

[[exercise:03-span.md]]

Un elemento con `span` y sin línea de inicio lo coloca el algoritmo automático, igual que D en el primer ejemplo: busca el primer sitio donde quepa entero.

## Líneas negativas

Las líneas también se cuentan desde el final: `-1` es la última, `-2` la penúltima. La más útil es `grid-column: 1 / -1`, «de la primera a la última», que vale para una cabecera o un pie de ancho completo aunque cambies el número de columnas.

[[exercise:04-lineas-negativas.md]]

Una advertencia para la próxima lección: `-1` es la última línea de la rejilla **explícita**, la que defines con `grid-template-*`. Las filas y columnas que el navegador crea por su cuenta no cuentan, y ahí `1 / -1` deja de llegar hasta el final.

### `grid-area` con números

`grid-area` es el atajo de las cuatro líneas a la vez, en este orden:

```css
.featured {
  grid-area: 1 / 2 / 3 / 4;
  /* grid-row-start / grid-column-start / grid-row-end / grid-column-end */
}
```

Es decir: arriba, izquierda, abajo, derecha; al revés que `margin` y `padding`, que van en el sentido de las agujas del reloj. Si te cuesta recordarlo, escribe `grid-row` y `grid-column` por separado: son más largos, pero se leen solos.

## Líneas con nombre

Contar líneas funciona, pero `grid-column: 2 / 3` no dice nada de lo que significa. Puedes **nombrar** las líneas escribiendo nombres entre corchetes entre las pistas, y usarlos en lugar de los números:

```css
.post {
  display: grid;
  grid-template-columns:
    [full-start] minmax(1rem, 1fr)
    [content-start] minmax(0, 18rem) [content-end]
    minmax(1rem, 1fr) [full-end];
}

.post > *          { grid-column: content; }   /* content-start / content-end */
.post > .full-bleed { grid-column: full; }      /* full-start / full-end */
```

Tres reglas:

- Una línea puede tener varios nombres: `[content-end sidebar-start]`.
- Si las líneas se llaman `algo-start` y `algo-end`, basta con escribir `grid-column: algo`.
- El número sigue funcionando: los nombres se añaden, no lo sustituyen.

El ejemplo es uno de los patrones más usados en blogs y documentación: una columna de lectura cómoda en el centro y fotos o citas «a sangre» (*full-bleed*), de borde a borde.

[[exercise:05-lineas-con-nombre.md]]

## Áreas: `grid-template-areas`

La forma más visual de colocar es **dibujar** el layout. `grid-template-areas` acepta una cadena de texto por fila, con una palabra por celda; las celdas que comparten nombre forman un **área**. Después, cada elemento dice en qué área va con `grid-area: <nombre>`:

```css
.plant {
  display: grid;
  grid-template-columns: 7rem 1fr;
  grid-template-areas:
    "photo title"
    "photo meta"
    "care  tips";
}

.photo { grid-area: photo; }
```

[[exercise:06-grid-template-areas.md]]

Las reglas del dibujo:

- Todas las cadenas deben tener **el mismo número de celdas**.
- Cada área debe ser un **rectángulo**: nada de formas en L ni de celdas sueltas con el mismo nombre.
- Un punto (`.`), o varios seguidos (`...`), es una celda vacía.
- Las columnas salen del dibujo; sus tamaños, de `grid-template-columns` y `grid-template-rows`.

Cada área crea además líneas con nombre: `photo-start` y `photo-end` en las dos direcciones. Por eso `grid-area: photo` funciona: busca las líneas que se llaman así. Y por eso puedes mezclar, por ejemplo, `grid-column: photo-start / tips-end`.

Existe un atajo que reúne filas, áreas y columnas en una sola declaración, con el tamaño de cada fila al final de su cadena:

```css
.plant {
  grid-template:
    "photo title" auto
    "photo meta"  auto
    "care  tips"  1fr
    / 7rem 1fr;
}
```

### Un nombre que no existe

Si un elemento pide un área que no existe (una errata, un nombre que se cambió en otro sitio), no hay ningún error. `grid-area: tip` busca líneas llamadas `tip-start` y `tip-end`; como no hay ninguna, la especificación dice que **todas las líneas implícitas** se llaman así, y el elemento empieza en la primera línea que hay después de la rejilla, en las dos direcciones. Acaba abajo a la derecha, en una fila y una columna nuevas, y su área se queda vacía.

[[exercise:07-nombre-de-area-desconocido.md]]

### Áreas inválidas

Un área que no es un rectángulo, o una fila con más o menos celdas que las demás, hace **inválida la declaración entera**. El navegador la descarta como cualquier declaración inválida (lo viste en el módulo de cascada) y la rejilla se queda sin áreas. Entonces todos los `grid-area` se comportan como el nombre desconocido del ejemplo anterior y **todos los elementos** acaban amontonados en la misma celda implícita. Como se tapan unos a otros, a simple vista solo se ve el último del HTML y una rejilla vacía; en el ejemplo, cada capa lleva un desplazamiento para que veas las cuatro.

[[exercise:08-areas-invalidas.md]]

La pista para encontrarlo está en DevTools: en **Styles**, una declaración inválida aparece tachada con un triángulo amarillo. Si ves una rejilla «sin áreas», busca primero ese triángulo.

### Dos elementos en la misma área

Grid no impide que dos elementos ocupen las mismas celdas: los coloca uno encima del otro. A veces es justo lo que quieres (capas, en la última lección del módulo), pero si dos elementos comparten `grid-area` por descuido, el de abajo desaparece. Lo peor es que sigue ahí: el teclado llega a sus enlaces y campos aunque no se vean.

[[exercise:09-dos-elementos-en-la-misma-area.md]]

La regla: **un área, un elemento**. Si un área debe contener varias cosas, envuélvelas en un elemento (un `aside`, un `div`) y coloca ese.

## ¿Números, nombres o áreas?

| Forma | Úsala cuando… |
|---|---|
| números (`1 / 3`, `1 / -1`) | el layout es pequeño o cambias pocas piezas; para «toda la fila», `1 / -1` |
| `span` | importa cuántas pistas ocupa, no dónde empieza |
| líneas con nombre | hay unas pocas columnas con significado (contenido, a sangre, barra lateral) |
| áreas | es el esqueleto de una página o de un componente: el CSS se lee como el dibujo |

Las cuatro se pueden mezclar en la misma rejilla.

## El orden del HTML y el orden visual

Colocar con grid cambia dónde se **ve** cada elemento, no dónde **está**. Igual que con `order` en flexbox, la tecla <kbd>Tab</kbd> y los lectores de pantalla siguen el HTML. Escribe el HTML en el orden en que tiene sentido leerlo (cabecera, contenido, barra lateral, pie) y usa la colocación para el diseño, no para arreglar un HTML desordenado. En la próxima lección verás cómo empeora esto con la colocación automática y qué ofrece `reading-flow` en grid.

## Cómo verlo en DevTools

- En la pestaña **Layout** de **Elements**, el desplegable de etiquetas del overlay elige entre *Show line numbers* (los números, positivos y negativos) y *Show line names* (los nombres de las líneas). *Show area names* escribe el nombre de cada área en su centro.
- En **Styles**, `grid-template-areas` muestra el dibujo con sus cadenas; si es inválido, aparece tachado.
- En **Computed**, `grid-column-start` y compañía muestran lo que has escrito (`span 2`, `content`), no la línea final: para saber dónde ha acabado un elemento, mira el overlay.

## Bestiario

- **Mi elemento ocupa una columna menos.** Síntoma: con `grid-column: 1 / 3` esperabas tres columnas y ocupa dos. Causa: los números son líneas, no celdas; entre la 1 y la 3 hay dos pistas. Solución: termina en la línea 4, o usa `1 / span 3`. → [ver ejemplo](02-lineas-no-celdas.md)
- **Un elemento sale de la rejilla, abajo a la derecha.** Síntoma: un elemento aparece fuera del layout, en una fila y una columna nuevas, y su área se queda vacía. Causa: su `grid-area` nombra un área que no existe (una errata), y los nombres desconocidos se resuelven en las líneas implícitas. Solución: corrige el nombre; búscalo con *Show area names*. → [ver ejemplo](07-nombre-de-area-desconocido.md)
- **Todos los elementos se amontonan en una celda.** Síntoma: la rejilla con áreas se ve vacía y los elementos, uno encima de otro, fuera de ella. Causa: `grid-template-areas` es inválido (un área que no es un rectángulo o filas de distinta longitud) y se descarta entero. Solución: busca la declaración tachada en Styles y corrige el dibujo. → [ver ejemplo](08-areas-invalidas.md)
- **Un elemento desaparece del layout.** Síntoma: un bloque no se ve, pero el teclado llega a sus campos. Causa: otro elemento está en las mismas celdas (mismo `grid-area` o mismas líneas) y lo tapa. Solución: un área, un elemento; envuelve los que deban ir juntos. → [ver ejemplo](09-dos-elementos-en-la-misma-area.md)

## Resumen

- `grid-column` y `grid-row` colocan un elemento entre una línea de inicio y una de fin; un solo número ocupa una pista.
- Los números son líneas, no celdas: `1 / 3` son dos columnas. `span N` cuenta pistas.
- `-1` es la última línea de la rejilla explícita: `1 / -1` ocupa toda la fila.
- `grid-area: fila-inicio / columna-inicio / fila-fin / columna-fin`, al revés que `margin`.
- Las líneas se pueden nombrar (`[content-start]`); `algo-start` y `algo-end` permiten escribir `grid-column: algo`.
- `grid-template-areas` dibuja el layout; cada área debe ser un rectángulo y todas las filas, igual de largas, o la declaración entera se descarta.
- Un área inexistente manda el elemento a las pistas implícitas; dos elementos en la misma área se tapan.
- La colocación cambia lo que se ve, no el orden de lectura: el HTML debe seguir en orden.

## Para profundizar

- [MDN: Colocación basada en líneas](https://developer.mozilla.org/es/docs/Web/CSS/CSS_grid_layout/Grid_layout_using_line-based_placement)
- [MDN: Grid template areas](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Grid_template_areas)
- [MDN: Layout using named grid lines](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Grid_layout_using_named_grid_lines)
- [Josh W. Comeau: Full-Bleed Layout Using CSS Grid](https://www.joshwcomeau.com/css/full-bleed/)
- [Especificación: Placing Grid Items](https://www.w3.org/TR/css-grid-2/#placement)
