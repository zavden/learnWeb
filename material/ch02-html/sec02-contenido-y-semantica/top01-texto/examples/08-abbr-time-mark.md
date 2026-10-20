---
example_description: "abbr, time y mark: siglas con su forma completa, fechas legibles por máquinas y resaltado"
example_tags: "html|texto|abbr|time|mark"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<!-- abbr: una sigla o abreviatura. title da la forma completa en un globo al pasar el
     ratón; como con teclado o en el móvil no se ve, desarrolla la sigla en el texto
     la primera vez que aparezca. -->
<p>La Organización Mundial de la Salud (<abbr>OMS</abbr>) recomienda al menos 150 minutos
  de actividad física a la semana.</p>
<p>Según la <abbr title="Organización Mundial de la Salud">OMS</abbr>, caminar cuenta. ← deja el ratón encima</p>

<!-- time: una fecha, hora o duración. datetime la repite en un formato estándar que
     entienden las máquinas (buscadores, calendarios, JavaScript); el texto es para personas. -->
<p>La biblioteca reabre el <time datetime="2026-11-02">lunes 2 de noviembre</time>
  a las <time datetime="09:30">nueve y media</time>.</p>
<p>La visita guiada dura <time datetime="PT1H30M">hora y media</time>.</p>

<!-- mark: texto resaltado por su RELEVANCIA en este contexto, como lo que acabas de
     buscar. No es un subrayador de «lo importante»: para eso está strong. -->
<p>Resultados para «tortilla»:</p>
<p>Receta de <mark>tortilla</mark> de patatas con cebolla</p>
<p>Cómo dar la vuelta a la <mark>tortilla</mark> sin romperla</p>
```

# JavaScript

```javascript
// title y datetime son datos que no se ven en la página, pero están en el DOM
console.log('abbr.title →', document.querySelector('abbr[title]').title);
for (const time of document.querySelectorAll('time')) {
  console.log(time.textContent.padEnd(20), '→ datetime:', time.dateTime);
}
```
