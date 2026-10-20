# URL e historial

## Por qué importa

Una dirección web es la memoria compartida entre el usuario, el navegador y el servidor. Se puede guardar en favoritos, enviar por mensaje, abrir en otra pestaña y recargar. Si tu página muestra «cafés de tueste oscuro, página 2» pero la dirección no lo dice, todo eso se rompe: el enlace compartido abre el catálogo vacío y el botón «atrás» saca al usuario de la tienda en vez de volver a la página 1.

Esta lección tiene dos partes. La primera es **leer y escribir URLs** sin errores, con `URL` y `URLSearchParams`, en lugar de pegar textos con `+` (los espacios, los acentos, el `+` y el `&` tienen trampas). La segunda es **cambiar la dirección sin recargar** con la API `history`, que es como funcionan las aplicaciones de una sola página: el enlace no pide una página nueva al servidor, pero la dirección cambia y el botón «atrás» sigue funcionando. Al final escribirás un *router* mínimo.

## La clase `URL`

En la lección «Cómo funciona la web» usaste `new URL(texto)` para ver las partes de una dirección. Es el mismo analizador que usa el navegador para los enlaces, así que también **normaliza** (quita el puerto por defecto, pasa el host a minúsculas, resuelve `.` y `..`, codifica los espacios) y **resuelve rutas relativas** contra una base, igual que un `<a href>` de la página:

[[exercise:01-la-clase-url.md-]]

```text
href → https://tienda.example/catalogo/cafe/chiapas?talla=500g&molido=fino#opiniones
protocol → https: | host → tienda.example | port → ""
pathname → /catalogo/cafe/chiapas
search → ?talla=500g&molido=fino | hash → #opiniones
origin → https://tienda.example
  veracruz                       → https://tienda.example/catalogo/cafe/veracruz
  ../cacao/tabasco               → https://tienda.example/catalogo/cacao/tabasco
  /carrito                       → https://tienda.example/carrito
  ?talla=1kg                     → https://tienda.example/catalogo/cafe/chiapas?talla=1kg
  //cdn.tienda.example/logo.svg  → https://cdn.tienda.example/logo.svg
modificada → https://tienda.example/catalogo/cafe/veracruz?talla=500g&molido=fino
normalizada → https://tienda.example/catalogo/ofertas%20de%20verano
```

Las partes se pueden **asignar** (`url.pathname = …`, `url.hash = ''`), y `href` se rehace solo. Un objeto `URL` se convierte en texto donde haga falta, así que se pasa tal cual a `fetch(url)`, a `link.href` o a una plantilla. `location`, la dirección de la página actual, tiene las mismas propiedades, con una diferencia importante: asignar `location.search` o `location.pathname` **navega** (recarga la página).

### Una ruta relativa no es una URL

`new URL('/carrito')` lanza un error: sin una base, el analizador no sabe a qué sitio pertenece la ruta. En la página, la base es `document.baseURI` (la dirección del documento, o la de su `<base href>`), y es la que usan sus enlaces. Para comprobar un texto sin `try/catch` existen `URL.canParse(texto, base?)`, que devuelve un booleano, y `URL.parse(texto, base?)`, que devuelve la URL o `null` (Chrome 126). Es la herramienta que prometía el ejemplo de configuración del módulo «Módulos y organización» para validar direcciones, junto con `protocol`:

[[exercise:02-url-relativa-sin-base.md-]]

```text
🐛 new URL(relativa) → TypeError: Failed to construct 'URL': Invalid URL
URL.canParse(relativa) → false
URL.parse(relativa) → null
✅ base fija → https://tienda.example/carrito?cupon=BIENVENIDA
✅ base de la página → pathname: /carrito | cupón: BIENVENIDA
  "https://cafe-chiapas.example" → ✅ válida
  "cafe-chiapas.example" → ⛔ no válida
  "javascript:alert(1)" → ⛔ no válida
  " http://mole.example/ " → ✅ válida
```

Comprobar `protocol` importa: `javascript:alert(1)` es una URL **válida**, y en un `href` ejecutaría código al pulsarla (es otra puerta del XSS de la lección «Crear y modificar elementos»).

Una base más, para código organizado en módulos. `fetch('plantilla.txt')` resuelve la ruta contra la **página** (`document.baseURI`), no contra el archivo `.js` que contiene la llamada, así que un módulo que vive en otra carpeta pediría el archivo equivocado. En la lección «Rutas, import maps y herramientas» viste la solución: `fetch(new URL('./plantilla.txt', import.meta.url))` pide el archivo que está junto al módulo, lo importe quien lo importe.

## La query: `URLSearchParams`

La query (`?categoria=cafe&tueste=oscuro`) es donde viven los filtros, la página de resultados y la búsqueda. `URLSearchParams` la lee y la escribe; se crea a partir de un texto, de un objeto o de pares, y cada URL trae uno ya hecho en `url.searchParams`:

[[exercise:03-urlsearchparams.md-]]

```text
get(categoria) → cafe
get(tueste) → solo el primero: medio
getAll(tueste) → (2) ['medio', 'oscuro']
get(origen) → null
has(precio_max) → true | es texto: string
toString() → categoria=cacao&tueste=medio&tueste=oscuro&tueste=claro
size → 4
  categoria = cacao
  tueste = medio
  tueste = oscuro
  tueste = claro
desde un objeto → categoria=cafe&molido=fino&pagina=2
Object.fromEntries → {tueste: 'oscuro'} | getAll → (2) ['medio', 'oscuro']
```

| Método | Hace |
|--------|------|
| `get(clave)` | el primer valor, o `null` si no está |
| `getAll(clave)` | todos los valores, en un array |
| `has(clave)` | si está |
| `set(clave, valor)` | sustituye todos los valores de la clave por uno |
| `append(clave, valor)` | añade otro valor |
| `delete(clave)` | quita la clave |
| `size`, `for…of`, `sort()`, `toString()` | contar, recorrer, ordenar y serializar |

Todos los valores son **texto**: `pagina=2` se lee como `'2'`, y `'0'` o `'false'` son *truthy*. Convierte tú: `Number(params.get('pagina') ?? 1)`.

### `+` o `%20`

En una URL hay dos formas de escribir un espacio, y vienen de dos normas distintas. La de los **formularios** (`application/x-www-form-urlencoded`), que es la que usa `URLSearchParams`, escribe `+`. La de las **URLs**, que usan `encodeURIComponent` y las rutas, escribe `%20`. Las dos codifican un `+` de verdad como `%2B`. Por separado funcionan; mezcladas producen errores sutiles:

[[exercise:04-mas-y-por-ciento-20.md-]]

```text
URLSearchParams escribe → q=caf%C3%A9+de+olla&tel=%2B52+55+1234+5678
encodeURIComponent escribe → caf%C3%A9%20de%20olla
🐛 decodeURIComponent → café+de+olla
🐛 tel escrito a mano → " 52 55 1234 5678"
🐛 & sin codificar → q: "Café " | claves: (2) ['q', ' cacao']
✅ https://tienda.example/buscar?q=Caf%C3%A9+%26+cacao&tel=%2B52+55+1234+5678
✅ leído → Café & cacao | +52 55 1234 5678
```

La regla práctica: **nunca construyas una query pegando textos**. Usa `url.searchParams.set(…)` para escribir y `url.searchParams.get(…)` para leer, y la codificación será siempre coherente. Si un valor va dentro de la **ruta** (`/buscar/café de olla`), usa `encodeURIComponent` en ese trozo.

> **Desde Python:** `urllib.parse.urlencode` y `quote_plus` escriben `+`, como `URLSearchParams`; `quote` escribe `%20`, como `encodeURIComponent`. Y `parse_qs` convierte los `+` en espacios, igual que `URLSearchParams`.

### `searchParams` está vivo

`url.searchParams` no es una copia: está ligado a su URL. Cambiarlo reescribe `url.href`, y asignar `url.search` lo actualiza. En cambio, `new URLSearchParams(url.search)` sí es una copia suelta, y `new URL(location.href)` es una URL nueva que no mueve la barra de direcciones:

[[exercise:05-searchparams-esta-vivo.md-]]

```text
tras live.set → https://tienda.example/catalogo?pagina=2&orden=precio
tras copy.set → https://tienda.example/catalogo?pagina=2&orden=precio | copia: pagina=99
tras url.search = … → live: 3 | ¿y orden? null | copia: 99
¿cambió location.search? → false
```

Para que la dirección refleje un filtro **sin recargar** hace falta la API `history`.

## El historial de la pestaña

Cada pestaña guarda una lista de **entradas**: las direcciones que has visitado en ella, con un puntero a la actual. `history.back()`, `history.forward()` y `history.go(n)` mueven ese puntero, como los botones del navegador, y `history.length` dice cuántas entradas hay. Una página no puede leer las direcciones de las demás entradas (serían un registro de tu navegación).

Normalmente, una entrada nueva significa una página nueva pedida al servidor. `history.pushState(estado, '', url)` añade una entrada **sin pedir nada**: cambia la dirección, guarda `estado` (cualquier valor que se pueda clonar, lección «JSON y copias») en `history.state` y no recarga. `history.replaceState(estado, '', url)` hace lo mismo **sustituyendo** la entrada actual. El segundo argumento es un título que los navegadores ignoran: se pasa `''`. La URL nueva tiene que ser del **mismo origen**; si no, lanza `SecurityError`.

Cuando el usuario recorre el historial (atrás, adelante) entre entradas de la misma página, el navegador no recarga: dispara el evento **`popstate`** en `window`, con el estado de la entrada a la que llegó en `event.state`. Tu código vuelve a pintar a partir de la dirección. El patrón completo:

- Enlaces de verdad (`<a href="?categoria=cacao">`): funcionan con Cmd/Ctrl + clic, se pueden copiar y los entienden los buscadores.
- Un listener de `click` que llama a `preventDefault()` (lección «Acciones por defecto», que prometía este momento), `pushState` y pinta.
- Un listener de `popstate` que pinta a partir de `location`.
- Una función `render(url)` que pinta **todo** a partir de la URL, para que lo que se ve y lo que dice la dirección no se separen nunca.

[[exercise:06-pushstate-y-popstate.md]]

[[exercise:06-pushstate-y-popstate.md-(script.js)]]

```text
Listo: pulsa «Cacaos» y «Cajetas», marca «Solo con envío gratis» y vuelve con «← Atrás»
// Tras pulsar «Cacaos» y luego «Cajetas»:
➡️ pushState → ?categoria=cacao (entrada nueva)
➡️ pushState → ?categoria=cajeta (entrada nueva)
// Tras marcar «Solo con envío gratis»:
🔁 replaceState → ?categoria=cajeta&envio=gratis (sin entrada nueva)
// Tras pulsar «← Atrás» dos veces:
⬅️ popstate → ?categoria=cacao · state.depth: 1
⬅️ popstate → (sin query) · state.depth: 0
```

¿Cuándo `pushState` y cuándo `replaceState`? Un cambio que el usuario querría deshacer con «atrás» (otra categoría, otra ficha de producto) es una entrada nueva. Un ajuste fino (un filtro, la posición de un mapa, cada letra de una búsqueda) se **sustituye**: nadie quiere pulsar «atrás» treinta veces para salir de la tienda.

Una advertencia propia de LearnWeb. La vista previa es un iframe, y el historial de un iframe se mezcla con el de la pestaña que lo contiene: un `history.back()` de más sacaría la vista previa de la página o movería la aplicación. Por eso los ejemplos guardan en el estado la profundidad (`depth`) de cada entrada y desactivan su botón «← Atrás» en la primera. En una tarjeta de la teoría (un iframe aislado, de origen `null`), `pushState` y `replaceState` lanzan `SecurityError`: abre estos ejemplos con «▶ Run» o en el editor.

### `pushState` no dispara `popstate`

`popstate` significa «el usuario se movió por el historial». Los cambios que haces tú con `pushState` o `replaceState` **no** lo disparan, porque ya sabes que los hiciste. Un *router* que solo pinta dentro de `popstate` cambia la dirección y deja la vista como estaba:

[[exercise:07-pushstate-no-dispara-popstate.md]]

[[exercise:07-pushstate-no-dispara-popstate.md-(script.js)]]

```text
Listo: pulsa «Carrito» sin marcar la casilla; luego márcala, pulsa «Mi cuenta» y prueba «← Atrás»
// Tras pulsar «Carrito» sin la casilla:
➡️ pushState → ?vista=carrito
🐛 la dirección dice «carrito», pero la vista sigue en «Catálogo»: popstate no saltó
// Tras marcar la casilla y pulsar «Mi cuenta»:
➡️ pushState → ?vista=cuenta
✅ pinto «Mi cuenta» yo mismo
// Tras pulsar «← Atrás»:
⬅️ popstate → ?vista=carrito: pinto «Carrito»
```

## Rutas con `#`

Antes de que existiera `pushState`, las aplicaciones de una página usaban el **fragmento** como ruta: `#/pasos`. Cambiar el fragmento nunca recarga (es un salto dentro del documento), crea una entrada en el historial y dispara el evento **`hashchange`**, también al volver atrás. Los enlaces son enlaces normales, sin `preventDefault` ni `pushState`:

[[exercise:08-rutas-con-hash.md]]

[[exercise:08-rutas-con-hash.md-(script.js)]]

```text
Listo: pulsa «Pasos» y «Notas», y vuelve con «← Atrás»
// Tras pulsar «Pasos» y luego «Notas»:
#️⃣ hashchange: #/ingredientes → #/pasos
#️⃣ hashchange: #/pasos → #/notas
// Tras pulsar «← Atrás»:
#️⃣ hashchange: #/notas → #/pasos
```

La gran ventaja: el navegador **nunca envía el fragmento al servidor**, así que recargar `…/index.html#/pasos` siempre funciona. Los inconvenientes: las direcciones son menos limpias, el servidor no puede preparar la página de cada ruta (los buscadores ven siempre la misma) y el `#` deja de servir para saltar a un `id` de la página. Un detalle: `pushState` con un fragmento distinto tampoco dispara `hashchange`; solo lo disparan los cambios de fragmento que hace el navegador.

## Un *router* mínimo

Un ***router*** es la pieza que traduce direcciones en vistas. El de este ejemplo usa rutas en la query (`?vista=producto&sku=CAF-500`) y junta todo lo anterior: un solo listener delegado en `document` para todos los enlaces internos (los del menú y los que pintan las vistas, lección «Delegación de eventos»), `pushState` + pintar al navegar, `popstate` al recorrer el historial, una vista 404 para lo que no existe, el título del documento y el **foco** en el encabezado de la vista nueva, para que un lector de pantalla anuncie el cambio igual que anunciaría una página nueva:

[[exercise:09-router-minimo.md]]

[[exercise:09-router-minimo.md-(script.js)]]

```text
🧭 (sin query) → «Catálogo»
Listo: pulsa «Café de Chiapas», «Ir al carrito» y «Ofertas»; luego «← Atrás»
// Tras pulsar «Café de Chiapas · 500 g», «Ir al carrito» y «Ofertas»:
🧭 ?vista=producto&sku=CAF-500 → «Café de Chiapas · 500 g»
🧭 ?vista=carrito → «Carrito»
🧭 ?vista=ofertas → «Página no encontrada»
// Tras pulsar «← Atrás»:
🧭 ?vista=carrito → «Carrito»
```

Dos detalles de seguridad. El `sku` sale de la URL, y una URL la puede escribir cualquiera y enviártela: las vistas se construyen con `textContent`, nunca metiendo parámetros en `innerHTML`. Y la tabla de rutas se consulta con `Object.hasOwn`: con `routes[nombre]` a secas, `?vista=toString` encontraría un método heredado de `Object.prototype` (lección «Prototipos nativos»).

Chrome tiene además la **Navigation API** (`navigation.addEventListener('navigate', …)`, Chrome 102), que avisa de **todas** las navegaciones (enlaces, formularios, atrás y adelante) en un único evento y simplifica mucho los *routers*. Todavía no está en todos los navegadores; con `history` funciona en todos.

### Recargar una ruta profunda

Las rutas con barra (`/tienda/carrito`) son las más limpias, y `pushState` las acepta sin problema. Pero `pushState` solo cambia la barra de direcciones: mientras la página está abierta, todo funciona. Al **recargar**, al abrir el enlace en otra pestaña o al compartirlo, el navegador pide `/tienda/carrito` **al servidor**, y si el servidor solo conoce `/tienda/index.html`, contesta `404`. El ejemplo lo comprueba sin recargar: cambia la dirección con `replaceState`, pide `fetch(location.href)` (lo mismo que pediría una recarga) y la deja como estaba:

[[exercise:10-recargar-una-ruta-profunda.md-(script.js)]]

```text
🐛 …/carrito → al recargar: 404 application/json
✅ …/index.html?vista=carrito → al recargar: 200 text/html
✅ …/index.html#/carrito → al recargar: 200 text/html
dirección restaurada → …/index.html
Listo: para la prueba real, abre el ejemplo con ↗, pulsa «Cambiar la dirección a …/carrito» y recarga
// Tras pulsar «Cambiar la dirección a …/carrito» (en la pestaña de ↗):
➡️ pushState → …/carrito: la página sigue igual. Recarga ahora (⌘R en la pestaña de ↗)
// Tras recargar: la pestaña muestra la respuesta del servidor, {"error":"Asset not found"}
```

Hay tres salidas. Rutas en la query o con `#`, que el servidor no necesita conocer (lo que hacen los ejemplos de esta lección, porque el servidor de LearnWeb solo sirve archivos). O configurar el servidor con una **ruta de reserva** (*fallback*): «para cualquier dirección de la aplicación que no sea un archivo, devuelve `index.html`», y el *router* decide en el navegador qué pintar. Los servicios de *hosting* de aplicaciones de una página lo ofrecen con una línea de configuración. O que el servidor sepa generar cada ruta, que es lo que hacen los *frameworks* con renderizado en el servidor.

## Bestiario

- **`new URL()` lanza con una ruta.**
  Síntoma: `TypeError: Failed to construct 'URL': Invalid URL` con un texto como `/carrito` o `foto.jpg`.
  Causa: una ruta relativa necesita una base para convertirse en URL.
  Solución: `new URL(ruta, document.baseURI)` (o una base fija); `URL.canParse`/`URL.parse` para comprobar sin lanzar.
  → [ver ejemplo](02-url-relativa-sin-base.md)
- **Los `+` que aparecen y desaparecen.**
  Síntoma: un texto leído de la query trae `+` en vez de espacios, un teléfono pierde su `+52`, o un valor con `&` llega cortado.
  Causa: se mezclaron las dos codificaciones (formulario: `+`; URL: `%20`) o se pegaron valores sin codificar.
  Solución: escribe y lee la query solo con `URLSearchParams` / `url.searchParams`.
  → [ver ejemplo](04-mas-y-por-ciento-20.md)
- **La dirección cambia, la vista no.**
  Síntoma: tras un clic, la barra de direcciones muestra la ruta nueva, pero la página sigue igual (y «atrás» pinta cosas raras).
  Causa: el *router* solo pinta en `popstate`, y `pushState` no lo dispara.
  Solución: pinta justo después de `pushState`; `popstate` es solo para atrás y adelante.
  → [ver ejemplo](07-pushstate-no-dispara-popstate.md)
- **La aplicación da 404 al recargar.**
  Síntoma: navegando funciona; al recargar o abrir un enlace compartido (`/tienda/carrito`), el servidor contesta 404.
  Causa: `pushState` no pide nada al servidor, pero una recarga sí, y el servidor no conoce esa ruta.
  Solución: una ruta de reserva en el servidor que devuelva `index.html`, o rutas en la query o con `#`.
  → [ver ejemplo](10-recargar-una-ruta-profunda.md)

## Resumen

- `new URL(texto, base)` analiza, normaliza y resuelve; sin base, una ruta relativa lanza. `URL.canParse`/`URL.parse` comprueban sin lanzar, y `protocol` dice si es una dirección web.
- `URLSearchParams` (y `url.searchParams`, que está vivo) lee y escribe la query: `get`, `getAll`, `set`, `append`, `delete`; los valores son siempre texto.
- En la query, `URLSearchParams` escribe los espacios como `+` y `encodeURIComponent` como `%20`: no mezcles, y no pegues valores a mano.
- `pushState` añade una entrada sin recargar; `replaceState` sustituye la actual; `popstate` avisa al ir atrás o adelante, nunca tras tus propios `pushState`.
- Pinta siempre a partir de la URL, intercepta enlaces de verdad (respetando Cmd/Ctrl + clic) y mueve el foco a la vista nueva.
- Las rutas con `#` disparan `hashchange` y sobreviven a una recarga sin configurar el servidor; las rutas con barra necesitan una ruta de reserva.

## Para profundizar

- [MDN: URL](https://developer.mozilla.org/es/docs/Web/API/URL)
- [MDN: URLSearchParams](https://developer.mozilla.org/es/docs/Web/API/URLSearchParams)
- [MDN: Trabajando con la API History](https://developer.mozilla.org/es/docs/Web/API/History_API/Working_with_the_History_API)
- [javascript.info: Objetos URL](https://es.javascript.info/url)
- [Chrome Developers: Navigation API (en inglés)](https://developer.chrome.com/docs/web-platform/navigation-api)
