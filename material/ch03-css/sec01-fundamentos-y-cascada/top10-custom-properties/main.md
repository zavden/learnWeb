# Custom properties

## Por qué importa

Un diseño real repite los mismos valores cientos de veces: el color de marca, el radio de las esquinas, el espaciado base. Las **custom properties** (también llamadas «variables de CSS») dan nombre a esos valores para escribirlos una sola vez. Pero son más que variables: son **propiedades** de verdad, así que se heredan, participan en la cascada y se pueden cambiar en vivo (con un `:hover`, una casilla marcada o JavaScript). Son la base de los temas claro/oscuro, de los sistemas de diseño y de casi todo el CSS moderno. Y tienen una forma de fallar que no se parece a nada de lo que has visto.

## Declarar y usar

Una custom property es cualquier propiedad cuyo nombre empieza por `--`. Se declara en un bloque como cualquier otra y se lee con la función `var()`:

```css
:root {
  --brand: #7c3aed;        /* declarar */
}

.title {
  color: var(--brand);     /* usar */
}
```

- Se suelen declarar en `:root` (el elemento `<html>`), para que lleguen a toda la página.
- El nombre distingue mayúsculas: `--brand` y `--Brand` son dos variables distintas.
- El valor puede ser casi cualquier cosa: un color, una longitud, un número sin unidad, una lista de fuentes… El navegador no lo comprueba al declararlo; solo lo guarda.

[[exercise:01-declarar-y-usar.md]]

## Valor de respaldo

`var()` admite un segundo argumento: el **respaldo**, que se usa cuando la variable no está definida. Puede ser otro `var()`, y todo lo que va tras la primera coma forma parte de él:

```css
color: var(--accent, orange);
font-family: var(--font, Georgia, serif);   /* respaldo: «Georgia, serif» */
```

[[exercise:02-valor-de-respaldo.md]]

## Herencia y ámbito

Las custom properties son propiedades **heredadas**. Si redefines una en un elemento, el nuevo valor vale para ese elemento y para todos sus descendientes, y `var()` se resuelve en cada elemento con el valor que tiene la variable **allí**. Así, una misma regla puede dar resultados distintos según dónde se aplique:

[[exercise:03-herencia-y-ambito.md]]

Como son propiedades, también participan en la cascada: si dos reglas declaran `--accent` para el mismo elemento, gana la de mayor especificidad o la última, como con cualquier otra propiedad.

> **Desde Python:** las variables de Python tienen ámbito **léxico**: su valor depende de dónde está escrito el código. Las custom properties se parecen más a un ámbito **dinámico**: `var(--accent)` no vale lo que había donde escribiste la regla, sino lo que vale `--accent` en el elemento que la está usando. La misma línea de CSS puede dar un azul en una tarjeta y un rojo en otra.

## Cambiar variables sin JavaScript

Como una variable es una propiedad, cualquier selector puede cambiarla: una pseudoclase de estado, una clase, un `:has()`. Si todos tus colores salen de variables, un tema oscuro consiste solo en redefinir unas pocas:

[[exercise:04-cambiar-variables-sin-js.md]]

## Cambiar variables desde JavaScript

JavaScript puede escribir una variable en cualquier elemento con `element.style.setProperty('--nombre', valor)`. Es la forma más limpia de conectar JavaScript y CSS: el script cambia **un dato** y el CSS decide cómo se ve. (Al escribirla en el atributo `style`, gana a la declaración de `:root`, como cualquier estilo en línea.)

[[exercise:07-cambiar-variables-con-js.md]]

## Inválida en tiempo de cómputo

Este es el comportamiento más extraño de las variables. Recuerda la lección 1: si una declaración es inválida, el navegador la descarta **al leer el CSS** y se queda con la anterior. Con `var()` eso es imposible, porque al leer no sabe qué valor tendrá la variable en cada elemento. Así que:

1. Al leer, acepta cualquier declaración con `var()` como válida (y descarta las anteriores de esa propiedad, como haría con cualquier declaración posterior).
2. Al calcular el estilo de cada elemento, sustituye `var()` por su valor.
3. Si el resultado no es válido para la propiedad, la declaración es **inválida en tiempo de cómputo** y la propiedad se comporta como si valiera `unset`: hereda si es heredada; si no, toma su valor inicial.

```css
p {
  color: crimson;
  color: var(--size);   /* --size: 20px → no es un color → unset → hereda el color del padre */
}
```

El respaldo no lo evita: solo se usa cuando la variable **no existe**, no cuando su valor es inválido.

[[exercise:05-invalida-en-tiempo-de-computo.md]]

## Variables y unidades

`var()` no pega texto: su valor se inserta como una pieza aparte. Por eso `var(--gap)px` no forma `48px` sino `48 px`, que es inválido. Para convertir un número en una longitud, multiplícalo por la unidad dentro de `calc()`, o guarda la unidad en la propia variable:

[[exercise:06-variables-y-unidades.md]]

Guardar números sin unidad tiene sus ventajas, porque el mismo número sirve para varias cosas: `calc(var(--columns) * 1fr)`, `calc(var(--gap) * 1px)`, `oklch(70% 0.15 var(--hue))`.

## @property: variables con tipo

Por defecto, para el navegador una custom property es solo una secuencia de texto. La at-rule `@property` la **registra** con un tipo:

```css
@property --progress {
  syntax: "<percentage>";   /* el tipo: <length>, <color>, <number>, <angle>… */
  inherits: false;          /* si se hereda o no */
  initial-value: 20%;       /* su valor inicial */
}
```

Con un tipo, el navegador sabe calcular valores intermedios y puede **animar** la variable, algo imposible sin registrarla. También puede rechazar valores que no encajan con el tipo y caer en el valor inicial en lugar de romper la propiedad que la usa.

[[exercise:08-property-tipada-y-animable.md]]

## Organizar y nombrar variables

Con pocas variables cualquier nombre sirve; con cien, hace falta un orden. Dos niveles habituales:

- **Globales**, en `:root`, con los valores básicos del diseño: `--color-brand`, `--color-text`, `--space-1`, `--space-2`, `--radius`. Son los *design tokens*, que construirás en el módulo de arquitectura CSS.
- **De componente**, que funcionan como la «interfaz» configurable de un componente. Se leen con un respaldo, para que el componente funcione aunque nadie las defina:

```css
.btn {
  background: var(--btn-bg, var(--color-brand));
  padding: var(--btn-padding, 0.5em 1em);
}

.toolbar .btn {
  --btn-padding: 0.25em 0.75em;   /* los botones de la barra son más compactos */
}
```

Nombra las variables por su **función** (`--color-text`, `--color-danger`), no por su valor (`--blue`): si mañana el color de peligro deja de ser rojo, `--red: green` sería un disparate.

## Cómo verlas en DevTools

En **Elements → Styles**, las custom properties aparecen como cualquier otra declaración. Al pasar el ratón sobre un `var(--brand)`, Chrome muestra el valor que tiene la variable en ese elemento, y si la variable no existe, la marca como no definida. En **Computed**, las custom properties del elemento aparecen agrupadas, con su valor ya heredado.

## Custom properties frente a variables de Sass

En el capítulo de Sass verás otras variables, `$brand`, que se parecen mucho pero funcionan en otro momento: las de Sass se sustituyen **al compilar** y desaparecen del CSS final; las custom properties viven **en el navegador**, se heredan y pueden cambiar mientras la página está abierta. Muchas veces se usan juntas.

## Bestiario

- **La declaración anterior no hace de respaldo.** *Síntoma:* escribes `color: crimson; color: var(--x);` y, si `--x` tiene un valor que no sirve, el texto no sale rojo sino del color del padre (o, en propiedades no heredadas, con su valor inicial). *Causa:* una declaración con `var()` se da por buena al leer el CSS; si al calcular resulta inválida, la propiedad pasa a `unset`, y la declaración anterior ya se descartó. El respaldo de `var()` tampoco ayuda si la variable existe. *Solución:* asegúrate de que la variable contiene un valor válido para cada propiedad donde la usas, o regístrala con `@property` para darle un tipo. [Ver ejemplo](05-invalida-en-tiempo-de-computo.md).
- **`var(--gap)px` no da una longitud.** *Síntoma:* una propiedad con `var(--x)px` no se aplica. *Causa:* el valor de la variable se inserta como una pieza aparte; el resultado es `48 px`, inválido en tiempo de cómputo. *Solución:* `calc(var(--gap) * 1px)`, o guarda la unidad dentro de la variable (`--gap: 48px`). [Ver ejemplo](06-variables-y-unidades.md).

## Resumen

- Una custom property es una propiedad `--nombre`; se lee con `var(--nombre, respaldo)`.
- Se hereda: redefinirla en un elemento la cambia para todo su subárbol, y `var()` se resuelve en cada elemento.
- Se puede cambiar con selectores (`:hover`, `:has()`, clases) o con JavaScript (`style.setProperty`).
- Si `var()` produce un valor inválido, la propiedad pasa a `unset`: ni la declaración anterior ni el respaldo la salvan.
- `var(--n)px` no funciona; usa `calc(var(--n) * 1px)`.
- `@property` da tipo, herencia y valor inicial a una variable, y la hace animable.

## Para profundizar

- [MDN: Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [web.dev: Custom properties](https://web.dev/learn/css/custom-properties)
- [MDN: @property](https://developer.mozilla.org/en-US/docs/Web/CSS/@property)
- [CSS Custom Properties Level 1: invalid at computed-value time](https://www.w3.org/TR/css-variables-1/#invalid-at-computed-value-time)
- [MDN: var()](https://developer.mozilla.org/en-US/docs/Web/CSS/var)
