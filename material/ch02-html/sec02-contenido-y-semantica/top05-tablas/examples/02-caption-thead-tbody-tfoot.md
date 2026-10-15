---
example_description: "caption da título a la tabla; thead, tbody y tfoot agrupan las filas de cabecera, datos y totales"
example_tags: "html|tablas|caption|thead|tbody|tfoot"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<table>
  <!-- caption: el título de la tabla, primer hijo de <table>. Los lectores de pantalla
       lo anuncian al entrar en la tabla. -->
  <caption>Pedidos de octubre de 2026</caption>
  <thead>
    <tr><th scope="col">Producto</th><th scope="col">Unidades</th><th scope="col">Importe</th></tr>
  </thead>
  <tbody>
    <tr><td>Café en grano 1 kg</td><td>12</td><td>214,80 €</td></tr>
    <tr><td>Taza de cerámica</td><td>30</td><td>255,00 €</td></tr>
    <tr><td>Molinillo manual</td><td>4</td><td>159,60 €</td></tr>
  </tbody>
  <tfoot>
    <tr><th scope="row">Total</th><td>46</td><td>629,40 €</td></tr>
  </tfoot>
</table>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Un estilo mínimo para leerla. Los grupos de filas permiten estilar cada parte por separado. */
table {
  border-collapse: collapse;
}

caption {
  font-weight: 700;
  padding-bottom: 6px;
}

th,
td {
  padding: 6px 12px;
  border-bottom: 1px solid #cbd5e1;
  text-align: left;
}

td:nth-child(n + 2) {
  text-align: right;       /* los números, alineados a la derecha */
}

thead { background: #e2e8f0; }
tfoot { font-weight: 700; background: #f1f5f9; }
```
