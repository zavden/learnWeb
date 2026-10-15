# Ejemplos profesionales: APIs modernas del navegador

## Por qué importa

Las APIs de este módulo son las que distinguen una página de una aplicación: el feed que carga solo al llegar al final, las pestañas y los avisos de un sistema de diseño, el control de formulario hecho a mano que se valida como uno nativo, el cargador de fotos que acepta arrastrar y pegar, la presentación a pantalla completa que no deja que se apague la pantalla. Esta página reúne doce piezas así, escritas como en un proyecto real con todo lo que has visto hasta ahora en el curso: HTML, CSS, el lenguaje JavaScript y los cinco módulos anteriores de este capítulo.

Lee primero el bloque de comentarios del principio de cada script, que explica las decisiones de diseño. Todos imprimen al cargar sus comprobaciones en la consola (✅) y una línea `Listo: …` con lo que puedes probar; ábrelos con «▶ Run» o en el editor. Varios usan la pantalla completa, el portapapeles, el formulario o Wake Lock, que una tarjeta de la teoría (un iframe aislado) no permite: lo dicen en la propia página y siguen funcionando en todo lo demás.

## Qué tienen en común

- **Primero lo nativo, después lo propio.** `loading="lazy"` antes que un observer para imágenes, `<dialog>` para el visor, radios e inputs de verdad dentro de los componentes, anclas que funcionan sin JavaScript. Cada API moderna se añade donde lo nativo no llega.
- **Una función por acción, varias entradas.** Mover una canción, añadir una foto o pasar una diapositiva se hace con una sola función; el ratón, el teclado, el arrastre y el portapapeles solo calculan sus argumentos. Todo lo que se arrastra también se hace con el teclado.
- **Lo que se prepara, se deshace.** Observers que se desconectan al terminar o se vuelven a armar tras cada carga, listeners con `signal`, URLs `blob:` revocadas en cuanto la imagen carga, intervalos que se paran con la página oculta.
- **Respeto por la persona.** Nada pide permiso al cargar; el portapapeles, la pantalla completa y Wake Lock van detrás de un botón y tienen plan B; el movimiento se consulta con `matchMedia`; el foco nunca se pierde (vuelve a la miniatura, a la fila movida, al título de la sección).
- **Componentes con frontera clara.** Shadow DOM para la estructura y el estilo propios, `::part` y variables CSS para el tema, eventos que salen desde el host, y el contenido y las referencias ARIA en el light DOM cuando la página los necesita.
- **Comprobables sin tocar nada.** La lógica vive en funciones puras (`pickCurrent`, `resolve`, `layoutFor`) o recibe sus dependencias (`createAutosave(editor, clave)`, `copy(write)`, listas de `matchMedia` falsas): las comprobaciones las prueban sin desplazar, arrastrar ni tocar el portapapeles de verdad. Las claves de almacenamiento empiezan por `lw-apis-`, y las de prueba se borran.

## Contenido que llega solo

### Feed de reseñas

**Objetivo:** las reseñas de una tostadora, cargadas por páginas mientras bajas. **Técnicas:** el patrón ARIA *feed* (`role="feed"`, `aria-busy`, `aria-posinset`, `aria-setsize` que pasa de `-1` al total en la última página, AvPág/RePág entre reseñas); páginas JSON de `assets/01-feed/` con `fetch` y un `AbortController` por petición; un centinela con `IntersectionObserver` (raíz: el panel) que se vuelve a observar tras cada página, porque el observer avisa de cambios y no de estados. **Fíjate en:** el botón «Cargar más reseñas» es la vía principal, y cambiar el orden a mitad de una carga cancela la anterior sin que su respuesta pinte nada.

[[exercise:01-feed-de-resenas.md]]

```text
✅ página 1 → loaded · 10 reseñas · aria-busy false
✅ «Cargar más» → 20 reseñas · aria-setsize -1
✅ última página → 25 · aria-setsize 25 · botón oculto
✅ cambiar el orden a mitad de carga cancela la petición anterior → aborted
✅ «Mejor valoradas»: las 10 primeras tienen 5 estrellas → true
✅ de vuelta a «Más recientes» → 10 · 10 reseñas (más recientes)
Listo: baja por el panel (carga sola al llegar al final) o pulsa «Cargar más reseñas»; cambia el orden; AvPág y RePág saltan entre reseñas
```

### Índice con sección actual

**Objetivo:** una guía larga con su índice siempre a mano. **Técnicas:** `IntersectionObserver` con `root: document` (la ventana de este documento, también dentro del iframe de la vista previa) y `rootMargin: '0px 0px -50% 0px'` (la mitad de arriba de la ventana; cada sección mide al menos media ventana, así que tras un salto solo la de destino toca la franja); `pickCurrent()`, una función pura que elige la última sección que toca la franja; `aria-current` en el índice; `scroll-behavior: smooth` solo sin `prefers-reduced-motion`, y lo mismo en los botones con `matchMedia`. **Fíjate en:** tras un salto, el foco va al título de la sección (`tabindex="-1"`), y la dirección cambia con `replaceState` sin llenar el historial.

[[exercise:06-indice-con-seccion-actual.md]]

```text
✅ cada enlace del índice lleva a una sección → true
✅ cada título puede recibir el foco → true
✅ franja con el final de «Tueste» y el principio de «Molienda» → molienda
✅ nada en la franja: se queda la anterior → agua
✅ markCurrent escribe solo si cambia → true false
✅ un solo aria-current en el índice → 1
Listo: desplaza la guía, usa el índice o los botones «↑ Anterior» / «↓ Siguiente»
// Tras pulsar «↓ Siguiente»:
↓ Tueste
📍 sección actual → Tueste
```

### Galería con visor

**Objetivo:** cinco obras de dominio público (Velasco, Hokusai y tres fotos de la NASA) con un visor a pantalla grande. **Técnicas:** miniaturas con `loading="lazy"`; un `<dialog>` modal que se recorre con ← → y precarga la obra anterior y la siguiente (`new Image()` + `decode()`); un fundido que respeta el movimiento reducido; pantalla completa sobre la figura del visor; «Compartir» con Web Share o, si no está, copiando el enlace; un `IntersectionObserver` con `threshold: 0.5` que cuenta las obras vistas. **Fíjate en:** al cerrar el visor (con Esc o con el botón), el foco vuelve a la miniatura que lo abrió.

[[exercise:12-galeria-con-visor.md]]

```text
✅ 5 miniaturas con nombre accesible → 5
✅ abrir la 2.ª: diálogo modal con la obra grande → true · 12-galeria/hokusai-gran-ola.jpg · 2 / 5
✅ se precargan la anterior y la siguiente → 12-galeria/tierra-apolo-17.jpg 12-galeria/velasco-valle-de-mexico.jpg
✅ ← dos veces: de la 2.ª a la 5.ª (en bucle) → 5 / 5 · Buzz Aldrin en la Luna
✅ al cerrar, el foco vuelve a la miniatura → true
✅ vistas: solo cuenta lo que se ve al menos a la mitad, una vez → 2
Listo: pulsa una obra; recórrelas con ← → o los botones; prueba «Pantalla completa», «Compartir» y Esc
```

## Componentes

### Pestañas y avisos

**Objetivo:** dos piezas de un sistema de diseño. **Técnicas:** `<app-tabs>` proyecta pestañas y paneles con slots con nombre pero los deja en el light DOM, porque `aria-controls` y `aria-labelledby` son ids y un id no cruza la frontera del Shadow DOM; *roving tabindex*, flechas, Inicio y Fin; `selected` reflejado; `tab-change` despachado desde el host con `composed: true`. `<app-toast>` guarda sus avisos en una región `role="status"` de su Shadow DOM, con una cuenta atrás que se pausa con el puntero encima, con el foco dentro o con la pestaña oculta. **Fíjate en:** el tema llega desde la página con `--tabs-accent`, `--toast-success` y `::part(tablist)`.

[[exercise:02-pestanas-y-avisos.md]]

```text
✅ roles → 3 tab · 3 tabpanel
✅ cada pestaña controla su panel (referencias en el light DOM) → true
✅ selected = 1 → aria-selected y tabindex → false/-1 true/0 false/-1
✅ solo se ve el panel elegido → true false true
📑 tab-change → Espresso (target: app-tabs#methods)
✅ → desde la última vuelve a la primera → 0
✅ el atributo refleja la propiedad → 0
✅ show() añade un aviso a la región role="status" → 1
✅ el aviso se cierra solo al acabar su tiempo → 0
Listo: cambia de pestaña con el ratón o con Tab y las flechas; pulsa «♡ Guardar» y pasa el puntero por encima del aviso
```

### Campo de cantidad

**Objetivo:** un control − / + para un pedido que se comporta exactamente como un `<input>`. **Técnicas:** `formAssociated` y `ElementInternals` (`setFormValue`, `setValidity` con `rangeUnderflow`, `rangeOverflow`, `stepMismatch` y `badInput`); el atributo `value` como valor por defecto y la propiedad como valor actual; `formResetCallback`, `formDisabledCallback` y `formStateRestoreCallback`; `delegatesFocus` para que `<label for>` enfoque el input de dentro, y su texto copiado al `aria-label`. **Fíjate en:** `:invalid` y `:disabled` funcionan desde la página, y un `<fieldset disabled>` desactiva también lo que hay dentro del Shadow DOM.

[[exercise:03-campo-de-cantidad.md]]

```text
✅ form.elements → chiapas, cacao
✅ FormData y total al empezar → chiapas=1 · cacao=0 · $210.00
✅ «+» en el cacao (de 2 en 2) → 2 · $400.00
✅ 11 cafés (máx. 10) → true · Como mucho 10 · :invalid true
✅ 3 de cacao (de 2 en 2) → true · De 2 en 2
✅ con errores, el formulario no es válido → false
✅ «Vaciar» vuelve a los valores por defecto → chiapas=1 · cacao=0 · válido true
✅ fieldset disabled desactiva el control y su input → true · true
✅ <label for> da nombre al input de dentro → Café de Chiapas 500 g · $210
Listo: cambia las cantidades con − y +, con las flechas o escribiendo; prueba «Pausar pedidos», «Vaciar» y «Pedir»
```

### Bloque de código copiable

**Objetivo:** el bloque «Copiar» de una documentación. **Técnicas:** el `<pre><code>` vive en el light DOM (se ve sin JavaScript, se indexa, se selecciona) y se proyecta con un slot; el botón (con `part="button"`) llama a `writeText` dentro del clic y, si el navegador lo rechaza, selecciona el código con `getSelection().selectAllChildren()` y dice «pulsa ⌘C»; el resultado sale en una región `aria-live` y en un evento `composed`. **Fíjate en:** las comprobaciones sustituyen `writeText` por una función de prueba: una página nunca debe escribir en el portapapeles sin que la persona lo pida.

[[exercise:09-bloque-de-codigo-copiable.md]]

```text
✅ el código sigue en el light DOM y se proyecta en el slot → pre
✅ el botón tiene nombre accesible y ::part → Copiar el código json · true
✅ code: el texto exacto del bloque → 2
✅ si el navegador lo rechaza, plan B: el código queda seleccionado → false · NotAllowedError · true
✅ el botón y la región aria-live lo dicen → Seleccionado · Seleccionado: pulsa ⌘C o Ctrl+C
✅ si lo acepta: «✓ Copiado» → true · ✓ Copiado
Listo: pulsa «Copiar» en cualquiera de los dos bloques y pega en tu terminal o tu editor
// Tras pulsar «Copiar» en el bloque json (con ▶ o en el editor):
📋 Código json copiado al portapapeles.
// En la tarjeta de arriba:
📋 No se pudo copiar automáticamente (NotAllowedError): el código json está seleccionado.
```

## Arrastrar, pegar y archivos

### Subida de fotos

**Objetivo:** las fotos de una reseña. **Técnicas:** tres entradas (soltar, pegar una captura y el `<input>`) que llaman a `addFiles()`; validación propia de tipo, tamaño, repetidas y máximo; vistas previas con `createObjectURL` revocadas en cuanto la imagen carga; una descripción por foto que es su `alt`; reducción a 1200 px con un `<canvas>` y `toBlob` antes de subir (el servidor de prueba admite 1 MB por petición); `XMLHttpRequest` con `upload.progress`, barra con nombre y «Cancelar». **Fíjate en:** las comprobaciones crean la «foto» dibujándola en un canvas y la suben de verdad a `/api/demo/echo`.

[[exercise:04-subida-de-fotos.md]]

```text
🖼 taza.png (prueba)
✅ acepta una imagen PNG → 1
⛔ menu.pdf no es una imagen PNG, JPG o WebP
✅ rechaza un PDF → ⛔ menu.pdf no es una imagen PNG, JPG o WebP
⛔ taza.png ya está en la lista
✅ ignora la misma foto otra vez → ⛔ taza.png ya está en la lista
✅ la vista previa cargó y su URL blob: se revocó → 0
✅ la descripción es el alt → Taza de barro con café de olla
✅ subidas: taza.png (image/png)
✅ subida al servidor de prueba → uploaded
✅ el servidor recibió → ✅ subidas: taza.png (image/png)
taza.png quitada
✅ al quitarla, la lista queda vacía y el botón desactivado → 0 · true
Listo: suelta, pega o elige fotos; escribe su descripción y pulsa «Subir»
```

### Lista de reproducción

**Objetivo:** ordenar una lista de boleros a gusto. **Técnicas:** `moveTrack()` para el arrastre (un tipo propio y una línea de inserción calculada con la mitad de la fila), para Alt + ↑/↓ y para los botones; FLIP con `element.animate` (del módulo «Gráficos y animación»), sin animación con movimiento reducido; una región `aria-live` que dice la nueva posición. **Fíjate en:** el foco sigue en la canción movida (o en su botón), aunque mover un nodo le quita el foco.

[[exercise:05-lista-de-reproduccion.md]]

```text
✅ 6 canciones · duración total → 6 · 21:40
🎵 Cielito lindo, posición 2 de 6 (teclado)
✅ Alt + ↓ en «Cielito lindo» → 2 · Cielito lindo, posición 2 de 6
✅ el foco sigue en la canción movida → true
🎵 Granada, posición 5 de 6 (botón)
✅ ▲ en «Granada» → besame cielito llorona sabor granada solamente
🎵 Sabor a mí, posición 1 de 6 (arrastre)
✅ arrastrar «Sabor a mí» encima de la primera → sabor besame cielito llorona granada solamente
✅ los botones de los extremos se ocultan → true · true
Listo: arrastra las canciones, usa Alt + ↑/↓ con una fila enfocada, o los botones ▲ ▼
```

## Observar y guardar

### Cuaderno con autoguardado

**Objetivo:** un cuaderno de catas que no pierde nada. **Técnicas:** `createAutosave(editor, clave)`: un `MutationObserver` sobre el `contenteditable` ve lo que se escribe y lo que insertan los botones; espera 800 ms sin cambios para guardar (*debounce*) y guarda en el acto con `visibilitychange` → `hidden` y con `pagehide`; `withoutSaving()` descarta con `takeRecords()` los cambios que hace la propia app; lo guardado lleva versión y vuelve a la página con `setHTML()`. **Fíjate en:** la comprobación de `setHTML`: un `<script>` y un `onerror` guardados no sobreviven.

[[exercise:07-cuaderno-con-autoguardado.md]]

```text
✅ escribir se detecta (characterData) → true
✅ varios cambios seguidos → un solo guardado → 1
✅ lo guardado se restaura en otro editor → 4 líneas · Aroma: cacao
✅ flush() (lo que hace visibilitychange → hidden) guarda en el acto → true · 2
✅ el HTML guardado pasa por setHTML → <p>Nota</p>
✅ withoutSaving: un cambio de la app no queda pendiente → false · false
Listo: escribe en el cuaderno o añade una plantilla; espera a «guardado», cambia de pestaña o pulsa ⟳
```

### Tabla que se adapta

**Objetivo:** los pedidos de la semana, legibles en una columna estrecha y en una pantalla ancha. **Técnicas:** un `ResizeObserver` sobre la propia sección decide `data-layout` con `layoutFor()`; el CSS pone la tabla o las tarjetas (con `display: contents` y `attr(data-label)`); en tarjetas, las cabeceras quedan solo para los lectores de pantalla y aparece un `<select>` para ordenar, sincronizado con `aria-sort`. **Fíjate en:** el comentario del principio explica por qué aquí no bastan las container queries del módulo «Diseño responsive»: cambian el aspecto, pero no los controles.

[[exercise:10-tabla-que-se-adapta.md]]

```text
✅ layoutFor: 479 px y 480 px → cards · table
✅ tarjetas: se ve el <select> y la cabecera queda solo para lectores → true · absolute
✅ tabla: el <select> se oculta → false
✅ ordenar por total (mayor primero) → P-2078 P-2072 P-2075
✅ aria-sort en «Total» y el <select> sincronizado → descending · total-descending
✅ clic en «Cliente» → ascendente; la primera fila, «Andrés Pérez» → ascending · Andrés Pérez
✅ otro clic → descendente; la primera, «Mercado Roma» → descending · Mercado Roma
Listo: cambia el ancho de la vista previa (cruza los 480 px de caja) y ordena con las cabeceras o con el <select>
// Tras estrechar la vista previa por debajo de 480 px de caja (el número varía):
📐 446 px → tarjetas
```

## Preferencias y pantalla

### Preferencias de lectura

**Objetivo:** tema y movimiento que siguen al sistema salvo que elijas otra cosa. **Técnicas:** `class Preferences extends EventTarget` con `resolve()`, una función pura de «lo que eliges» y «lo que dice el sistema»; las listas de `matchMedia` y su `change` en vivo; un objeto con versión en `localStorage` validado al leer; `data-theme` para el CSS y un evento `change` para lo que el CSS no alcanza: una gráfica de canvas y un carrusel de consejos que solo se desliza con movimiento completo. **Fíjate en:** las comprobaciones pasan listas de `matchMedia` falsas (un `EventTarget` con `matches`) para simular el sistema.

[[exercise:11-preferencias-de-lectura.md]]

```text
✅ resolve: sistema con SO oscuro · claro elegido con SO oscuro · sistema con SO que pide menos movimiento → dark/full · light/full · light/reduce
✅ con «Como el sistema», el cambio del SO llega como evento → dark (sistema)
✅ con «Claro» elegido, el SO ya no manda → dark (sistema), light (persona)
✅ se guarda con versión → {"version":1,"theme":"light","motion":"system"}
✅ un valor desconocido guardado vuelve a «system» → system/reduce
Listo: elige tema y movimiento (se recuerdan); con «Como el sistema», cambia el modo de macOS con la página abierta
// Tras elegir «Claro»:
🎨 tema claro · movimiento completo (lo decidió la persona)
```

### Modo presentación

**Objetivo:** las diapositivas de un taller de café. **Técnicas:** `show()` para botones y teclado (flechas, AvPág/RePág, Inicio/Fin, F) con el foco en la presentación; `aria-roledescription` y una región `aria-live`; un fundido con `element.animate` solo sin movimiento reducido; la Fullscreen API con `:fullscreen` para la letra grande; Wake Lock detrás de un botón, pedido otra vez en `visibilitychange`. **Fíjate en:** en una tarjeta de la teoría, el botón de pantalla completa se desactiva y la página explica por qué.

[[exercise:08-modo-presentacion.md]]

```text
✅ 5 diapositivas y solo se ve la primera → 5 · 1
🖼 Diapositiva 2 de 5: Del cafetal al beneficio
✅ → pasa a la 2.ª y lo anuncia → Diapositiva 2 de 5: Del cafetal al beneficio
🖼 Diapositiva 5 de 5: ¡A catar!
✅ Fin → la última; «Siguiente» desactivado → 5 / 5 · true
🖼 Diapositiva 1 de 5: Del grano a la taza
✅ Inicio → la primera; «Anterior» desactivado → 1 / 5 · true
✅ cada diapositiva dice su posición → 1 de 5 | 2 de 5 | 3 de 5 | 4 de 5 | 5 de 5
fullscreenEnabled → true · 'wakeLock' in navigator → true
Listo: haz clic en la presentación y usa las flechas (F: pantalla completa); prueba «Pantalla siempre encendida» y cambia de pestaña
// En una tarjeta de la teoría, la penúltima línea dice: fullscreenEnabled → false · 'wakeLock' in navigator → true
```
