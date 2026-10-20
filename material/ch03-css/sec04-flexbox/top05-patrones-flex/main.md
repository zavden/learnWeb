# Patrones con flexbox

## Por qué importa

Si desmontas la interfaz de cualquier web, encuentras las mismas piezas una y otra vez: una barra con el logo a un lado y un botón al otro, una foto junto a un texto, unas tarjetas en fila, un campo con su botón, un panel con su cabecera y su pie. Cada pieza es un **patrón**: un problema de layout que ya tiene una solución conocida, de dos o tres declaraciones.

En las lecciones anteriores aprendiste cómo funciona flexbox por dentro; esta lección es el recetario. Cada patrón usa lo que ya sabes (los ejes, la alineación, el algoritmo y sus trampas), así que no hay propiedades nuevas: hay combinaciones. Tenlo a mano:

| Patrón | Lo esencial |
|---|---|
| Barra de navegación | `align-items: center`, `flex-wrap: wrap` y `margin-left: auto` en lo que va al final |
| Media object | `align-items: flex-start`, `flex: none` en la imagen, `flex: 1; min-width: 0` en el texto |
| Pie pegado abajo | columna de `min-height: 100dvh` y `flex: 1` en `main` |
| Centrado | `align-items: center` y `justify-content: center` |
| Tarjetas de igual altura | la fila las estira; cada tarjeta en columna y `margin-top: auto` en su botón |
| Campo y botón | `flex: 1; min-width: 0` en el campo |
| Panel que llena el alto | columna de alto fijo y `flex: 1; min-height: 0; overflow-y: auto` en el cuerpo |
| Barras y etiquetas | `flex-wrap: wrap` y `gap` |
| Rejilla sin media queries | `flex-wrap: wrap` y `flex: 1 1 <base>` en cada tarjeta |
| Barra lateral que se apila | `flex-wrap: wrap` y un `flex-grow` enorme en el contenido |

## Barra de navegación

La cabecera de casi cualquier sitio: el logo, los enlaces principales y una acción (entrar, el carrito) en el otro extremo. Es una fila con tres hijos centrados en vertical; los enlaces son una lista que, a su vez, es otra fila flex. El extremo derecho no necesita `justify-content`: un `margin-left: auto` en la última pieza se queda con todo el espacio libre.

```css
.site-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

.cart {
  margin-left: auto;   /* empuja el carrito al final de su línea */
}
```

Con `flex-wrap: wrap`, la barra no se desborda cuando falta sitio: los enlaces bajan a una segunda línea y el margen automático sigue actuando dentro de la línea en la que caiga el carrito.

[[exercise:01-barra-de-navegacion.md]]

## Media object

El nombre viene de 2010 y lo acuñó Nicole Sullivan: una imagen a un lado y un bloque de texto que ocupa el resto. Es un comentario, una notificación, un resultado de búsqueda, un mensaje de chat. Con flexbox son tres declaraciones, y cada una evita una trampa de la lección anterior:

```css
.media        { display: flex; align-items: flex-start; gap: 12px; }  /* la imagen no se estira */
.media-figure { flex: none; }                                         /* la imagen no encoge */
.media-body   { flex: 1; min-width: 0; }                              /* el texto sí, aunque lleve una URL */
```

[[exercise:02-media-object.md]]

Fíjate en la respuesta: es otro `.media` metido dentro del cuerpo del primero. Un patrón bien hecho se puede anidar sin tocar nada.

## Pie pegado abajo

En una página con poco contenido (una confirmación de pedido, un error 404), el pie queda a media pantalla y debajo sobra un hueco vacío. La solución es convertir el `body` en una columna flex que mida como mínimo el alto de la ventana y dejar que `main` crezca:

```css
body {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;   /* como mínimo, el alto de la ventana */
  margin: 0;
}

main {
  flex: 1;              /* se queda con todo el alto que sobra */
}
```

Es un `min-height`, no un `height`: si el contenido crece, la página crece con él y el pie va detrás. En el ejemplo, dos páginas de 230px hacen de ventana:

[[exercise:03-pie-pegado-abajo.md]]

## Centrado

Ya conoces la receta: `align-items: center` y `justify-content: center`. Aquí la verás en tres piezas reales. En un estado vacío, el contenedor es una **columna**, así que `justify-content` centra en vertical y `align-items` en horizontal; el grupo entero (icono, título, texto y botón) queda en el centro, y `text-align: center` centra además las líneas de cada texto. En un botón de icono y en un contador, `inline-flex` centra el dibujo o la cifra en su caja sin ajustar `line-height` a ojo.

[[exercise:04-centrado.md]]

Si lo que centras puede ser más alto que su contenedor (una ventana modal en un móvil en horizontal), recuerda `safe center` o `margin: auto`, de la lección de alineación.

## Tarjetas de igual altura con el botón abajo

En una fila flex, las tarjetas ya miden lo mismo: es el `align-items: stretch` por defecto. Pero su contenido sigue en flujo normal, y cada botón queda justo donde acaba su texto, a alturas distintas. El arreglo usa los dos niveles: cada tarjeta es elemento flex de la fila **y** contenedor flex de su contenido, en columna. Un `margin-top: auto` en el botón se lleva todo el alto que sobra y lo manda al fondo.

```css
.plan {
  display: flex;
  flex-direction: column;
}

.plan .button {
  margin-top: auto;
}
```

[[exercise:05-tarjetas-de-igual-altura.md]]

En el módulo 2 conseguiste algo parecido sin flexbox, con títulos de dos líneas exactas y alturas mínimas calculadas. Ahora la altura sale del contenido real, sea cual sea.

## Campo y botón

En una de las páginas profesionales del módulo 2, un comentario lo dejaba pendiente: que el campo de búsqueda ocupara «todo lo que deje el botón» era trabajo de flexbox. Es `flex: 1` en el campo; el botón, con su `flex-grow: 0` inicial, mide lo suyo.

Con un detalle que conecta con la lección anterior: un `<input>` tiene un ancho por defecto (unos 20 caracteres, el de su atributo `size`), y ese ancho cuenta como su contenido. En una barra lateral estrecha, su `min-width: auto` no le deja bajar de ahí y el botón se sale. `min-width: 0` en el campo lo arregla, y conviene ponerlo siempre.

[[exercise:06-campo-y-boton.md]]

## Un panel cuyo cuerpo llena el alto

La otra promesa del módulo 2: un panel lateral de filtros con cabecera, cuerpo y pie, en el que solo el cuerpo se desplaza. Sin flexbox había que darle al cuerpo un `max-height` calculado a ojo. Con una columna flex de alto fijo, la cabecera y el pie miden lo suyo y el cuerpo se queda con **exactamente** el resto, sea cual sea el alto del panel:

```css
.filters {
  display: flex;
  flex-direction: column;
  height: 100dvh;       /* o el alto que tenga el panel */
}

.filters-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
```

[[exercise:07-panel-que-llena-el-alto.md]]

Aquí `min-height: 0` no es imprescindible, porque el cuerpo ya tiene `overflow` y un contenedor de scroll no tiene mínimo automático. Pero cuesta una línea y evita el error del scroll anidado de la lección anterior el día que alguien mueva el `overflow` a un hijo.

## Barras de herramientas y etiquetas

Cuando una fila de botones o de etiquetas puede no caber, la respuesta es `flex-wrap: wrap` con `gap`. El `gap` separa en las dos direcciones sin márgenes que sobren al final de cada línea. En una barra con grupos, el truco está en los dos niveles: la barra reparte **grupos** y cada grupo reparte sus botones, así que un grupo que no cabe baja entero, sin separar botones que van juntos. Y un `margin-left: auto` en el último grupo lo mantiene a la derecha en cualquier línea.

[[exercise:08-barra-de-herramientas-y-etiquetas.md]]

Para ver el efecto en tu propia pantalla, estrecha el panel de la vista previa o ábrela en su pestaña con el botón ↗ y cambia el ancho de la ventana.

## Diseño que se adapta sin media queries

Las media queries, que verás en el módulo de responsive, cambian el CSS según el ancho de la **pantalla**. Pero muchos componentes no necesitan saber nada de la pantalla: les basta con el sitio que tienen. `flex-wrap` junto con `flex-basis` da layouts que se adaptan al ancho de su **contenedor** sin una sola regla condicional.

### Una rejilla de tarjetas

Cada tarjeta tiene `flex: 1 1 9rem`. Al formar las líneas, el navegador mete en cada una tantas tarjetas de 9rem como quepan; después, `flex-grow` reparte lo que sobra en esa línea y las tarjetas la llenan. Más ancho, más columnas; menos ancho, menos columnas.

[[exercise:09-rejilla-sin-media-queries.md]]

El patrón tiene un punto débil, y es la consecuencia directa de que cada línea haga sus propias cuentas: si la última línea se queda con una sola tarjeta, esa tarjeta se lleva el ancho entero. Un `max-width` en las tarjetas le pone techo (el paso 4 del algoritmo la congela ahí), pero no da columnas exactas. Flexbox piensa en **una** dimensión, líneas; cuando necesitas filas **y** columnas alineadas, la herramienta es grid, el próximo módulo, con `repeat(auto-fill, minmax(9rem, 1fr))`.

### Una barra lateral que se apila

El segundo patrón adaptable: una barra lateral estrecha junto a un contenido ancho, que se ponen uno encima del otro cuando no caben. La clave es una proporción de `flex-grow` desmesurada:

```css
.with-sidebar { display: flex; flex-wrap: wrap; gap: 12px; }
.sidebar      { flex: 1 1 8rem; }      /* quiere 8rem */
.main         { flex: 999 1 15rem; }   /* quiere al menos 15rem y se lleva casi todo lo que sobre */
```

Si las dos bases caben en la línea, van juntas y el contenido se queda con 999 de cada 1000 píxeles libres: la barra apenas crece. Si no caben, `flex-wrap` pasa el contenido a la línea siguiente y cada uno, solo en su línea, la llena. El cambio depende del ancho del contenedor, así que la misma pieza funciona en una columna estrecha y en una página ancha.

[[exercise:10-barra-lateral-que-se-apila.md]]

## ¿Flexbox o grid?

Una regla práctica para cuando llegue el próximo módulo. Flexbox va **del contenido hacia fuera**: los elementos dicen cuánto miden y la línea se reparte entre ellos; es ideal para componentes en una dimensión (barras, grupos de botones, media objects, tarjetas sueltas). Grid va **del layout hacia dentro**: defines filas y columnas y colocas los elementos en ellas; es ideal cuando las cosas deben alinearse en dos dimensiones (rejillas de productos, el esqueleto de una página). Casi todas las páginas reales usan los dos: grid para el esqueleto y flexbox dentro de cada pieza.

## Bestiario

- **El campo de búsqueda no encoge y empuja el botón fuera.** Síntoma: en un hueco estrecho, un `<input>` con `flex: 1` mide unos 150px como mínimo y el botón se sale del contenedor. Causa: el ancho por defecto del campo (su atributo `size`) cuenta como su contenido, y `min-width: auto` no le deja bajar de ahí. Solución: `min-width: 0` en el campo. → [ver ejemplo](06-campo-y-boton.md)
- **La última tarjeta de la rejilla es enorme.** Síntoma: en una rejilla hecha con `flex-wrap`, la tarjeta que queda sola en la última línea ocupa todo el ancho. Causa: cada línea flex reparte su espacio por su cuenta; la última solo tiene una tarjeta para repartirlo. Solución: un `max-width` en las tarjetas, o grid (próximo módulo) cuando necesites columnas exactas. → [ver ejemplo](09-rejilla-sin-media-queries.md)

## Resumen

- Barra de navegación: fila centrada en vertical, `flex-wrap: wrap` y `margin-left: auto` en lo que va al final.
- Media object: `align-items: flex-start`, `flex: none` en la imagen y `flex: 1; min-width: 0` en el texto; se puede anidar.
- Pie pegado abajo: el `body` en columna con `min-height: 100dvh` y `flex: 1` en `main`.
- Tarjetas de igual altura: la fila las estira; cada tarjeta en columna con `margin-top: auto` en el botón.
- Campo y botón: `flex: 1; min-width: 0` en el campo. Panel que llena el alto: columna de alto fijo y `flex: 1; min-height: 0; overflow-y: auto` en el cuerpo.
- `flex-wrap: wrap` con `gap` reparte barras y etiquetas en varias líneas; con `flex: 1 1 <base>` da rejillas y barras laterales que se adaptan a su contenedor sin media queries.
- Cada línea flex reparte su espacio sola: para columnas exactas en dos dimensiones, grid.

## Para profundizar

- [MDN: Typical use cases of flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Typical_use_cases_of_flexbox)
- [Philip Walton: Solved by Flexbox](https://philipwalton.github.io/solved-by-flexbox/)
- [web.dev: Ten modern layouts in one line of CSS](https://web.dev/articles/one-line-layouts)
- [Every Layout: The Sidebar](https://every-layout.dev/layouts/sidebar/)
- [Nicole Sullivan: The media object saves hundreds of lines of code](http://www.stubbornella.org/content/2010/06/25/the-media-object-saves-hundreds-of-lines-of-code/)
