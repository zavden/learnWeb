# Curvas de aceleración (easing)

## Por qué importa

Nada en el mundo real se mueve a velocidad constante: un cajón arranca despacio, coge velocidad y frena antes de cerrarse; una pelota acelera al caer y bota. Un movimiento a velocidad fija se ve mecánico, y uno que arranca o frena de golpe, brusco. La **curva de aceleración** (*easing* o *timing function*) es la propiedad que decide cómo se reparte el cambio a lo largo del tiempo: misma duración, mismo principio y mismo final, y una sensación completamente distinta.

En la lección de animation frames del capítulo de JavaScript escribiste una curva a mano (`easeOutCubic`) para mover una furgoneta. CSS trae las curvas hechas, y tres herramientas para dibujar las tuyas: `cubic-bezier()`, `steps()` y `linear()`. Sirven igual para las transiciones de la lección anterior (`transition-timing-function`) y para las animaciones de la siguiente (`animation-timing-function`).

## Tiempo frente a progreso

Una curva de aceleración es una función: recibe el **tiempo** transcurrido (de 0 a 1: la fracción de la duración) y devuelve el **progreso** del valor (de 0 a 1: la fracción del camino entre el inicio y el final). Con `linear`, el progreso es igual al tiempo; con las demás, no.

[[exercise:01-las-curvas-con-nombre.md]]

Los puntos claros del ejemplo son la misma animación **congelada** en cinco instantes, como las fotos de un estroboscopio: donde se juntan, la bola va despacio; donde se separan, rápido. Es una técnica (una animación en pausa con un retardo negativo) que se explica en la lección siguiente y que usarás mucho en este módulo: permite comparar curvas sin tener que seguir el movimiento con la vista.

| Curva | Equivale a | Cómo se mueve | Para qué |
|---|---|---|---|
| `linear` | `cubic-bezier(0, 0, 1, 1)` | velocidad constante | giros continuos, barras ligadas al tiempo, cambios de color |
| `ease` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | arranca rápido y frena mucho | el valor por defecto; vale para casi todo lo pequeño |
| `ease-in` | `cubic-bezier(0.42, 0, 1, 1)` | arranca despacio, acaba rápido | lo que **sale** de la pantalla |
| `ease-out` | `cubic-bezier(0, 0, 0.58, 1)` | arranca rápido, frena al llegar | lo que **entra** o responde a un clic |
| `ease-in-out` | `cubic-bezier(0.42, 0, 0.58, 1)` | despacio, rápido, despacio | lo que se desplaza de un sitio a otro de la pantalla |

## `cubic-bezier()`: los cuatro números

Las cinco curvas con nombre son casos de una sola función: `cubic-bezier(x1, y1, x2, y2)`. Dibuja una **curva de Bézier** en un gráfico con el tiempo en horizontal y el progreso en vertical. Los extremos son fijos (sale de (0, 0) y llega a (1, 1)), y los cuatro números son las coordenadas de los dos **puntos de control** que tiran de la curva, como imanes:

- `(x1, y1)` es **P1**: la dirección en la que sale la curva desde el principio.
- `(x2, y2)` es **P2**: la dirección desde la que llega al final.
- La **pendiente** de la curva en cada punto es la velocidad: inclinada = rápido, plana = despacio. Si el segmento P2–P3 es horizontal, el movimiento llega al final con velocidad cero: frena del todo.

[[exercise:02-cubic-bezier-explicada.md]]

Las `x` son tiempos, y tienen que estar entre 0 y 1: una curva que volviera atrás en el tiempo no sería una función. `cubic-bezier(1.2, 0, 0.5, 1)` es inválida, y como cualquier CSS inválido, la declaración entera se ignora en silencio: el elemento se queda con la curva que tuviera, normalmente `ease`, la de por defecto. Las `y`, en cambio, pueden salirse de [0, 1].

> **Desde Python:** para saber dónde está la bola a mitad del tiempo hay que resolver la curva al revés: buscar el parámetro `t` de la Bézier cuya `x` es el tiempo pedido, y leer su `y`. Con una bisección salen exactamente los píxeles del primer ejemplo:

```python
def cubic_bezier(x1, y1, x2, y2):
    def coord(a, b, t):              # una coordenada de la curva, con P0 = 0 y P3 = 1
        return 3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t ** 2 + t ** 3

    def timing(x):                   # x = tiempo; buscamos el t de la curva con esa x
        lo, hi = 0.0, 1.0
        for _ in range(50):          # bisección: la x de la curva siempre crece
            t = (lo + hi) / 2
            if coord(x1, x2, t) < x:
                lo = t
            else:
                hi = t
        return coord(y1, y2, t)      # y = progreso

    return timing

curves = {
    "linear": (0, 0, 1, 1),
    "ease": (0.25, 0.1, 0.25, 1),
    "ease-in": (0.42, 0, 1, 1),
    "ease-out": (0, 0, 0.58, 1),
    "ease-in-out": (0.42, 0, 0.58, 1),
}
for name, points in curves.items():
    progress = cubic_bezier(*points)(0.5)
    print(f"{name:<12} a mitad del tiempo → {progress:.3f} → {progress * 228:3.0f}px de 228")
```

```text
linear       a mitad del tiempo → 0.500 → 114px de 228
ease         a mitad del tiempo → 0.802 → 183px de 228
ease-in      a mitad del tiempo → 0.315 →  72px de 228
ease-out     a mitad del tiempo → 0.685 → 156px de 228
ease-in-out  a mitad del tiempo → 0.500 → 114px de 228
```

`ease` llega al 80 % del camino a mitad de tiempo: por eso, siendo el valor por defecto, se siente «rápido y con frenada larga».

## Pasarse y volver

Si una `y` es mayor que 1, la curva sube por encima del final y el valor **se pasa** antes de volver: un globo que crece un poco más de la cuenta, un interruptor que rebota contra el tope. Si es menor que 0, el valor **retrocede** antes de arrancar, como quien coge impulso.

[[exercise:03-pasarse-y-volver.md]]

`cubic-bezier(0.34, 1.56, 0.64, 1)` se pasa un 10 % (hasta 1.098, a los 57 % del tiempo). En un globo de 18px son 2px: se nota como vida, no como un salto. En un panel de 400px serían 40px, y eso ya es mareo. Usa los rebotes en cosas pequeñas y nunca en movimientos largos; con «reducir movimiento», el globo solo se funde.

## Una curva para entrar y otra para salir

En la lección anterior viste que manda la transición del estado de **llegada**. Usado a propósito, eso permite elegir una curva y una duración para cada sentido: la de la regla abierta se usa al abrir, y la de la regla base, al cerrar.

[[exercise:04-entrar-y-salir.md]]

La receta habitual de los sistemas de diseño:

- **Entrar**: desacelerar (`ease-out` o `cubic-bezier(0, 0, 0.2, 1)`). Lo que llega aparece rápido y se posa con suavidad donde lo vas a leer.
- **Salir**: acelerar (`ease-in` o `cubic-bezier(0.4, 0, 1, 1)`) y en menos tiempo. Lo que se va no necesita que lo sigas con la vista.
- **Moverse por la pantalla** de un sitio a otro: acelerar y frenar (`ease-in-out` o la curva `standard`, `cubic-bezier(0.2, 0, 0, 1)`).

## `steps()`: a saltos

`steps(n)` no es una curva: es una **escalera**. Parte la duración en `n` tramos iguales y en cada uno muestra un valor fijo, sin nada en medio. Sirve para relojes, contadores, el cursor de una máquina de escribir y las tiras de fotogramas (*sprites*) de los dibujos animados. Su segundo argumento dice dónde están los saltos, y el valor por defecto da una sorpresa:

| Escritura | Valores con `n = 4` | Nunca muestra |
|---|---|---|
| `steps(4)` = `steps(4, jump-end)` | 0, 1/4, 2/4, 3/4 | el final (solo al terminar, si el `fill-mode` lo conserva) |
| `steps(4, jump-start)` | 1/4, 2/4, 3/4, 1 | el principio |
| `steps(4, jump-none)` | 0, 1/3, 2/3, 1 | nada: incluye los dos extremos |
| `steps(4, jump-both)` | 1/5, 2/5, 3/5, 4/5 | ninguno de los dos extremos |

[[exercise:05-steps-y-sus-saltos.md]]

La regla para no fallar: si quieres ver `k` posiciones **incluidos el principio y el final**, escribe `steps(k, jump-none)`. Para una tira de fotogramas en una imagen (`background-position` de 0 a −100 %), el `jump-end` por defecto es justo lo correcto: la posición «−100 %» quedaría fuera de la imagen. `step-start` y `step-end` son `steps(1, jump-start)` y `steps(1, jump-end)`: un único salto, al principio o al final.

## `linear()`: muelles y rebotes

Una `cubic-bezier()` puede pasarse una vez, pero no oscilar ni botar varias veces. `linear()` (Chrome 113 y todos los navegadores actuales) acepta una **lista de valores de progreso** y los une con rectas; con suficientes puntos, dibuja cualquier curva. Sin porcentajes, los puntos se reparten a partes iguales en el tiempo; con un porcentaje detrás, el punto llega en ese momento.

```css
linear(0, 0.25, 1)                 /* tres puntos: en 0 %, 50 % y 100 % del tiempo */
linear(0, 0.25 75%, 1)             /* el 0.25 llega al 75 % del tiempo */
```

No confundas la función con la palabra: `linear` sola es velocidad constante, y es lo mismo que `linear(0, 1)`.

[[exercise:06-linear-para-muelles.md]]

Nadie escribe esos puntos a mano: se generan con un programa que simula la física y se pegan en el CSS.

> **Desde Python:** un muelle amortiguado tiene una fórmula conocida. Se evalúa en 17 instantes repartidos entre 0 y 1 y se imprime la lista; es exactamente el `--spring` del ejemplo:

```python
from math import exp, cos, sin, sqrt, pi

def spring(t, damping=0.5, frequency=3 * pi):
    """Posición de un muelle amortiguado que sale de 0 y se asienta en 1."""
    w = frequency * sqrt(1 - damping ** 2)
    decay = exp(-damping * frequency * t)
    return 1 - decay * (cos(w * t) + damping * frequency / w * sin(w * t))

points = [round(spring(i / 16), 3) for i in range(17)]
points[-1] = 1                       # que termine exactamente en 1
print(f"linear({', '.join(f'{p:g}' for p in points)})")
print("máximo:", max(points))
```

```text
linear(0, 0.14, 0.437, 0.745, 0.981, 1.117, 1.162, 1.146, 1.1, 1.049, 1.008, 0.983, 0.974, 0.975, 0.982, 0.991, 1)
máximo: 1.162
```

Con `damping` (amortiguación) más bajo, el muelle oscila más; con `frequency` más alta, oscila más deprisa. Hay generadores en línea que hacen lo mismo con controles deslizantes.

## Tokens de movimiento

En el ejemplo profesional «Tokens de movimiento» del módulo de Sass, las duraciones y las curvas vivían en mapas de Sass y se publicaban como custom properties. Lo que llega al navegador es CSS normal, y se puede escribir directamente: un puñado de custom properties en `:root` con nombre (`--duration-base`, `--ease-enter`…) que todos los componentes usan. Cambiar el ritmo de la interfaz entera es cambiar esas líneas.

[[exercise:07-tokens-de-movimiento.md]]

Este ejemplo afina la preferencia de movimiento reducido respecto al de Sass. Allí, con `reduce`, todas las duraciones pasaban a `1ms`: desaparecía el movimiento, pero también los fundidos. Aquí los tokens incluyen las **distancias** (cuánto sube una tarjeta, desde dónde entra un aviso) y la escala, y con `reduce` son las que pasan a cero. Los fundidos conservan su duración y su curva.

## Cómo verlo en DevTools

- **El editor de curvas.** En **Elements** → **Styles**, junto a cada `ease` o `cubic-bezier()` hay un pequeño icono de curva. Al pulsarlo se abre un editor con la curva dibujada, unos ajustes predefinidos y los puntos de control: arrástralos y el cambio se aplica en directo; el texto de la regla se actualiza con los números.
- **A cámara lenta.** El panel **Animations** (<kbd>⋮</kbd> → **More tools** → **Animations**) reproduce cada transición al 25 % o al 10 % de velocidad: con un rebote de 400 ms, es la única forma de verlo bien.

## Bestiario

- **La barra nunca llega a llena.** Síntoma: una animación con `steps(4)` de vacía a llena muestra 0, 1, 2 y 3 rayas, pero nunca 4 mientras dura (o la 4 aparece un instante y desaparece). Causa: `steps(n)` equivale a `steps(n, jump-end)`, que salta al final de cada tramo; el último valor solo llega cuando la animación ha terminado. Solución: `steps(5, jump-none)` para ver las cinco posiciones, de 0 a 4. → [ver ejemplo](05-steps-y-sus-saltos.md)
- **La curva personalizada no hace nada.** Síntoma: has escrito una `cubic-bezier()` y la animación sigue con la curva por defecto. Causa: alguna `x` está fuera de [0, 1] y la declaración es inválida. Solución: las `x` entre 0 y 1; para pasarse o retroceder, usa las `y`. → [ver ejemplo](02-cubic-bezier-explicada.md)

## Resumen

- Una curva de aceleración convierte el tiempo transcurrido (0 → 1) en progreso del valor (0 → 1); la duración y los extremos no cambian.
- `ease` (por defecto), `ease-in` (para salir), `ease-out` (para entrar), `ease-in-out` (para moverse) y `linear` son atajos de `cubic-bezier()`.
- En `cubic-bezier(x1, y1, x2, y2)`, los números son los dos puntos de control; las `x` entre 0 y 1, las `y` libres (por encima de 1, el valor se pasa y vuelve).
- La transición del estado de llegada decide la curva: una para entrar y otra para salir.
- `steps(n)` va a saltos; el `jump-end` por defecto nunca muestra el final durante la animación: `steps(k, jump-none)` muestra `k` posiciones, extremos incluidos.
- `linear()` une una lista de puntos con rectas: muelles y rebotes generados con un programa.
- Tokens de movimiento: duraciones, curvas y distancias con nombre en `:root`; con `reduce`, las distancias a cero y los fundidos intactos.

## Para profundizar

- [MDN: easing-function](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function)
- [MDN: steps()](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/steps)
- [Chrome for Developers: Create complex animation curves in CSS with the linear() easing function](https://developer.chrome.com/docs/css-ui/css-linear-easing-function)
- [Josh W. Comeau: Understanding Easing and Cubic Bézier Curves](https://www.joshwcomeau.com/animation/cubic-bezier/)
- [Especificación: CSS Easing Functions Level 2](https://www.w3.org/TR/css-easing-2/)
