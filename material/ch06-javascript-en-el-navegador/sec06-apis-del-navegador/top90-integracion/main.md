# Integración: APIs modernas del navegador

## Por qué importa

Las cuatro lecciones de este módulo enseñan APIs que casi nunca van solas. Una galería carga sus imágenes con un observer **y** respeta el movimiento reducido **y** se abre a pantalla completa. Un componente de valoración tiene Shadow DOM **y** participa en un formulario **y** anima su clic según la preferencia de la persona. Un tablero se maneja arrastrando **y** con el teclado, y sus contadores se actualizan solos. Esta página junta las piezas en seis programas pequeños y cuatro ejercicios.

Los interactivos imprimen al cargar una línea `Listo: …` con lo que hay que hacer, llevan su propio registro en la página y, casi todos, **simulan** al cargar una interacción (un arrastre con `DragEvent`, un clic en una estrella, un archivo soltado), para que veas el resultado sin tocar nada. Varios usan la pantalla completa, el portapapeles o un formulario: en una tarjeta de la teoría (un iframe aislado) lo dicen en la propia página, y con «▶ Run» o en el editor funcionan.

## Las decisiones que se repiten

| Necesitas… | Usa… | Lección |
|------------|------|---------|
| saber si algo se ve, sin escuchar `scroll` | `IntersectionObserver` con raíz explícita; `isIntersecting` en cada entrada; `unobserve` lo que ya terminó | «Observers» |
| reaccionar al tamaño de una caja | `ResizeObserver`; la caja observada no cambia en su propio callback | «Observers» |
| enterarte de cualquier cambio del DOM | `MutationObserver` sobre lo justo, nunca sobre lo que el callback escribe | «Observers» |
| un componente reutilizable | custom element con Shadow DOM, atributos reflejados, `::part` y variables CSS para el tema | «Web Components» |
| que el componente avise | un evento despachado **desde el host** (o `composed: true`) | «Web Components» |
| que el componente vaya en un formulario | `formAssociated` + `attachInternals()`: `setFormValue`, `setValidity` | «Web Components» |
| arrastrar datos | un tipo propio en `setData`; decidir con `types` en `dragover`; leer en `drop`; botones para el teclado | «Portapapeles, arrastrar y soltar» |
| leer archivos | `file.text()` tras validar nombre y tamaño; `<input type="file">` como alternativa al arrastre | «Portapapeles, arrastrar y soltar» |
| copiar | `navigator.clipboard.writeText` dentro del clic, con un mensaje si falla | «Portapapeles, arrastrar y soltar» |
| adaptar el comportamiento | `matchMedia` guardado y su `change` | «Media queries en JS» |
| no trabajar para nadie | `visibilitychange`: pausa al ocultarse, actualiza al volver | «Media queries en JS» |

Dos reglas atraviesan la tabla. Primera: **una sola función por acción**, venga del ratón, del teclado, de un arrastre o del portapapeles (`moveOrder`, `importText`); las entradas solo traducen. Segunda: **lo que se prepara, se deshace**: observers que se desconectan al terminar, listeners con `signal`, URLs `blob:` revocadas.

## Ejemplos combinados

### Una galería que carga a tiempo

Los azulejos piden su imagen cuando están a menos de 80 px de entrar en el panel; al cargar, aparecen con `element.animate()` (de la lección «La Web Animations API»), en 0 ms si la persona prefiere menos movimiento. Cada azulejo es un botón que se abre a pantalla completa, con su propio estilo `:fullscreen`. Cuando ya se ha pedido todo, el observer se desconecta.

[[exercise:01-galeria-diferida.md]]

[[exercise:01-galeria-diferida.md-(script.js)]]

```text
fullscreenEnabled → true · movimiento reducido → false
Listo: desplaza la galería; pulsa un azulejo para verlo en grande (Esc o un clic para salir)
⬇️ pido tile-01.svg, tile-02.svg, tile-03.svg, tile-04.svg, tile-05.svg, tile-06.svg (6 de 9)
// Tras pulsar «⤓ Ir al final»:
⬇️ pido tile-07.svg, tile-08.svg, tile-09.svg (9 de 9)
✅ todo pedido: disconnect()
// Tras pulsar el azulejo «Estrella» (con ▶ o en el editor) y después Esc:
⛶ pantalla completa → Estrella
⛶ fuera de pantalla completa
```

### Una valoración con estrellas que va en el formulario

`<rating-stars>` reúne casi toda la lección de Web Components: radios de verdad en su Shadow DOM (las flechas del teclado y el lector de pantalla funcionan solos), la etiqueta proyectada con un `<slot>`, el tema desde fuera con `--star-color` y `::part(legend)`, el atributo `value` reflejado en la propiedad, `formAssociated` para que viaje en `FormData` y se valide con `required`, y un evento `change` despachado desde el host, porque el `change` de los radios no sale del shadow root. El saltito de la estrella respeta `prefers-reduced-motion`.

[[exercise:02-valoracion-con-estrellas.md]]

[[exercise:02-valoracion-con-estrellas.md-(script.js)]]

```text
shadowRoot → open · radios dentro: 5 · form.elements: rating-stars, textarea, button
desde el HTML (value="4") → 4 · FormData → rating=4 · comment=Dulce, con notas de chocolate.
— simulado: un clic en la 2.ª estrella —
change en el formulario → rating = 2 · FormData → rating=2 · comment=Dulce, con notas de chocolate.
atributo value → 2 (la propiedad y el atributo van juntos)
sin valor → checkValidity(): false · «Elige de 1 a 5 estrellas»
Listo: elige con el ratón o con Tab y las flechas; luego «Enviar reseña»
// Tras elegir 5 estrellas y pulsar «Enviar reseña»:
change en el formulario → rating = 5 · FormData → rating=5 · comment=Dulce, con notas de chocolate.
📨 envío → rating=5 · comment=Dulce, con notas de chocolate.
```

### Un tablero de comandas

Las comandas se arrastran con un tipo propio (`application/x-order`) que las columnas comprueban en `dragover`, y se mueven también con ◀ ▶. Los contadores no los actualiza `moveOrder`: los recalcula un `MutationObserver` que vigila las tres listas, así que valen para cualquier forma de mover, también las que se añadan mañana. Fíjate en que los dos movimientos simulados llegan en **un solo** aviso, con cuatro registros (cada movimiento quita un nodo de una lista y lo añade a otra), y en que el observer no vigila los contadores: si lo hiciera, se llamaría a sí mismo. El botón 📋 copia el resumen de la comanda.

[[exercise:03-tablero-de-comandas.md]]

[[exercise:03-tablero-de-comandas.md-(script.js)]]

```text
🧮 al cargar → Pendientes 3 · En cocina 0 · Listas 0
— simulado: arrastrar la mesa 2 a «En cocina» —
✅ Mesa 2 · Pozole rojo → En cocina (arrastre)
— simulado: ▶ en la mesa 4 —
✅ Mesa 4 · Enchiladas suizas → En cocina (botón)
Listo: arrastra las comandas o usa ◀ ▶; 📋 copia el resumen de una comanda
🧮 MutationObserver · 4 registros → Pendientes 1 · En cocina 2 · Listas 0
// Tras pulsar 📋 en la mesa 3 (con ▶ o en el editor):
📋 copiado → Mesa 3 · Tacos al pastor — Pendientes
```

### Un importador de recetas con tres entradas

Soltar archivos, elegirlos con el `<input>` o pegar filas de una hoja de cálculo: las tres entradas acaban en `importText`, que valida cada receta antes de pintarla con `textContent`. Los archivos se comprueban por nombre y tamaño antes de leerlos con `file.text()`. Y el enlace «Descargar recetas.json» usa una URL `blob:` que se **revoca** cada vez que se regenera, así que nunca hay más de una viva.

[[exercise:04-importador-de-recetas.md]]

[[exercise:04-importador-de-recetas.md-(script.js)]]

```text
— simulado: soltar recetas-otono.csv —
📄 recetas-otono.csv · 88 bytes → 3 recetas
— simulado: soltar foto.jpg —
⛔ foto.jpg: solo se admiten .csv o .json
— simulado: pegar 2 filas de una hoja de cálculo —
📋 pegado → 2 recetas
🍲 en total: 5 recetas · ⬇ Descargar recetas.json (5 recetas, 389 bytes)
Listo: suelta o elige tus archivos, o pega filas en el cuadro
```

La simulación despacha un `drop` con un `DataTransfer` que lleva dos `File` creados en memoria, y un `paste` con un `ClipboardEvent`: los mismos eventos que llegan de verdad. Como el script usa `await` en el nivel superior, es un módulo.

### Una gráfica que se adapta a su caja y al tema

Una gráfica de barras en `<canvas>` (módulo «Gráficos y animación») dentro de un recuadro que puedes estrechar. El `ResizeObserver` vigila el recuadro, no el canvas: cambiar el mapa de bits del canvas no cambia la caja observada, así que no hay error de bucle. Según el hueco de cada barra, las etiquetas son largas, cortas o iniciales, todas sacadas de `Intl.DateTimeFormat`. La página sigue el tema del sistema con `light-dark()` sin JavaScript; el canvas no puede, así que elige su paleta con `matchMedia` y redibuja en su `change`. Debajo, la tabla con los mismos datos, porque un canvas es una sola imagen para un lector de pantalla.

[[exercise:05-grafica-que-se-adapta.md]]

[[exercise:05-grafica-que-se-adapta.md-(script.js)]]

```text
tema → oscuro · devicePixelRatio → 2
Listo: cambia el ancho del recuadro desde su esquina, o el tema del sistema
🖌 llamada 1 → 300 px de ancho · mapa de bits 600 × 320 · etiquetas: lun, mar, mié, jue, vie, sáb, dom
// Tras estrecharlo a 202 px de borde a borde (180 de contenido):
🖌 llamada 2 → 180 px de ancho · mapa de bits 360 × 320 · etiquetas: L, M, M, J, V, S, D
// Tras pasar macOS a modo claro:
🎨 change → tema claro: redibujo
```

Los números son los de tu Mac en modo oscuro, con `devicePixelRatio` 2.

### Un lector con progreso

Un artículo largo en un panel. Cada párrafo que pasa por la franja de arriba (un `rootMargin` de `-80 %` por abajo) cuenta como leído; «Continuar» salta al primero sin leer con `behavior: 'smooth'` o `'instant'` según la preferencia; el reloj de lectura solo avanza mientras la página se ve, y «Modo lectura» pone el artículo a pantalla completa con su propio tamaño de letra.

[[exercise:06-lector-con-progreso.md]]

[[exercise:06-lector-con-progreso.md-(script.js)]]

```text
movimiento reducido → false · visibilityState → visible · fullscreenEnabled → true
Listo: baja poco a poco por el artículo; «Continuar» salta al primer párrafo sin leer; cambia de pestaña y vuelve
📖 leído → 1 de 8 (Del cacao al chocolate)
// Tras pulsar «↓ Continuar»:
↓ continuar → Los olmecas (behavior: 'smooth')
📖 leído → 2 de 8 (Los olmecas)
// Tras cambiar de pestaña y volver:
⏸ hidden → pauso el reloj de lectura
▶ visible → el reloj sigue
```

## Ejercicios

Los cuatro ejercicios se corrigen solos: al cargar, cada comprobación imprime `✓` o, en rojo, `✗` con el valor esperado y el obtenido. Al abrirlos, casi todas salen en rojo. Ninguno necesita que desplaces ni arrastres nada: las comprobaciones crean elementos, llaman al callback del observer con entradas de prueba o despachan los eventos ellas mismas.

### Una insignia que refleja su atributo

`<stock-badge quantity="3">` lee su atributo en un campo de clase (en el constructor, el bicho de la lección de Web Components) y solo pinta al conectarse. Haz que observe `quantity` y que la propiedad lo refleje. Seis comprobaciones.

[[exercise:07-ej-reflejar-atributo.md]]

### Impresiones que se cuentan bien

El callback de un `IntersectionObserver` suma una impresión por entrada, así que cuenta la primera llamada y las salidas. Las comprobaciones lo llaman con entradas de prueba (`{ target, isIntersecting }`) y un observer de prueba que apunta los `unobserve`. Cuatro comprobaciones.

[[exercise:08-ej-contar-impresiones.md]]

### Una olla que solo acepta ingredientes

La olla decide con `getData` durante `dragover`, que en un arrastre real devuelve `''`, y en `drop` ni cancela ni lee el tipo propio. Las comprobaciones despachan `DragEvent` y simulan el modo protegido sustituyendo `getData` durante `dragover`. Cuatro comprobaciones; después, arrastra de verdad un ingrediente y el enlace.

[[exercise:09-ej-solo-ingredientes.md]]

### Un temporizador que se limpia al salir

`<order-timer>` arranca un intervalo y un listener en cada `connectedCallback` y no los quita nunca. Límpialo con un `AbortController` en `disconnectedCallback`. Las comprobaciones esperan medio segundo en total, porque cuentan tics de verdad.

[[exercise:10-ej-limpiar-al-desconectar.md]]
