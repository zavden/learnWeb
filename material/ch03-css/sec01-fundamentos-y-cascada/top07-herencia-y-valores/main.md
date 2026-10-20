# Herencia y valores

## Por qué importa

Escribes `color` una sola vez en el `body` y toda la página cambia de color; escribes `border` y solo lo recibe ese elemento. La diferencia es la **herencia**. Junto con la cascada, es la otra mitad de la pregunta «¿de dónde sale este valor?». En esta lección verás qué se hereda y qué no, las palabras clave que controlan la herencia (`inherit`, `initial`, `unset`, `revert`) y el camino que recorre un valor desde que lo escribes hasta que se convierte en píxeles.

## Qué se hereda

Cuando ninguna regla da valor a una propiedad de un elemento, pasa una de dos cosas:

- Si la propiedad es **heredada**, el elemento toma el valor de su padre.
- Si **no** es heredada, toma el **valor inicial** de la propiedad, el que define la especificación de CSS.

La regla práctica: se heredan las propiedades del **texto** y no se heredan las de la **caja**.

| Heredadas (texto) | No heredadas (caja) |
|---|---|
| `color` | `background` |
| `font-family`, `font-size`, `font-weight`, `font-style` | `border`, `outline` |
| `line-height`, `letter-spacing`, `text-align`, `text-indent` | `margin`, `padding` |
| `list-style` | `width`, `height` |
| `visibility`, `cursor` | `display`, `position` |
| custom properties (`--color`, lección 10) | `opacity`, `transform` |

Tiene lógica: quieres que todo el texto de un artículo use la misma fuente sin repetirla en cada párrafo, pero no que cada párrafo dibuje el mismo borde que el artículo.

[[exercise:01-heredadas-y-no-heredadas.md]]

Dos detalles que confunden:

- El fondo **parece** heredarse, pero no: el valor inicial de `background-color` es `transparent`, y a través del hijo transparente se ve el fondo del padre.
- La herencia sigue el **árbol del DOM**, no lo que ves en pantalla: un elemento hereda de su padre en el HTML, aunque lo coloques visualmente en otro sitio.

> **Desde Python:** la herencia de CSS se parece a un `collections.ChainMap(elemento, padre, abuelo, …)`: si el elemento no tiene valor para una propiedad heredable, se busca en el padre, luego en el abuelo… hasta llegar a la raíz. Pero ojo, solo para las propiedades heredables; las demás no buscan hacia arriba.

## Valores iniciales

Cada propiedad tiene un **valor inicial** fijado por la especificación de CSS. Es el que recibe un elemento cuando nadie le da valor a una propiedad no heredada (o a una heredada en la raíz del documento). Algunos que conviene conocer:

| Propiedad | Valor inicial | Consecuencia |
|---|---|---|
| `display` | `inline` | un elemento sin regla del navegador (por ejemplo, uno inventado como `<mi-tarjeta>`) es inline |
| `background-color` | `transparent` | por eso se ve el fondo del padre |
| `margin`, `padding` | `0` | los márgenes de `p` o `h1` los pone el navegador, no CSS |
| `border-style` | `none` | sin estilo de borde no hay borde, aunque declares su ancho y su color |
| `width`, `height` | `auto` | el tamaño lo decide el contenido o el contenedor |
| `font-size` | `medium` | normalmente 16px, según la configuración del navegador |
| `font-weight` | `normal` | la negrita de `h1` o `strong` la pone el navegador |
| `color` | `CanvasText` | el color de texto del sistema (negro en un tema claro) |

## La herencia es el último recurso

Como viste en la lección de especificidad, un valor heredado **no compite** en la cascada: solo se usa cuando ninguna regla, de ningún origen, elige al elemento. Por eso los enlaces no heredan el color de su párrafo (el navegador tiene una regla para `a`) y los botones no heredan la fuente (el navegador tiene una regla para `button`).

## Palabras clave universales

Estas palabras clave valen para **cualquier** propiedad y controlan de dónde sale el valor:

| Valor | Significa | Ejemplo |
|---|---|---|
| `inherit` | toma el valor del padre, aunque la propiedad no sea heredada | `a { color: inherit; }` |
| `initial` | el valor inicial de la **propiedad** según la especificación | `display: initial` → `inline` |
| `unset` | `inherit` si la propiedad es heredada; `initial` si no lo es | `color: unset; border: unset;` |
| `revert` | el valor que tendría sin tus reglas: el de la hoja del navegador | `display: revert` → `block` en un `div` |
| `revert-layer` | el valor que tendría sin la capa actual (lección 6) | `color: revert-layer` |

`inherit` es la más útil en el día a día: hace que un elemento con estilos propios del navegador se integre con su entorno.

[[exercise:02-inherit.md]]

El caso más frecuente son los controles de formulario, que no heredan la fuente:

[[exercise:03-controles-no-heredan-la-fuente.md]]

`initial` engaña: suena a «el estado normal», pero el valor inicial es una propiedad de la **propiedad**, no del elemento. Es el mismo para un `div`, un `h2` o un `span`:

[[exercise:04-initial-no-es-el-del-navegador.md]]

`unset` es la forma de decir «olvida lo que te hayan puesto», respetando la herencia:

[[exercise:05-unset.md]]

Y `revert` es lo que mucha gente espera de `initial`: volver a lo que pondría el navegador. Es perfecto para deshacer un reset en una zona concreta:

[[exercise:06-revert.md]]

## all: todas las propiedades a la vez

La propiedad `all` aplica una de esas palabras clave a **todas** las propiedades de golpe (salvo las custom properties y `direction`). Es una herramienta drástica: `all: unset` deja un elemento sin ningún estilo, incluido su anillo de foco, así que úsala con cuidado.

[[exercise:07-all.md]]

## La herencia en la práctica

La herencia te ahorra repetir. El patrón habitual es declarar lo tipográfico una sola vez, en el `body`, y dejar que fluya hacia abajo; después, corregir los pocos elementos que el navegador saca de la herencia:

```css
body {
  font-family: system-ui, sans-serif;   /* llega a todo el documento */
  color: #1e293b;
  line-height: 1.5;
}

button, input, select, textarea {
  font: inherit;                        /* los controles no heredan la fuente por sí solos */
}
```

Para saber de dónde viene un valor heredado, selecciona el elemento en DevTools → **Elements**. En **Styles**, debajo de sus propias reglas, aparecen secciones «Inherited from div.card» con las reglas de los antepasados (en gris, las propiedades que no se heredan). En **Computed**, cada propiedad muestra su valor final; al desplegarla, ves qué regla lo aporta.

## Del valor escrito al píxel

Lo que escribes en una hoja no es lo que usa el navegador al dibujar. Cada valor pasa por varias etapas:

| Etapa | Qué es | `font-size: 1.5em` (padre a 20px) | `width: 50%` |
|---|---|---|---|
| Declarado | cada declaración que coincide con el elemento | `1.5em` (y quizá otras) | `50%` |
| En cascada | la ganadora de la cascada | `1.5em` | `50%` |
| Especificado | la ganadora, o la heredada, o el valor inicial | `1.5em` | `50%` |
| Computado | resuelto todo lo que se puede sin conocer el diseño | `30px` | `50%` |
| Usado | resuelto tras calcular el diseño (los porcentajes, `auto`…) | `30px` | `400px` (si el padre mide 800px) |
| Real | ajustado a lo que el dispositivo puede pintar (redondeos, fuentes disponibles) | `30px` | `400px` |

Lo importante para el día a día:

- **Se hereda el valor computado**, no el texto que escribiste. Un hijo de ese elemento hereda `30px`, no `1.5em` (si heredara `1.5em`, cada generación crecería un 50 %). Esto tiene una trampa famosa con `line-height` escrito con unidades, que verás en el módulo de tipografía.
- `em` en `font-size` se calcula con la fuente del **padre**; en cualquier otra propiedad (`padding`, `margin`…), con la fuente del **propio** elemento. Lo verás a fondo en la lección de unidades.
- DevTools → **Computed** muestra el valor computado o usado de cada propiedad. Desde JavaScript se obtiene con `getComputedStyle`:

[[exercise:08-del-especificado-al-computado.md]]

## Bestiario

- **Los botones y campos de formulario ignoran tu fuente.** *Síntoma:* todo el texto de la página usa tu tipografía salvo `input`, `button`, `select` y `textarea`, que se ven más pequeños y con la fuente del sistema. *Causa:* la hoja del navegador les da una fuente propia, y una regla que elige al elemento gana a la herencia. *Solución:* `button, input, select, textarea { font: inherit; }`, habitual en cualquier reset. [Ver ejemplo](03-controles-no-heredan-la-fuente.md).
- **`initial` no devuelve el aspecto normal.** *Síntoma:* un `div` con `display: initial` se pone en línea con su vecino; un `h2` con `font-size: initial` encoge. *Causa:* `initial` es el valor inicial de la propiedad según la especificación (`inline`, `medium`…), no el valor que el navegador da a ese elemento. *Solución:* usa `revert` para volver al estilo del navegador, o `unset` para respetar la herencia. [Ver ejemplo](04-initial-no-es-el-del-navegador.md).

## Resumen

- Si ninguna regla da valor a una propiedad, las heredadas toman el del padre y las demás, su valor inicial.
- Se heredan las propiedades de texto (`color`, `font-*`, `line-height`…), no las de caja (`margin`, `border`, `background`…).
- La herencia es el último recurso: cualquier regla que elija al elemento le gana, incluida la del navegador.
- `inherit`, `initial`, `unset`, `revert` y `revert-layer` valen para cualquier propiedad; `all` las aplica a todas a la vez.
- `initial` es el valor inicial de la propiedad, no el del navegador: para eso está `revert`.
- Un valor pasa de declarado a computado, usado y real; los hijos heredan el **computado**.

## Para profundizar

- [MDN: Inheritance](https://developer.mozilla.org/en-US/docs/Web/CSS/Inheritance)
- [web.dev: Inheritance](https://web.dev/learn/css/inheritance)
- [MDN: Values (specified, computed, used, actual)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Value_processing)
- [MDN: all](https://developer.mozilla.org/en-US/docs/Web/CSS/all)
- [MDN: revert](https://developer.mozilla.org/en-US/docs/Web/CSS/revert)
