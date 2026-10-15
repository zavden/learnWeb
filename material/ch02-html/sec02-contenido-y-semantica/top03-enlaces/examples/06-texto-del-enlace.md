---
example_description: "«Haz clic aquí» y «Leer más» no dicen nada fuera de contexto: el texto del enlace debe decir a dónde lleva"
example_tags: "html|enlaces|accesibilidad|texto|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- 🐛 «Leer más», «haz clic aquí», «enlace»: fuera de su párrafo no dicen nada. Y así
     es como los oye quien usa un lector de pantalla cuando pide la lista de enlaces de
     la página (NVDA: Insert + F7; VoiceOver: el rotor), o cuando salta de enlace en
     enlace con Tab. -->
<div id="broken">
  <h2>❌ Noticias</h2>
  <p>El ayuntamiento amplía el horario de las bibliotecas. <a href="pages/library-hours.html">Leer más</a></p>
  <p>Abre el plazo para las becas de comedor. <a href="pages/school-grants.html">Leer más</a></p>
  <p>Para descargar el horario, haz clic <a href="files/schedule.txt" download>aquí</a>.</p>
</div>

<!-- ✅ El texto del enlace dice a dónde lleva, aunque se lea solo. Si es un archivo,
     también su formato y su tamaño. -->
<div id="fixed">
  <h2>✅ Noticias</h2>
  <p><a href="pages/library-hours.html">El ayuntamiento amplía el horario de las bibliotecas</a></p>
  <p><a href="pages/school-grants.html">Abre el plazo para las becas de comedor</a></p>
  <p><a href="files/schedule.txt" download>Descarga el horario de la biblioteca (TXT, 1 KB)</a></p>
</div>
```

# JavaScript

```javascript
// La «lista de enlaces» de un lector de pantalla: solo el texto de cada enlace,
// sin el párrafo que lo rodea
for (const container of document.querySelectorAll('#broken, #fixed')) {
  console.log(container.querySelector('h2').textContent);
  for (const link of container.querySelectorAll('a')) {
    console.log('   🔗', link.textContent);
  }
}
```
