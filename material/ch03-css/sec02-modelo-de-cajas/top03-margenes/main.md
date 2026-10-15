# Márgenes

## Por qué importa

El margen es el espacio **exterior** de una caja: la separa de sus vecinas. Parece la propiedad más sencilla de CSS, y sin embargo esconde el comportamiento que más desconcierta a quien empieza: el **colapso de márgenes**. Dos márgenes de 30px y 20px que deberían sumar 50px dejan 30px; el margen de un título aparece *fuera* de su contenedor; una caja vacía «se come» parte de su espacio. No son errores del navegador: son reglas del flujo normal que existen desde CSS 1, pensadas para que los párrafos de un texto queden bien espaciados sin cálculos.

En esta lección verás cómo se escribe el margen, cómo centrar con `auto`, qué hacen los márgenes negativos y, sobre todo, cuándo y por qué colapsan los márgenes y cómo evitarlo.

## Escribir márgenes

`margin` acepta de 1 a 4 valores, en el mismo orden que `padding` y `border-width` (sentido horario empezando arriba):

| Valores | Significado |
|---|---|
| `margin: 16px` | los cuatro lados |
| `margin: 8px 32px` | arriba y abajo · izquierda y derecha |
| `margin: 4px 16px 28px` | arriba · izquierda y derecha · abajo |
| `margin: 4px 40px 12px 8px` | arriba · derecha · abajo · izquierda |

También existen los lados sueltos (`margin-top`, `margin-left`…) y las **propiedades lógicas**, que ya conoces del módulo anterior: `margin-inline` (el eje en el que avanza el texto: izquierda y derecha en español) y `margin-block` (el eje en el que se apilan los bloques: arriba y abajo). Las lógicas se adaptan solas a idiomas que se escriben de derecha a izquierda o en vertical.

El margen es **transparente**: deja ver el fondo del padre. En los ejemplos lo pintamos de naranja (`#fed7aa`, el color que usa el diagrama de cajas de DevTools) poniendo ese color al contenedor.

[[exercise:01-margen-y-sus-lados.md]]

## Centrar con `auto`

Un margen puede valer `auto`. En horizontal, para una caja de bloque, significa: «reparte el espacio libre de la línea entre los márgenes `auto`». Si los dos lados son `auto`, la caja queda **centrada**; si solo uno lo es, ese lado se queda con todo el espacio y empuja la caja al lado contrario.

```css
.page {
  width: min(70ch, 100%);
  margin-inline: auto;   /* centra la columna de lectura */
}
```

Tres condiciones que suelen olvidarse:

- La caja necesita un **ancho menor que el disponible** (`width`, `max-width`…). Un bloque sin `width` ya ocupa todo el ancho: no queda nada que repartir.
- Solo funciona con cajas de **bloque**. Un elemento `inline` como `<span>` no se centra con márgenes (para eso está `text-align` en su padre).
- En el flujo normal, `margin-top: auto` y `margin-bottom: auto` valen **0**: no centran en vertical. Dentro de flexbox y grid sí lo hacen, como verás en esos módulos.

[[exercise:02-centrar-con-margin-auto.md]]

## Márgenes negativos

Un margen puede ser negativo. El efecto depende del lado:

- `margin-top` o `margin-left` negativos **desplazan la caja** hacia arriba o hacia la izquierda, y puede quedar encima de otras cajas o salirse de su padre.
- `margin-bottom` o `margin-right` negativos no mueven la caja: **tiran de lo que viene después**, que se acerca y puede montarse encima.

En ambos casos la caja ocupa menos espacio en el flujo, así que las siguientes también suben. Se usan para efectos concretos (una etiqueta que «sobresale» de una tarjeta, compensar un padding) y conviene usarlos con moderación: un margen negativo hace que el diseño dependa de medidas exactas.

[[exercise:03-margenes-negativos.md]]

## El colapso de márgenes

**Colapsar** significa que dos o más márgenes **verticales** que se tocan se fusionan en uno solo, en lugar de sumarse. El margen resultante mide:

- el **mayor** de los márgenes, si todos son positivos;
- el **más negativo**, si todos son negativos;
- la **suma** del mayor positivo y el más negativo, si hay de ambos signos.

```text
 ┌─────────────┐
 │  párrafo 1  │  margin-bottom: 30px ┐
 └─────────────┘                      ├─ se fusionan: 30px de hueco, no 50px
 ┌─────────────┐  margin-top: 20px    ┘
 │  párrafo 2  │
 └─────────────┘
```

Solo colapsan márgenes **verticales** de cajas de **bloque** en el **flujo normal**. Nunca colapsan los horizontales, ni los de cajas flotantes, posicionadas de forma absoluta, `inline-block`, ni los de los hijos de un contenedor flex o grid.

¿Por qué existe esta regla? Piensa en un texto: cada `<p>` tiene un margen de `1em` arriba y abajo (hoja del navegador). Si se sumaran, entre dos párrafos habría `2em` y entre el título y el primer párrafo, otro valor distinto. Con el colapso, el hueco entre cualquier par de bloques es el mayor de sus márgenes: el texto queda uniforme sin que el autor calcule nada.

Hay tres situaciones en las que se tocan dos márgenes.

### 1. Entre hermanos

El margen inferior de una caja y el superior de la siguiente se tocan. Es el caso más frecuente y casi siempre el deseado. El ejemplo mide la separación real con un pequeño script:

[[exercise:04-colapso-entre-hermanos.md]]

### 2. Entre un padre y su primer (o último) hijo

Si entre el borde superior del padre y el margen superior de su primer hijo **no hay nada** (ni borde, ni padding, ni contenido en línea, ni un contexto de formato propio), los dos márgenes se tocan y colapsan. Lo sorprendente es dónde acaba el margen resultante: **fuera** del padre. El fondo del padre empieza más abajo y el hueco aparece por encima de él. Lo mismo ocurre abajo con el último hijo si el padre no tiene altura fija.

[[exercise:05-colapso-padre-hijo.md]]

Es la causa clásica de «hay un hueco blanco encima de mi cabecera y no sé de dónde sale»: el `margin-top` del `<h1>` (que pone el navegador) se escapa de la cabecera. Recuerda también el margen de `8px` del `<body>` que viste en el módulo anterior: es otro margen que colapsa con el de su primer hijo.

### 3. Dentro de una caja vacía

Una caja sin contenido, sin altura, sin padding y sin borde no separa su propio margen superior del inferior: colapsan entre sí, y el resultado colapsa a su vez con los márgenes de los vecinos. Un `<div>` vacío usado como «espaciador» no aporta lo que esperas.

[[exercise:06-colapso-de-cajas-vacias.md]]

## Cómo evitar el colapso

Los márgenes solo colapsan si se **tocan**. Cualquier cosa que se interponga lo impide:

| Técnica | Efecto secundario |
|---|---|
| `padding` en el padre (aunque sea `1px`) | cambia la medida interior |
| `border` en el padre | añade una línea (puede ser transparente) |
| `display: flow-root` en el padre | ninguno: crea un nuevo **contexto de formato de bloque** (BFC) |
| `overflow` distinto de `visible` en el padre | recorta lo que sobresalga (lección de overflow) |
| contenedor flex o grid y la propiedad `gap` | cambia el tipo de layout (módulos de flexbox y grid) |

`display: flow-root` existe precisamente para esto: hace que el elemento se comporte como un bloque normal, pero aislado, de modo que los márgenes de sus hijos se quedan dentro. Lo viste en la lección de `display`; aquí tienes su uso principal.

[[exercise:07-como-evitar-el-colapso.md]]

Una estrategia que evita el problema de raíz: los **componentes** (tarjetas, cabeceras, secciones) se espacian por dentro con `padding` y entre sí con márgenes en **una sola dirección** (por ejemplo, solo `margin-block-end`). Así nunca hay dos márgenes enfrentados.

## Cómo verlo en DevTools

En **Elements → Computed**, el diagrama de cajas muestra el margen en naranja con su valor. Al pasar el ratón sobre un elemento en el panel Elements, la página resalta su margen también en naranja: si la zona resaltada queda fuera del fondo del padre, estás viendo un margen que ha colapsado hacia fuera.

## Bestiario

- **Mis márgenes no se suman.** Síntoma: `30px` abajo y `20px` arriba dejan `30px` de separación. Causa: los márgenes verticales adyacentes colapsan y queda el mayor. Solución: es lo esperado; si necesitas la suma, pon todo el espacio en uno de los dos lados. → [ver ejemplo](04-colapso-entre-hermanos.md)
- **Aparece un hueco encima de mi contenedor.** Síntoma: el fondo de una sección empieza más abajo de lo esperado y el espacio queda fuera. Causa: el `margin-top` del primer hijo colapsa con el del padre y sale fuera de él. Solución: `display: flow-root` en el padre (o padding/borde). → [ver ejemplo](05-colapso-padre-hijo.md)
- **Mi `div` espaciador no ocupa lo que le di.** Síntoma: un elemento vacío con `margin: 40px 0` deja 40px en total, no 80px. Causa: sin altura, padding ni borde, sus dos márgenes colapsan entre sí. Solución: usa `height` o `padding` para crear espacio, o mejor, márgenes en los elementos reales. → [ver ejemplo](06-colapso-de-cajas-vacias.md)

## Resumen

- `margin` usa el orden arriba · derecha · abajo · izquierda; `margin-inline` y `margin-block` son sus versiones lógicas.
- `margin-inline: auto` centra un bloque con ancho definido; en vertical, en el flujo normal, `auto` vale 0.
- Los márgenes negativos mueven la caja (arriba/izquierda) o acercan lo siguiente (abajo/derecha).
- Los márgenes verticales de bloques que se tocan colapsan: queda el mayor (o la suma, si hay negativos).
- Colapsan entre hermanos, entre padre e hijo (el margen sale fuera del padre) y dentro de cajas vacías.
- Se evita con padding o borde en el padre, con `display: flow-root`, o con layouts flex/grid.

## Para profundizar

- [MDN: Dominar el colapso de márgenes](https://developer.mozilla.org/es/docs/Web/CSS/CSS_box_model/Mastering_margin_collapsing)
- [MDN: margin](https://developer.mozilla.org/es/docs/Web/CSS/margin)
- [Josh W. Comeau: Rules of Margin Collapse](https://www.joshwcomeau.com/css/rules-of-margin-collapse/)
- [CSS 2.2: Collapsing margins (especificación)](https://www.w3.org/TR/CSS22/box.html#collapsing-margins)
