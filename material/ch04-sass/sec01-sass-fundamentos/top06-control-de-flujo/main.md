# Control de flujo

## Por qué importa

Hasta ahora, Sass te ahorraba repetir valores (variables), bloques (mixins) y cálculos (funciones). Con el **control de flujo** te ahorra repetir **reglas enteras**: una condición elige qué se genera y un bucle genera diez, cuarenta o cien clases a partir de un mapa. Es lo que convierte a Sass en un generador de CSS, y la razón por la que librerías como Bootstrap se escriben en Sass: un archivo de configuración con unos mapas y unos bucles produce todas las variantes de botones, alertas y utilidades.

Todo ocurre **al compilar**. Un `@if` de Sass no puede preguntar si el usuario ha marcado una casilla, ni un `@each` puede recorrer los elementos de la página: deciden qué texto CSS se escribe, y luego desaparecen.

## Condiciones: `@if` y `@else`

`@if` evalúa una expresión y, si es verdadera, compila su bloque. Le pueden seguir `@else if` y `@else`. Se usa sobre todo dentro de funciones y mixins, para decidir según los argumentos:

[[exercise:01-if-else.md]]

[[exercise:01-if-else.md-(styles.scss|compiled.css)]]

Los operadores son los que esperas: `==`, `!=`, `<`, `>`, `<=`, `>=`, y para combinar condiciones, `and`, `or` y `not`, escritos con palabras, como en Python. Las comparaciones tienen en cuenta las unidades: `2px == 2` es falso.

> **Desde Python:** `@if $x > 60% { … } @else { … }` es `if x > 60: … else: …`, con llaves en lugar de dos puntos e indentación. `@else if` es `elif`.

Dentro de un mixin, `@if` permite que un argumento cambie **qué declaraciones** se escriben, no solo sus valores:

```scss
@mixin button($variant: solid) {
  padding: 8px 16px;
  border: 2px solid #2563eb;

  @if $variant == solid {
    background: #2563eb;
    color: #ffffff;
  } @else if $variant == outline {
    background: transparent;
    color: #1e40af;
  } @else {
    @error "button(): variante desconocida «#{$variant}»";   // lección de depuración
  }
}
```

Recuerda la frontera de siempre: esta condición se evalúa **una vez, al compilar**, con los argumentos que pongas en el `@include`. Para decidir según lo que pasa en la página, las herramientas son las de CSS:

| Quieres decidir según… | Herramienta | Cuándo se evalúa |
|---|---|---|
| un argumento, una variable de configuración | `@if` de Sass | al compilar |
| el ancho de la ventana o del contenedor | `@media`, `@container` | en el navegador |
| el estado de un elemento (casilla, foco, contenido) | `:checked`, `:focus-visible`, `:has()` | en el navegador |
| un valor que cambia (tema, JavaScript) | custom properties | en el navegador |

## Qué es verdadero en Sass

Aquí Sass y Python discrepan, y la diferencia produce errores silenciosos. En Python, `0`, `""`, `[]`, `{}` y `None` son falsos. En Sass, **solo `false` y `null` son falsos**: el número `0`, la cadena vacía `""` y la lista vacía `()` son **verdaderos**.

| Valor | Python | Sass |
|---|---|---|
| `false` / `False` | falso | falso |
| `null` / `None` | falso | falso |
| `0` | falso | **verdadero** |
| `""` | falso | **verdadero** |
| `()` / `[]` | falso | **verdadero** |

Si vienes de Python, escribirás `@if $count { … }` pensando «si hay alguno», y con `0` el bloque se compila igual:

[[exercise:02-solo-false-y-null-son-falsos.md]]

[[exercise:02-solo-false-y-null-son-falsos.md-(styles.scss|compiled.css)]]

La regla práctica: **compara siempre de forma explícita** (`$count > 0`, `$label != ""`), y usa `null`, no `0` ni `""`, para representar «no hay valor».

## La función `if()`, deprecada

Durante años, Sass tuvo una función `if($condición, $si-verdadero, $si-falso)`, el equivalente al `a if cond else b` de Python. En Dart Sass 1.98 está **deprecada**: sigue funcionando, pero cada uso imprime un aviso.

[[exercise:03-if-funcion-deprecada.md-(styles.scss|sass-output.txt)]]

Tienes dos alternativas. La de siempre, `@if`/`@else` dentro de una función, es la más clara. La nueva, la que propone el propio aviso, imita la sintaxis de la nueva función `if()` de CSS: `if(sass($condición): valor; else: otro)`. El `sass(…)` indica que la condición la evalúa Sass al compilar, no el navegador.

[[exercise:03-if-funcion-deprecada.md]]

## Recorrer listas: `@each`

`@each $item in <lista>` repite su bloque una vez por elemento, y es el bucle que más usarás. Con interpolación, cada vuelta genera una regla con su propio nombre de clase. Si los elementos de la lista son a su vez listas (pares, tríos), `@each` los **desestructura** en varias variables:

[[exercise:04-each-listas.md-(styles.scss|compiled.css)]]

[[exercise:04-each-listas.md]]

> **Desde Python:** `@each $weight in 400, 600, 800` es `for weight in [400, 600, 800]`, y `@each $name, $color in $statuses` es `for name, color in statuses`, con la misma desestructuración.

## Recorrer mapas

Con un mapa, `@each` recibe la clave y el valor en dos variables. Una paleta de cuatro colores genera cuatro variantes de alerta completas, con los tonos derivados con `sass:color`:

[[exercise:05-each-mapas.md]]

[[exercise:05-each-mapas.md-(styles.scss|compiled.css)]]

> **Desde Python:** `@each $name, $color in $alerts` es `for name, color in alerts.items()`. Y como en Python 3.7+, los mapas de Sass conservan el orden de inserción: las reglas se generan en el orden en que escribiste las claves, lo que importa para la cascada.

## Contar: `@for`, con `through` o con `to`

`@for` recorre números enteros. Tiene dos formas, y la diferencia es la fuente de un error clásico:

```scss
@for $i from 1 through 5 { … }   // 1, 2, 3, 4, 5   (incluye el final)
@for $i from 1 to 5 { … }        // 1, 2, 3, 4      (se detiene antes)
```

[[exercise:06-for-through-y-to.md]]

[[exercise:06-for-through-y-to.md-(styles.scss|compiled.css)]]

> **Desde Python:** `from 1 to 5` es `range(1, 5)`; `from 1 through 5` es `range(1, 6)`. Si piensas «del 1 al 5, los dos incluidos», necesitas `through`. Y cuando recorras una lista o un mapa, prefiere `@each`: no hay índices que equivocar.

## Repetir mientras: `@while`

`@while` repite su bloque mientras una condición sea verdadera. Es útil cuando no sabes de antemano cuántas vueltas hacen falta, como en una escala tipográfica que crece hasta pasar de un tamaño:

[[exercise:07-while.md-(styles.scss|compiled.css)]]

[[exercise:07-while.md]]

Fíjate en el comentario del bucle: dentro de los bloques de control de flujo (`@if`, `@each`, `@for`, `@while`), asignar a una variable que ya existía fuera **cambia esa variable**, en lugar de crear una local como hacen las reglas de estilo. Gracias a eso `$size` crece de vuelta en vuelta.

### El bucle que no termina

Avanzar es responsabilidad tuya. Si la variable de la condición no cambia, el bucle no termina nunca. Este ejemplo lleva una **guarda casera** que lo detiene con un error que explica qué pasa:

[[exercise:08-while-sin-progreso.md-(styles.scss|sass-output.txt)]]

Sin esa guarda, el compilador se quedaría dando vueltas para siempre. En una terminal, `sass --watch` se quedaría colgado hasta que pulsaras Ctrl+C. LearnWeb compila cada vez que dejas de escribir, así que un bucle a medio escribir podría bloquear la aplicación: para evitarlo, **LearnWeb** detiene el compilador a los 5 segundos y muestra «Compilation took longer than 5s and was stopped (an endless Sass @while or Pug loop?)». Igual que la guarda de bucles de JavaScript, es una ayuda de LearnWeb, no de Sass.

[[exercise:08-while-sin-progreso.md]]

En la práctica, `@while` se usa poco: casi todo lo que hace se puede escribir con `@each` o `@for`, que no pueden quedarse colgados.

## Generar utilidades

El patrón que reúne todo lo anterior: unos **mapas** de configuración y unos **bucles anidados** que generan una familia de clases. Aquí, siete prefijos (`m`, `mt`, `p`, `px`, `gap`…) por seis tamaños dan 42 clases de utilidad:

[[exercise:09-generar-utilidades.md]]

[[exercise:09-generar-utilidades.md-(styles.scss|compiled.css)]]

La interpolación hace dos trabajos: construye el nombre de la clase (`.#{$prefix}-#{$key}`) y el nombre de la propiedad (`#{$property}: $value`). Un detalle de diseño: las utilidades tienen especificidad (0,1,0), igual que los componentes, así que ganan o pierden por **orden de aparición**. Por eso en proyectos reales se ponen en una capa posterior (`@layer utilities`), como viste en el módulo de cascada.

Cuidado con el tamaño: dos bucles anidados multiplican. Siete utilidades por seis tamaños son 42 clases; añade cuatro breakpoints y son 210. Genera solo las que vas a usar.

## Bestiario

- **`@if $count` se cumple con `0`.** *Síntoma:* aparece una insignia con un «0» o una píldora vacía que no debería existir. *Causa:* en Sass solo `false` y `null` son falsos; `0`, `""` y `()` son verdaderos (al revés que en Python). *Solución:* compara de forma explícita (`$count > 0`, `$label != ""`) y usa `null` para «no hay valor». [Ver ejemplo](02-solo-false-y-null-son-falsos.md).
- **Avisos «The Sass if() syntax is deprecated».** *Síntoma:* `sass-output.txt` muestra un aviso por cada `if($cond, a, b)`. *Causa:* la función `if()` clásica está deprecada en Dart Sass 1.98. *Solución:* usa `@if`/`@else` (dentro de una función si necesitas un valor) o la nueva sintaxis `if(sass($cond): a; else: b)`. [Ver ejemplo](03-if-funcion-deprecada.md).
- **Falta la última clase del `@for`.** *Síntoma:* `.span-5` no existe y el elemento que la usa se queda en una columna. *Causa:* `from 1 to 5` se detiene antes del 5, como `range(1, 5)`. *Solución:* `from 1 through 5`, o mejor `@each` si recorres una lista. [Ver ejemplo](06-for-through-y-to.md).
- **Un `@while` que no termina.** *Síntoma:* la compilación no acaba; LearnWeb la corta a los 5 segundos con «Compilation took longer than 5s…», y en la terminal el compilador se queda colgado. *Causa:* la variable de la condición no cambia (o cambia en la dirección equivocada). *Solución:* asegúrate de que cada vuelta acerca la condición a falso; añade una guarda con `@error` si el bucle es delicado, o usa `@each`/`@for`. [Ver ejemplo](08-while-sin-progreso.md).

## Resumen

- `@if` / `@else if` / `@else` deciden qué se compila; se usan sobre todo dentro de funciones y mixins.
- Solo `false` y `null` son falsos: `0` y `""` son verdaderos. Compara de forma explícita.
- La función `if($c, a, b)` está deprecada: `@if`/`@else` o `if(sass($c): a; else: b)`.
- `@each` recorre listas (con desestructuración) y mapas (`$key, $value`); es el bucle más útil.
- `@for … through` incluye el final; `@for … to`, no.
- `@while` necesita progreso en cada vuelta; LearnWeb detiene un compilador colgado a los 5 segundos.
- Dentro del control de flujo, asignar a una variable existente la modifica.
- Mapas + bucles anidados + interpolación = familias de clases generadas. Genera solo lo que uses.

## Para profundizar

- [Sass: Flow Control Rules](https://sass-lang.com/documentation/at-rules/control/)
- [Sass: Booleans and truthiness](https://sass-lang.com/documentation/values/booleans/#truthiness-and-falsiness)
- [Sass: deprecación de la función if()](https://sass-lang.com/d/if-function)
- [Bootstrap: Sass (mapas y bucles de la librería)](https://getbootstrap.com/docs/5.3/customize/sass/)
