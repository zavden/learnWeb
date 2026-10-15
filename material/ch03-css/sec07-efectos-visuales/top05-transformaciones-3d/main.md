# Transformaciones 3D

## Por qué importa

Las transformaciones de la lección anterior ocurren en el plano de la pantalla. CSS tiene también una tercera dimensión: un eje **z** que sale de la pantalla hacia ti. Con él se hacen tarjetas que se voltean para enseñar su reverso, cubos, carruseles en círculo y efectos de inclinación que dan profundidad a una foto.

Esta lección tiene otro interés para el objetivo del curso. Las ideas que verás aquí (proyectar en perspectiva, ordenar por profundidad, no dibujar las caras que dan la espalda, componer matrices de 4 × 4) son exactamente las que programarás a mano en el capítulo de gráficos en la GPU con WebGL y WebGPU. CSS te las da hechas: es un buen sitio para entenderlas antes de escribirlas.

## El eje z y las funciones 3D

En CSS, el eje x va hacia la derecha, el y **hacia abajo** y el z **hacia ti**. Una caja que se mueve con `translateZ(50px)` se acerca 50px a tus ojos; con `translateZ(-50px)`, se aleja. Las funciones 3D son las de la lección anterior con un eje más:

| Función | Qué hace |
|---|---|
| `translateZ(z)`, `translate3d(x, y, z)` | acerca o aleja (y mueve) |
| `rotateX(a)` | gira alrededor del eje horizontal: como una persiana que se abre |
| `rotateY(a)` | gira alrededor del eje vertical: como una puerta |
| `rotateZ(a)` | gira en el plano de la pantalla: es el `rotate()` de siempre |
| `rotate3d(x, y, z, a)` | gira alrededor de un eje cualquiera |
| `scaleZ(s)`, `scale3d(x, y, z)` | escala en profundidad (solo se nota en los hijos en 3D) |
| `perspective(d)` | la perspectiva de un solo elemento (ver más abajo) |
| `matrix3d(…)` | cualquier transformación 3D: 16 números |

Las propiedades sueltas también aceptan tres ejes: `translate: 0 0 50px`, `rotate: y 45deg`, `scale: 1 1 2`.

## La perspectiva

Sin más, el navegador dibuja el 3D **en paralelo**: lo que se acerca no crece y lo que se aleja no encoge. Una caja con `rotateY(50deg)` solo parece más estrecha. Para ver profundidad hace falta un **ojo**, y eso es la propiedad `perspective`: la distancia entre el ojo y la pantalla, que se pone en el **contenedor** de lo que se transforma.

[[exercise:01-perspectiva.md]]

Cuanto **menor** es la distancia, más exagerado es el efecto, como una foto hecha con un gran angular muy cerca del objeto: entre `800px` y `1200px` da una profundidad natural; por debajo de `300px`, dramática. `perspective-origin` coloca el ojo: por defecto, frente al centro del contenedor.

> **Desde Python:** la proyección en perspectiva es una regla de tres. Un punto a una profundidad `z` se ve escalado por `d / (d − z)`, donde `d` es la `perspective`. En el ejemplo, el borde izquierdo de la estampa (110px de ancho, girada 50°) se acerca 55 × sin 50° ≈ 42px:

```python
def projected_scale(perspective, z):
    return perspective / (perspective - z)

for z in (42, 0, -80):
    for d in (800, 250):
        print(f"perspective {d}px, z = {z:>4}px → escala {projected_scale(d, z):.2f}")
```

```text
perspective 800px, z =   42px → escala 1.06
perspective 250px, z =   42px → escala 1.20
perspective 800px, z =    0px → escala 1.00
perspective 250px, z =    0px → escala 1.00
perspective 800px, z =  -80px → escala 0.91
perspective 250px, z =  -80px → escala 0.76
```

Con el ojo a 250px, el borde que se acerca se ve un 20 % más grande; a 800px, solo un 6 %. Esta división entre la distancia es la misma que hará el *vertex shader* en WebGL.

### ¿En el padre o en cada elemento?

La perspectiva se puede escribir de dos formas, y no son equivalentes:

- La **propiedad** `perspective: 400px`, en el contenedor: un solo ojo para todos los hijos. Es una escena: cada hijo se ve desde un ángulo distinto según dónde esté, como en una foto.
- La **función** `perspective(400px)`, dentro del `transform` de cada elemento: cada uno se proyecta desde un ojo situado frente a su propio centro. Sirve para un elemento suelto; en una fila, todos se ven idénticos.

[[exercise:02-donde-va-la-perspectiva.md]]

La función tiene una trampa más: como cualquier función de la lista, solo afecta a lo que viene **detrás** de ella. `rotateY(45deg) perspective(400px)` no tiene perspectiva; tiene que ser `perspective(400px) rotateY(45deg)`.

## `preserve-3d`: un espacio compartido

Por defecto, cada elemento es **plano**: si sus hijos tienen transformaciones 3D, se dibujan aplastados contra su plano, como pegatinas, y después el elemento se transforma entero. Para construir un objeto con varias caras hace falta que los hijos vivan en el **mismo espacio 3D** que su padre, y eso lo dice `transform-style: preserve-3d` en el padre.

Un cubo es el ejemplo clásico: seis caras, cada una girada hacia su lado y adelantada media arista con `translateZ()`, dentro de un elemento con `preserve-3d` que gira el conjunto.

[[exercise:03-un-cubo.md]]

Fíjate en el orden de cada cara: `rotateY(90deg) translateZ(50px)` gira primero la cara (y su eje z) y después la adelanta por ese eje girado. Es la regla de la lección anterior: cada función mueve los ejes para la siguiente.

## `backface-visibility`: las dos caras de una tarjeta

Toda caja tiene una **parte de atrás**: si la giras 180°, ves su contenido en espejo. `backface-visibility: hidden` oculta un elemento cuando te da la espalda. Con eso se hace la tarjeta que se voltea:

1. Un contenedor con `perspective`.
2. La tarjeta, con `preserve-3d`, es la que gira.
3. Dos caras, una encima de la otra, con `backface-visibility: hidden`.
4. La cara trasera empieza girada 180°: de espaldas y, por tanto, oculta. Cuando la tarjeta gira 180°, la delantera queda de espaldas y la trasera, de frente.

[[exercise:04-tarjeta-que-se-voltea.md]]

Ocultar con `backface-visibility` no saca nada del documento: un lector de pantalla lee las dos caras, y un enlace de la cara oculta sigue recibiendo el foco con el teclado. El ejemplo lo aprovecha: con `:focus-within`, la tarjeta se voltea cuando el foco entra en ella. Una tarjeta que solo se voltea con `:hover` no funciona en un móvil ni con el teclado; en el capítulo de JavaScript la harás con un botón que cambia una clase.

## Lo que aplana el 3D

`preserve-3d` tiene enemigos. Hay propiedades que obligan al navegador a pintar el elemento como un **grupo plano**, para poder recortarlo, filtrarlo o hacerlo transparente como un todo; la especificación las llama propiedades de **agrupación**. Si una de ellas está en el elemento con `preserve-3d`, el navegador lo trata como `flat`: los hijos se aplastan contra su plano antes de girarlo.

[[exercise:05-preserve-3d-se-aplana.md]]

| Propiedad | Valores que aplanan |
|---|---|
| `overflow` | `hidden`, `scroll`, `auto` |
| `opacity` | menor que `1` |
| `filter` | distinto de `none` |
| `clip-path`, `mask` | distinto de `none` |
| `mix-blend-mode` | distinto de `normal` |
| `isolation` | `isolate` |

Son casi las mismas que creaban un contexto de apilamiento en la lección de filtros, y por la misma razón: pintar como grupo. La solución es ponerlas en las **caras**, que no tienen hijos en 3D (un `border-radius` con `overflow: hidden` en cada cara, no en la tarjeta). El caso más traicionero es `overflow: hidden` para redondear las esquinas de una tarjeta que se voltea.

## En 3D manda la profundidad

Dentro de un espacio 3D compartido, el navegador no pinta en el orden del HTML ni según el `z-index`: **ordena por profundidad**, como haría una tarjeta gráfica con su búfer de profundidad. Lo que está más cerca tapa a lo que está más lejos, y si dos planos se cruzan, el navegador los corta por la línea de intersección. El `z-index` solo desempata entre planos a la misma distancia.

[[exercise:06-en-3d-manda-la-profundidad.md]]

Dos consecuencias prácticas:

- Para traer algo al frente dentro de una escena 3D, `translateZ()`, no `z-index`.
- El **fondo** del propio elemento con `preserve-3d` es un plano más, en z = 0: todo lo que pongas detrás (`translateZ` negativo) queda tapado por él. Si la escena necesita un fondo, ponlo en un contenedor exterior, fuera del espacio 3D.

## `matrix3d()`

Como en 2D, el navegador guarda cualquier transformación 3D como una matriz, ahora de 4 × 4: `matrix3d()` con 16 números, en orden de columnas. Las tres primeras filas y columnas giran y escalan, la cuarta columna desplaza, y la cuarta **fila** es la que hace la perspectiva: `perspective(d)` es la identidad con un `−1/d` en esa fila, que hace que la coordenada `w` dependa de `z`. Al dividir entre `w` sale el `d / (d − z)` del ejemplo de Python. En cuanto un elemento tiene una transformación 3D, `getComputedStyle()` devuelve un `matrix3d(…)`.

Son las mismas matrices de 4 × 4 de modelo, vista y proyección que usarás en WebGL; allí las multiplicarás tú, con una librería o a mano, y las pasarás a la GPU.

## Rendimiento y movimiento

Las transformaciones 3D las hace la tarjeta gráfica: un elemento en 3D se pinta una vez en una capa y la GPU la proyecta, lo que las hace muy baratas de animar (módulo de animación). Dos cuidados:

- **No conviertas toda la página en 3D.** Cada elemento en un espacio 3D es una capa en la memoria de la GPU.
- **Movimiento y mareo.** Los giros y los acercamientos grandes pueden marear a personas con trastornos vestibulares. Los efectos de este módulo son estáticos; cuando los animes, respetarás la preferencia `prefers-reduced-motion`, que verás en el módulo de diseño responsive.

## Cómo verlo en DevTools

- **Las capas.** En el menú ⋮ → **More tools** → **Layers**, una vista 3D de las capas que la GPU compone; puedes girarla con el ratón para ver la escena «desde un lado».
- **Los ángulos.** Como en 2D, junto a cada ángulo de `rotateX()` o `rotateY()` hay un reloj para girarlo en directo.
- **La matriz.** En **Computed**, `transform` aparece como `matrix3d(…)`.

## Bestiario

- **La fila de paneles no parece una escena.** Síntoma: varios elementos girados en 3D se ven idénticos, o planos. Causa: la función `perspective()` da a cada uno su propio ojo, y escrita después del giro no hace nada. Solución: la propiedad `perspective` en el contenedor, o la función la primera de la lista. → [ver ejemplo](02-donde-va-la-perspectiva.md)
- **El cubo se aplasta.** Síntoma: un objeto con `preserve-3d` se ve como una tarjeta inclinada: las caras laterales desaparecen. Causa: `overflow: hidden`, `opacity`, `filter` o `clip-path` en el elemento con `preserve-3d` lo obligan a ser plano. Solución: esas propiedades en las caras, no en el contenedor 3D. → [ver ejemplo](05-preserve-3d-se-aplana.md)

## Resumen

- El eje z sale de la pantalla hacia ti; `rotateX()`, `rotateY()` y `translateZ()` trabajan en 3D.
- Sin `perspective` no hay profundidad; la propiedad, en el contenedor, da un ojo común a toda la escena, y la función, uno por elemento (y solo si va la primera).
- La proyección escala cada punto por `d / (d − z)`: con el ojo más cerca, el efecto es mayor.
- `transform-style: preserve-3d` hace que los hijos compartan el espacio 3D; `overflow`, `opacity`, `filter`, `clip-path` y compañía lo aplanan.
- `backface-visibility: hidden` oculta la cara que da la espalda: es la base de las tarjetas que se voltean, cuyas dos caras siguen en el documento.
- En un espacio 3D manda la profundidad, no el `z-index`, y los planos que se cruzan se cortan.

## Para profundizar

- [MDN: Usar transformaciones CSS (con la parte 3D)](https://developer.mozilla.org/es/docs/Web/CSS/CSS_transforms/Using_CSS_transforms)
- [MDN: perspective](https://developer.mozilla.org/es/docs/Web/CSS/perspective)
- [MDN: backface-visibility](https://developer.mozilla.org/es/docs/Web/CSS/backface-visibility)
- [David DeSandro: Intro to CSS 3D transforms](https://3dtransforms.desandro.com/)
- [Especificación: CSS Transforms Level 2](https://www.w3.org/TR/css-transforms-2/)
