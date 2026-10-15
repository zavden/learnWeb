# Especificidad

## Por qué importa

Cuando dos reglas declaran **la misma propiedad** para **el mismo elemento**, el navegador tiene que quedarse con una. La causa número uno de «mi regla no se aplica» es que otra regla, quizá escrita cientos de líneas antes, tiene un selector más **específico**. Si sabes calcular la especificidad a ojo, puedes predecir qué gana sin probar, leer DevTools con criterio y, sobre todo, escribir CSS fácil de sobrescribir.

## Cuándo se usa: la cascada en una frase

Si las declaraciones que compiten no son de la misma propiedad, no hay nada que decidir: se suman (lo viste en la lección 1). Cuando sí compiten, el navegador aplica estos criterios **en orden**, y el primero que deshace el empate decide:

1. **Origen e importancia**: hoja del navegador, tu hoja, `!important`… (la lección 6 lo detalla; aquí verás lo básico de `!important`).
2. **Estilos en línea**: el atributo `style`.
3. **Capas** (`@layer`): lección 6.
4. **Especificidad** del selector: esta lección.
5. **Orden de aparición**: si todo lo anterior empata, gana la última declaración.

La especificidad es, por tanto, un desempate: solo cuenta entre declaraciones del mismo origen, la misma importancia y la misma capa. Pero en el día a día casi todas tus reglas cumplen eso, así que es el criterio que más vas a ver.

## Cómo se calcula: la terna (a, b, c)

Se cuentan tres cosas en el selector:

| Columna | Qué cuenta | Ejemplos |
|---|---|---|
| **a** | selectores de id | `#menu` |
| **b** | clases, atributos y pseudoclases | `.card`, `[type="email"]`, `:hover`, `:nth-child(2)` |
| **c** | tipos y pseudoelementos | `p`, `li`, `::before` |
| — | no cuentan nada | `*`, los combinadores (espacio, `>`, `+`, `~`) y `:where()` |

| Selector | a | b | c | Especificidad |
|---|---|---|---|---|
| `*` | 0 | 0 | 0 | (0,0,0) |
| `li` | 0 | 0 | 1 | (0,0,1) |
| `ul > li + li` | 0 | 0 | 3 | (0,0,3) |
| `p::first-line` | 0 | 0 | 2 | (0,0,2) |
| `.card` | 0 | 1 | 0 | (0,1,0) |
| `a:hover` | 0 | 1 | 1 | (0,1,1) |
| `input[type="email"]:focus` | 0 | 2 | 1 | (0,2,1) |
| `.nav .item.active` | 0 | 3 | 0 | (0,3,0) |
| `#menu` | 1 | 0 | 0 | (1,0,0) |
| `#menu .item a` | 1 | 1 | 1 | (1,1,1) |

## Cómo se compara: columna a columna, sin acarreo

Se compara primero la columna **a**; si empata, la **b**; si empata, la **c**. Si las tres empatan, decide el orden. Las columnas **no** se suman ni se «llevan»: no son las cifras de un número.

```text
#intro      (1, 0, 0)
p.lead      (0, 1, 1)     a: 1 > 0  → gana #intro; b y c ni se miran
.lead       (0, 1, 0)
p           (0, 0, 1)
```

> **Desde Python:** la especificidad se compara exactamente igual que las tuplas de Python, en orden lexicográfico: `(1, 0, 0) > (0, 100, 0)` es `True`, y `(0, 1, 1) > (0, 1, 0)` también. Si alguna vez dudas, escribe las ternas como tuplas y compáralas.

En este ejemplo, cuatro reglas eligen el mismo párrafo. Están escritas de más a menos específica, para que veas que el orden no las salva:

[[exercise:01-escalera-de-especificidad.md]]

La consecuencia más sorprendente de comparar sin acarreo es que **un id gana a cualquier cantidad de clases**. Literalmente:

[[exercise:02-un-id-gana-a-100-clases.md]]

Y cuando la especificidad empata, decide el orden de aparición en la hoja. El orden de las clases dentro del atributo `class` no influye en nada:

[[exercise:03-empate-gana-la-ultima.md]]

## :is(), :not(), :has() y :where()

Las pseudoclases lógicas de la lección 3 tienen reglas propias:

| Pseudoclase | Especificidad | Ejemplo |
|---|---|---|
| `:is(S)`, `:not(S)`, `:has(S)` | la del selector **más específico** de su lista | `:is(#hero, .card) p` → (1,0,1) |
| `:where(S)` | siempre **cero** | `:where(#hero, .card) p` → (0,0,1) |
| `:nth-child(An+B of S)` | una pseudoclase + el más específico de `S` | `li:nth-child(2 of .done)` → (0,2,1) |

`:where()` permite escribir estilos base que cualquier regla posterior puede sobrescribir, algo muy útil en resets y librerías:

[[exercise:04-is-y-where.md]]

La regla de «el más específico de su lista» tiene una trampa: `:is()` pesa lo mismo coincida por donde coincida. En cambio, en una **lista de selectores** separados por comas cada selector conserva su propia especificidad:

[[exercise:05-is-arrastra-el-id.md]]

## Estilos en línea

Las declaraciones del atributo `style` no tienen selector. La cascada las coloca en un escalón propio, **por encima de cualquier selector** de una hoja (es el criterio 2 de la lista del principio). A menudo se resume como una cuarta columna delante de los id: (1,0,0,0).

[[exercise:06-estilo-en-linea.md]]

Por eso los estilos en línea se reservan para casos muy concretos (por ejemplo, valores que calcula JavaScript): son casi imposibles de sobrescribir desde una hoja.

## !important

Escrito tras el valor, `!important` saca la declaración de la competición normal y la pone en un escalón superior:

```css
.alert { color: darkred !important; }
```

- Una declaración `!important` gana a **cualquier** declaración normal del mismo origen, incluidas las del atributo `style`.
- Entre dos declaraciones `!important`, se vuelve a desempatar con los mismos criterios: especificidad y orden.
- Un `style="… !important"` en línea gana a todo lo que escribas en tus hojas.

| Dentro de tu CSS, de más fuerte a más débil |
|---|
| `style="color: red !important"` |
| reglas de tus hojas con `!important` (entre ellas, por especificidad y orden) |
| `style="color: red"` |
| reglas normales de tus hojas (por especificidad y orden) |

[[exercise:07-important.md]]

`!important` también cambia cómo compiten los orígenes y las capas (llega a invertir su orden). Lo verás en la lección de cascada y capas.

## Estrategia: mantén la especificidad baja

El problema de la especificidad no es calcularla, sino que **solo se puede subir**. Si una regla general pesa mucho, cada excepción tendrá que pesar todavía más, y el CSS se convierte en una escalada de selectores largos e `!important`. Este es el caso más típico:

[[exercise:08-mi-regla-no-se-aplica.md]]

Hábitos que evitan esa escalada:

- Usa **clases** para dar estilos; deja los id para anclas, formularios y JavaScript.
- Evita cadenas largas como `.page .sidebar .menu li a`: una clase bien nombrada (`.menu-link`) pesa (0,1,0) y dice lo mismo.
- Usa `:where()` para los estilos base y los resets.
- No uses `!important` para ganar una pelea de especificidad.
- Más adelante tendrás dos herramientas más: las capas (`@layer`, lección 6) y las metodologías como BEM (módulo de arquitectura CSS).

## La especificidad no compite con la herencia

Algunas propiedades, como `color` o `font-family`, se **heredan**: si un elemento no tiene ningún valor para ellas, toma el de su padre. Pero un valor heredado no es una declaración que compita: solo se usa cuando **ninguna** regla, de ningún origen, elige al propio elemento. Basta con que exista una regla para el elemento, aunque sea la hoja del navegador con un selector modesto, para que el valor heredado no cuente, venga del id que venga:

[[exercise:09-herencia-no-compite.md]]

La herencia y las palabras clave como `inherit` se estudian en la lección 7.

## Cómo verla en DevTools

En el panel **Elements → Styles**, pasa el ratón por encima de un selector: Chrome muestra un recuadro con su especificidad, por ejemplo «Specificity: (1,0,1)». Las reglas aparecen ordenadas de la que gana a la que pierde, y las declaraciones derrotadas, **tachadas**. Cuando una propiedad no se aplica, busca quién la tacha y compara las ternas.

## Bestiario

- **Cien clases no pueden con un id.** *Síntoma:* añades clases y más clases a un selector y sigue sin ganar. *Causa:* la especificidad se compara columna a columna, sin acarreo; un id en la columna **a** gana a cualquier número en la **b**. *Solución:* no compitas con un id: cambia la regla del id por una clase o envuélvelo en `:where()`. [Ver ejemplo](02-un-id-gana-a-100-clases.md).
- **`:is()` hace que una regla pese como un id.** *Síntoma:* una regla sencilla como `.card p` no puede con `:is(#hero, .card) p`, aunque el elemento ni siquiera esté dentro de `#hero`. *Causa:* `:is()`, `:not()` y `:has()` toman la especificidad de su argumento más específico, coincida por donde coincida. *Solución:* usa una lista de selectores (`#hero p, .card p`) o `:where()`. [Ver ejemplo](05-is-arrastra-el-id.md).
- **Mi regla está bien escrita, pero no se aplica.** *Síntoma:* la declaración aparece tachada en DevTools. *Causa:* otra regla con mayor especificidad declara la misma propiedad, aunque esté escrita antes. *Solución:* baja la especificidad de la regla general (clase en lugar de id, `:where()`); no subas la de la nueva ni recurras a `!important`. [Ver ejemplo](08-mi-regla-no-se-aplica.md).
- **El texto del contenedor es blanco, pero sus enlaces no.** *Síntoma:* pones `color` en un contenedor con un id y los enlaces siguen azules. *Causa:* el color llega a los enlaces solo por herencia, y la hoja del navegador tiene una regla propia para `a`; un valor heredado nunca compite con una regla que elige al elemento. *Solución:* escribe una regla para los enlaces (`.panel a { color: … }` o `color: inherit`). [Ver ejemplo](09-herencia-no-compite.md).

## Resumen

- La especificidad decide entre declaraciones de la misma propiedad con el mismo origen, importancia y capa; si empata, gana la última.
- Se calcula como (a, b, c): id; clases, atributos y pseudoclases; tipos y pseudoelementos. `*` y los combinadores no cuentan.
- Se compara columna a columna, como las tuplas de Python: un id gana a cualquier número de clases.
- `:is()`, `:not()` y `:has()` valen lo que su argumento más específico; `:where()` vale cero.
- El atributo `style` está por encima de cualquier selector; `!important` está por encima de todo lo normal.
- Un valor heredado no compite: cualquier regla que elija al elemento le gana.
- Mantén la especificidad baja: clases, selectores cortos, `:where()` y nada de `!important` para ganar peleas.

## Para profundizar

- [MDN: Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity)
- [web.dev: Specificity](https://web.dev/learn/css/specificity)
- [Selectors Level 4: cálculo de la especificidad](https://www.w3.org/TR/selectors-4/#specificity-rules)
- [Polypane: calculadora de especificidad](https://polypane.app/css-specificity-calculator/)
- [MDN: !important](https://developer.mozilla.org/en-US/docs/Web/CSS/important)
