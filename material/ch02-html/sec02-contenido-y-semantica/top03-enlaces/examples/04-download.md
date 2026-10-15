---
example_description: "El atributo download descarga el archivo en lugar de abrirlo, y propone un nombre"
example_tags: "html|enlaces|download|archivos"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<!-- Sin download: el navegador ABRE el archivo si sabe mostrarlo (texto, imágenes, PDF).
     La vista previa navegará al archivo; pulsa ⟳ en su barra para volver. -->
<p><a href="files/schedule.txt">Ver el horario (TXT)</a></p>

<!-- Con download: lo DESCARGA. El valor (opcional) es el nombre que propone al guardarlo.
     Solo funciona con archivos de tu mismo origen: para otros sitios se ignora.
     Pruébalo en el editor o con ↗: las tarjetas de la teoría no pueden descargar. -->
<p><a href="files/schedule.txt" download="horario-biblioteca.txt">Descargar el horario (TXT, 1 KB)</a></p>
```

# JavaScript

```javascript
// La propiedad download refleja el atributo: el nombre propuesto (vacío si no hay)
for (const link of document.querySelectorAll('a')) {
  console.log(link.textContent.padEnd(32), '→ download:', JSON.stringify(link.download));
}
```
