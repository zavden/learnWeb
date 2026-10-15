# Integración: arquitectura y CSS moderno

## Qué vas a practicar

Las cinco lecciones del módulo responden a cinco preguntas de organización: **¿cómo agrupo los estilos de un componente?** (anidamiento nativo), **¿cómo nombro las clases y quién gana a quién?** (BEM, utilidades, `:where()` y capas), **¿cómo limito hasta dónde llega una regla?** (`@scope`), **¿dónde viven las decisiones de diseño?** (tokens en tres niveles, temas, escalas) y **¿desde qué punto de partida empiezo?** (el reset, la base, la red de movimiento reducido y la capa de impresión). En un proyecto real se responden todas a la vez, y cada respuesta se apoya en las otras: las capas deciden el orden entre grupos, BEM y `:where()` mantienen la especificidad baja dentro de cada capa, y los tokens hacen que un tema o una temporada se cambien en un solo sitio.

Cada ejemplo de esta página combina dos, tres o cuatro de esas lecciones. Antes de leer el código, hazte cuatro preguntas: **¿en qué capa está cada regla, y quién gana si dos coinciden?**, **¿cuánto pesa cada selector?**, **¿qué tokens lee cada componente, y dónde se calculan?** y **¿qué cambia en el tema oscuro, con «reducir movimiento» y en papel?** Al final hay tres ejercicios con su solución.

> Todos los ejemplos usan solo lo visto hasta ahora: el capítulo de HTML, los diez módulos de CSS y Sass para comparar. Tu Mac está en modo oscuro: los ejemplos con tema empiezan en oscuro y dicen en la página qué tema está activo. Para ver el claro, usa el selector de tema cuando lo haya, o abre el ejemplo con ↗ y DevTools → **Rendering** → **Emulate CSS media feature prefers-color-scheme**. Para la impresión, ↗ y <kbd>⌘</kbd> <kbd>P</kbd>, o **Emulate CSS media type** → `print`.

## Un recetario anidado y en capas

Las tarjetas de un recetario con la estructura completa del módulo. Las capas se declaran en una línea (`reset, base, components, utilities`). La tarjeta está escrita en BEM y anidada a un solo nivel: dentro van sus estados (`:hover`, el anillo de foco con `:has()`), su contexto (`.sidebar &`) y su container query, que pone el tiempo a la izquierda cuando hay 17rem de hueco; los elementos, como reglas planas de una clase. El enlace del título cubre la tarjeta entera con un `::after`. La base usa etiquetas y `:where()`; las dos utilidades (`.cluster` para las etiquetas y `.visually-hidden` para la descripción de la receta del día) ganan sin `!important`.

[[exercise:01-recetas-anidadas-en-capas.md]]

## Una temporada con tokens

Una tienda de artesanía con los tres niveles de tokens: primitivos que no cambian nunca, semánticos con `light-dark()` y la temporada de Día de Muertos, que solo redefine tres tokens de acento en `[data-season]`. El truco está en los derivados (el fondo suave de la etiqueta, hecho con `color-mix()`, y el anillo de foco): se declaran en `:where(:root, [data-season])`, así que se calculan otra vez dentro de la zona de temporada, con el acento naranja. Si solo estuvieran en `:root`, la zona heredaría el verde ya calculado. El selector de tema solo cambia `color-scheme`.

[[exercise:02-temporada-con-tokens.md]]

Un detalle del fondo suave: se mezcla `in oklab` y no `in oklch`. En oklch, el tono se interpola, y mezclar un 12 % de verde azulado con un gris oscuro ligeramente cálido da un marrón; en oklab, los canales se mezclan en línea recta y sale un gris verdoso, que es lo que se espera de un «tinte».

## Comentarios con ámbito

Un blog con un widget de comentarios de otro equipo. Los estilos del widget van en `@scope (.comments) to (.comment__body)`: dentro, nombres cortos (`.comment`, `h2`, `a`) que no salen del ámbito, y un agujero para el texto de cada lector, que conserva el estilo de la página. Fíjate en tres cosas. Los enlaces del widget son verdes aunque la regla `a` de la página va después, en la misma capa y con el mismo peso: una regla sin ámbito cuenta como infinitamente lejana y pierde por proximidad. El cuerpo del comentario heredaría el gris y la letra pequeña del widget, pero declara los suyos con la clase `.prose`. Y lo que `@scope` no evita, contado en un comentario: una regla de la página más específica sí entraría.

[[exercise:03-comentarios-con-scope.md]]

## Planes con utilidades

Los planes de una huerta comunitaria, compuestos con utilidades: `.stack` y `.cluster` colocan (y su hueco se ajusta desde el HTML con una custom property), `.u-text-center` centra la cabecera y la etiqueta, y `.visually-hidden` completa lo que el lector de pantalla necesita: «$90 pesos al mes», «Elegir el plan Maceta». Están en la última capa: `.u-text-center` gana al `text-align: start` de `.plan`, y `.stack` al `display` de cualquier componente, sin `!important`. Los componentes, en BEM con anidamiento corto (`.plan__price small`, `&.button--ghost`).

[[exercise:04-planes-con-utilidades.md]]

## Una guía con escala fluida

Una guía de cuidados con el reset y la base de la lección 5, la escala fluida de la lección de tokens y los estilos de texto largo a especificidad cero (`:where(.prose)`). La cabecera es pegada, así que el reset (`scroll-margin-block: 5ex` en `:target`) no basta: la base le suma la altura de la cabecera, guardada en un token. El título al que se salta se marca con una raya, y la capa `print` esconde el índice, despega la cabecera y escribe la dirección del enlace de la fuente.

[[exercise:05-guia-con-escala-fluida.md]]

## Botones con tokens de componente

Los botones de un editor de recetas. Cada botón declara su interfaz (`--button-base`, `--button-hover`, `--button-text`, `--button-border`) a partir de los tokens semánticos, y las variantes solo cambian tokens. El fondo es un degradado, que no se puede animar; pero el color que vive dentro, `--button-bg`, está registrado como `<color>`, y su transición vuelve a pintar el degradado en cada fotograma. La barra oscura no toca ningún botón: redefine los semánticos (`--color-surface`, `--color-text`, `--color-focus`), y como los tokens del botón se declaran en cada botón, se calculan allí con los valores de la barra.

[[exercise:06-botones-con-tokens.md]]

Un detalle de cascada: el estado `:hover` cambia `--button-bg`, y las variantes cambian `--button-base`. Si las variantes cambiaran `--button-bg` directamente, `.button.button--primary` (0,2,0), escrita después, ganaría a `.button:hover` (0,2,0) y el botón principal no reaccionaría al ratón.

## Una entrada para la pantalla y para el papel

La entrada de un museo con tokens `light-dark()` y una etiqueta que dice qué tema está activo. El sello «Pagado» entra una sola vez con una animación de `scale` y `rotate`; con «reducir movimiento», la red de seguridad del reset lo deja en 0.01ms y aparece en su sitio. La capa `print` va la última: fuerza `color-scheme: light` (así `light-dark()` elige los valores claros), pasa los bordes a negro, esconde los enlaces y la etiqueta del tema, y evita partir la entrada entre dos hojas.

[[exercise:07-entrada-imprimible.md]]

## Una librería en su capa

Una librería de reseñas (estrellas e insignia) metida en `@layer vendor`. Se configura como se debe: redefiniendo **sus** custom properties (`--sr-accent`, `--sr-size`) desde la capa `components`, que va después, sin subir la especificidad. Su único `!important` (la insignia gris) solo se puede ganar con otro `!important` en una capa **anterior**: por eso la primera línea declara `vendor-fixes` antes que `vendor`. Las estrellas son un único texto `★★★★★` pintado con un degradado recortado (`background-clip: text`), y su valor real lo lee el lector de pantalla en el `aria-label`.

[[exercise:08-libreria-en-su-capa.md]]

## Ejercicios

Cada ejercicio tiene el HTML y el script bloqueados: solo se trabaja en el CSS, en los puntos marcados con `TODO`. El script lee las reglas de la hoja (el CSSOM: capas, `@scope`, declaraciones con `!important`, colores escritos a mano) y los estilos calculados, marca con ✅ lo que ya está bien y lo repite en la consola. Ninguna comprobación depende del tema de tu sistema ni del tamaño de la vista previa: el de los tokens fabrica dos copias ocultas de la tarjeta, una en claro y otra en oscuro, y compara sus colores. Las pistas orientan sin dar la respuesta; la solución está enlazada desde el propio ejercicio.

**Ordena la hoja en capas.** Una hoja sin capas: un reset pegado al final que borra los márgenes de la base, una utilidad que solo gana con `!important` y un estilo de texto largo que, dentro de la misma capa, gana a un botón por especificidad.

[[exercise:09-ej-ordena-la-hoja-en-capas.md]]

**Tematiza la agenda con tokens.** Componentes con los colores escritos a mano, un tema oscuro copiado entero en una `@media` y un token derivado congelado en `:root` que deja la etiqueta de la temporada en verde.

[[exercise:10-ej-tematiza-la-agenda.md]]

**Protege la nota del widget con `@scope`.** Un widget del tiempo con selectores descendientes que pintan la nota de la autora que lleva dentro; el script mide el contraste de la nota, que también depende de la herencia.

[[exercise:11-ej-protege-el-widget-con-scope.md]]

## Lo que conviene llevarse

- El orden de las capas, en una línea al principio; todo el CSS dentro de alguna; las utilidades, al final y sin `!important`; los `!important` ajenos, domados desde una capa anterior.
- Dentro de una capa sigue contando la especificidad: BEM (una clase) y `:where()` (cero) la mantienen baja y pareja.
- Anidar agrupa, no protege: un nivel, dos como mucho, y los elementos como reglas planas.
- `@scope` limita a quién seleccionan las reglas y desempata por proximidad; no frena la herencia ni a una regla más específica.
- Tres niveles de tokens; los derivados se declaran donde se redefine su base; `light-dark()` y `color-scheme` hacen el tema sin duplicar; `@property` permite animar un token.
- Un reset pequeño en la capa más baja, una base con `:where()`, la red de movimiento reducido con `0.01ms` y la capa `print` la última.
