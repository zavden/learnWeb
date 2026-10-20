# Listas

## Por qué importa

Las listas están por todas partes en la web, aunque no siempre lo parezcan: los ingredientes de una receta y sus pasos, sí, pero también el menú de navegación, los resultados de una búsqueda, las tarjetas de una tienda o los comentarios de un artículo. Marcar algo como lista le dice al navegador «estas cosas van juntas y son tantas». Un lector de pantalla lo anuncia («lista, 4 elementos»), permite saltar de elemento en elemento o saltarse la lista entera, y avisa al entrar en una sublista.

HTML tiene tres listas, y elegir bien es fácil si te haces la pregunta correcta. La trampa está en la estructura: dentro de una lista no puede ir cualquier cosa, y el parser, que tantas cosas repara, aquí no repara nada.

## Listas sin orden y con orden: `ul`, `ol` y `li`

- `<ul>` (*unordered list*): una lista en la que el **orden no importa**. El navegador dibuja una viñeta delante de cada elemento.
- `<ol>` (*ordered list*): una lista en la que el **orden sí importa**: pasos, clasificaciones, instrucciones. El navegador numera los elementos.
- `<li>` (*list item*): cada elemento de la lista, en las dos.

La pregunta para elegir: **si cambio el orden de los elementos, ¿cambia el significado?** Los ingredientes de una receta se pueden comprar en cualquier orden (`<ul>`); sus pasos, no (`<ol>`).

```html
<ul>
  <li>Huevos</li>
  <li>Patatas</li>
</ul>
```

Ni las viñetas ni los números forman parte del texto: los dibuja el navegador. Lo que hace que un `<li>` tenga marcador es una propiedad de CSS que le pone la hoja de estilos del navegador, `display: list-item`, que genera una caja extra para el marcador (el pseudoelemento `::marker`, que verás en CSS). Por eso, si mueves un paso de sitio, la numeración se rehace sola; y por eso, al copiar el texto de una lista, a veces los números no se copian.

[[exercise:01-ul-y-ol.md]]

```text
texto del primer paso → Pela las patatas y la cebolla y córtalas en láminas finas.
display de un li      → list-item
pasos de la receta    → 4
```

La hoja de estilos del navegador también da a las listas un margen de `1em` arriba y abajo y un relleno de `40px` a la izquierda, que es el hueco donde se dibujan los marcadores. Lo verás en el panel **Computed** de DevTools si seleccionas un `<ul>`.

## Numeración: `start`, `reversed`, `type` y `value`

Una `<ol>` cuenta 1, 2, 3… salvo que le digas otra cosa:

| Atributo | En | Qué hace | Ejemplo |
|---|---|---|---|
| `start` | `<ol>` | número del primer elemento | `<ol start="3">` → 3, 4, 5… |
| `reversed` | `<ol>` | cuenta hacia atrás (booleano) | `<ol reversed>` con tres elementos → 3, 2, 1 |
| `type` | `<ol>` | tipo de numeración: `1`, `a`, `A`, `i`, `I` | `<ol type="a">` → a, b, c… |
| `value` | `<li>` | número de **ese** elemento; los siguientes siguen desde él | `<li value="10">` → 10, 11, 12… |

`start` sirve para seguir contando cuando una lista se interrumpe (por un aviso, una imagen, un anuncio). `reversed` es para las cuentas atrás («los diez discos del año», del 10 al 1). `type` cambia solo el aspecto de los números, así que úsalo cuando la numeración forma parte del contenido: en unas condiciones legales alguien citará «el apartado b», y ese «b» tiene que estar ahí aunque falle el CSS. Si solo quieres otro estilo de número, eso es CSS (`list-style-type`).

[[exercise:02-start-reversed-type.md]]

Fíjate en la clasificación del final: con `value` se pueden representar empates (dos segundos puestos, y el siguiente es el cuarto) sin escribir los números a mano.

> **Desde Python:** `start` es el equivalente de `enumerate(pasos, start=3)`, y `reversed` el de recorrer con `reversed(...)`, con una diferencia: en HTML el contenido no se reordena, solo cambian los números. Una `<ol reversed>` sigue mostrando su primer `<li>` arriba, con el número más alto.

## Listas anidadas

Un `<li>` puede contener cualquier cosa: párrafos, imágenes, enlaces… y otras listas. Una **sublista** va **dentro** del `<li>` al que pertenece, después de su texto y antes de su `</li>`:

```html
<ul>
  <li>Ropa
    <ul>
      <li>Forro polar</li>
      <li>Chubasquero</li>
    </ul>
  </li>
  <li>Comida</li>
</ul>
```

El navegador sangra cada nivel y cambia la viñeta de las `<ul>`: disco en el primer nivel, círculo en el segundo, cuadrado del tercero en adelante. Se pueden mezclar tipos: pasos numerados (`<ol>`) con detalles sin orden (`<ul>`) dentro de un paso.

[[exercise:03-listas-anidadas.md]]

```text
padre de la sublista → li
texto de ese padre   → Ropa
```

Un lector de pantalla anuncia el anidamiento (por ejemplo, «lista, 3 elementos, nivel 2»), así que la estructura importa aunque se vea igual. Y aquí empiezan los problemas.

## La regla: dentro de `ul` y `ol`, solo `li`

El modelo de contenido de `<ul>` y `<ol>` es estricto: sus hijos directos solo pueden ser `<li>` (y los elementos que no se ven, como `<script>` y `<template>`). Lo que va *dentro* de cada `<li>` es libre.

En la lección del parser viste que el navegador repara muchas cosas: cierra un `<p>` que contiene un `<div>`, saca de una tabla lo que no es de la tabla. **Con las listas no hace nada.** Si metes un `<p>`, un `<h3>` o texto suelto directamente en una `<ul>`, el parser lo deja ahí. El resultado es una lista con cosas que no son elementos de la lista: salen sin viñeta, con la sangría de la lista, y no cuentan.

[[exercise:04-hijos-de-ul.md]]

```text
#broken  → hijos: li, p, li | elementos de lista: 2
#fixed   → hijos: li, li, li | elementos de lista: 3
```

En pantalla, `#broken` muestra cuatro líneas; un lector de pantalla anunciaría «lista, 2 elementos», y el párrafo y el texto suelto quedan en tierra de nadie. Fíjate también en que «Domingos: cerrado» ni siquiera aparece entre los hijos: un texto suelto no es un elemento, es un nodo de texto.

La versión más frecuente de este error es la sublista escrita **entre** dos `<li>`, como hermana, en lugar de dentro del `<li>` al que pertenece. Es especialmente traicionera porque en pantalla se ve igual: la hoja del navegador sangra y pone círculos a cualquier `<ul>` que esté dentro de otra, sea cual sea su padre.

[[exercise:05-sublista-fuera-del-li.md]]

```text
#broken  → hijos: li, ul, li | ¿«Ropa» contiene su sublista? false
#fixed   → hijos: li, li | ¿«Ropa» contiene su sublista? true
```

En `#broken`, «Ropa» es un elemento sin nada dentro, y la sublista flota entre «Ropa» y «Comida» sin pertenecer a ninguno. Si mañana le das estilo con CSS a cada `<li>` (un borde, una tarjeta), la sublista quedará fuera de la tarjeta de «Ropa».

El validador del W3C ([validator.w3.org](https://validator.w3.org/)) detecta ambos errores. Merece la pena pasarle tus páginas de vez en cuando: el navegador nunca te avisará.

## Listas de descripción: `dl`, `dt` y `dd`

La tercera lista no es de elementos sueltos, sino de **parejas**: un término y su descripción.

- `<dl>` (*description list*): la lista.
- `<dt>` (*description term*): el término, el nombre, la pregunta.
- `<dd>` (*description details*): la descripción, el valor, la respuesta.

Se usa para glosarios, fichas técnicas («Peso: 1,2 kg»), metadatos («Autor», «Publicado», «Categoría»), horarios, preguntas frecuentes… Un término puede tener varias descripciones (varios colores de un producto) y varios términos pueden compartir una (sinónimos). Cada pareja puede ir envuelta en un `<div>`, lo único que admite un `<dl>` además de `<dt>` y `<dd>`; es útil para darle estilo con CSS.

[[exercise:06-listas-de-descripcion.md]]

El navegador dibuja los `<dd>` con un margen a la izquierda de `40px`, y nada más: sin viñetas ni números. En HTML 4 se llamaba «lista de definiciones», y por eso muchos creen que solo sirve para glosarios; desde HTML5 es cualquier lista de parejas nombre → valor.

> **Desde Python:** un `<dl>` es un diccionario escrito en HTML. `{"Peso": "1,2 kg", "Colores": ["Negro", "Rojo"]}` se escribe con un `<dt>` por clave y uno o varios `<dd>` por valor.

## ¿Qué lista uso?

| Pregunta | Lista |
|---|---|
| ¿Si cambio el orden, cambia el significado? | `<ol>` |
| ¿Son elementos del mismo tipo y el orden da igual? | `<ul>` |
| ¿Son parejas nombre → valor? | `<dl>` |
| ¿Son dos o tres cosas cortas dentro de una frase? | ninguna: escríbelo en el párrafo («huevos, patatas y cebolla») |

Una misma página puede necesitar las tres. Esta receta tiene una ficha de datos (`<dl>`), unos ingredientes (`<ul>`) y unos pasos (`<ol>`):

[[exercise:07-cada-lista-en-su-sitio.md]]

Muchas cosas que no parecen listas lo son. Un menú de navegación es una `<ul>` de enlaces dentro de un `<nav>` (lo verás en la lección de estructura semántica); unos resultados de búsqueda ordenados por relevancia, una `<ol>`; un hilo de comentarios con respuestas, listas anidadas. En todos esos casos el CSS les quitará las viñetas y cambiará su disposición, pero el lector de pantalla seguirá diciendo cuántos son.

Un aviso para cuando llegues a CSS: Safari, con VoiceOver, puede dejar de anunciar como lista una `<ul>` a la que le quitas las viñetas con `list-style: none`. Es una decisión deliberada de WebKit (muchas webs usan listas para maquetar) y tiene solución, que verás en su momento.

## Bestiario

**🐛 Un elemento de la lista sale sin viñeta y mal alineado.**
- *Síntoma:* dentro de una lista aparece texto o un párrafo sin marcador, con la sangría de la lista; el lector de pantalla anuncia menos elementos de los que se ven.
- *Causa:* dentro de `<ul>` y `<ol>` solo pueden ir `<li>`; el parser no repara este error, deja el contenido donde lo escribiste.
- *Solución:* mete cada elemento en su `<li>` y saca de la lista lo que no sea un elemento (títulos, avisos). → [ver ejemplo](04-hijos-de-ul.md)

**🐛 La sublista no pertenece al elemento que tiene encima.**
- *Síntoma:* se ve bien, pero el CSS de cada `<li>` no alcanza a la sublista, y un lector de pantalla no la relaciona con su elemento.
- *Causa:* la sublista se escribió entre dos `<li>` (como hija del `<ul>`) en lugar de dentro del `<li>`.
- *Solución:* mueve la sublista dentro del `<li>`, antes de su `</li>`. → [ver ejemplo](05-sublista-fuera-del-li.md)

## Resumen

- `<ul>` si el orden no importa, `<ol>` si importa; cada elemento es un `<li>`.
- Viñetas y números los dibuja el navegador (`display: list-item`); no forman parte del texto.
- `<ol>` admite `start`, `reversed` y `type`; `<li value>` fija el número de un elemento.
- Una sublista va **dentro** del `<li>` al que pertenece.
- Los hijos directos de `<ul>` y `<ol>` solo pueden ser `<li>`; el parser no corrige este error y el resultado se ve raro y se anuncia mal.
- `<dl>` con `<dt>` y `<dd>` es una lista de parejas nombre → valor (glosarios, fichas, metadatos), como un diccionario.
- Menús, resultados y comentarios también son listas: el CSS cambia su aspecto, no su significado.

## Para profundizar

- [MDN — `<ul>`: la lista desordenada](https://developer.mozilla.org/es/docs/Web/HTML/Element/ul)
- [MDN — `<ol>`: la lista ordenada (con `start`, `reversed` y `type`)](https://developer.mozilla.org/es/docs/Web/HTML/Element/ol)
- [MDN — `<dl>`: la lista de descripción](https://developer.mozilla.org/es/docs/Web/HTML/Element/dl)
- [WHATWG — Grouping content: modelo de contenido de cada lista](https://html.spec.whatwg.org/multipage/grouping-content.html#the-ul-element)
