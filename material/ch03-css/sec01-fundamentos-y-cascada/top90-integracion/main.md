# Integración: fundamentos y cascada

## Qué vas a practicar

En las lecciones de este módulo viste cada pieza por separado: la sintaxis, los selectores, las pseudoclases y los pseudoelementos, la especificidad, la cascada con sus capas, la herencia, las unidades, el color y las custom properties. En un proyecto real nunca aparecen solas. Una tarjeta usa a la vez variables, capas, `:has()` y `color-mix()`; un error en un botón puede deberse al origen, a la capa, a la especificidad o a una variable inválida.

Cada ejemplo de esta página combina varias de esas ideas. Antes de leer el código, mira la vista previa y pregúntate **qué regla gana en cada propiedad y por qué**. Al final hay tres ejercicios con su solución.

> En estos ejemplos aparecen, de forma básica, algunas propiedades de módulos posteriores (`padding`, `margin`, `border`, `display: block`, `line-height`…). No influyen en lo que se practica aquí: la cascada, los selectores y los valores.

## Componentes con capas y variables

Tres tarjetas con un mismo componente. Combina **capas** (`@layer base, components, utilities`), **custom properties** como interfaz del componente (las variantes solo cambian `--card-accent`), **`color-mix()`** para derivar los tonos del borde y del fondo, y **`:has()`** para que la tarjeta reaccione a su contenido. La clave está en la tercera tarjeta: una utilidad de una sola clase gana a reglas más específicas solo por estar en una capa posterior, sin un solo `!important`.

[[exercise:01-tarjetas-con-capas-y-variables.md]]

## Una tabla sin una sola clase

Todo el estilo de esta tabla sale de **selectores**: `:nth-child(even)` para las bandas, `:hover` (con la misma especificidad y escrito después, para que gane a la banda), **selectores de atributo** que asignan una variable por estado, un **`::before`** con texto alternativo vacío para el punto de color y **`:empty::before`** para la celda sin importe. Cuando el HTML no se puede tocar, o ya describe bien los datos, esta es la forma de trabajar.

[[exercise:02-tabla-con-selectores.md]]

## Un formulario que reacciona a su estado

Combina **herencia** (`font: inherit` en los controles), **pseudoclases de estado** (`:focus-visible`, `:user-invalid`), **`:has()`** para mostrar el mensaje de error de un campo y avisar desde el `fieldset`, y **pseudoelementos** generados con `label:has(+ input:required)::after`. Escribe un correo incorrecto, sal del campo y mira cuántas reglas se activan a la vez sin una línea de JavaScript.

[[exercise:03-formulario-con-estados.md]]

## Tema y color de acento con :has()

Los controles de formulario se convierten en interruptores de diseño. Cada radio marcado cambia `--hue` y la casilla de tema oscuro cambia la luminosidad, todo con **`:root:has(…:checked)`**. Como todos los colores se calculan con **`oklch()`** a partir de esas variables, el contraste se mantiene con cualquier combinación. `color-scheme: dark` hace que las casillas y los radios también se vean oscuros.

[[exercise:04-tema-y-acento-con-has.md]]

## Una escala tipográfica fluida

Las **unidades y funciones** al servicio del texto: una escala de tamaños guardada en **custom properties**, cada una con **`clamp()`** que mezcla `rem` y `vw`; márgenes de los títulos en **`em`**, para que sean proporcionales a cada título; ancho de lectura en **`ch`**; y estilos base con **`:where()`**, de especificidad cero, que una regla posterior corrige sin esfuerzo.

[[exercise:05-escala-tipografica-fluida.md]]

## Documentación con :target y contadores

Una página de documentación que se navega sola: **contadores** numeran las secciones, **`:target`** resalta la sección enlazada (prueba el índice y el enlace interno del consejo), un **selector de atributo** marca los enlaces externos con una flecha accesible y **`[data-callout]`** dibuja avisos cuyo color sale de una variable. Ninguna regla conoce el contenido concreto.

[[exercise:06-documentacion-con-target.md]]

## Depurar la cascada de principio a fin

El ejemplo más importante del módulo. Un botón recibe declaraciones de **cuatro sitios**: la hoja del navegador, la capa `base`, la capa `components` y una «librería» pegada sin capa. La tabla del ejemplo recorre cada propiedad con los criterios de la cascada en orden: origen, capa, especificidad. La versión arreglada mete la librería en su propia **capa**, declarada la primera. Es el razonamiento que repetirás cada vez que una declaración aparezca tachada en DevTools.

[[exercise:07-depurar-la-cascada.md]]

## Ejercicios

Cada ejercicio tiene el HTML bloqueado: solo se trabaja en el CSS, en los puntos marcados con `TODO`. Las pistas orientan sin dar la respuesta; la solución está enlazada desde el propio ejercicio.

**Arregla la cascada de la alerta.** Tres errores clásicos del módulo en un solo componente: un orden de capas sin declarar, un id que pesa demasiado y una variable que no se convierte en longitud.

[[exercise:08-ej-arregla-la-cascada.md]]

**Convierte los colores en un tema.** Pasa unos colores escritos a mano a custom properties y añade un tema oscuro que solo redefine variables.

[[exercise:09-ej-tema-con-variables.md]]

**Da estilo sin añadir clases.** Combinadores, selectores de atributo, pseudoclases estructurales y pseudoelementos sobre un HTML que no puedes modificar.

[[exercise:10-ej-selectores-sin-clases.md]]

## Lo que conviene llevarse

- Ante cualquier conflicto, recorre la cascada en orden: origen e importancia, estilos en línea, capas, especificidad, orden de aparición. La herencia solo entra si nadie elige al elemento.
- Las capas ordenan el CSS por intención (base, componentes, utilidades) y hacen innecesario `!important`.
- Las custom properties separan los **datos** (colores, tamaños, tonos) de las **reglas**: un tema o una variante solo cambian datos.
- Mantén la especificidad baja (`:where()`, clases, selectores cortos) y los estados en pseudoclases (`:has()`, `:checked`, `:user-invalid`).
- Los errores de este módulo son silenciosos: busca en DevTools las declaraciones tachadas y los valores computados.
