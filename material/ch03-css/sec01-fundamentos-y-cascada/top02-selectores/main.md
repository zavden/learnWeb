# Selectores

## Por qué importa

Toda regla empieza por un selector, y el selector decide **a qué elementos** se aplica. Si no coincide con el elemento que tienes en mente, da igual lo bien escritas que estén las declaraciones: no pasará nada y no habrá ningún aviso. Saber leer un selector con exactitud, como lo lee el navegador, evita la mayoría de los «mi estilo no se aplica».

## Qué es un selector para el navegador

Un selector es una **condición** que se evalúa sobre cada elemento del DOM. Cuando el navegador calcula los estilos de un elemento, recorre las reglas y se queda con aquellas cuyo selector es verdadero para ese elemento.

La parte de más a la derecha es el **sujeto**: el elemento que recibe los estilos. Todo lo que hay a su izquierda son condiciones sobre su entorno (antepasados, hermanos). Por eso conviene leer los selectores **de derecha a izquierda**:

```text
.article > p    →  «un p… cuyo padre es .article»
nav ul a        →  «un a… que tiene un ul por encima… que tiene un nav por encima»
```

Los navegadores también los evalúan así: empiezan por el sujeto y suben por el árbol comprobando el resto.

> **Desde Python:** piensa en un selector como un predicado. Aplicar una regla es como filtrar una lista por comprensión: `[el for el in dom if el.tag == "p" and "warning" in el.classes]` es lo que expresa `p.warning`. En JavaScript, `document.querySelectorAll("p.warning")` hace exactamente ese filtro (lo verás en el capítulo del DOM).

## Selectores simples: tipo, clase, id y universal

| Selector | Nombre | Coincide con |
|---|---|---|
| `p` | de tipo | todos los elementos `<p>` |
| `.warning` | de clase | todo elemento cuyo atributo `class` contiene la palabra `warning` |
| `#page-title` | de id | el elemento con `id="page-title"` |
| `*` | universal | todos los elementos |

Detalles que importan:

- El atributo `class` es una **lista de palabras** separadas por espacios: `class="card featured"` tiene dos clases y su orden da igual. `.card` coincide con él, y `.featured` también.
- Un `id` debe ser único en la página. Para dar estilos se prefieren las clases (se reutilizan y, como verás en la lección de especificidad, pesan mucho menos); los id se reservan para anclas `#`, `label for` y JavaScript.
- Nombra las clases por **lo que es** el elemento (`.warning`, `.price`), no por cómo se ve (`.red-text`): el aspecto cambia, el significado no.

Cada selector de este ejemplo toca una propiedad distinta, así que puedes ver a la vez todos los que coinciden con cada elemento:

[[exercise:01-tipo-clase-e-id.md]]

El universal, `*`, rara vez se usa solo para diseñar, pero es una herramienta de depuración estupenda: un contorno en cada elemento revela todas las cajas de la página.

[[exercise:02-selector-universal.md]]

## Selectores de atributo

Seleccionan elementos según sus atributos, con o sin mirar su valor. Supón el enlace `<a href="https://example.com/informe.pdf" lang="es-ES">`:

| Selector | Coincide si el atributo… | ¿Coincide? |
|---|---|---|
| `[href]` | existe, con cualquier valor (incluso vacío) | ✅ |
| `[href="https://example.com"]` | vale **exactamente** eso | ❌ |
| `[href^="https"]` | **empieza** por eso | ✅ |
| `[href$=".pdf"]` | **termina** en eso | ✅ |
| `[href*="example"]` | **contiene** eso en cualquier parte | ✅ |
| `[href~="informe"]` | contiene esa **palabra** en una lista separada por espacios | ❌ (no hay espacios) |
| `[lang\|="es"]` | es `es` o **empieza** por `es-` | ✅ |
| `[href$=".PDF" i]` | como sin la `i`, pero sin distinguir mayúsculas | ✅ |

Se combinan con otros selectores para afinar: `a[href$=".pdf"]`, `input[type="email"]`, `button[disabled]`. Las comillas del valor son opcionales si es una sola palabra, pero ponlas siempre.

[[exercise:03-atributo-presencia-y-valor.md]]

Los tres operadores de subcadenas (`^=`, `$=`, `*=`) son los más usados, sobre todo con `href` y `src`:

[[exercise:04-atributo-subcadenas.md]]

`~=` y `|=` parecen raros, pero responden a formatos concretos: `~=` a listas de palabras (así funciona `class` por dentro: `.card` equivale a `[class~="card"]`) y `|=` a códigos de idioma como `es-MX`. Fíjate en la diferencia entre `~=` y `*=`, y en por qué el ejemplo escribe `p[lang|="es"]` y no `[lang|="es"]` a secas (pista: la página entera es `<html lang="es">`):

[[exercise:05-atributo-palabras-e-idiomas.md]]

## Selectores compuestos y listas

Los selectores simples se pueden **pegar** (sin espacios) para exigir varias condiciones al mismo elemento. Es un «y» lógico:

```css
p.warning { }                 /* un p que además tiene la clase warning */
a.btn.primary { }             /* un a con las clases btn Y primary */
input[type="email"]:focus { } /* un input de tipo email con el foco (:focus, próxima lección) */
```

Si hay un selector de tipo, va el primero: `p.warning` es válido; `.warningp` sería otra clase, «warningp».

Una **lista** separa selectores con comas y es un «o» lógico: la regla se aplica a los elementos que coinciden con cualquiera de ellos. Cada selector de la lista se evalúa por separado.

[[exercise:06-listas-de-selectores.md]]

## Combinadores

Un combinador une dos selectores e impone una relación en el árbol entre los elementos que seleccionan:

| Combinador | Sintaxis | Significa |
|---|---|---|
| descendiente | `A B` (un espacio) | B está dentro de A, a cualquier profundidad |
| hijo | `A > B` | el padre directo de B es A |
| hermano adyacente | `A + B` | B va **justo** después de A, con el mismo padre |
| hermanos siguientes | `A ~ B` | B va después de A (no necesariamente justo), con el mismo padre |

En un árbol se ve mejor:

```text
section.article
├── p            ← .article p ✅    .article > p ✅
├── blockquote
│   └── p        ← .article p ✅    .article > p ❌  (su padre es blockquote)
└── p            ← .article p ✅    .article > p ✅
```

[[exercise:07-descendiente-e-hijo.md]]

Los combinadores de hermanos solo miran **hacia delante** y **en el mismo nivel**:

```text
body
├── p      ← antes del h2: ni + ni ~
├── h2
├── p      ← h2 + p ✅   h2 ~ p ✅
├── p      ← h2 + p ❌   h2 ~ p ✅
├── div
└── p      ← h2 + p ❌   h2 ~ p ✅
```

[[exercise:08-hermanos-adyacente-y-general.md]]

No existe un combinador de «padre» ni de «hermano anterior»: durante años fue imposible seleccionar un elemento según lo que viene después o lo que contiene. La pseudoclase `:has()`, que verás en la próxima lección, cubre ese hueco.

## El espacio y las mayúsculas cuentan

Un espacio dentro de un selector **es** un combinador. `.card.featured` y `.card .featured` se diferencian en un solo carácter y seleccionan cosas completamente distintas:

[[exercise:09-espacio-en-el-selector.md]]

Y las mayúsculas también importan, pero no en todas partes:

| Parte del selector | ¿Distingue mayúsculas? |
|---|---|
| Nombre de etiqueta (`p`, `P`) | no, en documentos HTML |
| Clase e id (`.warning`, `#main-title`) | **sí** |
| Valor de atributo (`[data-state="open"]`) | **sí**, salvo con `i` y salvo algunos atributos de HTML como `type` o `lang` |
| Nombre de atributo (`[DATA-STATE]`) | no, en documentos HTML |

[[exercise:10-mayusculas-en-selectores.md]]

> Otra rareza del modo quirks (página sin `<!DOCTYPE html>`): ahí las clases y los id **no** distinguen mayúsculas. Si tu CSS funciona en una página antigua y deja de funcionar al añadir el DOCTYPE, sospecha de esto.

## Bestiario

- **`.card .featured` no selecciona la tarjeta destacada.** *Síntoma:* un elemento con `class="card featured"` no recibe el estilo; a veces lo recibe un hijo inesperado. *Causa:* el espacio es el combinador descendiente: el selector busca un `.featured` **dentro** de un `.card`. *Solución:* sin espacio, `.card.featured`, para exigir las dos clases al mismo elemento. [Ver ejemplo](09-espacio-en-el-selector.md).
- **La clase está bien escrita… salvo una mayúscula.** *Síntoma:* una regla con `.Warning`, `#Main-Title` o `[data-state="Open"]` no se aplica. *Causa:* clases, id y valores de atributo distinguen mayúsculas. *Solución:* copia los nombres tal cual del HTML y adopta una convención (minúsculas con guiones); para valores de atributo que no controlas, usa el indicador `i`. [Ver ejemplo](10-mayusculas-en-selectores.md).

## Resumen

- Un selector es una condición sobre cada elemento; el de más a la derecha es el **sujeto** que recibe los estilos. Léelos de derecha a izquierda.
- Simples: tipo (`p`), clase (`.x`), id (`#x`), universal (`*`) y atributo (`[a]`, `[a="v"]`, `^=`, `$=`, `*=`, `~=`, `|=`, indicador `i`).
- Pegados forman un selector **compuesto** («y»); separados por comas forman una **lista** («o»).
- Combinadores: espacio (descendiente), `>` (hijo), `+` (siguiente hermano), `~` (hermanos siguientes). Solo miran hacia abajo y hacia delante.
- Un espacio cambia el significado: `.a.b` ≠ `.a .b`.
- Clases, id y valores de atributo distinguen mayúsculas; las etiquetas no.

## Para profundizar

- [MDN: CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors)
- [MDN: Attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors)
- [web.dev: Selectors](https://web.dev/learn/css/selectors)
- [Selectors Level 4 (especificación)](https://www.w3.org/TR/selectors-4/)
