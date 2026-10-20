# z-index y contextos de apilamiento

## Por qué importa

En cuanto las cajas se superponen (con `position`, con márgenes negativos, con flotantes), hay que decidir **cuál se pinta encima**. La respuesta rápida es `z-index`, y casi todo el mundo aprende `z-index` así: «el número más alto gana». Hasta el día en que un menú con `z-index: 9999` aparece debajo de una sección con `z-index: 2`, y la reacción es probar con 99999.

El número más alto no siempre gana, porque los `z-index` no se comparan en una sola lista global: se comparan dentro de **contextos de apilamiento**, que se anidan unos dentro de otros. En esta lección verás el orden en el que el navegador pinta, qué hace realmente `z-index`, qué crea un contexto de apilamiento (muchas propiedades lo hacen sin avisar) y cómo organizar los `z-index` de un proyecto para no entrar en la carrera de los nueves.

## El orden de pintado

El navegador no pinta caja a caja en el orden del HTML, sino **por fases**. Dentro de cada contexto de apilamiento:

1. el fondo y el borde de la caja que crea el contexto;
2. los descendientes posicionados con `z-index` **negativo**, del más negativo al menos;
3. los fondos y bordes de los **bloques** del flujo normal, en el orden del HTML;
4. los **flotantes**;
5. el **contenido en línea** (texto, imágenes, `inline-block`), en el orden del HTML;
6. los descendientes **posicionados** con `z-index: auto` o `0` (y los contextos sin `z-index`), en el orden del HTML;
7. los descendientes posicionados con `z-index` **positivo**, de menor a mayor.

Dos consecuencias que ya habías visto sin saberlo: el fondo de un título pasa por debajo de una imagen flotante (fase 3 antes que fase 4) y, en el contador montado sobre su botón de los ejemplos profesionales del módulo anterior, el contador quedaba encima porque las cajas en línea se pintan en el orden del HTML. Y una tercera que sorprende: si dos bloques se solapan con un margen negativo, el **texto** del primero se ve encima del **fondo** del segundo, porque todos los fondos se pintan antes que todo el texto.

[[exercise:01-orden-de-pintado.md]]

Fíjate en la fase 6: cualquier caja posicionada, aunque no tenga `z-index`, se pinta después de todo el flujo normal. Por eso una caja con `position: relative` tapa a sus vecinas sin posicionar.

## `z-index`

`z-index` ordena las cajas posicionadas en el eje Z, el que sale de la pantalla hacia ti. Acepta números enteros, también negativos, y `auto` (el valor por defecto). Entre cajas del mismo contexto, el número mayor se pinta encima; si empatan, gana la que va después en el HTML.

[[exercise:02-z-index-ordena-los-posicionados.md]]

`z-index` **solo se aplica a cajas posicionadas** (`position` distinto de `static`) y a los hijos de un contenedor flex o grid, que verás en sus módulos. En una caja `static` se ignora sin dar ningún error: es el primer motivo de «le he puesto `z-index: 99` y no sube».

[[exercise:03-z-index-sin-position.md]]

`auto` y `0` parecen lo mismo (las dos van en la fase 6), pero no lo son: `z-index: 0` crea un contexto de apilamiento y `auto` no. Esa diferencia es el tema del resto de la lección.

## Contextos de apilamiento

Un **contexto de apilamiento** (*stacking context*) es un grupo de cajas que se pintan juntas, como una sola capa, con su propio orden interno. Los `z-index` de los descendientes solo los ordenan **entre sí, dentro del grupo**. Hacia fuera, el grupo entero compite con su propio `z-index` (o como `0`, si no tiene).

Piensa en carpetas dentro de carpetas. Un documento marcado «9999» dentro de la carpeta «1» se archiva antes que cualquier cosa de la carpeta «2»: primero se compara la carpeta y solo después lo de dentro.

```text
página (contexto raíz)
├── cabecera            z-index: 1  ─── contexto
│   └── menú            z-index: 9999   (solo compite dentro de la cabecera)
└── sección             z-index: 2  ─── contexto
                                       → orden final: cabecera (con su menú) < sección
```

> **Desde Python:** el orden real se parece a comparar tuplas con el «camino» de `z-index` desde la raíz. El menú vale `(1, 9999)` y la sección `(2,)`. Igual que en Python `(1, 9999) < (2,)` es `True` porque la comparación se decide en el primer elemento, la sección se pinta encima del menú.

### Qué crea un contexto de apilamiento

El elemento `<html>` crea el contexto raíz. Además, crea uno nuevo cualquier caja con:

| Propiedad | Valor | Dónde se estudia |
|---|---|---|
| `position: relative` o `absolute` | con un `z-index` distinto de `auto` | esta lección |
| `position: fixed` o `sticky` | siempre | lección anterior |
| hijo de flex o grid | con un `z-index` distinto de `auto` | módulos de flexbox y grid |
| `opacity` | menor que `1` | módulo de efectos visuales |
| `transform`, `translate`, `rotate`, `scale`, `perspective` | distinto de `none` | módulo de efectos visuales |
| `filter`, `backdrop-filter` | distinto de `none` | módulo de efectos visuales |
| `mix-blend-mode` | distinto de `normal` | módulo de efectos visuales |
| `clip-path`, `mask` | distinto de `none` | módulo de efectos visuales |
| `isolation` | `isolate` | esta lección |
| `will-change` | cualquiera de las propiedades anteriores | módulo de animaciones |
| `contain` | `layout`, `paint`, `strict` o `content` | — |

Casi todas crean el contexto **como efecto secundario**: alguien añade un `opacity: 0.95` o una animación con `transform` a un contenedor, y de repente un menú que estaba dentro queda atrapado.

[[exercise:04-que-crea-un-contexto.md]]

### El `z-index: 9999` que no sube

Ya puedes explicar el error más famoso de `z-index`. Un menú desplegable con `z-index: 9999` vive dentro de una cabecera con `z-index: 1`. Debajo hay una sección con `z-index: 2`. El 9999 del menú solo cuenta dentro de la cabecera; hacia fuera, quien compite es la cabecera, con su 1, y pierde contra el 2 de la sección.

[[exercise:05-z-index-9999-no-sube.md]]

El método para depurarlo siempre es el mismo:

1. Desde la caja que no sube, recorre sus antepasados y anota cuáles crean un contexto (la tabla anterior).
2. Haz lo mismo desde la caja que la tapa.
3. Busca el primer nivel en el que las dos ramas son **hermanas** dentro del mismo contexto y compara ahí sus `z-index`.
4. Arréglalo en ese nivel: sube el contexto correcto o quita el que sobra. Subir el número de la caja de dentro no sirve de nada.

### La cabecera `sticky` que queda debajo

Una variante muy frecuente: una cabecera `sticky` sin `z-index` y, debajo, una lista de tarjetas con `position: relative` (por sus insignias). Al hacer scroll, las tarjetas pasan **por encima** de la cabecera. La cabecera y las tarjetas están todas en la fase 6, y las tarjetas van después en el HTML. Un `z-index: 1` en la cabecera la sube a la fase 7.

[[exercise:06-cabecera-sticky-bajo-las-tarjetas.md]]

## `z-index` negativo

Un `z-index` negativo no significa «detrás de todo», sino «detrás de todo **lo de mi contexto**, pero delante de su fondo» (fase 2). Si la caja que debería hacer de fondo no crea un contexto, el `-1` se va hasta el contexto de un antepasado y acaba detrás del fondo que querías decorar.

[[exercise:07-z-index-negativo.md]]

La solución es crear un contexto en la caja adecuada sin cambiar nada más, y para eso existe `isolation: isolate`: su único efecto es crear un contexto de apilamiento. Es a los contextos de apilamiento lo que `display: flow-root` es a los BFC.

## Una estrategia para todo un proyecto

Tres reglas evitan casi todos los problemas:

- **Una escala** de `z-index` en custom properties (`--z-dropdown: 100`, `--z-sticky: 200`, `--z-modal: 300`), en un solo sitio. Los componentes usan los nombres, nunca números sueltos.
- **Aislar** las zonas grandes de la página (`main`, cada componente complejo) con `isolation: isolate`. Lo que pase dentro, con `z-index: 1`, `2` o `500`, no puede salir a tapar la cabecera.
- **Dentro de un componente**, números pequeños (`1`, `2`, `-1`): solo ordenan sus piezas entre sí.

[[exercise:08-escala-de-z-index.md]]

Hay algo que está por encima de cualquier `z-index`: la **capa superior** (*top layer*). Un `<dialog>` abierto con `showModal()`, un elemento con `popover` o un elemento en pantalla completa se pintan en ella, fuera de todos los contextos. Por eso, para una ventana modal, lo correcto no es un `z-index` enorme sino un `<dialog>`; lo verás en la lección de elementos interactivos del capítulo de HTML.

## Tres «contextos» que no hay que confundir

En este módulo han aparecido tres ideas con nombres parecidos. Las tres son fronteras que crea una caja, pero cada una responde a una pregunta distinta:

| | Contexto de formato de bloque (BFC) | Bloque contenedor | Contexto de apilamiento |
|---|---|---|---|
| Pregunta | ¿cómo se **colocan** mis hijos y qué se escapa? | ¿respecto a qué se **miden** los desplazamientos y los `%`? | ¿en qué **orden** se pintan las cajas que se solapan? |
| Afecta a | márgenes que colapsan, flotantes | `absolute`, `fixed`, porcentajes | `z-index`, orden de pintado |
| Forma explícita de crearlo | `display: flow-root` | `position: relative` | `isolation: isolate` |
| Lección | 1 y 3 | 4 | 5 |

Muchas propiedades crean varias a la vez, y por eso un cambio pequeño tiene efectos en sitios inesperados:

| Propiedad | ¿BFC? | ¿Bloque contenedor de `absolute`? | ¿Bloque contenedor de `fixed`? | ¿Contexto de apilamiento? |
|---|---|---|---|---|
| `overflow: hidden` | sí | no | no | no |
| `display: flow-root` | sí | no | no | no |
| `position: relative` (sin `z-index`) | no | **sí** | no | no |
| `position: relative; z-index: 1` | no | sí | no | **sí** |
| `position: absolute` | sí | sí | no | solo con `z-index` |
| `opacity: 0.9` | no | no | no | **sí** |
| `transform` | no | **sí** | **sí** | **sí** |
| `isolation: isolate` | no | no | no | sí |
| `contain: paint` | sí | sí | sí | sí |

Cuando algo se coloque, se recorte o se pinte donde no esperas, pregúntate cuál de las tres fronteras está en juego y busca en los antepasados la propiedad que la crea.

## Cómo verlo en DevTools

Chrome no dibuja los contextos de apilamiento. Para seguir el método de depuración, selecciona la caja en **Elements** y sube por sus antepasados mirando en **Computed** `position`, `z-index`, `opacity`, `transform`, `filter` e `isolation`. El panel **Layers** (en el menú ⋮ → *More tools*) muestra las capas que el navegador manda al compositor, que no son lo mismo que los contextos de apilamiento, aunque a menudo coinciden.

## Bestiario

- **`z-index: 99` no hace nada.** Síntoma: la caja sigue debajo de una vecina por mucho que subas el número. Causa: la caja es `static`, y `z-index` solo se aplica a cajas posicionadas (y a hijos de flex o grid). Solución: `position: relative`. → [ver ejemplo](03-z-index-sin-position.md)
- **Mi menú con `z-index: 9999` queda debajo de otra sección.** Síntoma: un desplegable aparece debajo de algo con un `z-index` mucho menor. Causa: un antepasado del menú crea un contexto de apilamiento (`z-index`, `opacity`, `transform`, `filter`…) y es ese antepasado el que compite, y pierde. Solución: compara contextos, no números; sube el antepasado o quita el contexto que sobra. → [ver ejemplo](05-z-index-9999-no-sube.md)
- **Las tarjetas pasan por encima de mi cabecera `sticky`.** Síntoma: al hacer scroll, las tarjetas se dibujan sobre la cabecera fija. Causa: la cabecera y las tarjetas posicionadas se pintan en la misma fase, y las tarjetas van después en el HTML. Solución: `z-index: 1` (o el de tu escala) en la cabecera. → [ver ejemplo](06-cabecera-sticky-bajo-las-tarjetas.md)
- **Mi decoración con `z-index: -1` desaparece.** Síntoma: un pseudoelemento o un adorno con `z-index` negativo no se ve. Causa: se pinta detrás del fondo del contexto de un antepasado, porque la caja que debía contenerlo no crea un contexto. Solución: `isolation: isolate` en esa caja. → [ver ejemplo](07-z-index-negativo.md)

## Resumen

- El navegador pinta por fases: fondos de bloques, flotantes, contenido en línea y, al final, las cajas posicionadas; dentro de cada fase, en el orden del HTML.
- `z-index` solo funciona en cajas posicionadas (y en hijos de flex y grid); el número mayor queda encima y el empate lo gana la última del HTML.
- Un contexto de apilamiento agrupa a sus descendientes en una sola capa: sus `z-index` solo valen dentro de él.
- Muchas propiedades crean un contexto de rebote: `opacity < 1`, `transform`, `filter`, `position: fixed/sticky`, `z-index` en una caja posicionada…
- Un `z-index: 9999` que no sube está atrapado en el contexto de un antepasado: compara contextos, no números.
- Un `z-index` negativo va detrás de todo lo de su contexto, pero delante de su fondo; `isolation: isolate` crea el contexto donde lo necesitas.
- Usa una escala de `z-index` con custom properties, aísla las zonas grandes y reserva la capa superior (`dialog`, `popover`) para lo que debe ir encima de todo.

## Para profundizar

- [MDN: El contexto de apilamiento](https://developer.mozilla.org/es/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context)
- [MDN: z-index](https://developer.mozilla.org/es/docs/Web/CSS/z-index)
- [Josh W. Comeau: What the heck, z-index??](https://www.joshwcomeau.com/css/stacking-contexts/)
- [CSS 2.2, apéndice E: el orden de pintado en detalle](https://www.w3.org/TR/CSS22/zindex.html)
- [web.dev: Z-index and stacking contexts](https://web.dev/learn/css/z-index)
