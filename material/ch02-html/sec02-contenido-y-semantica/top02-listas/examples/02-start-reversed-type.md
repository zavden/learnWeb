---
example_description: "Atributos de ol: start, reversed y type; value en un li"
example_tags: "html|listas|ol|start|reversed"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<!-- start: seguir contando tras una interrupción -->
<h2>Instalación</h2>
<ol>
  <li>Descarga el instalador.</li>
  <li>Ábrelo y acepta la licencia.</li>
</ol>
<p><strong>Atención:</strong> en Windows, el sistema puede pedirte permiso de administrador.</p>
<ol start="3">
  <li>Elige la carpeta de instalación.</li>
  <li>Pulsa «Instalar».</li>
</ol>

<!-- reversed: cuenta hacia atrás, desde el número de elementos (o desde start) -->
<h2>Las tres cumbres más altas de España</h2>
<ol reversed>
  <li>Aneto, 3404 m</li>
  <li>Mulhacén, 3479 m</li>
  <li>Teide, 3715 m</li>
</ol>

<!-- type: 1 (por defecto), a, A, i o I. Úsalo cuando la numeración forma parte del
     contenido: aquí alguien citará «el apartado b». -->
<h2>Condiciones de devolución</h2>
<ol type="a">
  <li>El producto debe estar sin usar y en su caja.</li>
  <li>Dispones de 30 días desde la entrega.</li>
  <li>Los gastos de envío corren de tu cuenta.</li>
</ol>

<!-- value en un li: fija el número de ESE elemento; los siguientes siguen desde ahí.
     Una clasificación con un empate en el segundo puesto: -->
<h2>Clasificación</h2>
<ol>
  <li>Lucía, 42 puntos</li>
  <li>Marcos, 38 puntos</li>
  <li value="2">Irene, 38 puntos</li>
  <li value="4">Daniel, 35 puntos</li>
</ol>
```
