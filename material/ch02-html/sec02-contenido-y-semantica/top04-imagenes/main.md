# Imágenes

## Por qué importa

Las imágenes son, con diferencia, lo que más pesa en una página web y una de las principales barreras de accesibilidad. Una etiqueta `<img>` mal escrita produce tres problemas que el usuario nota aunque no sepa nombrarlos: el texto **salta** mientras la página carga, el móvil descarga una foto de 2000 píxeles para mostrarla a 360, y una persona que usa lector de pantalla oye «img-producto-3482 punto png». En esta lección verás cómo escribir una imagen correcta: con texto alternativo, con dimensiones, y con varias versiones para que el navegador elija la adecuada.

## `<img>`: un elemento vacío y reemplazado

`<img>` es un elemento **vacío** (sin contenido ni etiqueta de cierre) y **reemplazado**: el navegador sustituye el elemento por el contenido del archivo, cuyo aspecto no controla tu HTML. Sus dos atributos imprescindibles son:

- `src`: la URL del archivo. Se resuelve como cualquier URL relativa (lo viste en el módulo anterior); en LearnWeb, los archivos de la carpeta `assets/` del tema se cargan por su nombre.
- `alt`: el **texto alternativo**, que sustituye a la imagen cuando no se puede ver: un lector de pantalla lo lee, un buscador lo indexa y el propio navegador lo muestra si el archivo falla.

[[exercise:01-img-y-alt.md]]

## Escribir un buen `alt`

El `alt` no describe la imagen «por describirla»: transmite **la información o la función** que la imagen aporta en ese contexto. Unas reglas prácticas:

| Situación | `alt` |
|---|---|
| Imagen que aporta información (una gráfica, una foto del producto) | lo que el usuario necesita saber: `alt="Ventas de 2026: +12 % respecto a 2025"` |
| Imagen dentro de un enlace o un botón | a dónde lleva o qué hace: `alt="Ir a la página de inicio"` |
| Imagen decorativa (adornos, iconos junto a un texto que ya lo dice) | **vacío**: `alt=""` |
| Imagen con texto dentro | el mismo texto |

Dos errores frecuentes: **omitir** el atributo (el lector de pantalla recurre al nombre del archivo) y empezar con «imagen de…» (el lector ya anuncia que es una imagen). Fíjate en la diferencia entre `alt=""` (decorativa, se ignora) y no poner `alt` (error).

[[exercise:02-alt-que-falta.md]]

## `width` y `height`: reservar el hueco

Mientras una imagen se descarga, el navegador no sabe cuánto mide. Si no se lo dices, la dibuja con altura 0 y, cuando llega el archivo, empuja hacia abajo todo lo que hay después: el texto que estabas leyendo **salta**. Ese salto se llama *layout shift* y Google lo mide como métrica de calidad (CLS).

La solución es declarar `width` y `height` con las dimensiones **intrínsecas** del archivo (en píxeles, sin unidad). Aunque luego el CSS cambie el tamaño con `max-width: 100%; height: auto`, el navegador usa esos atributos para conocer la **proporción** y reservar un hueco con la forma correcta desde el principio.

[[exercise:03-width-y-height.md]]

Otros dos atributos útiles para el rendimiento:

- `loading="lazy"`: no descarga la imagen hasta que está cerca de verse. Úsalo en imágenes que quedan fuera de la primera pantalla, nunca en la principal.
- `decoding="async"`: permite al navegador decodificar la imagen sin bloquear el resto del dibujo.

## Imágenes responsive: `srcset` y `sizes`

Una pantalla de móvil, una de portátil y una Retina necesitan archivos distintos. Con `srcset` ofreces varias versiones y el navegador elige; tú no decides cuál, le das la información para decidir.

### Por densidad: `1x`, `2x`

Para imágenes de **tamaño fijo** (un logo, un avatar), los descriptores `x` indican para qué densidad de píxeles es cada archivo. Una pantalla Retina tiene `devicePixelRatio` 2: cada píxel CSS son 2×2 píxeles físicos, así que necesita una imagen del doble de resolución para verse nítida.

[[exercise:04-srcset-por-densidad.md]]

### Por ancho: `w` y `sizes`

Para imágenes que cambian de tamaño con la página, los descriptores `w` indican el **ancho real** de cada archivo, y `sizes` le dice al navegador **cuánto ocupará** la imagen antes de que el CSS se haya aplicado:

```html
<img src="mountain-960.jpg"
     srcset="mountain-480.jpg 480w, mountain-960.jpg 960w, mountain-1920.jpg 1920w"
     sizes="(min-width: 900px) 50vw, 100vw"
     width="960" height="640" alt="…">
```

```text
viewport 1400px → sizes: 50vw = 700px × devicePixelRatio 2 = 1400px → elige mountain-1920
viewport  390px → sizes: 100vw = 390px × devicePixelRatio 3 = 1170px → elige mountain-1920
viewport  390px con devicePixelRatio 1                    = 390px  → elige mountain-480
```

[[exercise:05-srcset-y-sizes.md]]

Para ver la elección cambiar, abre el ejemplo con el botón ↗ de la vista previa y usa el **modo dispositivo** de DevTools (o estrecha la ventana y recarga). Ten en cuenta que el navegador puede quedarse con un archivo mayor que ya tenga en caché: la especificación le permite elegir lo que considere mejor.

### Dirección de arte: `<picture>`

`srcset` sirve cuando todas las versiones son **la misma imagen** a distintos tamaños. Si quieres un **encuadre distinto** (una foto apaisada en escritorio y un recorte vertical en móvil), usa `<picture>`: contiene varios `<source>` y un `<img>` final obligatorio. El navegador usa el **primer** `<source>` cuya condición se cumpla y, si ninguno, el `<img>`.

- `media="(min-width: 700px)"`: condición de tamaño (las media queries se estudian en el capítulo de CSS).
- `type="image/avif"`: formato; el navegador salta los formatos que no entiende. Así se ofrecen AVIF o WebP con un JPEG de respaldo.

El `alt`, las dimensiones y los estilos van siempre en el `<img>`: `<picture>` y `<source>` solo deciden qué archivo se carga.

[[exercise:06-picture-direccion-de-arte.md]]

## `<figure>` y `<figcaption>`

`<figure>` marca un contenido **autónomo** al que el texto puede hacer referencia («ver figura 1»): una imagen, pero también un fragmento de código, una tabla o una cita. `<figcaption>` es su pie o título y debe ser el primer o el último hijo de la figura. El pie **no sustituye** al `alt`: el pie lo leen todos, el `alt` solo quien no ve la imagen, y a menudo dicen cosas distintas (el pie da el contexto o el autor; el `alt` describe el contenido).

Las imágenes SVG se usan con `<img>` igual que cualquier otra, con una ventaja: al ser vectoriales se ven nítidas a cualquier tamaño y en cualquier densidad, sin necesidad de `srcset`. El SVG escrito directamente dentro del HTML lo verás en el módulo de multimedia.

[[exercise:07-figure-y-figcaption.md]]

## El hueco bajo las imágenes

Pon una imagen dentro de una caja con borde y aparecerá un hueco de unos píxeles entre la imagen y el borde inferior. No es un margen ni un padding: `<img>` es un elemento **inline** y se coloca sobre la **línea base** de una línea de texto, como si fuera una letra. Debajo de la línea base, el navegador reserva el espacio de los «descendentes» (los rabos de la g, la j o la p). La solución corta es `display: block` en la imagen; la explicación completa llegará con el contexto de formato inline en el capítulo de CSS.

[[exercise:08-hueco-bajo-la-imagen.md]]

## Bestiario

- **El lector de pantalla lee el nombre del archivo.** Síntoma: «img-producto-3482 punto png, imagen». Causa: la imagen no tiene atributo `alt`. Solución: escribe un `alt` con la información que aporta, o `alt=""` si es decorativa. → [ver ejemplo](02-alt-que-falta.md)
- **El texto salta mientras carga la página.** Síntoma: estás leyendo y el párrafo baja de golpe. Causa: la imagen no tiene `width` y `height`, así que el navegador no reserva su hueco. Solución: declara sus dimensiones intrínsecas y usa `height: auto` en el CSS. → [ver ejemplo](03-width-y-height.md)
- **Hay unos píxeles de más debajo de la imagen.** Síntoma: un hueco entre la imagen y el borde de su contenedor. Causa: la imagen es inline y se alinea a la línea base, dejando el espacio de los descendentes. Solución: `display: block` o `vertical-align: middle` en la imagen. → [ver ejemplo](08-hueco-bajo-la-imagen.md)

## Resumen

- `<img>` es vacío y reemplazado; `src` y `alt` son imprescindibles.
- El `alt` transmite la información o la función de la imagen; vacío si es decorativa, nunca ausente.
- `width` y `height` con las dimensiones del archivo evitan los saltos de contenido (CLS).
- `loading="lazy"` para las imágenes que no se ven al cargar.
- `srcset` con `x` para tamaño fijo y densidades; con `w` + `sizes` para imágenes fluidas.
- `<picture>` para cambiar el encuadre o el formato; el `<img>` final es obligatorio y lleva el `alt`.
- `<figure>` + `<figcaption>` para contenido referenciable con pie.
- El hueco bajo las imágenes viene de la línea base: `display: block` lo elimina.

## Para profundizar

- [MDN: El elemento img](https://developer.mozilla.org/es/docs/Web/HTML/Element/img)
- [MDN: Imágenes adaptables](https://developer.mozilla.org/es/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [W3C WAI: árbol de decisión para el texto alternativo](https://www.w3.org/WAI/tutorials/images/decision-tree/)
- [web.dev: Cumulative Layout Shift](https://web.dev/articles/cls)
