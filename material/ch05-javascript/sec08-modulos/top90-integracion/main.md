# Integración: módulos y organización

## Por qué importa

Las cuatro lecciones de este módulo enseñan piezas sueltas: cada archivo es un módulo con su ámbito, sus `export` y sus enlaces vivos; `import()` carga código cuando hace falta; los módulos se organizan por responsabilidades, con barrels y sin ciclos; y las rutas, los import maps y los JSON tienen sus reglas. En una aplicación real aparecen todas juntas: una tienda con su API pública que carga los métodos de pago bajo demanda, cambia de idioma sin recargar y registra paqueterías al importarse.

Los ejemplos de esta página combinan varias lecciones en cada programa, todos con varios archivos en la carpeta `assets/` del tema (botón «Assets» de la galería). Los ejercicios te piden escribir la carga bajo demanda de una tienda, las dos piezas de un sistema de módulos (el orden de evaluación y una caché) y cazar los bugs típicos del módulo.

## Las decisiones que se repiten

| Necesitas… | Usa… | Lección |
|------------|------|---------|
| que algo sea privado de un archivo | no exportarlo | «Módulos ES» |
| una API pública para una carpeta | un barrel `index.js` con la lista explícita | «Organizar el código» |
| estado compartido por toda la aplicación | un módulo dueño que exporta funciones para cambiarlo | «Módulos ES», «Organizar el código» |
| que otros vean un valor que cambia | un `let` exportado (enlace vivo), leído cuando se usa | «Módulos ES» |
| datos de configuración que nadie debe tocar | un objeto congelado; variantes con `{ ...base, … }` | «Organizar el código» |
| conectar la interfaz | `addEventListener` desde el módulo, nunca `onclick="…"` | «Módulos ES» |
| código opcional o pesado | `await import('./x.js')`, con la ruta escrita entera | «Import dinámico» |
| elegir un módulo según los datos | `import()` con la ruta calculada y validada contra una lista | «Import dinámico» |
| la exportación por defecto con `import()` | `const { default: x } = await import(…)` | «Import dinámico» |
| datos JSON fijos | `import x from './x.json' with { type: 'json' }` | «Rutas, import maps y herramientas» |
| nombres de paquete sin empaquetador | un import map | «Rutas, import maps y herramientas» |
| código que se registra al cargarse | un import por sus efectos (`import './plugin.js'`), el primero | «Organizar el código» |
| dos módulos que se necesitan mutuamente | un tercer módulo con lo común, o inyección de dependencias | «Organizar el código» |
| varios «archivos» desde texto | Blobs con URLs completas (`import.meta.resolve`) | «Import dinámico» |

Dos reglas atraviesan la tabla. La primera: un módulo se evalúa **una vez** y todos sus importadores comparten lo que exporta; eso lo hace perfecto para el estado único de una aplicación y peligroso para objetos que cualquiera puede cambiar. La segunda: los `import` estáticos son **datos** que el navegador y las herramientas leen antes de ejecutar nada; mantenerlos simples (rutas completas, nombres explícitos, sin ciclos) es lo que permite comprobar el grafo, dividirlo y recortarlo.

## Ejemplos combinados

### Una tienda por capas

La tienda de café repartida en cinco archivos: datos congelados, un carrito que es **dueño** de su estado (nadie de fuera toca sus líneas) y avisa a quien se suscriba, funciones de formato puras, un barrel con la lista explícita de la API pública y una interfaz que es lo único que toca el DOM. Los botones se conectan desde el módulo con `addEventListener`, y el contador `itemCount` es un `let` exportado: su enlace vivo **atraviesa el barrel**. Pulsa los botones con «▶ Run».

[[exercise:01-tienda-por-capas.md]]

```text
productos → 4 | itemCount al empezar → 0
itemCount tras dos productos → 2 (enlace vivo, a través del barrel)
en pantalla → 🛒 2 productos · $759.00 (1 × Café de Chiapas 500 g, 1 × Molinillo manual)
⛔ los datos están congelados → TypeError
```

Fíjate en que `ui.js` importa de sus archivos hermanos y no del barrel: dentro de una carpeta, pasar por el `index.js` propio es la forma más fácil de crear un ciclo.

### Métodos de pago bajo demanda

Cada método de pago (tarjeta, efectivo en OXXO, transferencia SPEI) vive en su módulo y se carga con `import()` la primera vez que alguien lo elige. El registro escribe cada ruta **entera** dentro de una función (`card: () => import('./card.js')`), en lugar de calcularla: así un empaquetador sabe qué archivos pueden pedirse y hace uno aparte para cada método. La segunda compra con tarjeta no vuelve a evaluar `card.js`, y SPEI nunca se descarga.

[[exercise:02-pagos-bajo-demanda.md-]]

```text
métodos disponibles → card, oxxo, spei | cargados → 0
▶ P-1001 con card
  (evaluando card.js)
  ✅ Tarjeta: cobrado con tarjeta **** 4242 · $487.20
▶ P-1002 con oxxo
  (evaluando oxxo.js)
  ✅ Efectivo en OXXO: ficha OXXO 9300-1002 · paga $210.00 antes de 72 h
▶ P-1003 con card
  ✅ Tarjeta: cobrado con tarjeta **** 4242 · $1,179.00
▶ P-1004 con paypal
  ⛔ Método de pago no disponible: paypal
módulos cargados → card, oxxo (spei nunca se descargó)
```

### Idioma y moneda

El módulo `i18n.js` es el dueño del idioma actual: exporta `locale` como `let` (enlace vivo) y `setLocale()`, que carga el catálogo del idioma, un JSON, con `import()` y `with { type: 'json' }`. El idioma solo cambia cuando la carga terminó bien, así que un idioma no admitido deja el anterior intacto, y volver a un idioma ya usado devuelve el mismo módulo JSON, sin descargarlo otra vez. Los textos se rellenan sin expresiones regulares, con `split` y `join`.

[[exercise:03-idioma-y-moneda.md-]]

```text
idioma antes de cargar nada → null
[es-MX] Tu carrito: 3 productos · Total: $1,179.00
[en-US] Your cart: 3 items · Total: MX$1,179.00
[en-US] Your cart: 1 item · Total: MX$1,179.00
⛔ Idioma no admitido: fr-FR → sigue en en-US
[es-MX] Tu carrito: 1 producto · Total: $1,179.00
setLocale() llamado con → es-MX, en-US, es-MX
¿el mismo catálogo es-MX que la primera vez? → true
```

### Paqueterías que se registran solas

Cada paquetería es un módulo que no exporta nada: al evaluarse, se registra en un `Map` compartido. Un barrel de **imports por sus efectos** las carga en orden, y ese orden es el de registro (los números de los mensajes son el orden de evaluación). Más tarde, la tienda activa un servicio nuevo con `import()`, que se registra en el **mismo** `Map`: `registry.js` ya estaba en el mapa de módulos.

[[exercise:04-paqueterias-que-se-registran.md-]]

```text
1. registry.js: registro vacío
2. estafeta.js se registra
3. dhl.js se registra
4. pickup.js se registra
registradas → estafeta, dhl, pickup
▶ 2.5 kg a Ciudad de México
     $0.00  Recoger en la tienda de Coyoacán
   $144.00  Estafeta (3-5 días)
   $324.00  DHL Express (1 día)
▶ 25 kg a Monterrey
   $474.00  Estafeta (3-5 días)
5. same-day.js se registra (cargado con import())
registradas → estafeta, dhl, pickup, same-day
▶ 2.5 kg a Ciudad de México
     $0.00  Recoger en la tienda de Coyoacán
    $89.00  Mensajería en el día
   $144.00  Estafeta (3-5 días)
   $324.00  DHL Express (1 día)
```

Es el patrón de muchas librerías con *plugins*. Su coste: un import por sus efectos no se puede recortar con *tree-shaking*, y si alguien olvida importar el barrel, el registro está vacío sin ningún error.

### De un ciclo a la inyección de dependencias

Los pedidos necesitaban avisar al cliente y los avisos necesitaban leer los pedidos: un ciclo. La solución de este ejemplo es que **ninguno importe al otro**: cada módulo exporta una **fábrica** que recibe lo que necesita (`createOrderService({ notify })`), y el script de entrada los conecta. De regalo, los pedidos se pueden probar con un canal de avisos falso, cosa imposible si `orders.js` importara el envío de emails directamente (los imports no se pueden reasignar).

[[exercise:05-de-ciclo-a-inyeccion.md-]]

```text
▶ la aplicación
  📧 mariana@example.com: Tu pedido P-1042 va en camino (guía MX-77812)
  estado → enviado | avisos enviados → 1
▶ una prueba, con un canal falso
  ✓ se envió un aviso
  ✓ al cliente del pedido
  ✓ con la guía de envío
  ✓ la aplicación no se enteró de la prueba
```

### Un enlazador de módulos

Tres «archivos» escritos como texto, como en un *playground*. El enlazador lee sus `import` con métodos de string, calcula el orden de evaluación (en profundidad, hojas primero, con el camino actual para descubrir ciclos) y convierte cada archivo en un Blob después de cambiar sus `'./dep.js'` por la URL `blob:` de la dependencia, que ya existe porque se creó antes. Al final explica por qué un ciclo es imposible con Blobs y posible en el navegador.

[[exercise:06-enlazador-de-modulos.md-]]

```text
orden (hojas primero) → money.js → cart.js → main.js
main.js → Total con IVA: $880.44
⛔ ciclo: a.js → b.js → a.js
⛔ no existe utils.js
```

### Una prueba del contrato de la API

¿Cómo se sabe que un barrel exporta lo que debe? Con una prueba que importa cada versión con `import()` y compara las claves de su espacio de nombres con un **contrato**: los nombres prometidos y su tipo. La versión con `export *` de todo pierde la clase por defecto y los dos `format` en conflicto, y filtra una función interna; la versión con la lista explícita cumple el contrato.

[[exercise:07-contrato-de-la-api.md-]]

```text
▶ shop/index-v1.js
  ✗ falta Cart
  ✗ falta formatProduct
  ✗ falta formatWeight
  ✗ sobra normalizeSku (¿es interna?)
▶ shop/index-v2.js
  ✓ la API coincide con el contrato: Cart, MAX_ITEMS, addVat, findProduct, formatPrice, formatProduct, formatWeight
    prueba rápida → 1 producto · Café de Chiapas 500 g
```

## Ejercicios

Los tres ejercicios se corrigen solos, como los de los módulos anteriores: al final del código hay una función `check` que compara cada resultado con lo esperado (las asíncronas, con un límite de tiempo) e imprime `✓` o, en rojo, `✗` con el valor esperado y el obtenido. Los archivos que usan están en la carpeta `assets/` del tema: ábrelos con «Assets» antes de empezar.

### Carga bajo demanda

Escribe la carga de una tienda: `loadPaymentMethod`, que valida el método y devuelve la exportación por defecto de su módulo; `loadMessages`, que importa un catálogo JSON y usa el español si el idioma no existe; `once`, que llama a una función de carga solo la primera vez; y `loadAllMessages`, que carga varios catálogos a la vez. Las nueve comprobaciones salen en rojo al empezar.

[[exercise:08-ej-carga-bajo-demanda.md]]

### Orden y caché de módulos

Las dos piezas que hacen funcionar cualquier sistema de módulos, sin `import`: `evaluationOrder`, que calcula el orden de evaluación de un grafo (el de la lección «Organizar el código») y detecta los ciclos y los archivos que faltan, y `createRequire`, un `require` con caché como el del empaquetador a mano de la lección «Rutas, import maps y herramientas». Ocho comprobaciones salen en rojo al empezar.

[[exercise:09-ej-orden-y-cache-de-modulos.md]]

### Caza los bugs de módulos

Seis funciones de una tienda, cada una con un bug del Bestiario de este módulo: el `await` que falta, la clave `default`, el JSON sin `with`, la ruta relativa dentro de un blob, el objeto exportado que se modifica para todos y la carga sin alternativa. Ninguno detiene el script; dos comprobaciones ya salen ✓ y deben seguir así.

[[exercise:10-ej-caza-los-bugs-de-modulos.md]]

## Resumen

- Una carpeta, una API pública: un barrel con la lista explícita; dentro de la carpeta, imports entre hermanos.
- El estado compartido tiene un módulo dueño; los datos fijos, congelados; los valores que cambian, `let` exportados y leídos al usarse.
- `import()` con rutas escritas enteras permite cargar bajo demanda y que un empaquetador divida el código.
- Los JSON se cargan con `with { type: 'json' }` y se comparten como cualquier módulo.
- Los imports por sus efectos registran *plugins*, pero su orden y su presencia forman parte del programa.
- Las fábricas que reciben sus dependencias rompen ciclos y permiten probar con piezas falsas.
- El orden de evaluación es un recorrido en profundidad en postorden; una caché garantiza que cada módulo se ejecuta una vez.

## Para profundizar

- [MDN: módulos de JavaScript](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Modules)
- [Lin Clark: ES modules, una inmersión con dibujos (en inglés)](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/)
- [patterns.dev: import bajo demanda (en inglés)](https://www.patterns.dev/vanilla/dynamic-import)
- [Martin Fowler: inyección de dependencias (en inglés)](https://martinfowler.com/articles/injection.html)
