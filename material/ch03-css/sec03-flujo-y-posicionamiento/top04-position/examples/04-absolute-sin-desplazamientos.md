---
example_description: "Una caja absolute sin top ni left se queda donde estaría en el flujo, pero ya no ocupa sitio: es la base de un menú desplegable"
example_tags: "css|position|absolute|posicion-estatica|desplegable"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="column">
  <p class="label">Lista en el flujo: empuja el párrafo hacia abajo</p>
  <details class="picker" open>
    <summary>Idioma: español</summary>
    <ul class="menu">
      <li><a href="#" lang="es">Español</a></li>
      <li><a href="#" lang="ca">Català</a></li>
      <li><a href="#" lang="eu">Euskara</a></li>
      <li><a href="#" lang="gl">Galego</a></li>
    </ul>
  </details>
  <p class="text">Los precios incluyen IVA y los envíos son gratuitos a partir de 30 €.</p>
</div>

<div class="column">
  <p class="label"><code>position: absolute</code> sin desplazamientos: aparece en el mismo sitio, pero flota encima</p>
  <details class="picker" open>
    <summary>Idioma: español</summary>
    <ul class="menu is-floating">
      <li><a href="#" lang="es">Español</a></li>
      <li><a href="#" lang="ca">Català</a></li>
      <li><a href="#" lang="eu">Euskara</a></li>
      <li><a href="#" lang="gl">Galego</a></li>
    </ul>
  </details>
  <p class="text">Los precios incluyen IVA y los envíos son gratuitos a partir de 30 €.</p>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.column {
  display: inline-block;
  vertical-align: top;
  width: calc(50% - 12px);
  margin-right: 8px;
}

.label {
  min-height: 3.9em;               /* hasta tres líneas: las dos columnas empiezan igual */
  margin: 0 0 6px;
  font-size: 0.8rem;
}

.picker summary {
  cursor: pointer;
  font-weight: bold;
}

.menu {
  margin: 4px 0 0;
  padding: 4px 0;
  list-style: none;
  border: 1px solid #94a3b8;
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 0 6px 16px rgb(15 23 42 / 0.2);
}

.menu a {
  display: block;
  padding: 2px 12px;
  color: #1d4ed8;
}

.text {
  margin: 8px 0 0;
  padding: 6px;
  background: #fde68a;
  font-size: 0.85rem;
}

/* Sin top, right, bottom ni left, una caja absolute se coloca en su POSICIÓN ESTÁTICA:
   justo donde estaría si siguiera en el flujo (aquí, debajo del summary).
   La diferencia es que ya no ocupa sitio: el párrafo sube y la lista queda encima.
   Es la base de los menús desplegables, las sugerencias de un buscador o los globos de ayuda.
   Cierra el desplegable con un clic en «Idioma» para ver que el párrafo no se mueve. */
.is-floating {
  position: absolute;
}
```
