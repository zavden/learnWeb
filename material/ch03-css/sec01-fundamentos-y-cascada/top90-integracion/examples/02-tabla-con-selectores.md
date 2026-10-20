---
example_description: "Una tabla de pedidos sin clases: :nth-child para las bandas, :hover, selectores de atributo con variables, ::before y :empty"
example_tags: "css|selectores|pseudoclases|pseudoelementos|tablas"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<table>
  <caption>Pedidos de la semana</caption>
  <thead>
    <tr>
      <th scope="col">Pedido</th>
      <th scope="col">Cliente</th>
      <th scope="col">Estado</th>
      <th scope="col">Importe</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>#1042</td><td>Lucía Pérez</td><td data-status="enviado">Enviado</td><td>48,90 €</td></tr>
    <tr><td>#1043</td><td>Marcos Gil</td><td data-status="pendiente">Pendiente</td><td>12,50 €</td></tr>
    <tr><td>#1044</td><td>Ana Ruiz</td><td data-status="retrasado">Retrasado</td><td>103,00 €</td></tr>
    <tr><td>#1045</td><td>Pablo Sanz</td><td data-status="enviado">Enviado</td><td></td></tr>
  </tbody>
</table>
```

# CSS

```css
:root {
  --stripe: oklch(97% 0.01 260);
  --row-hover: oklch(93% 0.03 260);
}

body {
  font-family: system-ui, sans-serif;
  color: oklch(25% 0.03 260);
}

table {
  border-collapse: collapse;           /* bordes de celda compartidos (propiedad de tablas) */
}

caption {
  font-weight: bold;
  text-align: start;
  padding-block: 0.5rem;
}

th,
td {
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid oklch(88% 0.02 260);
  text-align: start;
}

/* Bandas: filas pares de tbody (0,1,2) */
tbody tr:nth-child(even) {
  background: var(--stripe);
}

/* Misma especificidad (0,1,2) y escrita después → al pasar el ratón, gana a la banda */
tbody tr:hover {
  background: var(--row-hover);
}

/* La última columna (importes) alineada al final */
:is(th, td):last-child {
  text-align: end;
}

/* Cada estado solo define una variable; la regla de ::before la usa */
td[data-status="enviado"]   { --status-color: oklch(48% 0.13 150); }
td[data-status="pendiente"] { --status-color: oklch(50% 0.12 70); }
td[data-status="retrasado"] { --status-color: oklch(50% 0.19 27); }

/* Un punto de color decorativo antes del texto del estado (texto alternativo vacío) */
td[data-status]::before {
  content: "● " / "";
  color: var(--status-color);
}

/* Una celda vacía, <td></td>, muestra un guion en lugar de un hueco */
td:empty::before {
  content: "—";
  color: oklch(45% 0.03 260);
}
```
