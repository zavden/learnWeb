# Design tokens

## Por qué importa

Un diseño es un conjunto de **decisiones**: qué colores hay y para qué sirve cada uno, qué tamaños de letra, cuánto espacio entre las cosas, cuánto se redondean las esquinas, cuánto tarda un movimiento. Los **design tokens** son esas decisiones con nombre, guardadas en un solo sitio y usadas en todos los demás. En CSS se escriben como custom properties.

Ya han ido apareciendo por el curso: en la lección de custom properties, la diferencia entre variables globales y de componente; en el ejemplo «Sistema de temas» del módulo responsive, dos niveles de tokens con `light-dark()`; en el módulo de Sass, mapas que se publicaban como custom properties; en el de animación, las duraciones y las curvas con nombre. Esta lección los ordena: tres niveles, dos formas de hacer temas, escalas fluidas, tokens con tipo y tres formas en que un token se rompe sin avisar.

## Tres niveles

| Nivel | Qué nombra | Ejemplos | Lo leen… |
|---|---|---|---|
| **Primitivos** | lo que hay disponible: la paleta, la escala de radios, de pasos | `--teal-700`, `--radius-8`, `--step-2` | solo los semánticos |
| **Semánticos** | las decisiones: para qué sirve cada cosa | `--color-accent`, `--color-text-muted`, `--radius-card` | los componentes |
| **De componente** | lo que un componente deja configurar | `--button-bg`, `--button-padding` | el propio componente |

Los primitivos dicen **qué** es un valor (un verde azulado oscuro); los semánticos, **para qué** sirve (el acento de la marca). Esa separación es la que hace barato cambiar: si el acento pasa a ser naranja, se cambia una línea de los semánticos; si una zona de la página necesita otro acento, redefine unos pocos semánticos y todo lo que hay dentro los hereda.

[[exercise:01-primitivos-y-semanticos.md]]

Dos reglas que sostienen el sistema:

- **Un componente nunca lee un primitivo.** Si `.button` usa `var(--teal-700)`, el día que cambie el acento habrá que buscar ese botón a mano.
- **Los nombres van de lo general a lo particular**: categoría, propiedad, variante, estado. `--color-text`, `--color-text-muted`, `--color-accent-hover`, `--space-m`, `--radius-control`. Así se ordenan solos en DevTools y se adivinan sin mirar.

> **Desde Python:** los primitivos son como un módulo de constantes (`PALETTE = {"teal-700": "#0f766e", …}`) y los semánticos, un diccionario que elige de él (`THEME = {"accent": PALETTE["teal-700"]}`). La diferencia es que los tokens de CSS están vivos: redefinir `--color-accent` en un elemento lo cambia para todo su interior, el «ámbito dinámico» de la lección de custom properties.

## Tokens de componente

El tercer nivel es la **interfaz** de un componente: las custom properties que lee y que se pueden cambiar desde fuera. Sus propiedades siempre leen esos tokens, y las variantes solo cambian tokens, nunca propiedades:

[[exercise:02-tokens-de-componente.md]]

El ejemplo muestra las dos formas de escribirlos, y la diferencia importa:

- **Declarado en el componente** (`.button { --button-bg: var(--color-accent); }`): es el valor por defecto de cada botón, y los modificadores del propio botón lo cambian. Un antepasado no puede, porque la declaración del elemento gana a la heredada.
- **Leído con respaldo** (`border-radius: var(--button-radius, var(--radius-control))`, sin declararlo en el botón): si un antepasado lo define, se hereda y se usa. Es la forma de que un contexto, como una barra de herramientas, configure a todos los botones de dentro.

Decide cuáles son de cada tipo: lo segundo es una promesa pública del componente.

## Temas

Un tema es otro conjunto de valores para los **mismos** tokens semánticos. Ningún componente sabe qué tema hay. Hay dos formas de escribirlo.

### Con un atributo: `[data-theme]`

Los valores por defecto van en `:root` y cada tema es un bloque que redefine los semánticos: `:root[data-theme="dark"] { … }`. Cambiar de tema es cambiar un atributo de `<html>`, con un botón y una línea de JavaScript (un adelanto del capítulo 6):

[[exercise:03-tema-con-data-theme.md]]

La página dice qué tema está activo y lo repite en la consola:

```text
Listo: pulsa «Tema oscuro» para cambiar data-theme en <html>.
Tema activo: claro (sin data-theme: los valores de :root)
// Tras pulsar «Tema oscuro»:
Tema activo: oscuro (data-theme="dark")
// Tras pulsar otra vez:
Tema activo: claro (data-theme="light")
```

Fíjate en que empieza en claro aunque tu sistema esté en oscuro: el atributo no sabe nada del sistema. Para seguirlo habría que copiar el bloque oscuro entero dentro de `@media (prefers-color-scheme: dark)`, y mantener las dos copias iguales para siempre.

### Con `light-dark()` y `color-scheme`

La técnica del módulo responsive: cada token semántico guarda sus dos valores en una línea, `light-dark(claro, oscuro)`, y el tema depende de una sola propiedad, `color-scheme`, que además oscurece lo que dibuja el navegador (campos, casillas, barras de desplazamiento). Con `color-scheme: light dark` en la raíz sigue al sistema; con `light` o `dark` lo fuerza:

[[exercise:04-tema-con-light-dark.md]]

Como tu Mac está en modo oscuro, la vista previa empieza en oscuro con «Sistema» marcado. Elige «Claro» para ver el otro tema, o abre el ejemplo con ↗ y usa DevTools → **Rendering** → **Emulate CSS media feature prefers-color-scheme**.

| | `[data-theme]` | `light-dark()` + `color-scheme` |
|---|---|---|
| Dónde están los valores | un bloque por tema | los dos en cada token |
| Seguir al sistema | duplicando el bloque oscuro en una `@media` | gratis, con `color-scheme: light dark` |
| Más de dos temas (sepia, marca de temporada…) | sí | no: solo claro y oscuro |
| Piezas del navegador | hay que cambiar `color-scheme` en cada tema | automático |
| Soporte | todos los navegadores | `light-dark()`: Chrome 123 (2024) y los actuales |

Se combinan bien: `light-dark()` para claro y oscuro, y un `[data-theme]` o una clase para lo que no es claro u oscuro (la zona de temporada del primer ejemplo, un tema de alto contraste).

## Escalas fluidas

Los tamaños también son tokens. En la lección de tipografía fluida del módulo responsive calculaste la recta de un `clamp()` y una escala modular fluida; aquí está la escala completa, como se guarda en un proyecto: pasos de letra de `--step--2` a `--step-5` y espacios de `--space-3xs` a `--space-3xl`, más los **pares** (`--space-s-l`, `--space-m-xl`) que crecen mucho más para separar bloques grandes.

```css
:root {
  --step-0: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);       /* 16 → 20px: el texto */
  --step-5: clamp(2.4883rem, 2.006rem + 2.4116vw, 3.8147rem); /* 40 → 61px: la portada */
  --space-s: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);      /* 16 → 20px */
  --space-s-l: clamp(1rem, 0.4545rem + 2.7273vw, 2.5rem);     /* 16 → 40px */
}
```

[[exercise:05-escala-fluida.md]]

Los componentes no escriben tamaños: eligen un paso (`font-size: var(--step-1)`, `gap: var(--space-s)`). Así el ritmo de toda la página cambia en un solo sitio, y las reglas de accesibilidad de aquella lección (todo en `rem` salvo la pendiente; el máximo, como mucho 2,5 veces el mínimo) se cumplen una vez y para siempre.

## Tokens con tipo: `@property`

Para el navegador, una custom property sin registrar es solo texto: no sabe si es un color o una longitud hasta que la sustituye en una propiedad. `@property` la **registra** con un tipo (`syntax`), si se hereda (`inherits`) y un valor inicial (`initial-value`). Un token con tipo gana dos cosas:

- **Se puede animar.** El navegador sabe interpolar un `<color>` o una `<length>`, así que una transición del token cambia poco a poco todo lo que lo usa. Sin registrar, salta.
- **Se defiende de los valores equivocados**, como verás en la sección siguiente.

[[exercise:06-tokens-tipados.md]]

Dos detalles al registrar. `initial-value` tiene que valer lo mismo en cualquier elemento: `16px` o `#b91c1c` sí, `1rem` o `2em` no (la regla `@property` entera se descartaría). Y `inherits: false` sirve para los tokens que un componente usa por dentro y no deben llegar a sus descendientes, como el `--progress` de un anillo de carga dentro de otro. No hace falta registrar cada token: basta con los que se animan y los que más daño harían si se rompen.

## Tokens de movimiento

Las duraciones, las curvas y las distancias también son decisiones de diseño, y siguen los mismos niveles. En el módulo de animación las escribiste en `:root` (`--duration-base`, `--ease-enter`, `--distance-lift`) y resolviste el movimiento reducido en un solo sitio, poniendo las distancias a cero; en el de Sass, salían de un mapa. Ordenadas por niveles:

```css
:root {
  /* Primitivos */
  --duration-100: 100ms;
  --duration-200: 200ms;
  --duration-400: 400ms;
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);

  /* Semánticos */
  --motion-duration-feedback: var(--duration-100);   /* un botón que responde */
  --motion-duration-enter: var(--duration-200);      /* algo que aparece */
  --motion-ease-enter: var(--ease-out-quart);
  --motion-distance-enter: 0.75rem;
}

@media (prefers-reduced-motion: reduce) {
  :root { --motion-distance-enter: 0px; }             /* se funde en su sitio, sin viajar */
}
```

## Tres formas de romper un token

Los tokens fallan en silencio: no hay errores en la consola, solo una página que se ve mal. Estas son las tres formas más comunes.

### Un valor del tipo equivocado

Lo viste en la lección de custom properties: si `var()` produce un valor que no sirve para la propiedad, la declaración es **inválida en tiempo de cómputo** y la propiedad se comporta como `unset`: hereda si es heredada (`color`) o toma su valor inicial si no lo es (`padding: 0`). No vuelve a la declaración anterior, que se descartó al leer el CSS. En un sistema de tokens, basta con un `1.5` sin unidad o un `600` donde iba un color para que medio componente desaparezca:

[[exercise:07-token-de-tipo-equivocado.md]]

Con el token registrado, el error se queda en el token: es el **token** el que pasa a valer su valor heredado o inicial, y la propiedad que lo usa recibe un valor válido. La tarjeta sigue bien mientras alguien corrige el valor.

### Un token derivado en `:root`

Un token que se calcula a partir de otro (`--ring: 0 0 0 4px var(--accent)`, `--accent-soft: color-mix(in oklch, var(--accent) 15%, white)`) se resuelve **en el elemento donde se declara**. Si se declara en `:root`, sus descendientes heredan el resultado ya calculado, no la receta: redefinir `--accent` en una tarjeta cambia lo que lee `--accent` directamente, pero no el anillo ni el fondo suave.

[[exercise:08-token-derivado-congelado.md]]

Dos soluciones: redefinir los derivados allí donde redefines la base (como en la zona de temporada del primer ejemplo, que redefinía los tres tokens de acento), o no derivar en `:root` y componer el valor donde se usa, guardando como tokens solo las piezas (`--ring-width`, `--soft-amount`).

### Una referencia circular

En Sass, `$space: $space * 2` funciona: el código se ejecuta de arriba abajo y usa el valor anterior. Una custom property no es una variable que se reasigna, sino una propiedad del elemento. Dentro de su propio valor, `var(--space)` se refiere a sí misma, no a la heredada: `--space: calc(var(--space) * 2)` es un **ciclo**. Las custom properties de un ciclo pasan a ser inválidas, como si no existieran: la propiedad que las usa cae a `unset`, y un `var()` con respaldo usa el respaldo.

[[exercise:09-referencia-circular.md]]

La solución es un nombre nuevo para el valor nuevo: `--note-space: calc(var(--space) * 2)`. Lo mismo vale para dos tokens que se citan entre sí (`--a: var(--b); --b: var(--a)`).

## Cómo verlo en DevTools

- En **Elements → Styles**, pasa el ratón por un `var(--color-accent)`: Chrome muestra el valor que tiene el token en ese elemento, o avisa de que no está definido.
- En **Computed**, marca **Show all** y busca el token: verás su valor ya calculado en el elemento. En la tarjeta de peligro del ejemplo 8, `--ring` vale el verde de `:root`: ahí se ve que el derivado está congelado.
- Un token del tipo equivocado no aparece tachado en Styles (la declaración se dio por buena al leer); el valor real está en Computed: `padding: 0px`.
- Las reglas `@property` aparecen en Styles, en su propia sección, con la sintaxis y el valor inicial de cada token registrado.

## Bestiario

- **Media tarjeta se queda sin estilos.** Síntoma: sin relleno, o con el color del texto en lugar del rojo, aunque la línea anterior pusiera otro valor. Causa: el token tiene un valor del tipo equivocado; la propiedad es inválida en tiempo de cómputo y pasa a `unset`, no a la declaración anterior. Solución: corregir el valor y registrar con `@property` los tokens importantes, que caen a su valor inicial. → [ver ejemplo](07-token-de-tipo-equivocado.md)
- **Cambio el acento y el anillo sigue igual.** Síntoma: redefinir `--accent` en un componente cambia el borde, pero no el anillo ni el fondo suave. Causa: `--ring` y `--accent-soft` se calcularon en `:root` y se heredan ya resueltos. Solución: redefinir los derivados en el mismo sitio, o componerlos donde se usan. → [ver ejemplo](08-token-derivado-congelado.md)
- **«El doble de espacio» deja la tarjeta sin espacio.** Síntoma: `--space: calc(var(--space) * 2)` deja el relleno a 0 (o en el respaldo de `var()`). Causa: el token se cita a sí mismo, es un ciclo y pasa a ser inválido. Solución: otro nombre para el valor nuevo (`--note-space`). → [ver ejemplo](09-referencia-circular.md)

## Resumen

- Tres niveles: primitivos (la paleta), semánticos (las decisiones) y de componente (su interfaz). Los componentes no leen primitivos.
- Tokens de componente: declarados en el componente (valores por defecto, los cambian sus modificadores) o leídos con respaldo (los puede cambiar un antepasado).
- Temas: `[data-theme]` redefine los semánticos en un bloque por tema; `light-dark()` + `color-scheme` guarda los dos valores en cada token y sigue al sistema sin duplicar.
- Los tamaños (letra y espacio) y el movimiento también son tokens; los componentes eligen un paso, no un número.
- `@property` da tipo a un token: se puede animar y, si recibe un valor equivocado, cae a su valor inicial.
- Tres errores silenciosos: un valor del tipo equivocado, un derivado calculado en `:root` y una referencia circular.

## Para profundizar

- [Design Tokens Community Group (W3C)](https://www.designtokens.org/)
- [MDN: @property](https://developer.mozilla.org/en-US/docs/Web/CSS/@property)
- [MDN: light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark)
- [Utopia: escalas fluidas de letra y espacio](https://utopia.fyi/)
- [Especificación: CSS Custom Properties, dependencias y ciclos](https://www.w3.org/TR/css-variables-1/#cycles)
