# Depuración

## Por qué importa

Sass trabaja donde no lo ves: entre tu código y el navegador. Cuando una página sale mal, el problema puede estar en tres sitios: el compilador se ha detenido (y no hay CSS), el compilador ha generado algo distinto de lo que creías (y el CSS es válido pero hace otra cosa), o el CSS generado es correcto y el fallo está en el propio CSS. Esta lección te da las herramientas para distinguir los tres casos: las reglas `@debug`, `@warn` y `@error`, el módulo `sass:meta` y, sobre todo, la costumbre de leer los mensajes del compilador y el CSS generado.

## Dónde habla el compilador

En LearnWeb, todo lo que dice el compilador aparece en la pestaña **`sass-output.txt`** de los ejemplos de la teoría y, en el editor, en el botón **«CSS»** de la vista previa y en la barra de estado, bajo «Compile». Cada mensaje empieza con el archivo, la línea del código y el tipo. Si el mensaje sale de dentro de un mixin o de una función, debajo aparece la **pila de llamadas**: qué mixin se estaba ejecutando (y en qué línea y columna) y desde dónde se llamó:

```text
styles.scss:12 @debug: fluid(1.75rem, 3rem) → pendiente 0.03125, corte 1.125rem
styles.scss:41 @warn: button-size(): no existe el tamaño «xl». Uso «md». Opciones: sm, md, lg.
    styles.scss 13:5   button-size()
    styles.scss 41:15  root stylesheet
styles.scss:34 Error: "from(): no existe el breakpoint «xl». Usa uno de estos: md, lg."
```

La pila se lee de arriba abajo, de dentro hacia fuera: el aviso se lanzó en la línea 13, dentro de `button-size()`, que se llamó desde la línea 41 del nivel principal del archivo (`root stylesheet`, fuera de cualquier mixin o función). Es la misma información que el *traceback* de Python, pero en orden inverso: Python pone la llamada más interna al final.

En la terminal, Dart Sass muestra lo mismo con otro formato, y añade a los errores un extracto del código con la posición señalada:

```text
Error: Undefined variable.
  ╷
5 │   background: $brnad;
  │               ^^^^^^
  ╵
  src/main.scss 5:15  root stylesheet

WARNING: no existe «xl»
    src/warn.scss 4:33  size()
    src/warn.scss 8:6   root stylesheet

src/warn.scss:5 DEBUG: size(xl)
```

`5:15` significa línea 5, columna 15.

## `@debug`: el `print()` de Sass

`@debug <expresión>;` imprime el valor de la expresión durante la compilación, sin cambiar el CSS generado. Sirve para ver los pasos intermedios de una función o los valores que recibe un mixin:

[[exercise:01-debug.md-(styles.scss|sass-output.txt|compiled.css)]]

[[exercise:01-debug.md]]

Un consejo que se ve en el ejemplo: la línea que indica `sass-output.txt` es la **del `@debug`**, así que si la función se llama tres veces verás tres mensajes con la misma línea. Incluye en el texto algo que identifique cada llamada (los argumentos, por ejemplo). Y quita los `@debug` cuando termines, como harías con los `print()` de Python.

## Inspeccionar valores: `sass:meta`

`@debug` muestra los valores de forma «amable», y a veces eso esconde el problema. El caso típico: un número entre comillas. `"8px"` es una **cadena**, aunque `@debug` la imprima como `8px`. El módulo `sass:meta` te dice la verdad:

[[exercise:02-numero-entre-comillas.md-(styles.scss|sass-output.txt|compiled.css)]]

[[exercise:02-numero-entre-comillas.md]]

| Función | Devuelve | Ejemplo |
|---|---|---|
| `meta.type-of($x)` | el tipo: `number`, `string`, `color`, `list`, `map`, `bool`, `null`… | `meta.type-of("8px")` → `string` |
| `meta.inspect($x)` | el valor tal como lo escribirías en Sass, con comillas y paréntesis | `meta.inspect("8px")` → `"8px"` |

> **Desde Python:** `meta.type-of()` es `type()` y `meta.inspect()` es `repr()`: `print("8px")` muestra `8px`, pero `repr("8px")` muestra `'8px'`. La diferencia con Python es que Sass no da error al sumar una cadena y un número: convierte el número en texto y los pega.

## `@warn`: avisar sin detenerse

`@warn "mensaje";` imprime un aviso y **sigue compilando**. Es la herramienta para quien escribe mixins y funciones que usarán otras personas: si reciben algo dudoso pero hay una alternativa razonable, avisan y continúan.

[[exercise:03-warn.md-(styles.scss|sass-output.txt)]]

[[exercise:03-warn.md]]

Fíjate en `sass-output.txt`: la primera línea del aviso es la del `@include` que lo provocó (la que tienes que corregir), y la pila de debajo dice en qué línea del mixin está el `@warn`. Los avisos de deprecación que viste en las lecciones anteriores son exactamente esto: avisos que Sass emite para que actualices tu código antes de que deje de funcionar.

## `@error`: detenerse con un mensaje propio

`@error "mensaje";` detiene la compilación, igual que un error del propio Sass, pero con **tu** mensaje. En la lección de mixins te prometí un mixin de breakpoints que se quejara si le pides un tamaño que no existe. Aquí está:

[[exercise:04-error-en-un-mixin.md-(styles.scss|sass-output.txt)]]

[[exercise:04-error-en-un-mixin.md]]

> **Desde Python:** `@error` es `raise ValueError(f"…")`. Como en Python, un buen mensaje dice **qué** ha fallado, **con qué valor** y **qué opciones** había: «no existe el breakpoint «xl». Usa uno de estos: md, lg».

Dos detalles al leerlo: Sass muestra tu mensaje entre comillas (es el valor de una cadena), y la línea que indica es la del `@include` que provocó el error, no la del `@error`. A diferencia del `@warn`, Dart Sass no da la pila de un `@error` lanzado por ti, así que tu mensaje debe decir de qué mixin viene: por eso empieza por `from():`. (Los errores del propio Sass dentro de un mixin, como «Missing argument», sí llevan pila.) ¿Cuándo `@warn` y cuándo `@error`? Si seguir compilando produce un resultado razonable, `@warn`; si produciría CSS roto o engañoso, `@error`.

## Los errores silenciosos

Los errores que detienen la compilación son molestos, pero fáciles de encontrar. Los peores son los que **no avisan**: Sass genera CSS válido para Sass, pero no el que querías. Dos de los más traicioneros:

Una **clave de mapa mal escrita**. `map.get` devuelve `null` cuando la clave no existe, y una declaración con valor `null` no se escribe. No hay error, no hay aviso: la propiedad desaparece.

[[exercise:05-clave-que-no-existe.md]]

[[exercise:05-clave-que-no-existe.md-(styles.scss|compiled.css)]]

Una **función mal escrita**. Las variables y los mixins mal escritos dan error, pero las funciones no: Sass no puede saber si `spce()` es una errata o una función de CSS que no conoce (CSS añade funciones nuevas cada año), así que la copia tal cual. El navegador la descarta en silencio.

[[exercise:06-funcion-mal-escrita.md]]

[[exercise:06-funcion-mal-escrita.md-(styles.scss|compiled.css)]]

En las lecciones anteriores viste otros errores de esta familia. Esta tabla los reúne:

| Síntoma | Causa probable | Dónde se vio |
|---|---|---|
| Una propiedad falta en `compiled.css` | un valor `null` (clave de mapa inexistente, argumento opcional) | esta lección |
| Una función tuya aparece sin calcular en `compiled.css` | el nombre de la función está mal escrito | esta lección |
| Un valor sale entre comillas o pegado (`"8px4px"`) | un número guardado como cadena | esta lección |
| `--brand: $brand` en el CSS | falta la interpolación `#{}` | variables y ámbito |
| Una regla con `:hover` o un tema no existe en el CSS | solo declaraba variables Sass | variables y ámbito |
| `padding: 32px/2` en el CSS | la barra no divide | funciones y módulos |
| Selectores `.a :hover` con espacio | falta el `&` | anidamiento |
| Aparece una insignia con «0» | `0` y `""` son verdaderos | control de flujo |
| Una variante pierde contra la regla base | `@extend` movió el selector | @extend y placeholders |

## Leer los errores del compilador

Cuando la compilación se detiene, la página se queda sin CSS y el mensaje dice qué y dónde. Pero «dónde» es **donde Sass se dio cuenta**, que no siempre es donde está el fallo. El caso más típico es un punto y coma olvidado:

[[exercise:07-punto-y-coma.md-(styles.scss|sass-output.txt)]]

[[exercise:07-punto-y-coma.md]]

Los mensajes que más verás, reunidos:

| Mensaje | Qué suele significar |
|---|---|
| `Undefined variable.` | errata en el nombre, o una variable local usada fuera de su bloque |
| `Undefined mixin.` | errata, o el `@mixin` está escrito después del `@include` |
| `Missing argument $x.` / `No parameter named $x.` | faltan argumentos al llamar, o un nombre no coincide |
| `expected ";".` / `expected "}".` | falta un `;` o una `}`, normalmente en una línea **anterior** |
| `100% and 240px have incompatible units.` | una cuenta que solo puede hacer el navegador: usa `calc()` |
| `Undefined operation "8px * 2".` | operas con una cadena, no con un número |
| `List index may not be 0.` | las listas empiezan en 1 |
| `@use rules must be written before any other rules.` | mueve los `@use` al principio |
| `Can't find stylesheet to import.` | la ruta del `@use` está mal (en LearnWeb, solo hay módulos `sass:`) |
| `Declarations may only be used within style rules.` | un `@include` de declaraciones fuera de cualquier regla |
| `You may not @extend selectors across media queries.` | usa un mixin dentro de la `@media` |
| `The target selector was not found.` | el selector extendido no existe (o añade `!optional`) |

## Un método para depurar Sass

1. **¿Compila?** Mira `sass-output.txt` (o el botón «CSS»). Si hay un error, ve a la línea indicada y a la anterior.
2. **¿Genera lo que esperas?** Busca en `compiled.css` la regla del elemento que falla. ¿Existe? ¿Tiene la declaración? ¿El selector es el que creías?
3. **¿Lo acepta el navegador?** En DevTools, **Elements → Styles**: una declaración tachada perdió en la cascada; una con un icono de aviso tiene un valor inválido (como `spce(4)` o `"8px4px"`).
4. **¿Qué valores calcula Sass?** Añade `@debug` con `meta.inspect()` en la función o el mixin sospechoso.
5. **Reduce.** Copia el trozo sospechoso a un ejemplo nuevo del editor y quita cosas hasta que el fallo desaparezca: lo último que quitaste es la causa.

## Bestiario

- **Un número entre comillas.** *Síntoma:* `padding: "8px4px"` en el CSS generado y la declaración no se aplica; `@debug` muestra `8px` y parece correcto. *Causa:* `"8px"` es una cadena; `+` con una cadena pega texto. *Solución:* escribe los números sin comillas; para investigar, usa `meta.type-of()` y `meta.inspect()`. [Ver ejemplo](02-numero-entre-comillas.md).
- **Un mixin que acepta cualquier cosa.** *Síntoma:* `@include from(xl)` genera una media query rota sin ningún aviso. *Causa:* `map.get` devuelve `null` con una clave que no existe. *Solución:* comprueba la clave con `map.has-key` y lanza un `@error` con las opciones válidas. [Ver ejemplo](04-error-en-un-mixin.md).
- **Una propiedad desaparece sin avisar.** *Síntoma:* `color: map.get($palette, brnad)` no aparece en `compiled.css`. *Causa:* la clave no existe, `map.get` devuelve `null` y una declaración `null` no se escribe. *Solución:* accede a los mapas con una función propia que haga `@error` si falta la clave. [Ver ejemplo](05-clave-que-no-existe.md).
- **Una función mal escrita no da error.** *Síntoma:* `padding: spce(4)` aparece tal cual en `compiled.css` y no se aplica. *Causa:* Sass toma cualquier función que no conoce por una función de CSS y la copia sin evaluar. *Solución:* revisa el CSS generado: si ves el nombre de una función tuya, está mal escrito. [Ver ejemplo](06-funcion-mal-escrita.md).
- **El error señala la línea equivocada.** *Síntoma:* `expected ";".` en una línea que parece correcta. *Causa:* Sass informa de dónde descubrió el problema, que suele ser la línea siguiente al `;` o la `}` olvidados. *Solución:* mira el final de la línea anterior. [Ver ejemplo](07-punto-y-coma.md).

## Resumen

- `@debug` imprime valores (como `print()`), `@warn` avisa y sigue, `@error` detiene la compilación con tu mensaje (como `raise`).
- En LearnWeb, los mensajes salen en `sass-output.txt`, en el botón «CSS» y en la barra de estado, con la pila de llamadas cuando vienen de un mixin o una función; en la terminal, además, con un extracto del código.
- `meta.type-of()` y `meta.inspect()` revelan lo que `@debug` disimula, como las comillas de una cadena.
- Los errores silenciosos (valores `null`, funciones mal escritas, cadenas en lugar de números) solo se ven en el CSS generado: léelo.
- La línea de un error es donde Sass se dio cuenta; mira también la anterior.
- Valida los argumentos de tus mixins y funciones con `map.has-key` + `@error`: un fallo pronto y claro es mejor que un CSS roto en silencio.

## Para profundizar

- [Sass: @debug](https://sass-lang.com/documentation/at-rules/debug/)
- [Sass: @warn](https://sass-lang.com/documentation/at-rules/warn/)
- [Sass: @error](https://sass-lang.com/documentation/at-rules/error/)
- [Sass: sass:meta](https://sass-lang.com/documentation/modules/meta/)
- [Chrome DevTools: View and change CSS](https://developer.chrome.com/docs/devtools/css)
