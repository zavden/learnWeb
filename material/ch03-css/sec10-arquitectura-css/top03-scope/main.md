# Ámbitos con @scope

## Por qué importa

BEM evita que los nombres choquen con una convención: cada clase lleva el nombre de su componente, y `.recipe-card__title` nunca se confundirá con el título de otro sitio. Funciona, pero a base de nombres largos y de disciplina. La at-rule **`@scope`** resuelve el mismo problema desde el propio lenguaje: unas reglas que **solo se aplican dentro de un elemento**, que pueden **detenerse** antes de llegar a ciertas partes de su interior y que, cuando dos ámbitos se solapan, dejan ganar al **más cercano**.

Es una pieza reciente, pensada para los casos que BEM resuelve mal: el contenido que viene de fuera (el texto de un artículo, un comentario, el componente de otro equipo) y los temas anidados (un panel claro dentro de uno oscuro dentro de uno claro).

`@scope` funciona en Chrome desde la versión 118 (2023) y en Safari desde la 17.4. Si tu proyecto debe funcionar en todos los navegadores, comprueba su soporte en caniuse.com antes de depender de él.

## La raíz del ámbito

```css
@scope (.recipe-card) {
  :scope { background: #fff7ed; }   /* la propia tarjeta */
  h3 { color: #9a3412; }            /* solo los h3 de dentro de una .recipe-card */
}
```

El selector entre paréntesis elige la **raíz del ámbito**. Las reglas de dentro solo seleccionan elementos de su interior, y `:scope` es la propia raíz. Un `h3` dentro del ámbito funciona como `:scope h3`, pero con una diferencia importante: **la raíz no suma especificidad**. Ese `h3` pesa (0,0,1), como si no hubiera ámbito:

| Escribes | Selecciona | Especificidad |
|---|---|---|
| `@scope (.recipe-card) { h3 {} }` | los `h3` dentro de la tarjeta | (0,0,1) |
| `@scope (.recipe-card) { :scope h3 {} }` | lo mismo | (0,1,1): `:scope` es una pseudoclase |
| `.recipe-card { h3 {} }` (anidamiento) | lo mismo | (0,1,1) |
| `.recipe-card__title {}` (BEM) | el elemento con esa clase | (0,1,0) |

[[exercise:01-la-raiz-del-ambito.md]]

La ficha de la autora tiene sus propios `h3`, `p` y `li`, y no se entera de nada. Y la nota azul demuestra lo de la especificidad: la clase `.note` (0,1,0) le gana al `p` del ámbito (0,0,1). Un ámbito limita **dónde** se aplica una regla, no **cuánto pesa**.

## Ámbitos con agujero: `to (…)`

Después de la raíz puedes poner un **límite**: `@scope (raíz) to (límite)`. Las reglas valen dentro de la raíz, pero no en el límite ni en nada de lo que contiene. Por la forma que dibuja, se le llama *donut scope*, un ámbito con agujero:

```text
article.post-card              ← raíz: dentro
├── p.post-card__meta > a      ← dentro
├── h3                         ← dentro
├── div.post-card__body        ← límite: FUERA
│   └── p > a, a               ← fuera
└── a «Leer completo»          ← dentro
```

[[exercise:02-ambito-con-agujero.md]]

Es justo lo que necesita un componente que envuelve contenido ajeno: la tarjeta da estilo a sus enlaces (la autora, «Leer completo») sin tocar los del texto que escribió la usuaria. Sin `@scope`, habría que enumerar los enlaces propios uno a uno o excluir los demás con `:not()`.

## La proximidad

`@scope` añade un criterio nuevo a la cascada. Recuerda el orden de la lección de cascada; la **proximidad** entra justo después de la especificidad:

| # | Criterio |
|---|---|
| 1 | origen e importancia |
| 2 | contexto (Shadow DOM) |
| 3 | estilos en línea |
| 4 | capas |
| 5 | especificidad |
| 6 | **proximidad del ámbito**: gana la regla cuya raíz está a menos generaciones del elemento |
| 7 | orden de aparición |

El caso clásico son los temas anidados. Con clases (`.light a`, `.dark a`), un enlace dentro de un panel claro que está dentro de uno oscuro coincide con las dos reglas, que pesan lo mismo, y gana la que esté más abajo en el archivo. Con `@scope`, gana el panel más cercano:

[[exercise:03-proximidad.md]]

> **Desde Python:** la proximidad recuerda a cómo Python busca un nombre en funciones anidadas: primero en el ámbito más interior, luego en el que lo contiene, y así hacia fuera. La diferencia es que en CSS la proximidad solo desempata: antes se han comparado las capas y la especificidad.

Las reglas sin ámbito cuentan como si su raíz estuviera infinitamente lejos: a igual especificidad, una regla con ámbito les gana, vaya donde vaya en el archivo.

## La especificidad va primero

Como la proximidad es el criterio 6, solo cuenta cuando la especificidad empata. Si un ámbito escribe `:scope a` (0,1,1) y otro solo `a` (0,0,1), el primero gana en todo su interior, aunque esté más lejos:

[[exercise:04-especificidad-antes-que-proximidad.md]]

La regla práctica: dentro de los ámbitos que pueden solaparse, selectores del mismo peso. `:scope` solo cuando de verdad te refieres a la raíz (`:scope { … }`, `:scope > h3`).

## La herencia no tiene límites

El límite de un ámbito decide qué elementos pueden **seleccionar** sus reglas. No detiene la **herencia**: si la raíz pone `color: white`, todo su interior lo hereda, también el agujero, salvo que el agujero declare su propio color. Un recuadro claro dentro de un banner oscuro se queda con letra blanca sobre fondo claro:

[[exercise:05-la-herencia-cruza-el-limite.md]]

Es la misma herencia de siempre (lección de herencia del módulo de fundamentos): `color`, `font-*`, `line-height`, `text-align`, `visibility` y las custom properties pasan de padre a hijo. El agujero de un ámbito debe declarar las que no quiera recibir.

## `@scope` dentro de un `<style>`

Si `@scope` no lleva selector, la raíz es **el elemento padre del `<style>`** que lo contiene. Así, un fragmento de HTML puede traer sus estilos consigo, sin inventar ninguna clase:

```html
<section>
  <style>
    @scope {
      :scope { background: #ecfeff; }
      h3 { color: #155e75; }
    }
  </style>
  <h3>Horario</h3>
</section>
```

[[exercise:06-scope-en-un-style.md]]

Es útil cuando el HTML lo genera un sistema de plantillas o un gestor de contenidos, componente a componente. El precio: cada copia del componente repite su `<style>`. Para un componente que aparece cien veces en la página, una regla en la hoja de estilos sigue siendo mejor.

## `@scope`, anidamiento y BEM

Las tres herramientas se parecen en la superficie (todas agrupan los estilos de un componente) pero resuelven cosas distintas, y se combinan:

| | Anidamiento | BEM | `@scope` |
|---|---|---|---|
| Qué hace | agrupa reglas en el código | da nombres que no chocan | limita dónde se aplican las reglas |
| Especificidad | suma la del selector de fuera | (0,1,0) siempre | la raíz no suma (salvo con `:scope`) |
| Choque de nombres | no lo evita | lo evita con nombres largos | lo evita: un `h3` del ámbito no sale de él |
| Límite interior | no | no | `to (…)` |
| Temas anidados | gana la última regla | gana la última regla | gana la raíz más cercana |

En un proyecto real conviven: `@scope` dentro de una capa, reglas anidadas dentro de un ámbito, o BEM para los componentes y `@scope` solo para el contenido que viene de fuera.

```css
@layer components {
  @scope (.post-card) to (.post-card__body) {
    :scope { border: 1px solid #cbd5e1; }
    .meta { color: #475569; }      /* un nombre corto: solo vale dentro de la tarjeta */
    a {
      color: #15803d;
      &:hover { text-decoration: underline; }   /* anidamiento dentro del ámbito */
    }
  }
}
```

Fíjate en `.meta`: dentro de un ámbito, las clases pueden tener **nombres cortos**, porque la regla no sale de la tarjeta. Otra tarjeta puede tener su propio `.meta` en su propio ámbito sin que choquen. Lo que el ámbito no evita es lo contrario: una regla global `.meta { … }`, escrita fuera de cualquier ámbito, sí llega al interior de la tarjeta. Los nombres cortos funcionan si **todos** los componentes los usan dentro de un ámbito.

## Cómo verlo en DevTools

- En **Elements → Styles**, las reglas de un ámbito aparecen bajo un encabezado `@scope (.post-card) to (.post-card__body)`, como las de una `@media`.
- Si una regla con ámbito no se aplica a un elemento, mira primero si el elemento está dentro del límite: no aparecerá en su lista de reglas.
- Si dos reglas con ámbito compiten, compara su especificidad (pasa el ratón por el selector) antes de pensar en la proximidad.

## Bestiario

- **El tema más cercano no gana.** Síntoma: en un panel claro dentro de uno oscuro, los enlaces siguen con el color del oscuro, aunque los dos temas usen `@scope`. Causa: la proximidad solo desempata; uno de los ámbitos usa un selector más específico (`:scope a`) y gana antes. Solución: selectores del mismo peso en los ámbitos que se solapan. → [ver ejemplo](04-especificidad-antes-que-proximidad.md)
- **El agujero del ámbito hereda los colores de fuera.** Síntoma: un recuadro excluido con `to (…)` tiene letra blanca sobre fondo claro. Causa: el límite detiene a los selectores, no a la herencia. Solución: el agujero declara su propio `color` (y lo que no deba heredar). → [ver ejemplo](05-la-herencia-cruza-el-limite.md)

## Resumen

- `@scope (raíz) { … }` limita las reglas al interior de la raíz; `:scope` es la propia raíz.
- La raíz no suma especificidad: `h3` dentro de un ámbito pesa (0,0,1). `:scope` sí suma (0,1,0).
- `to (límite)` excluye el límite y todo lo que contiene: un ámbito con agujero, para el contenido ajeno.
- La proximidad es un criterio de la cascada, después de la especificidad: a igual peso, gana la raíz más cercana.
- El límite no detiene la herencia.
- Sin selector, dentro de un `<style>`, la raíz es el padre del `<style>`.

## Para profundizar

- [MDN: @scope](https://developer.mozilla.org/en-US/docs/Web/CSS/@scope)
- [Chrome for Developers: Limit the reach of your selectors with the CSS @scope at-rule](https://developer.chrome.com/docs/css-ui/at-scope)
- [MDN: :scope](https://developer.mozilla.org/en-US/docs/Web/CSS/:scope)
- [Especificación: CSS Cascading and Inheritance Level 6 (@scope)](https://www.w3.org/TR/css-cascade-6/#scoped-styles)
