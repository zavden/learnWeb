# Accesibilidad

## Por qué importa

Una de cada seis personas tiene alguna discapacidad, y muchas más usan la web en condiciones difíciles: con el sol en la pantalla, una mano ocupada, una conexión lenta o con la vista cansada. Hay quien navega solo con el teclado, quien usa un **lector de pantalla** que lee la página en voz alta, quien amplía el texto al 200 % o quien controla el ordenador con la voz. Hacer una web **accesible** significa que funciona para todas esas personas. En muchos países (también en la Unión Europea) es además una obligación legal para muchos sitios.

La buena noticia: la mayor parte de la accesibilidad sale **gratis** si usas el HTML correcto, que es lo que has hecho en todo este módulo. Esta lección explica qué recibe un lector de pantalla, cómo completar la información con **ARIA** cuando HTML no basta y cómo cuidar el **foco** del teclado.

## El árbol de accesibilidad

A partir del DOM, el navegador construye un segundo árbol, el **árbol de accesibilidad**, que es lo que leen las tecnologías de asistencia. Cada nodo tiene, sobre todo:

- un **rol**: qué es (botón, enlace, título de nivel 2, campo de texto, región principal…);
- un **nombre accesible**: cómo se llama («Guardar borrador», «Ciudad»);
- un **estado**: cómo está (pulsado, desactivado, expandido, inválido…).

Los elementos HTML traen su rol de serie (`<button>` es un botón, `<nav>` una región de navegación). Lo que tú debes cuidar sobre todo es el **nombre**.

## El nombre accesible

El nombre de un control se calcula, en este orden de prioridad:

1. `aria-labelledby="id"`: el texto de **otro** elemento.
2. `aria-label="texto"`: un texto que solo leen las tecnologías de asistencia.
3. El `<label>` asociado (en los campos de formulario) o el `alt` (en las imágenes).
4. El **contenido** del elemento (el texto de un botón o de un enlace).

[[exercise:01-nombre-accesible.md]]

El caso más frecuente de nombre vacío es un **botón de icono**: una papelera, una ✕, una lupa. Para un lector de pantalla es «botón», sin más. Se arregla con `aria-label`, o con un texto real oculto visualmente (la clase `visually-hidden`), que además se traduce si el usuario usa el traductor del navegador. El icono decorativo se oculta con `aria-hidden="true"` para que no se lea dos veces.

[[exercise:02-boton-de-icono-sin-nombre.md]]

## La primera regla de ARIA

**ARIA** (*Accessible Rich Internet Applications*) es un conjunto de atributos (`role`, `aria-*`) que modifican el árbol de accesibilidad: añaden nombres, roles y estados que HTML no puede expresar. Es potente y peligroso, porque **solo cambia lo que se anuncia, no el comportamiento**. Por eso su primera regla es:

> Si existe un elemento HTML nativo con el significado y el comportamiento que necesitas, úsalo en lugar de reutilizar otro y añadirle ARIA.

Un `<div>` con aspecto de botón no recibe el foco con Tab, no se activa con Enter ni con Espacio y no se anuncia como botón. Ponerle `role="button"` arregla solo el anuncio; el resto hay que programarlo a mano. Un `<button>` lo trae todo de serie.

[[exercise:03-div-que-parece-boton.md]]

## Descripciones, errores y estados

Además del nombre, ARIA permite comunicar información adicional y estados que cambian:

| Atributo | Para qué |
|---|---|
| `aria-describedby="id …"` | una descripción que se lee después del nombre: una pista, un formato, un error |
| `aria-invalid="true"` | el campo tiene un valor incorrecto |
| `aria-expanded="true/false"` | un botón muestra u oculta otro contenido |
| `aria-controls="id"` | qué elemento controla ese botón |
| `aria-current="page"` | el enlace de la página actual en un menú |
| `aria-hidden="true"` | ocultar algo decorativo a las tecnologías de asistencia (nunca algo enfocable) |

[[exercise:04-descripciones-y-errores.md]]

Un estado ARIA debe actualizarse cuando cambia la interfaz (con JavaScript, que verás en su capítulo). Una buena práctica es que el CSS **lea** ese mismo estado (`button[aria-expanded="true"]`): así el aspecto y lo que se anuncia nunca se contradicen. Y, de nuevo, si existe un elemento nativo, úsalo: `<details>` y `<summary>` ya se comportan como un desplegable accesible.

[[exercise:05-aria-expanded.md]]

### Mensajes que aparecen: regiones vivas

Cuando algo cambia en la página sin que el foco se mueva («Añadido al carrito», «Guardado», «3 resultados»), quien no ve la pantalla no se entera. Una **región viva** (`role="status"`, equivalente a `aria-live="polite"`) hace que el lector anuncie su texto cada vez que cambia. Tiene que existir en el HTML **antes** de que cambie su contenido. Para avisos urgentes existe `role="alert"`, que interrumpe lo que se esté leyendo: úsalo con moderación.

[[exercise:06-regiones-vivas.md]]

## El foco del teclado

Quien navega con teclado avanza con Tab (y retrocede con Mayús+Tab) por los elementos **enfocables**: enlaces, botones y campos de formulario, en el orden del HTML. Tres reglas:

- **No uses `tabindex` positivo**: los elementos con `tabindex="1"` o mayor se recorren antes que todo lo demás y rompen el orden visual.
- `tabindex="0"` añade al recorrido un elemento que no es enfocable (por ejemplo, un área con scroll, para desplazarla con las flechas).
- `tabindex="-1"` hace un elemento enfocable **solo por código** (`element.focus()`), útil para mover el foco a un título o a un mensaje.

Y el foco siempre debe **verse**. Nunca quites el anillo de foco (`outline: none`) sin sustituirlo por otro indicador; `:focus-visible` lo muestra al navegar con teclado y no al hacer clic con el ratón.

[[exercise:07-foco-y-tabindex.md]]

### Saltar al contenido

Si cada página empieza con un menú de diez enlaces, quien usa el teclado tiene que pasar por todos antes de llegar al contenido, en cada página. Un **enlace para saltar al contenido** (*skip link*), el primer elemento enfocable de la página, oculto hasta que recibe el foco, lo evita.

[[exercise:08-enlace-para-saltar-al-contenido.md]]

## Contraste y otras comprobaciones rápidas

- **Contraste**: el texto normal necesita una relación de al menos 4,5:1 con su fondo (3:1 para texto grande y para bordes de controles). DevTools la muestra al inspeccionar un color en el panel Styles.
- **Zoom**: amplía la página al 200 % (⌘ +) y comprueba que no se pierde contenido ni hace falta scroll horizontal.
- **Teclado**: desenchufa mentalmente el ratón y recorre la página con Tab: ¿se ve siempre el foco?, ¿se llega a todo?, ¿el orden tiene sentido?
- **Lector de pantalla**: en macOS, VoiceOver se activa con ⌘ F5. Diez minutos con él enseñan más que cualquier guía.
- **Auditoría**: DevTools → Lighthouse → Accessibility detecta los problemas automáticos (aproximadamente un tercio de los posibles: el resto requiere probar).

## Bestiario

- **El lector de pantalla dice solo «botón».** Síntoma: un botón de icono no tiene nombre. Causa: su único contenido es un SVG o un carácter decorativo. Solución: `aria-label` o un texto oculto visualmente. → [ver ejemplo](02-boton-de-icono-sin-nombre.md)
- **Mi botón no funciona con el teclado.** Síntoma: Tab se lo salta; Enter y Espacio no hacen nada. Causa: es un `<div>` con estilo de botón. Solución: `<button>` (primera regla de ARIA). → [ver ejemplo](03-div-que-parece-boton.md)
- **El foco salta en un orden absurdo.** Síntoma: Tab va del tercer campo al primero. Causa: un `tabindex` positivo. Solución: elimínalo y ordena el HTML como se lee. → [ver ejemplo](07-foco-y-tabindex.md)

## Resumen

- El navegador construye un árbol de accesibilidad con el rol, el nombre y el estado de cada elemento.
- El nombre accesible sale de `aria-labelledby`, `aria-label`, el `<label>`/`alt` o el contenido; los botones de icono necesitan uno explícito.
- Primera regla de ARIA: usa el elemento nativo; ARIA cambia lo que se anuncia, no el comportamiento.
- `aria-describedby`, `aria-invalid`, `aria-expanded` y las regiones vivas (`role="status"`) comunican pistas, errores, estados y mensajes.
- Nada de `tabindex` positivo; `0` para añadir al recorrido, `-1` para enfocar por código; el foco siempre visible.
- Un enlace para saltar al contenido ahorra el menú en cada página.

## Para profundizar

- [MDN: Accesibilidad](https://developer.mozilla.org/es/docs/Learn/Accessibility)
- [W3C WAI: Using ARIA (las reglas de ARIA)](https://www.w3.org/TR/using-aria/)
- [W3C WAI: WCAG 2.2 de un vistazo](https://www.w3.org/WAI/standards-guidelines/wcag/glance/)
- [web.dev: Learn Accessibility](https://web.dev/learn/accessibility)
- [The A11Y Project: checklist](https://www.a11yproject.com/checklist/)
