# Tipografía y espacios fluidos

## Por qué importa

Un título de 48px queda perfecto en un portátil y ocupa media pantalla en un móvil; un texto de 16px se lee bien en el móvil y parece diminuto en un monitor de 27 pulgadas. Con media queries, los tamaños cambian **a saltos**: 32px hasta 640px de ventana, 48px desde ahí. La tipografía **fluida** cambia de forma continua: crece en línea recta con la ventana, entre dos límites.

Ya la has visto de pasada: `clamp(1.25rem, 6vw, 2.5rem)` en la lección de unidades y una escala con `clamp()` en la integración del primer módulo. Allí los números eran a ojo. Esta lección enseña a **calcularlos** (qué tamaño quieres con qué ventana), a construir una escala tipográfica y unos espacios que crecen juntos, y las tres trampas de accesibilidad que tiene la técnica. Y cumple la promesa del módulo de tipografía: la portada de la escuela de panadería, con su escala, ahora fluida.

## De saltos a una recta

Con una media query, el tamaño da un salto en el breakpoint. Con `clamp()`, el tamaño sigue una recta entre dos puntos y se queda quieto fuera de ellos:

```text
 letra
  20px ┤                              ●━━━━━━━━━━  máximo de clamp()
       │                         ╱
  18px ┤                    ╱
       │               ╱
  16px ┤━━━━━━━━━●╱                                mínimo de clamp()
       └─────────┬────────────────────┬──────────  ventana
               320px                1200px
```

Lo que define la recta son dos puntos que decides tú: **16px de letra con una ventana de 320px** (un móvil pequeño) y **20px con una de 1200px** (un portátil). Entre medias, la letra crece en proporción; por debajo de 320px se queda en 16, y por encima de 1200px, en 20.

## La cuenta, paso a paso

Una recta es `letra = corte + pendiente × ventana`, como la `y = b + m·x` del colegio. Hay que encontrar la pendiente y el corte, y escribirlos en unidades de CSS.

1. **Pendiente**: cuánto crece la letra por cada píxel de ventana. Sube 20 − 16 = 4px mientras la ventana crece 1200 − 320 = 880px: `4 / 880 = 0.004545` px de letra por px de ventana.
2. **La pendiente en `vw`**: `1vw` es el 1 % del ancho de la ventana, así que «0.004545 × ventana» es lo mismo que «0.004545 × 100 vw» = **`0.4545vw`**.
3. **Corte**: la letra que daría la recta con una ventana de 0px. Se despeja con uno de los puntos: `16 − 0.004545 × 320 = 16 − 1.4545 = 14.5455px`, que en `rem` (÷ 16) es **`0.9091rem`**.
4. **Comprobación**: con 320px, `14.5455 + 0.004545 × 320 = 16` ✓. Con 1200px, `14.5455 + 0.004545 × 1200 = 20` ✓.
5. **Los límites**, con `clamp(mínimo, preferido, máximo)`: `clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem)`.

El valor preferido es un `calc()` implícito: dentro de `clamp()` (y de `min()` y `max()`) se puede sumar directamente. Así queda la recta a distintos anchos:

| Ventana | Preferido (`0.9091rem + 0.4545vw`) | Usado (con `clamp()`) |
|---|---|---|
| 320px | 16px | 16px |
| 480px (esta página) | 16.73px | 16.73px |
| 760px | 18px | 18px |
| 1200px | 20px | 20px |
| 1920px | 23.27px | **20px** |
| 2560px | 26.18px | **20px** |

Sin `clamp()`, un `font-size: calc(0.9091rem + 0.4545vw)` seguiría creciendo en un monitor grande, y en una pantalla de televisión el texto sería enorme. El ejemplo lee del navegador el valor usado para el ancho actual:

[[exercise:01-la-recta-del-clamp.md]]

Fíjate en las unidades de cada parte, porque no son intercambiables: el mínimo, el corte y el máximo van en **`rem`**, y solo la pendiente en **`vw`**. La parte en `rem` sigue al tamaño de letra que el usuario haya elegido y al zoom; la parte en `vw` solo sigue a la ventana. Lo verás en las trampas, al final.

> **Desde Python:** la cuenta es la misma siempre, así que merece una función. Esta imprime el `clamp()` del texto y, con un bucle, los pasos de la escala modular de la sección siguiente (en el capítulo de Sass escribirás esta misma función en Sass, y el compilador hará las cuentas):

```python
def rem(px):
    """Pasa px a rem (16px por rem) y quita los ceros sobrantes."""
    return f"{px / 16:.4f}".rstrip("0").rstrip(".") + "rem"

def fluid(min_px, max_px, from_px=320, to_px=1200):
    """clamp() que vale min_px con una ventana de from_px y max_px con una de to_px."""
    slope = (max_px - min_px) / (to_px - from_px)      # px de letra por px de ventana
    intercept = min_px - slope * from_px               # la letra con una ventana de 0px
    vw = f"{slope * 100:.4f}".rstrip("0").rstrip(".") + "vw"
    return f"clamp({rem(min_px)}, {rem(intercept)} + {vw}, {rem(max_px)})"

print("texto:", fluid(16, 20))

# Escala modular: razón 1,2 en el móvil y 1,25 en el escritorio.
for step in range(-1, 5):
    small = 16 * 1.2 ** step
    large = 20 * 1.25 ** step
    print(f"--step-{step}: {fluid(small, large)};   /* {small:.1f} → {large:.1f}px */")
```

```text
texto: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem)
--step--1: clamp(0.8333rem, 0.7727rem + 0.303vw, 1rem);   /* 13.3 → 16.0px */
--step-0: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);   /* 16.0 → 20.0px */
--step-1: clamp(1.2rem, 1.0682rem + 0.6591vw, 1.5625rem);   /* 19.2 → 25.0px */
--step-2: clamp(1.44rem, 1.2534rem + 0.933vw, 1.9531rem);   /* 23.0 → 31.2px */
--step-3: clamp(1.728rem, 1.4686rem + 1.2971vw, 2.4414rem);   /* 27.6 → 39.1px */
--step-4: clamp(2.0736rem, 1.7179rem + 1.7785vw, 3.0518rem);   /* 33.2 → 48.8px */
```

## Escalas modulares fluidas

En la portada de la escuela de panadería del módulo de tipografía viste una **escala modular**: un tamaño base y una razón, y cada paso multiplica el anterior por la razón (`paso n = base × razónⁿ`). La razón decide el contraste entre los niveles. Muchas tienen nombre de intervalo musical, porque la idea viene de las proporciones de las notas:

| Razón | Nombre | Para |
|---|---|---|
| 1.125 | segunda mayor | interfaces densas, paneles |
| 1.2 | tercera menor | móviles, textos largos |
| 1.25 | tercera mayor | uso general |
| 1.333 | cuarta justa | portadas, titulares con presencia |
| 1.5 | quinta justa | carteles, páginas de presentación |

Una sola razón no sirve para todas las pantallas: con 1.25, el quinto paso de una base de 20px mide 61px, demasiado para un móvil; con 1.2 en un monitor grande, la jerarquía se queda plana. La solución es tener **dos escalas**, una para la ventana pequeña (base 16px, razón 1.2) y otra para la grande (base 20px, razón 1.25), y hacer que cada paso sea la recta entre su versión pequeña y su versión grande. Es lo que calcula el bucle de Python. El efecto: los títulos crecen mucho más que el texto, y la jerarquía se acentúa cuando hay sitio.

[[exercise:02-escala-modular-fluida.md]]

Herramientas como **Utopia** (utopia.fyi) generan estas escalas y sus tokens; ahora sabes qué cuentas hacen.

## Espacios fluidos

La misma recta sirve para los márgenes, los rellenos y los `gap`. Si el texto crece un 25 % entre el móvil y el escritorio, los espacios deberían crecer con él para mantener las proporciones. Se definen igual, como tokens: `--space-s` de 16 a 20px, `--space-m` de 24 a 30px, y así.

Para los espacios grandes (el relleno de una sección, el hueco entre bloques de una página) se usan **pares**: un token que va del mínimo de un paso al máximo de otro, por ejemplo de `s` en el móvil (16px) a `l` en el escritorio (40px). En el móvil, cada píxel de pantalla vale oro y la sección respira poco; en un monitor, respira mucho. La regla de fondo: los espacios entre cosas relacionadas crecen poco, los que separan bloques crecen más.

[[exercise:03-espacios-fluidos.md]]

## Una portada sin media queries

Con una escala y unos espacios fluidos, muchos componentes ya no necesitan ninguna media query para el tamaño de sus letras y sus rellenos. Es la portada de la escuela de panadería del módulo de tipografía, con sus tamaños ahora fluidos:

[[exercise:04-portada-fluida.md]]

La tipografía fluida no sustituye a las media queries: un layout que cambia de estructura sigue necesitándolas. Pero los tamaños, que antes cambiaban a saltos en cada breakpoint, ahora cambian solos.

## Fluida y accesible

La tipografía fluida tiene mala fama en accesibilidad, y con razón: escrita sin cuidado, rompe dos ajustes que usa la gente con baja visión. Escrita como en esta lección, no rompe nada.

### El zoom: nunca solo `vw`

El criterio 1.4.4 de las pautas WCAG (*Resize text*) pide que el texto pueda ampliarse hasta el **200 %** sin perder contenido. El zoom del navegador (<kbd>⌘</kbd> <kbd>+</kbd>) hace más grande cada píxel CSS, así que en la ventana caben menos: a 200 %, una ventana de 1000px mide 500px CSS. Un texto medido solo en `vw` se encoge en píxeles CSS exactamente en la misma proporción en que cada píxel crece, y en la pantalla **no cambia de tamaño**: el zoom no le hace nada.

[[exercise:05-solo-vw-rompe-el-zoom.md]]

La parte en `rem` del valor preferido sí crece con el zoom, y el mínimo en `rem` garantiza que, con un zoom grande, el texto acabe creciendo del todo. ¿Cuánto margen hay que dejar? Los navegadores amplían hasta el 500 %. Con un zoom así, la ventana mide tan poco que `clamp()` se queda en su mínimo, que en la pantalla mide 5 veces el mínimo; para que eso sea al menos el doble del tamaño original (que en el peor caso es el máximo), basta con que **el máximo no pase de 2,5 veces el mínimo**. En la escala de esta lección, el paso 4 va de 33 a 49px: 1,5 veces.

### La letra del usuario: `rem`, no `px`

Además del zoom, los navegadores permiten elegir el **tamaño de letra** por defecto (en Chrome: Settings → Appearance → Font size). Como viste en la lección de unidades, `rem` lo sigue y `px` no. Un `clamp()` escrito en píxeles ignora esa preferencia por completo:

[[exercise:06-clamp-en-px-ignora-la-letra-del-usuario.md]]

### Porcentajes: ¿de qué?

Un último despiste: en `font-size`, un porcentaje es del tamaño de letra del **padre**, no del ancho. `1rem + 3%` no tiene nada de fluido.

[[exercise:07-el-porcentaje-no-es-el-ancho.md]]

### La ventana no es la caja

`vw` mide la ventana entera. Un título fluido dentro de una tarjeta estrecha (una columna lateral, una rejilla de cuatro columnas) mide lo mismo que en la columna principal, porque la ventana es la misma. Para que el texto se adapte a su **caja**, existen las unidades de contenedor (`cqi`), en la lección siguiente.

## Cómo verlo en DevTools

- **Computed**: `font-size` aparece ya resuelto en píxeles para el ancho actual. Cambia el ancho en el modo dispositivo (**Responsive**) y mira cómo cambia.
- **Styles**: el `clamp()` aparece tal cual lo escribiste; pasa el ratón por encima de una custom property (`var(--step-4)`) para ver su valor.
- **Zoom**: en una pestaña abierta con ↗, prueba <kbd>⌘</kbd> <kbd>+</kbd> hasta 200 % y comprueba que el texto crece. Es la prueba más rápida de 1.4.4.
- **Letra grande**: cambia el tamaño de letra en los ajustes de Chrome y recarga. Todo lo que debía crecer, debe crecer.

## Bestiario

- **El texto crece sin fin en monitores grandes.** Síntoma: en una pantalla de 2560px, el texto de un `calc(1rem + 1vw)` mide 42px. Causa: una recta sin límites sigue creciendo. Solución: `clamp()` con un máximo. → [ver ejemplo](01-la-recta-del-clamp.md)
- **El zoom no agranda el texto.** Síntoma: con <kbd>⌘</kbd> <kbd>+</kbd> al 200 %, el texto mide lo mismo en la pantalla. Causa: un tamaño solo en `vw` se encoge en píxeles CSS al mismo ritmo al que el zoom los agranda. Solución: `clamp()` con mínimo, corte y máximo en `rem`, y el máximo como mucho 2,5 veces el mínimo. → [ver ejemplo](05-solo-vw-rompe-el-zoom.md)
- **La letra grande del usuario no llega.** Síntoma: quien eligió letra grande en su navegador ve el texto igual que todos. Causa: un `clamp()` en `px` no depende del tamaño de letra del usuario. Solución: todo en `rem`, salvo la pendiente en `vw`. → [ver ejemplo](06-clamp-en-px-ignora-la-letra-del-usuario.md)
- **El título «fluido» no cambia nunca.** Síntoma: `clamp(1.25rem, 1rem + 3%, 2.5rem)` se queda en su mínimo a cualquier ancho. Causa: en `font-size`, el porcentaje es del tamaño de letra del padre. Solución: `vw` para lo que debe depender de la ventana. → [ver ejemplo](07-el-porcentaje-no-es-el-ancho.md)

## Resumen

- Fluido = una recta entre dos puntos (letra pequeña con ventana pequeña, letra grande con ventana grande), con límites: `clamp(mínimo, corte + pendiente·vw, máximo)`.
- Pendiente = diferencia de letra / diferencia de ventana; en `vw`, × 100. Corte = letra mínima − pendiente × ventana mínima.
- Mínimo, corte y máximo en `rem` (siguen al zoom y a la letra del usuario); solo la pendiente en `vw`.
- Escala modular fluida: una escala para el móvil (razón menor), otra para el escritorio (razón mayor), y cada paso es la recta entre las dos.
- Los espacios usan la misma recta; los pares (`s-l`) crecen más y sirven para separar bloques.
- Nunca solo `vw`; el máximo, como mucho 2,5 veces el mínimo; los porcentajes de `font-size` son del padre.

## Para profundizar

- [Utopia: tipografía y espacios fluidos](https://utopia.fyi/)
- [Smashing Magazine: Addressing Accessibility Concerns With Using Fluid Type (Maxwell Barvian)](https://www.smashingmagazine.com/2023/11/addressing-accessibility-concerns-fluid-type/)
- [web.dev: Typography (Learn Design)](https://web.dev/learn/design/typography)
- [MDN: clamp()](https://developer.mozilla.org/es/docs/Web/CSS/clamp)
- [WCAG 2.2: 1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)
