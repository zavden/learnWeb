---
example_description: "sub, sup y small: fórmulas, exponentes, llamadas a notas y letra pequeña"
example_tags: "html|texto|sub|sup|small"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<!-- sub y sup: subíndice y superíndice, cuando la convención lo exige -->
<p>El agua es H<sub>2</sub>O; el aire que exhalamos lleva CO<sub>2</sub>.</p>
<p>La luz recorre unos 3 × 10<sup>8</sup> metros por segundo.</p>

<!-- Llamada a una nota al pie: un sup con un enlace a la nota (y otro de vuelta) -->
<p><cite>El Quijote</cite> se publicó en 1605<sup><a href="#note-1" id="ref-1">1</a></sup>.</p>

<!-- ❌ No uses sup para los ordinales: en español se escriben con los caracteres º y ª
     (1.º, 2.ª), que ya están dibujados en la parte alta de la línea. -->
<p>Quedó en 1.º puesto; su hermana, en 2.ª posición.</p>

<!-- small: la «letra pequeña» (avisos, condiciones, derechos de autor). Significa
     «comentario al margen», no «texto más pequeño»: el tamaño lo decide el CSS. -->
<p>Menú del día: 13,50 €. <small>IVA incluido. Bebida y postre no incluidos.</small></p>

<p id="note-1"><small>1. La primera parte. La segunda se publicó en 1615.
  <a href="#ref-1">Volver al texto</a></small></p>
```
