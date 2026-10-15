# Fuentes

## Por qué importa

Casi todo lo que hay en una página es texto, y la fuente decide cómo se lee: su tono, su tamaño aparente, cuánto ocupa cada línea. Pero en la web no eliges una fuente: escribes una **lista de deseos**, y es el navegador de cada visitante quien decide con qué letra dibuja, según lo que tenga instalado y lo que consiga descargar. Por eso un diseño perfecto en tu Mac puede verse con Times en otro ordenador, y una fuente web mal declarada falla sin ningún mensaje de error.

Este módulo tiene cuatro lecciones: en esta verás cómo se eligen y se cargan las fuentes; en la siguiente, las propiedades que dan forma al texto (el interlineado, la alineación, las mayúsculas, los subrayados); después, dónde puede partirse una línea, y por último, los modos de escritura, que explican por qué tantas propiedades se llaman `inline` y `block`.

> Los ejemplos describen lo que ves en **Chrome para Mac**. Las fuentes del sistema cambian de un sistema operativo a otro: en Windows, Linux o un móvil, varias filas se verán distintas, y esa es justo la lección.

## `font-family`: una lista de deseos

`font-family` recibe una **pila** de fuentes separadas por comas. El navegador las recorre de izquierda a derecha y usa la primera que tiene, instalada en el sistema o descargada con `@font-face`:

```css
body {
  font-family: "Helvetica Neue", Arial, sans-serif;
}
```

La pila se consulta **letra a letra**: si la fuente elegida no tiene un carácter (una letra polaca, un emoji, un ideograma), el navegador lo busca en la siguiente, y después en las del sistema. Lo verás en el ejemplo de `@font-face`.

Al final de la pila va siempre una **familia genérica**, una palabra clave que el navegador traduce a una fuente que seguro existe:

| Genérica | Qué pide | En Chrome para Mac |
|---|---|---|
| `serif` | letra con remates | Times |
| `sans-serif` | letra sin remates | Helvetica |
| `monospace` | todas las letras del mismo ancho | Courier |
| `system-ui` | la fuente de la interfaz del sistema | San Francisco (Segoe UI en Windows) |
| `cursive`, `fantasy` | caligráfica, decorativa | varían tanto que casi nadie las usa |
| `emoji`, `math` | emojis en color, fórmulas matemáticas | Apple Color Emoji para `emoji` |

Las tres primeras se pueden cambiar en `chrome://settings/fonts`: son preferencias del usuario, no del sistema. Existen también `ui-serif`, `ui-sans-serif`, `ui-monospace` y `ui-rounded`, que dan las variantes de San Francisco y New York, pero solo las entiende Safari; Chrome las salta como a una fuente que no tiene, así que pueden ir al principio de una pila sin romper nada.

[[exercise:01-la-pila-de-fuentes.md]]

Dos reglas de escritura:

- Los nombres de fuente con espacios o símbolos van entre comillas (`"Helvetica Neue"`); los de una palabra pueden ir sin ellas (`Georgia`).
- Las genéricas **nunca** van entre comillas. `"sans-serif"` con comillas es el nombre de una fuente concreta que no existe.

[[exercise:02-genericas-entre-comillas.md]]

Una pila bien hecha va de lo particular a lo general: la fuente que quieres, una o dos alternativas parecidas que estén en los sistemas habituales y la genérica. La pila `system-ui, sans-serif` es la más rápida que existe (no descarga nada) y la que usan casi todos los ejemplos de este curso.

### `monospace` y los 13 píxeles

`code`, `kbd`, `samp` y `pre` reciben de la hoja del navegador `font-family: monospace`. Y aquí hay una herencia antigua: cuando la pila es **solo** la genérica `monospace` y el tamaño es el de por defecto, el navegador no usa 16px sino su «tamaño de fuente fija», 13px. Por eso el código de una página sin estilos se ve tan pequeño.

[[exercise:03-monospace-encoge.md]]

Basta con escribir una pila con cualquier otra fuente delante (`ui-monospace, Menlo, Consolas, monospace`) para que el código tenga el tamaño del texto que lo rodea. Si lo quieres algo más pequeño, dilo tú con `font-size: 0.9em`.

### Los controles de formulario

En la lección de herencia viste la otra excepción clásica: `input`, `button`, `select` y `textarea` no heredan la fuente, porque la hoja del navegador les da la suya. Cualquier reset incluye `button, input, select, textarea { font: inherit; }`; recuérdalo cada vez que cambies la fuente de la página.

### El atajo `font`

`font` agrupa en una declaración el estilo, el peso, el tamaño, el interlineado y la familia:

```css
.lead {
  font: italic 300 1.25rem/1.5 Literata, Georgia, serif;
  /*    estilo peso tamaño/interlineado familia */
}
```

Tiene dos exigencias y una trampa. El tamaño y la familia son obligatorios, en ese orden y al final. Y todo lo que no escribes vuelve a su valor inicial: `font: 1rem Georgia` pone `font-weight: normal`, `line-height: normal` y `font-style: normal` aunque una regla anterior dijera otra cosa. Úsalo para definir el texto base de una vez, o con `inherit`; para cambiar una sola cosa, la propiedad suelta.

## Fuentes propias: `@font-face`

Para usar una fuente que el visitante no tiene, la declaras con `@font-face` y le das un nombre; desde ese momento, ese nombre funciona en cualquier `font-family`:

```css
@font-face {
  font-family: "Literata";                               /* el nombre que usarás */
  src: url("fonts/literata-normal.woff2") format("woff2"); /* dónde está el archivo */
  font-weight: 200 900;                                  /* qué pesos cubre */
  font-style: normal;                                    /* qué estilo cubre */
  font-display: swap;                                    /* qué hacer mientras llega */
}
```

Lo que conviene saber de cada parte:

- **El nombre** lo eliges tú y no tiene por qué coincidir con el del archivo; lo que importa es que sea idéntico en `@font-face` y en `font-family`.
- **El formato**: hoy solo hace falta WOFF2, que entienden todos los navegadores y viene comprimido. `src` acepta varias fuentes separadas por comas, como una pila: `local("Literata"), url(…)` usa la instalada si existe.
- **Los descriptores** `font-weight` y `font-style` no aplican estilos: dicen qué cubre ese archivo. Una familia puede tener varios `@font-face` con el mismo nombre (uno para la cursiva, otro para la negrita), y el navegador elige el archivo según lo que pida cada texto.
- **La descarga es perezosa**: el archivo solo se pide cuando algún texto de la página necesita esa fuente. Declarar diez `@font-face` no cuesta nada si solo usas uno.

[[exercise:04-font-face.md]]

Las fuentes de este módulo vienen de Google Fonts y tienen licencia libre (SIL Open Font License); están en la carpeta `assets/fonts/` del tema, con su licencia al lado. Las puedes ver con el botón «Assets» de la galería. Una fuente comercial tiene una licencia que dice si puedes servirla desde tu web: la licencia de escritorio no basta.

### Subconjuntos y `unicode-range`

Los archivos de este módulo solo traen el alfabeto latino básico, como los que sirve Google Fonts por defecto. Google divide cada fuente en **subconjuntos** (`latin`, `latin-ext`, `cyrillic`, `greek`…) y declara cada uno con el descriptor `unicode-range`, que dice qué caracteres cubre:

```css
@font-face {
  font-family: "Literata";
  src: url("literata-latin-ext.woff2") format("woff2");
  unicode-range: U+0100-024F, U+1E00-1EFF;   /* Ł, ź, ő, ş… */
}
```

El navegador solo descarga el subconjunto `latin-ext` si la página contiene alguno de esos caracteres. Si no lo declaras, esas letras salen de la siguiente fuente de la pila, como la Ł de Łódź en el ejemplo anterior.

### La fuente que falla en silencio

Un `@font-face` con la ruta mal escrita, o un `font-family` que no coincide con el nombre declarado, no produce ningún error en la página: el navegador pasa a la siguiente fuente de la pila y sigue. Si la de reserva se parece, ni lo notas.

[[exercise:05-la-fuente-que-no-carga.md]]

La herramienta para cazarlo está en DevTools. Selecciona el texto en **Elements**, abre la pestaña **Computed** y baja hasta el final: la sección **Rendered Fonts** dice qué fuente ha dibujado de verdad ese texto, cuántas letras y de dónde viene (*Local file* o *Network resource*). Si ahí no aparece la fuente que pediste, mira la pestaña **Network** con el filtro **Font**: una petición en rojo es una ruta equivocada; ninguna petición, un nombre que no coincide.

## Mientras la fuente llega: `font-display`

Una fuente web es un archivo más, y tarda en llegar. Mientras tanto, el navegador tiene que decidir qué hace con el texto que la necesita: dejarlo invisible (*FOIT*, *flash of invisible text*) o dibujarlo con la fuente de reserva y cambiarla al llegar (*FOUT*, *flash of unstyled text*). El descriptor `font-display` elige:

| Valor | Texto invisible al principio | Si la fuente tarda más… |
|---|---|---|
| `block` | hasta unos 3 s | se usa la de reserva y se cambia cuando llegue |
| `swap` | nada (o casi) | se cambia cuando llegue, aunque sea mucho después |
| `fallback` | unos 100 ms | se cambia solo si llega en unos 3 s; si no, se queda la de reserva |
| `optional` | unos 100 ms | si no ha llegado ya, no se usa en esta visita (queda en caché para la próxima) |
| `auto` (inicial) | lo que decida el navegador; en Chrome, como `block` | |

`swap` es lo más habitual para el texto: se lee desde el primer momento. `optional` es lo más estable: la página nunca cambia de fuente delante del lector. `block` solo tiene sentido para fuentes de iconos, que sin su fuente mostrarían letras sin sentido.

En LearnWeb las fuentes llegan al instante, así que no verás el cambio. Para provocarlo, abre un ejemplo con ↗ y, en DevTools, pestaña **Network**: marca **Disable cache**, elige **3G** en el menú de velocidad (*throttling*) y recarga. Verás el texto con Georgia o con la fuente del sistema durante unos segundos, y el salto cuando llega la buena.

### El salto de la página

Con `swap`, el cambio de fuente tiene un coste: si la fuente web y la de reserva no miden lo mismo, el texto cambia de tamaño al llegar y todo lo que hay debajo se mueve. Es uno de los motivos más comunes del **CLS** (*Cumulative Layout Shift*), la métrica de Google que mide cuánto se mueve una página mientras carga.

[[exercise:06-el-salto-al-cargar.md]]

La solución es **ajustar la fuente de reserva** para que ocupe lo mismo que la fuente web. Se declara con `@font-face` una fuente instalada (`src: local("Georgia")`) con cuatro descriptores:

| Descriptor | Qué ajusta |
|---|---|
| `size-adjust` | escala las letras (el ancho y el alto) sin cambiar el `font-size` |
| `ascent-override` | cuánto sube la fuente sobre la línea base |
| `descent-override` | cuánto baja por debajo |
| `line-gap-override` | el espacio extra entre líneas que trae la fuente |

Los tres últimos deciden el `line-height: normal`, y por eso afectan a la altura de cada línea. Los valores salen de las medidas de los dos archivos y no se calculan a mano: herramientas como Fontaine, Capsize o el sistema de fuentes de Next.js los generan. Existe también `font-size-adjust` (Chrome 127), una propiedad que iguala la altura de la x de todas las fuentes de la pila; ayuda con la legibilidad de la reserva, pero no iguala los anchos.

Otra ayuda: `<link rel="preload" href="fonts/literata-normal.woff2" as="font" type="font/woff2" crossorigin>` en el `<head>` pide la fuente desde el principio, sin esperar a que el CSS diga que hace falta. Solo para las una o dos fuentes del texto principal.

## Fuentes variables

Una fuente clásica es una colección de archivos: uno para el regular, otro para la negrita, otro para la cursiva. Una **fuente variable** guarda en un solo archivo un diseño que se puede deformar a lo largo de unos **ejes**, y el navegador calcula cualquier punto intermedio: no solo 400 y 700, también 437.

Cinco ejes están **registrados** (sus etiquetas van en minúsculas) y se manejan con propiedades de siempre:

| Eje | Qué cambia | Propiedad |
|---|---|---|
| `wght` | el peso | `font-weight` (de 1 a 1000) |
| `wdth` | el ancho | `font-stretch` (en %) |
| `slnt` | la inclinación | `font-style: oblique 10deg` |
| `ital` | recta o cursiva | `font-style: italic` |
| `opsz` | el tamaño óptico | `font-optical-sizing: auto` (automático) |

En el `@font-face` de una fuente variable, los descriptores llevan **rangos**: `font-weight: 100 1000` le dice al navegador que este archivo cubre todos esos pesos.

[[exercise:07-fuentes-variables.md]]

El **tamaño óptico** merece una nota. Las imprentas fundían cada tamaño de letra por separado: los cuerpos pequeños con trazos más gruesos y más aire entre letras, para que se leyeran; los grandes, más finos y apretados, para que fueran elegantes. Con `opsz`, la misma fuente hace eso sola: `font-optical-sizing: auto`, el valor inicial, pone el eje al tamaño en píxeles de cada texto.

### Ejes propios y `font-variation-settings`

Las fuentes pueden tener ejes propios, con etiquetas en mayúsculas. Roboto Flex tiene `GRAD` (grado: engorda el trazo sin ensanchar las letras) y, en su versión completa, una docena más, como `XTRA` (el ancho del hueco interior de las letras); el archivo de este módulo solo trae `GRAD`. Para estos ejes existe una propiedad de bajo nivel:

```css
h3 {
  font-variation-settings: "GRAD" 150;
}
```

Tiene dos comportamientos que sorprenden: **gana** a `font-weight` y a `font-stretch` (se aplica después de todo), y es **una sola propiedad** con una lista dentro, así que si un hijo declara la suya, la del padre se pierde entera.

[[exercise:08-font-variation-settings.md]]

La regla práctica: los ejes registrados, siempre con su propiedad; `font-variation-settings`, solo para los ejes propios. Si necesitas combinar varios ejes propios en distintos niveles, usa una custom property por eje: `font-variation-settings: "GRAD" var(--grad, 0), "XTRA" var(--xtra, 468)`.

## Estilos que la fuente no tiene

Cuando un texto pide un peso o un estilo, el navegador busca entre las caras de la familia la más cercana. Si pides 600 y solo hay 400 y 700, usa 700 (para pesos por encima de 500 busca primero hacia arriba). Pero si pides negrita y lo único que hay es una cara fina, o cursiva y solo hay recta, el navegador hace algo más drástico: la **sintetiza**. Engorda los trazos de la cara fina para fingir una negrita, o inclina las letras rectas para fingir una cursiva.

El problema es que los elementos más comunes piden esos estilos sin que escribas nada: `h1`-`h6`, `strong`, `b` y `th` llevan `font-weight: bold` en la hoja del navegador; `em`, `i`, `cite` y `address`, `font-style: italic`.

[[exercise:09-negrita-sintetica.md]]

Una negrita sintética emborrona las curvas y cierra los huecos de las letras. Una cursiva sintética es peor de detectar, porque parece correcta: es la letra recta torcida, y una cursiva de verdad es otro dibujo.

[[exercise:10-cursiva-sintetica.md]]

Dos remedios, según el caso:

- Carga las caras que usa tu texto: si el contenido tiene `em`, la cursiva; si tiene `strong`, la negrita (o una fuente variable que cubra el peso). Y si una fuente solo tiene un peso, como las de los logotipos, pon `font-weight: 400` a los títulos que la usan.
- `font-synthesis: none` prohíbe al navegador inventar negritas, cursivas y versalitas. Tiene versiones por separado: `font-synthesis-weight`, `font-synthesis-style` y `font-synthesis-small-caps`. Es una red de seguridad para fuentes de marca, no un arreglo: un `em` sin cursiva pierde el énfasis.

## Cómo verlo en DevTools

- **Qué fuente dibuja.** **Elements** → **Computed** → **Rendered Fonts**, al final de la lista: el nombre real de la fuente, cuántos caracteres ha dibujado y si es local o descargada. Un texto con dos entradas está mezclando fuentes letra a letra.
- **Qué se ha descargado.** **Network** → filtro **Font**: cada archivo, su tamaño y cuándo llegó. Con **Disable cache** y una velocidad lenta verás el `font-display` en acción.
- **Jugar con los ejes.** En **Elements** → **Styles**, cambia el valor de `font-weight` o `font-stretch` con las flechas del teclado (con <kbd>Shift</kbd>, de 10 en 10): en una fuente variable, el texto cambia de grosor o de ancho en cada pulsación.

## Bestiario

- **La página sale con Times.** Síntoma: el texto aparece con una letra con remates que nadie pidió. Causa: una genérica entre comillas (`"sans-serif"`) o una pila sin genérica al final, con una fuente que el visitante no tiene. Solución: genéricas sin comillas y siempre al final de la pila. → [ver ejemplo](02-genericas-entre-comillas.md)
- **El código se ve más pequeño que el texto.** Síntoma: `code` y `pre` miden 13px en un párrafo de 16px. Causa: con la genérica `monospace` sola, el navegador usa su tamaño de fuente fija. Solución: una pila con otra fuente delante (`Menlo, Consolas, monospace`). → [ver ejemplo](03-monospace-encoge.md)
- **La fuente web no aparece.** Síntoma: el texto sale con la fuente de reserva y no hay ningún error en la página. Causa: la ruta del `src` está mal (404 en **Network**) o el nombre de `font-family` no coincide con el de `@font-face`. Solución: compruébalo en **Rendered Fonts** y en **Network**, filtro **Font**. → [ver ejemplo](05-la-fuente-que-no-carga.md)
- **El `strong` no engorda en una fuente variable.** Síntoma: la negrita no se ve, o un título pierde el ancho que tenía su tarjeta. Causa: `font-variation-settings` gana a `font-weight` y a `font-stretch`, se hereda y se sustituye entera. Solución: los ejes registrados con su propiedad; `font-variation-settings` solo para ejes propios. → [ver ejemplo](08-font-variation-settings.md)
- **Los títulos con la fuente del logotipo se ven emborronados.** Síntoma: letras engordadas, huecos cerrados. Causa: la fuente solo tiene peso 400 y `h1` o `strong` piden negrita, así que el navegador la sintetiza. Solución: `font-weight: 400` en esos elementos, o `font-synthesis: none`. → [ver ejemplo](09-negrita-sintetica.md)
- **La cursiva parece la letra recta torcida.** Síntoma: `em` y `cite` salen inclinados, pero con las mismas formas que el texto. Causa: no hay `@font-face` para `font-style: italic` y el navegador la falsifica. Solución: declara el archivo de la cursiva con el mismo nombre de familia. → [ver ejemplo](10-cursiva-sintetica.md)

## Resumen

- `font-family` es una pila que el navegador recorre hasta encontrar una fuente que tiene, letra a letra; termina siempre con una genérica sin comillas.
- Las fuentes del sistema dependen del sistema operativo (y algunas genéricas, del navegador): `system-ui` es San Francisco en un Mac y Segoe UI en Windows.
- `@font-face` declara una fuente con un nombre, un `src` en WOFF2 y los pesos y estilos que cubre; el archivo solo se descarga si algún texto lo necesita.
- `font-display: swap` muestra el texto desde el principio con la fuente de reserva; para que el cambio no mueva la página, ajusta la reserva con `size-adjust` y `*-override`.
- Las fuentes variables se manejan con `font-weight`, `font-stretch`, `font-style` y `font-optical-sizing`; `font-variation-settings` es solo para ejes propios.
- Si una familia no tiene negrita o cursiva, el navegador las inventa: carga las caras que usas o pon `font-synthesis: none`.
- **Rendered Fonts**, en la pestaña **Computed**, dice qué fuente dibuja de verdad cada texto.

## Para profundizar

- [MDN: font-family](https://developer.mozilla.org/es/docs/Web/CSS/font-family)
- [web.dev: Best practices for fonts](https://web.dev/articles/font-best-practices)
- [MDN: Variable fonts guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_fonts/Variable_fonts_guide)
- [Chrome for Developers: Improved font fallbacks](https://developer.chrome.com/blog/font-fallbacks)
- [Especificación: CSS Fonts Level 4](https://www.w3.org/TR/css-fonts-4/)
