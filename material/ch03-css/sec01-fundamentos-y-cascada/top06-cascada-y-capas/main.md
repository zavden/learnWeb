# Cascada y capas

## Por qué importa

La «C» de CSS es de **cascada**: el algoritmo que decide qué declaración gana cuando varias quieren dar valor a la misma propiedad del mismo elemento. En la lección anterior viste uno de sus criterios, la especificidad. Aquí verás el algoritmo completo: de dónde viene cada hoja (**origen**), qué cambia `!important` y cómo las **capas** (`@layer`) te permiten ordenar tu CSS por intención en lugar de pelearte con selectores. Es la herramienta moderna para que un proyecto grande, con resets, componentes y librerías ajenas, siga siendo predecible.

## El algoritmo completo

Cuando varias declaraciones compiten por la misma propiedad de un elemento, el navegador las compara con estos criterios, **en este orden**. En cuanto uno de ellos deshace el empate, los siguientes ya no se miran:

| # | Criterio | Gana… |
|---|---|---|
| 1 | Origen e importancia | según la tabla de orígenes (más abajo) |
| 2 | Contexto | reglas de dentro o de fuera de un Shadow DOM (capítulo de Web Components) |
| 3 | Estilos en línea | el atributo `style`, frente a cualquier hoja |
| 4 | Capas | la capa con más prioridad |
| 5 | Especificidad | el selector más específico (lección 5) |
| 6 | Orden de aparición | la declaración que aparece más tarde |

> **Desde Python:** imagina que cada declaración tiene una clave de ordenación, como en `max(declaraciones, key=lambda d: (d.origen, d.en_linea, d.capa, d.especificidad, d.posicion))`. Las tuplas se comparan posición a posición, así que un criterio solo importa si todos los anteriores empatan. Eso es exactamente la cascada.

## Orígenes: navegador, usuario y autor

Cada declaración procede de uno de tres **orígenes**:

- **User agent**: la hoja del navegador (lección 1).
- **Usuario**: preferencias de quien navega, como un tamaño mínimo de letra o una extensión que fuerza colores de alto contraste.
- **Autor**: tú, con tus `<link>`, `<style>` y atributos `style`.

Las declaraciones normales del autor ganan a las del navegador **sin mirar la especificidad**, porque el origen se compara antes:

[[exercise:01-el-autor-gana-al-navegador.md]]

## Importancia: !important invierte los orígenes

`!important` no solo «sube» una declaración: la cambia de grupo, y en el grupo de las importantes el orden de los orígenes **se invierte**. Esta es la tabla completa, de más a menos prioridad:

| Prioridad | Declaraciones |
|---|---|
| 1 (máxima) | transiciones en curso (`transition`) |
| 2 | `!important` del navegador |
| 3 | `!important` del usuario |
| 4 | `!important` del autor |
| 5 | animaciones (`@keyframes`) |
| 6 | normales del autor |
| 7 | normales del usuario |
| 8 (mínima) | normales del navegador |

La inversión tiene una razón de accesibilidad: si una persona necesita letra grande o colores de alto contraste, marca sus preferencias como `!important` y ninguna web puede anularlas. Del mismo modo, el navegador protege con `!important` las pocas cosas que no deben romperse.

## Orden de aparición

Si todo lo demás empata, gana la declaración que aparece **más tarde**. Todas las hojas del documento, lleguen por `<link>` o por `<style>`, se ponen en fila según su posición, como si fueran un único archivo muy largo:

[[exercise:02-orden-entre-hojas.md]]

## Capas: @layer

Las **capas de cascada** permiten agrupar reglas y decidir el orden de los grupos. Entre capas no importa la especificidad: una regla de una capa posterior gana a cualquier regla de una capa anterior.

```css
@layer reset, base, components, utilities;   /* orden: de menos a más prioridad */

@layer base {
  a { color: #1d4ed8; }
}

@layer components {
  .button { color: white; }
}
```

- La sentencia `@layer a, b, c;` **declara el orden**. Conviene que sea la primera línea de tu CSS.
- Un bloque `@layer nombre { … }` mete reglas en esa capa. Puedes abrir la misma capa varias veces: todo va al mismo sitio.
- Las capas se pueden anidar (`@layer framework { @layer base { … } }`, que se nombra `framework.base`).

[[exercise:03-capas-antes-que-especificidad.md]]

Las reglas **sin capa** no quedan fuera del juego: forman una capa implícita que va **la última**, con más prioridad que todas las demás.

```text
reset  <  base  <  components  <  utilities  <  (sin capa)
```

[[exercise:04-sin-capa-gana.md]]

Si no declaras el orden con una sentencia `@layer`, lo decide la **primera aparición** de cada nombre en el archivo. Es fácil acabar con un orden distinto del que imaginas:

[[exercise:05-orden-de-capas-sin-declarar.md]]

## !important y capas

Con las capas pasa lo mismo que con los orígenes: para las declaraciones `!important` el orden **se invierte**. Gana la capa más temprana, y cualquier capa gana a lo que no tiene capa:

```text
Normales:     reset < base < components < (sin capa)
!important:   (sin capa) < components < base < reset
```

[[exercise:06-important-invierte-las-capas.md]]

## revert-layer: deshacer una capa

La palabra clave `revert-layer`, usada como valor de cualquier propiedad, significa «haz como si esta capa no declarara nada aquí»: la cascada retrocede y usa el valor que dejaron las capas anteriores. Sirve para crear variantes que vuelven al estilo base sin repetirlo:

[[exercise:07-revert-layer.md]]

Su pariente `revert` retrocede más: hasta la hoja del navegador. Lo verás con las demás palabras clave universales en la lección de herencia y valores.

## Meter CSS ajeno en una capa

Las librerías suelen traer selectores muy específicos que cuestan de sobrescribir. Si las importas dentro de una capa, tus estilos sin capa les ganan siempre, sea cual sea la especificidad:

```css
@import url("library.css") layer(library);   /* tiene que ir al principio de la hoja */
```

[[exercise:08-importar-en-una-capa.md]]

Un esquema habitual en proyectos reales:

```css
@layer reset, library, base, layout, components, utilities;
@import url("library.css") layer(library);
```

Cada capa tiene un papel claro, y dentro de cada una puedes usar selectores sencillos porque ya no compiten con los de las demás. Lo retomarás en el módulo de arquitectura CSS.

## Cómo verlo en DevTools

En **Elements → Styles**, Chrome agrupa las reglas bajo un encabezado con su capa (por ejemplo, `@layer components`) y las ordena de la que gana a la que pierde, igual que con la especificidad. El botón de capas de ese panel muestra el orden completo de las capas del documento. Las reglas de la hoja del navegador aparecen al final, marcadas como *user agent stylesheet*.

Cuando una declaración aparece tachada, recorre los criterios de la tabla del principio en orden: ¿es otro origen?, ¿hay un `!important`?, ¿un atributo `style`?, ¿otra capa?, ¿más especificidad?, ¿aparece después? El primer «sí» es la explicación.

## Bestiario

- **Las capas no respetan el orden que imaginabas.** *Síntoma:* una capa que debería ganar (por ejemplo, `components`) pierde contra otra (por ejemplo, `reset`). *Causa:* sin una sentencia `@layer` al principio, el orden de las capas es el de su primera aparición en el archivo (o en los `@import`). *Solución:* declara todas las capas en orden en la primera línea: `@layer reset, base, components;`. [Ver ejemplo](05-orden-de-capas-sin-declarar.md).
- **Un `!important` sin capa no consigue ganar.** *Síntoma:* añades `!important` a tu regla sin capa y sigue ganando la de una capa (por ejemplo, la de una librería). *Causa:* para las declaraciones importantes el orden de las capas se invierte: cualquier capa gana a lo que no tiene capa, y la más temprana gana a las posteriores. *Solución:* no luches con `!important`: quita el de la capa si es tuyo o, si no lo es, pon tu regla en una capa anterior. [Ver ejemplo](06-important-invierte-las-capas.md).

## Resumen

- La cascada compara, en orden: origen e importancia, contexto, estilos en línea, capas, especificidad y orden de aparición.
- Las declaraciones normales del autor ganan a las del navegador sin mirar la especificidad.
- `!important` invierte el orden de los orígenes y de las capas.
- Varias hojas se ordenan por su posición en el documento, sean `<link>` o `<style>`.
- `@layer a, b, c;` declara el orden de las capas; entre capas no cuenta la especificidad; lo que no tiene capa va lo último y gana.
- `revert-layer` vuelve al valor de las capas anteriores; `@import … layer(x)` mete una hoja ajena en una capa.

## Para profundizar

- [MDN: Introducing the CSS Cascade](https://developer.mozilla.org/en-US/docs/Web/CSS/Cascade)
- [MDN: @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
- [web.dev: The cascade](https://web.dev/learn/css/the-cascade)
- [CSS-Tricks: A Complete Guide to CSS Cascade Layers](https://css-tricks.com/css-cascade-layers/)
- [CSS Cascading and Inheritance Level 5 (especificación)](https://www.w3.org/TR/css-cascade-5/)
