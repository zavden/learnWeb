# Ejemplos profesionales: transiciones y animaciones

Estos ejemplos están escritos como en un proyecto real: HTML semántico y accesible, contenido realista y un CSS organizado para que otra persona pueda mantenerlo. Usan todo lo visto hasta ahora en el curso: el capítulo de HTML y los nueve módulos de CSS, incluidas las media queries, las container queries y las preferencias del usuario del módulo anterior. Las View Transitions necesitan unas líneas de JavaScript, marcadas como adelanto del capítulo 6; todo lo demás funciona sin él. Ábrelos con ↗ para verlos en una pestaña, ensanchar la ventana y probar el movimiento reducido con DevTools → **Rendering** → **Emulate CSS media feature prefers-reduced-motion**.

Comparten una arquitectura sencilla: **tokens** en `:root` (colores, duraciones, curvas) y componentes con una sola clase. El anidamiento nativo y la organización de todo un proyecto en capas llegan en el módulo de arquitectura CSS. Y siguen siete reglas de este módulo:

- **Seguros por defecto.** Un token `--motion` vale `0` y solo pasa a `1` dentro de `@media (prefers-reduced-motion: no-preference)`. Toda distancia y toda escala se multiplica por él (`translate: 0 calc(var(--motion) * -4px)`): si alguien olvida una regla, la página se queda quieta, no marea. Los nombres de las View Transitions, que no se pueden multiplicar, van dentro de esa media query.
- **Reducir no es quitar.** Con `reduce`, los desplazamientos se convierten en fundidos, los saltos en destellos de color y los giros en pulsos lentos. La información que daba el movimiento sigue ahí.
- **La transición vive en la regla base.** El estado de llegada solo declara la suya cuando quiere otra curva o un retardo distinto: entrar frenando, salir acelerando, escalonar al abrir y salir a la vez.
- **Se anima `transform` y `opacity`.** Las barras se escalan, los paneles se desplazan, los brillos son pseudoelementos que se mueven. Las alturas (`interpolate-size`) solo en huecos pequeños y breves.
- **Lo que aparece tiene punto de partida, y lo que se va, tiempo para irse.** `@starting-style` para entrar; `display … allow-discrete` (y `overlay` en la capa superior) para salir.
- **Nada infinito por defecto.** Los indicadores de carga giran solo mientras dura su estado, uno cada vez, con `transform` u `opacity`; las ondas y los latidos se repiten un número finito de veces.
- **El movimiento nunca va solo.** Hay un texto de estado (`role="status"`), un `aria-pressed`, un número escrito o un color que dicen lo mismo que la animación.

Lee primero el comentario de cabecera de cada CSS: explica las decisiones.

## Cajón de navegación

**Objetivo:** la navegación de una tienda, de móvil a escritorio. **Técnicas:** en pantallas estrechas, un `popover` que entra desde la izquierda (`@starting-style`), sale con `overlay` y `display` en `allow-discrete` y oscurece la página con su `::backdrop`; los enlaces llegan escalonados solo al abrir; desde 48rem, la misma lista es una barra normal (un `display` del autor gana a la regla del navegador que oculta el popover). **Fíjate en** la salida: el cajón acelera y tarda menos que al entrar, porque cada estado declara su transición.

[[exercise:01-cajon-de-navegacion.md]]

## Tienda de láminas

**Objetivo:** el catálogo y las fichas de las láminas de un museo. **Técnicas:** dos vistas en la misma página que se cambian con `hidden` dentro de `startViewTransition`; la miniatura y la imagen de la ficha comparten `view-transition-name` (nunca están visibles a la vez), así que la miniatura viaja y crece hasta la ficha; `object-fit: cover` en los pseudoelementos para que las fotos no se deformen al cambiar de proporción; una container query coloca la ficha en dos columnas. **Fíjate en** el foco: al abrir una ficha va a su título, y al volver, a la miniatura de la que salió.

[[exercise:02-tienda-de-laminas.md]]

## Centro de avisos

**Objetivo:** los avisos de un huerto comunitario. **Técnicas:** un popover que crece desde la campana (`transform-origin` y `scale`); un punto de «sin leer» que lanza una onda tres veces al cargar y se apaga al marcar todo como leído; avisos que se archivan cerrando su hueco con `interpolate-size`; un estado vacío que aparece con `@starting-style` cuando no queda ninguna casilla sin marcar (`:not(:has(… :not(:checked)))`, porque un `:has()` no puede ir dentro de otro). **Fíjate en** el orden de la lista de transiciones de cada aviso: `opacity` va primero para que el retardo escalonado se aplique a ella también con «reducir movimiento».

[[exercise:03-centro-de-avisos.md]]

## Selector de precios

**Objetivo:** una página de planes con pago mensual o anual. **Técnicas:** dos radios con una píldora (`::before`) que se desliza bajo la opción elegida; cada precio con sus dos versiones en la misma celda de grid, cruzadas con `opacity`, `visibility` y un pequeño desplazamiento; el ahorro anual, que no existe en mensual, entra con `@starting-style`; tarjetas que se levantan con el ratón o el foco. **Fíjate en** la versión con movimiento reducido de la píldora: en lugar de deslizarse, se funde una y aparece la otra.

[[exercise:04-selector-de-precios.md]]

## Portada con scroll

**Objetivo:** la portada de una exposición sobre José María Velasco. **Técnicas:** una cabecera pegajosa que se vuelve opaca en los primeros 80px (`animation-range` en píxeles sobre `scroll()`); parallax de la pintura (se desplaza un 30 % de su caja mientras la portada sube); el título que se desvanece; una barra de lectura y secciones que aparecen al entrar con `view()`; velos calculados para que el texto blanco tenga al menos 6:1 sobre el peor píxel de la pintura. **Fíjate en** el parallax con «reducir movimiento»: su distancia es `--motion × 30 %`, así que desaparece sin tocar ninguna otra regla.

[[exercise:05-portada-con-scroll.md]]

## Huerto en cifras

**Objetivo:** un panel de datos que se anima al cargar. **Técnicas:** una custom property registrada como `<integer>` que va de 0 al valor y que leen a la vez el arco (`conic-gradient`) y el número (`counter-reset` y `counter()`); barras escaladas desde la izquierda y escalonadas con `--i`; un «reproducir» sin JavaScript que cambia el nombre de las animaciones (un nombre nuevo es una animación nueva). **Fíjate en** que cada dato está también en el texto: los gráficos son decoración accesible de un dato que ya se lee.

[[exercise:06-huerto-en-cifras.md]]

## Compra en pasos

**Objetivo:** un proceso de compra de cuatro pasos. **Técnicas:** View Transitions con tipo (`startViewTransition({ update, types })`, Chrome 125+) y `:active-view-transition-type()` para que el paso se deslice hacia un lado al avanzar y hacia el otro al retroceder; la raíz sin fundido, para que la barra de progreso (una transición de `scale` normal) se vea crecer en directo durante la transición; el foco, al título de cada paso. **Fíjate en** `data-step`: el script solo cambia ese atributo y los `hidden`; el resto es CSS.

[[exercise:07-compra-en-pasos.md]]

## Sistema de carga

**Objetivo:** una regla clara para cada tipo de espera. **Técnicas:** barra indeterminada para la página, botón con spinner que solo aparece si la espera pasa de 300 ms (una animación de aparición con retardo, más el giro), esqueletos con brillo para las listas y el contenido final con `@starting-style`; los estados se eligen con radios, así que nunca hay dos animaciones infinitas a la vez. **Fíjate en** el botón: sus dos textos comparten celda, así que no cambia de tamaño al pasar a «Guardando…».

[[exercise:08-sistema-de-carga.md]]

## Catálogo que se reordena

**Objetivo:** filtrar y ordenar un catálogo de plantas. **Técnicas:** cada tarjeta con su `view-transition-name` y la clase común `card`; las que se quedan viajan a su nuevo sitio, y las que salen o entran (su foto es la única hija del par: `::view-transition-old(*.card):only-child`) se encogen o crecen mientras se funden; botones con `aria-pressed` y un `role="status"` que anuncia cuántas plantas se ven. **Fíjate en** que todo el cambio, botones incluidos, ocurre dentro de la transición: la foto «de antes» es el estado anterior completo.

[[exercise:09-catalogo-que-se-reordena.md]]

## Botones con tokens de movimiento

**Objetivo:** el kit de botones de una tienda. **Técnicas:** tokens de duración (`instant`, `fast`, `base`), de curva (`standard`, `spring`) y `--motion`; botones que suben al pasar el ratón y se hunden al pulsar en 80 ms; un anillo de foco que se separa; un «favorito» que late y lanza una onda; un interruptor (`role="switch"`) con rebote; un botón de pago con spinner tras 300 ms. **Fíjate en** las dos duraciones del botón: subir tarda 250 ms, hundirse 80 ms, porque la respuesta a una pulsación tiene que sentirse inmediata.

[[exercise:10-botones-con-tokens.md]]

## Índice que sigue la lectura

**Objetivo:** una guía larga con un índice que marca la sección que estás leyendo. **Técnicas:** una línea de tiempo de vista con nombre por sección, encogida con `view-timeline-inset` a una franja a un tercio de la altura; `timeline-scope` para que el índice, fuera del contenedor con scroll, las vea; un fotograma «activo» entre el 1 % y el 99 % del tramo; una barra de lectura con `scroll-timeline`; una container query que lleva el índice a la izquierda. **Fíjate en** los longhands: `view-timeline-name` y `view-timeline-axis` por separado, porque el atajo reiniciaría el inset.

[[exercise:11-indice-que-sigue-la-lectura.md]]

## Temporizador de pausas

**Objetivo:** un temporizador de estiramientos sin JavaScript. **Técnicas:** una custom property `<integer>` heredable que cuenta hacia atrás con `steps(var(--total))`, leída por el anillo y por un contador de CSS; «Pausar» con `animation-play-state`; el aviso final como segunda animación con un retardo igual a la duración, pausado a la vez. **Fíjate en** el orden de las reglas: la de pausa va después de los atajos `animation`, que reinician `animation-play-state`.

[[exercise:12-temporizador-de-pausas.md]]
