# Tablas

## Por qué importa

Una tabla HTML sirve para una sola cosa: **datos tabulares**, información que se lee cruzando una fila con una columna (un horario, una comparativa de precios, los resultados de una liga). Durante los años noventa también se usaron para maquetar páginas enteras, y ese hábito todavía aparece en plantillas de correo y en código antiguo. Hoy maquetar con tablas es un error: un lector de pantalla anuncia «tabla de 3 columnas y 12 filas» y obliga al usuario a navegar celda a celda por algo que no es una tabla. Para colocar cosas en la página existen flexbox y grid, que verás en el capítulo de CSS.

Usadas para datos, en cambio, las tablas son uno de los elementos más ricos de HTML: el navegador sabe qué cabecera corresponde a cada celda y se lo comunica a quien no puede ver la cuadrícula.

## Filas y celdas

Una tabla se construye **por filas**: `<table>` contiene filas `<tr>` (*table row*) y cada fila contiene celdas. Hay dos tipos de celda:

- `<th>` (*table header*): una **cabecera**, el nombre de una fila o de una columna.
- `<td>` (*table data*): un **dato**.

No existe un elemento «columna»: una columna es simplemente «la celda número N de cada fila». Por eso todas las filas deben tener el mismo número de posiciones.

[[exercise:01-tabla-minima.md]]

## Título y grupos de filas

Una tabla completa tiene estructura:

| Elemento | Función |
|---|---|
| `<caption>` | el título de la tabla; primer hijo de `<table>`; los lectores de pantalla lo anuncian al entrar |
| `<thead>` | las filas de cabecera |
| `<tbody>` | las filas de datos (puede haber varios, para agrupar) |
| `<tfoot>` | las filas de resumen o totales |

Los grupos de filas no cambian el aspecto por sí solos, pero dan significado, permiten estilar cada parte por separado y, al imprimir una tabla larga, el navegador puede repetir el `<thead>` en cada página.

[[exercise:02-caption-thead-tbody-tfoot.md]]

## Cabeceras accesibles: `scope`

Quien ve la tabla relaciona cada dato con su fila y su columna de un vistazo. Un lector de pantalla lo hace gracias a los `<th>`: al leer una celda anuncia también sus cabeceras («Tarde, Sábado: Cerrado»). El atributo `scope` indica a qué se aplica cada cabecera:

- `scope="col"`: cabecera de la **columna** que tiene debajo.
- `scope="row"`: cabecera de la **fila** que tiene a la derecha.

En tablas sencillas el navegador lo deduce, pero escribir `scope` elimina cualquier ambigüedad, sobre todo cuando hay cabeceras en las dos direcciones. El ejemplo simula en la consola lo que anunciaría un lector de pantalla.

[[exercise:03-th-y-scope.md]]

Para tablas muy complejas (varias filas de cabeceras anidadas) existe el atributo `headers`, que enlaza cada celda con los `id` de sus cabeceras. Si llegas a necesitarlo, suele ser señal de que conviene dividir la tabla en varias más simples.

## Celdas que ocupan varias posiciones

- `colspan="N"`: la celda ocupa N **columnas** de su fila.
- `rowspan="N"`: la celda ocupa N **filas** hacia abajo.

Con `rowspan`, las filas siguientes tienen ya una posición ocupada: **no** escribas la celda tapada. Si cuentas mal, la tabla se desplaza y aparece una columna fantasma a la derecha.

[[exercise:04-colspan-y-rowspan.md]]

## El `<tbody>` que no escribiste

Si escribes las filas directamente dentro de `<table>`, el parser de HTML (el del módulo anterior, con sus reglas de reparación) crea un `<tbody>` y mete las filas dentro. El DOM real es `table > tbody > tr`, así que un selector CSS como `table > tr` no encuentra nada. Escribe siempre `<tbody>`: el código coincidirá con el DOM y no habrá sorpresas.

[[exercise:05-tbody-implicito.md]]

Recuerda también la otra reparación de las tablas que viste en el módulo anterior: cualquier texto o elemento que no sea una celda, escrito directamente dentro de `<table>` o de `<tr>`, se saca **fuera** de la tabla (*foster parenting*).

## Columnas: `<colgroup>` y `<col>`

Aunque las celdas pertenecen a filas, puedes dar estilo a columnas enteras con `<colgroup>` y `<col>` (con `span` para abarcar varias). La limitación es importante: las celdas **no son hijas** de `<col>`, así que la herencia no las alcanza. Solo funcionan cuatro propiedades: `background`, `width`, `border` (con `border-collapse: collapse`) y `visibility`. Para todo lo demás, usa selectores como `td:nth-child(3)`.

[[exercise:06-col-y-colgroup.md]]

## Antes de crear una tabla

- ¿Los datos se leen cruzando filas y columnas? Si no, no es una tabla: usa listas, `<dl>` o un layout con CSS.
- Pon un `<caption>` que diga de qué trata.
- Marca las cabeceras con `<th>` y `scope`; los datos, con `<td>`.
- Escribe `<thead>` y `<tbody>` (y `<tfoot>` si hay totales).
- Alinea los números a la derecha para que se comparen cifra a cifra.
- En pantallas estrechas, una tabla ancha puede ir dentro de un contenedor con scroll horizontal (`overflow-x: auto`, lección de overflow del capítulo de CSS).

## Bestiario

- **`table > tr` no selecciona ninguna fila.** Síntoma: los estilos para las filas de una tabla no se aplican. Causa: el parser crea un `<tbody>` implícito y las filas no son hijas directas de `<table>`. Solución: escribe `<tbody>` explícitamente y usa `tbody > tr` o simplemente `tr`. → [ver ejemplo](05-tbody-implicito.md)

## Resumen

- Las tablas son para datos tabulares, nunca para maquetar.
- Una tabla son filas (`<tr>`) con celdas de cabecera (`<th>`) y de datos (`<td>`); las columnas son implícitas.
- `<caption>` titula la tabla; `<thead>`, `<tbody>` y `<tfoot>` agrupan las filas.
- `scope="col"` y `scope="row"` relacionan cabeceras y datos para los lectores de pantalla.
- `colspan` y `rowspan` fusionan celdas; no escribas las posiciones tapadas.
- El parser añade un `<tbody>` aunque no lo escribas.
- `<col>` solo admite `background`, `width`, `border` y `visibility`.

## Para profundizar

- [MDN: Tablas HTML, conceptos básicos](https://developer.mozilla.org/es/docs/Learn/HTML/Tables/Basics)
- [MDN: Tablas HTML, características avanzadas y accesibilidad](https://developer.mozilla.org/es/docs/Learn/HTML/Tables/Advanced)
- [W3C WAI: Tables tutorial](https://www.w3.org/WAI/tutorials/tables/)
