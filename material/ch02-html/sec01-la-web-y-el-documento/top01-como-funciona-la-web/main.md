# Cómo funciona la web

## Por qué importa

Cada vez que abres una página, tu navegador mantiene una conversación con otros ordenadores siguiendo unas reglas muy concretas: pide archivos por su URL, recibe respuestas con un código de estado y unas cabeceras, y vuelve a pedir todo lo que el HTML menciona. Si entiendes esa conversación, entiendes por qué una imagen sale rota, por qué una página tarda en aparecer o por qué el mismo enlace funciona en una página y falla en otra.

En esta lección todavía no escribimos HTML: miramos «el cable». Los ejemplos usan unas pocas líneas de JavaScript solo para enseñarte lo que normalmente es invisible. No hace falta que entiendas ese código: JavaScript se estudia a fondo más adelante; aquí basta con leer la consola.

## Cliente y servidor

La web funciona con un modelo **cliente/servidor**. El *cliente* (tu navegador) pide; el *servidor* (un programa que escucha en otra máquina, o en la tuya) responde. Siempre en ese orden: un servidor no te envía una página si no se la has pedido.

```text
  Navegador (cliente)                              Servidor
  ───────────────────                              ────────
  1. «Dame /blog/articulo.html»     ─────────────▶
                                    ◀─────────────  2. «Aquí la tienes» (200 OK + HTML)
  3. Lee el HTML: menciona styles.css y foto.png
  4. «Dame /blog/styles.css»        ─────────────▶
  5. «Dame /blog/foto.png»          ─────────────▶
                                    ◀─────────────  6. El CSS, la imagen…
  7. Dibuja la página
```

Cada flecha es una **petición HTTP** y su **respuesta**. Una página corriente son decenas de ellas: el HTML, las hojas de estilo, los scripts, las imágenes, las fuentes…

En LearnWeb tienes los dos papeles en tu propio ordenador: la aplicación que estás usando (`http://localhost:5174`) y un pequeño servidor (`http://localhost:3001`) que entrega la vista previa de cada ejemplo y los archivos de la carpeta `assets/` de cada tema. La vista previa no es una simulación: es una página web de verdad, con su propia URL, que el navegador descarga por HTTP.

> **Desde Python:** `python -m http.server 8000` arranca un servidor que entrega los archivos de la carpeta actual en `http://localhost:8000/`. Es la forma más rápida de probar páginas fuera de LearnWeb. Abrir el `.html` con doble clic (`file://…`) funciona a medias: varias cosas, como `fetch`, solo funcionan cuando la página llega por HTTP.

## La URL, pieza a pieza

Una **URL** (*Uniform Resource Locator*) dice *cómo* pedir algo, *a quién* y *qué*:

```text
https://tienda.ejemplo.com:8443/zapatos/running.html?talla=42&color=rojo#opiniones
└─┬──┘  └───────┬────────┘ └┬─┘└─────────┬─────────┘└────────┬─────────┘└───┬────┘
esquema       host       puerto        ruta                query        fragmento
```

| Parte | Para qué sirve | ¿Llega al servidor? |
|---|---|---|
| esquema (`https:`) | el protocolo: `http`, `https` (HTTP cifrado), `file`, `mailto`… | decide cómo conectarse |
| host (`tienda.ejemplo.com`) | qué máquina; el DNS lo traduce a una dirección IP | sí (cabecera `Host`) |
| puerto (`8443`) | qué programa de esa máquina; si falta, 80 (`http`) o 443 (`https`) | decide la conexión |
| ruta (`/zapatos/running.html`) | qué recurso dentro del servidor | sí |
| query (`?talla=42&color=rojo`) | parámetros `clave=valor` separados por `&` | sí |
| fragmento (`#opiniones`) | un punto concreto dentro del documento | **no**: solo lo usa el navegador |

Esquema + host + puerto forman el **origen** (`https://tienda.ejemplo.com:8443`). El origen es la «identidad» de un sitio: el navegador separa los datos y permisos de cada origen (lo verás al estudiar el almacenamiento y CORS).

Este ejemplo descompone esa URL con `new URL(...)`, el mismo analizador que usa el navegador por dentro:

[[exercise:01-anatomia-de-una-url.md-]]

Al abrirlo, la consola muestra:

```text
URL completa → https://tienda.ejemplo.com:8443/zapatos/running.html?talla=42&color=rojo#opiniones
esquema      → https:
host         → tienda.ejemplo.com
puerto       → 8443
ruta         → /zapatos/running.html
query        → ?talla=42&color=rojo
fragmento    → #opiniones
origen       → https://tienda.ejemplo.com:8443
puerto de https://ejemplo.com/ → "" (se usa el 443)
```

### La URL de la vista previa

El documento que ves en la vista previa también tiene URL, y JavaScript la expone en `location`. Tiene esta forma: `http://localhost:3001/preview/<capítulo>/<sección>/<tema>/<id>/index.html`. El enlace del ejemplo añade `?page=2#comments`: al pulsarlo, el navegador hace una petición nueva de la misma página y salta al título con `id="comments"`. Si pulsas el botón ↗ de la barra de la vista previa, el documento se abre en su propia pestaña y verás esa URL en la barra de direcciones.

[[exercise:02-la-url-de-esta-pagina.md-]]

Las tarjetas de vista previa que aparecen en esta teoría son documentos incrustados sin URL propia: dentro de ellas `location.href` vale `about:srcdoc`. Por eso los ejemplos que hablan de URL se muestran aquí como código: ábrelos desde la galería de ejemplos del tema para ver su consola.

### La query y la codificación porcentual

Una URL solo admite un puñado de caracteres ASCII. Todo lo demás (espacios, tildes, `ñ`, o un `&` que forme parte de un valor) se escribe con **codificación porcentual**: cada byte de su representación UTF-8 se escribe como `%` seguido de dos cifras hexadecimales. La `ó` ocupa dos bytes, `C3 B3`, así que viaja como `%C3%B3`. Dentro de la query, el espacio puede escribirse como `+` o como `%20`.

[[exercise:03-query-string.md-]]

```text
q    → canción triste
page → 2 | tipo: string
tag  → (2) ['rock', 'pop']
sort → null
URL generada → https://ejemplo.com/buscar?q=caf%C3%A9+con+leche&sort=precio%26m%C3%A1s
```

> **Desde Python:** `urllib.parse.urlparse(url)` hace lo mismo que `new URL(url)`, y `parse_qs`/`urlencode` lo mismo que `URLSearchParams`. Diferencia práctica: `parse_qs` devuelve siempre listas (`{'page': ['2']}`), mientras que `params.get('page')` devuelve el primer valor (`'2'`, siempre texto) y `params.getAll('tag')` la lista completa.

## DNS: del nombre a la dirección

Los ordenadores se localizan por **dirección IP** (`93.184.215.14` en IPv4, `2606:2800:21f:cb07::1` en IPv6), no por nombre. Antes de la primera petición a un host, el navegador averigua su IP con el **DNS** (*Domain Name System*), una especie de guía telefónica distribuida:

```text
¿tienda.ejemplo.com?
  1. caché del navegador            → ¿lo resolví hace poco?
  2. sistema operativo              → su caché y el archivo /etc/hosts
  3. resolvedor DNS (router, ISP…)  → pregunta a los servidores raíz → a los de .com
                                      → a los de ejemplo.com
  ← 93.184.215.14   (la respuesta se guarda en caché un tiempo, el «TTL»)
```

Con la IP, el navegador abre una conexión al puerto (TCP), negocia el cifrado si el esquema es `https` (TLS) y, por fin, envía la petición HTTP. Todo eso ocurre antes del primer byte de HTML y es parte de lo que tarda en abrirse un sitio nuevo.

`localhost` es especial: nunca se pregunta al DNS, siempre es tu propia máquina (`127.0.0.1`). Por eso no hay ejemplo de DNS: desde una página no se ve la resolución. En un sitio real puedes medirla en DevTools: pestaña **Network** → clic en una petición → **Timing** → «DNS Lookup».

## HTTP: petición y respuesta

HTTP es un protocolo de texto (en HTTP/1.1, literalmente líneas de texto). Una petición tiene una **línea de petición** (método, ruta, versión), **cabeceras** y, a veces, un **cuerpo**:

```text
GET /zapatos/running.html?talla=42 HTTP/1.1
Host: tienda.ejemplo.com
Accept: text/html
Accept-Language: es-ES,es;q=0.9
User-Agent: Mozilla/5.0 (Macintosh; …) Chrome/…
```

La respuesta tiene una **línea de estado** (versión, código, frase), cabeceras, una línea en blanco y el cuerpo:

```text
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 5120
Cache-Control: no-cache
Last-Modified: Mon, 12 Oct 2026 09:30:00 GMT

<!DOCTYPE html>
<html lang="es">…
```

HTTP/2 y HTTP/3 envían la misma información en binario y por varias «vías» a la vez, pero el modelo es idéntico: método, ruta, cabeceras, código de estado y cuerpo.

### Métodos

| Método | Significa | Quién lo usa en el navegador |
|---|---|---|
| `GET` | «dame este recurso» (sin cuerpo) | enlaces, imágenes, CSS, scripts, la barra de direcciones |
| `HEAD` | como `GET`, pero solo las cabeceras | comprobaciones (¿existe?, ¿cuánto ocupa?) |
| `POST` | «toma estos datos» (con cuerpo) | formularios que envían datos |
| `PUT` / `PATCH` / `DELETE` | reemplazar / modificar / borrar | APIs, desde JavaScript |
| `OPTIONS` | «¿qué me permites?» | el propio navegador, antes de ciertas peticiones (CORS) |

`GET` y `HEAD` son **seguros**: no deben cambiar nada en el servidor. Por eso el navegador los repite o precarga sin miedo, y por eso un formulario que borra algo nunca debe usar `GET`.

### Códigos de estado

| Familia | Significado | Los que más verás |
|---|---|---|
| 1xx | información provisional | `101` (cambio de protocolo, WebSocket) |
| 2xx | éxito | `200 OK`, `201 Created`, `204 No Content` |
| 3xx | redirección o caché | `301`/`308` (movido para siempre), `302`/`307` (temporal), `304 Not Modified` |
| 4xx | error del cliente | `400` (petición mal formada), `401`/`403` (sin permiso), `404 Not Found`, `405` (método no permitido) |
| 5xx | error del servidor | `500` (fallo interno), `502`/`503`/`504` (servidor caído o saturado) |

Un `404` no es un fallo de la red: el servidor ha respondido perfectamente, y su respuesta es «eso no existe». El navegador recibe un cuerpo igual (la página de error) y decide qué hacer con él.

### Cabeceras

Las cabeceras son metadatos `Nombre: valor` (el nombre no distingue mayúsculas). Algunas importantes:

| Cabecera | Va en | Para qué |
|---|---|---|
| `Host` | petición | qué sitio quieres (un servidor puede alojar muchos) |
| `Accept`, `Accept-Language` | petición | qué formatos e idiomas prefieres |
| `Cookie` | petición | datos que el servidor te pidió guardar |
| `Content-Type` | respuesta | **qué es** el cuerpo: `text/html`, `text/css`, `image/svg+xml`, `application/json`… y su codificación (`charset`) |
| `Content-Length` | respuesta | cuántos bytes ocupa el cuerpo |
| `Cache-Control`, `ETag`, `Last-Modified` | respuesta | si se puede guardar en caché y cómo comprobar si cambió |
| `Location` | respuesta | adónde ir en una redirección `3xx` |
| `Set-Cookie` | respuesta | pide al navegador que guarde una cookie |

Fíjate en `Content-Type`: el navegador decide qué hacer con un archivo por esa cabecera, **no** por la extensión del nombre. Un `.css` servido como `text/plain` no se aplica, y el `charset` de esta cabecera manda sobre lo que diga el propio HTML (lo verás en la próxima lección).

Este ejemplo hace una petición real al servidor de LearnWeb y enseña la respuesta:

[[exercise:04-fetch-status-y-cabeceras.md-]]

```text
URL pedida     → http://localhost:3001/preview/ch02-html/…/top01-como-funciona-la-web/<id>/data.json
status         → 200 OK
ok             → true
Content-Type   → application/json; charset=UTF-8
Content-Length → 83 bytes
Last-Modified  → (la fecha en que se guardó el archivo)
cuerpo         → { "course": "Web a fondo", … }
```

Y este compara métodos y códigos de estado: un `GET` que encuentra el archivo, otro que no (`404`) y un `HEAD`, que anuncia el tamaño del cuerpo pero no lo envía:

[[exercise:05-metodos-y-codigos.md-]]

```text
GET  data.json    → 200 OK
GET  missing.json → 404 Not Found | ok: false
HEAD data.json    → 200 | Content-Length anunciado: 83 | bytes recibidos: 0
```

> **Desde Python:** con `requests` sería `r = requests.get(url)`, y luego `r.status_code`, `r.headers['content-type']` y `r.text`. `fetch` se parece mucho, con una diferencia de diseño: el cuerpo se lee aparte (`await response.text()`) porque llega *después* de las cabeceras y puede ser enorme. Y en ninguno de los dos un `404` es una excepción: `requests` solo la lanza si llamas a `r.raise_for_status()`.

Para ver todo esto sin código, abre DevTools (<kbd>⌥</kbd> <kbd>⌘</kbd> <kbd>I</kbd> en Mac, <kbd>F12</kbd> en Windows/Linux), ve a la pestaña **Network** y pulsa ⟳ en la vista previa: aparece cada petición con su método, su código y su tamaño. Al hacer clic en una ves sus cabeceras (**Headers**), su cuerpo (**Response**) y cuánto tardó cada fase (**Timing**).

## Rutas relativas y absolutas

En HTML casi nunca escribes URLs completas. Escribes **rutas relativas** (`img/logo.svg`) y el navegador las completa con la URL del documento que las contiene, igual que una ruta de archivo relativa se completa con la carpeta actual:

| Escribes | Significa |
|---|---|
| `foto.png`, `./foto.png` | en la misma «carpeta» que el documento |
| `img/foto.png` | en una subcarpeta |
| `../foto.png` | sube una carpeta (no puede subir más allá de la raíz) |
| `/foto.png` | desde la raíz del sitio (mismo origen) |
| `//cdn.ejemplo.net/foto.png` | mismo esquema, otro host |
| `https://otro.org/foto.png` | absoluta: se usa tal cual |
| `?page=2`, `#comments` | la misma página con otra query / otro fragmento |

[[exercise:06-rutas-relativas.md-]]

```text
Documento → https://ejemplo.com/blog/articulo.html
foto.png                    → https://ejemplo.com/blog/foto.png
./foto.png                  → https://ejemplo.com/blog/foto.png
img/foto.png                → https://ejemplo.com/blog/img/foto.png
../foto.png                 → https://ejemplo.com/foto.png
/foto.png                   → https://ejemplo.com/foto.png
//cdn.ejemplo.net/foto.png  → https://cdn.ejemplo.net/foto.png
https://otro.org/foto.png   → https://otro.org/foto.png
?page=2                     → https://ejemplo.com/blog/articulo.html?page=2
#comments                   → https://ejemplo.com/blog/articulo.html#comments
```

La regla clave: para resolver, el navegador toma la URL del documento y **quita todo lo que haya después de la última `/`**. Lo que queda es la «carpeta» base. Eso tiene una consecuencia sorprendente: la misma ruta relativa apunta a sitios distintos según la página en la que la escribas… y según si su URL termina en barra o no.

[[exercise:07-relativa-al-documento.md-]]

```text
en /index.html     → https://ejemplo.com/img/logo.svg
en /blog/post.html → https://ejemplo.com/blog/img/logo.svg
en /blog           → https://ejemplo.com/img/logo.svg
en /blog/          → https://ejemplo.com/blog/img/logo.svg
/img/logo.svg en /blog  → https://ejemplo.com/img/logo.svg
/img/logo.svg en /blog/ → https://ejemplo.com/img/logo.svg
base de esta vista previa → http://localhost:3001/preview/ch02-html/…/<id>/index.html
```

Las rutas que empiezan por `/` evitan ese problema, pero tienen el suyo: dan por hecho que el sitio vive en la raíz del dominio. La vista previa de LearnWeb vive en una subcarpeta (`/preview/…/<id>/`), igual que un proyecto publicado en `usuario.github.io/mi-proyecto/`, así que `/img/logo.svg` apunta fuera de ella:

[[exercise:08-rutas-en-la-vista-previa.md]]

Las rutas relativas tampoco se resuelven siempre contra el documento: una `url(...)` escrita **dentro de un archivo CSS** se resuelve contra la URL de ese CSS. Lo verás en el último ejemplo.

> **Desde Python:** `urllib.parse.urljoin('https://ejemplo.com/blog', 'foto.png')` devuelve `'https://ejemplo.com/foto.png'`, y con `'https://ejemplo.com/blog/'` devuelve `'https://ejemplo.com/blog/foto.png'`. Es la misma regla (la del estándar RFC 3986), barra final incluida.

## Qué descarga el navegador y en qué orden

Al abrir una página ocurre, más o menos, esto:

1. **DNS** y **conexión**: averigua la IP, abre la conexión TCP y negocia TLS si es `https`.
2. **El HTML**: pide el documento y empieza a leerlo *mientras llega*, sin esperar al final.
3. **Recursos del HTML**: cada `<link rel="stylesheet">`, `<script src>` o `<img>` que encuentra genera una petición. Un *escáner de precarga* lee por delante del parser para empezar esas descargas cuanto antes.
4. **El CSS bloquea el pintado**: el navegador no dibuja nada hasta tener las hojas de estilo del `<head>`, para no enseñarte la página sin estilos y luego «saltar».
5. **Recursos del CSS**: fondos y fuentes que solo aparecen dentro de un CSS no se pueden pedir hasta haber descargado y leído ese CSS; llegan más tarde.
6. **Fin**: cuando el HTML está leído entero se dispara `DOMContentLoaded`; cuando además han terminado imágenes, CSS y scripts, se dispara `load`.

Este documento completo pide un CSS, un script y una imagen, y su CSS pide a su vez un fondo. Al terminar, la consola lista cada descarga con el momento en que empezó y quién la pidió (`link`, `script`, `img` o `css`):

[[exercise:09-que-descarga-el-navegador.md]]

Verás algo así (los milisegundos cambian en cada carga):

```text
js/app.js → ejecutado (tenía defer)
0 ms → el documento HTML (siempre lo primero)
5 ms → css/styles.css | lo pidió: link
5 ms → js/app.js | lo pidió: script
6 ms → img/logo.svg | lo pidió: img
11 ms → img/pattern.svg | lo pidió: css
```

El fondo de rayas siempre es el último: su URL no existía hasta que el navegador leyó `styles.css`. Y fíjate en la ruta que usa ese CSS, `url(../img/pattern.svg)`: sube una carpeta porque se resuelve contra `…/css/styles.css`, no contra el documento.

## Bestiario

**🐛 La imagen (o el CSS) carga en unas páginas y en otras no.**
- *Síntoma:* `<img src="img/logo.svg">` se ve en `/index.html` pero sale rota en `/blog/post.html`, o funciona en `/blog/` y falla en `/blog`.
- *Causa:* una ruta relativa se resuelve contra la URL **del documento**, quitando lo que hay tras la última `/`. Cambia la página (o su barra final) y cambia la URL resultante.
- *Solución:* razona la ruta desde la URL real de cada página; usa rutas desde la raíz (`/img/logo.svg`) cuando el sitio vive en la raíz del dominio; enlaza las carpetas siempre con barra final. → [ver ejemplo](07-relativa-al-documento.md)

**🐛 La imagen funciona en local y sale rota al publicar el sitio.**
- *Síntoma:* icono de imagen rota y el texto del `alt`; en **Network**, la petición termina en `404`.
- *Causa:* una ruta que empieza por `/` siempre va a la raíz del servidor. Si el sitio vive en una subcarpeta (`usuario.github.io/mi-proyecto/`, o la vista previa de LearnWeb), apunta fuera de él.
- *Solución:* usa rutas relativas al documento (`img/logo.svg`) para los recursos de tu propio proyecto. → [ver ejemplo](08-rutas-en-la-vista-previa.md)

## Resumen

- La web es cliente/servidor: el navegador pide con **peticiones HTTP** y el servidor contesta con **respuestas**; una página son decenas de peticiones.
- Una URL tiene esquema, host, puerto, ruta, query y fragmento; esquema + host + puerto forman el **origen**. El fragmento nunca llega al servidor.
- Lo que no es ASCII viaja en la URL con **codificación porcentual** (`ó` → `%C3%B3`).
- El **DNS** traduce nombres a IPs antes de conectar; `localhost` es siempre tu máquina.
- Una respuesta trae un **código de estado** (2xx éxito, 3xx redirección, 4xx error del cliente, 5xx error del servidor), **cabeceras** y un cuerpo. `Content-Type` decide qué es el archivo.
- Las **rutas relativas** se completan con la URL del documento (o del CSS que las contiene); la barra final importa.
- El navegador lee el HTML mientras llega y pide en paralelo lo que va encontrando; lo que solo aparece en el CSS llega después.

## Para profundizar

- [MDN — Generalidades del protocolo HTTP](https://developer.mozilla.org/es/docs/Web/HTTP/Overview)
- [MDN — Códigos de estado de respuesta HTTP](https://developer.mozilla.org/es/docs/Web/HTTP/Status)
- [MDN — La interfaz URL](https://developer.mozilla.org/es/docs/Web/API/URL)
- [web.dev — How browsers work](https://web.dev/articles/howbrowserswork)
- [WHATWG — URL Standard (cómo se analiza y resuelve una URL)](https://url.spec.whatwg.org/)
