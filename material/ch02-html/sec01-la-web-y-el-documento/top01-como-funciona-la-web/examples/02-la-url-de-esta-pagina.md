---
example_description: "location: la URL real del documento de la vista previa"
example_tags: "url|location|query|fragmento"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<h1>¿Dónde vive esta página?</h1>
<p>Mira la consola: <code>location</code> es la URL del documento que estás viendo.</p>
<p>
  <!-- Enlace relativo que solo cambia la query y el fragmento. Al pulsarlo, el navegador
       hace una petición GET nueva de esta misma página con ?page=2 y, al recibirla,
       salta al elemento con id="comments". -->
  <a href="?page=2#comments">Recargar con ?page=2#comments</a>
</p>
<h2 id="comments">Comentarios</h2>
<p>El fragmento <code>#comments</code> lleva hasta este título.</p>
```

# JavaScript

```javascript
// location (JavaScript) describe la URL del documento actual.
// Si ves «about:srcdoc», estás en una tarjeta de la teoría, que no tiene URL propia:
// abre el ejemplo en el editor para ver la URL real.
console.log('href     →', location.href);
console.log('protocol →', location.protocol);
console.log('hostname →', location.hostname);  // localhost: tu propio ordenador
console.log('port     →', location.port);      // 3001: el servidor de vistas previas de LearnWeb
console.log('pathname →', location.pathname);  // /preview/<capítulo>/<sección>/<tema>/<id>/index.html
console.log('search   →', location.search);    // vacío hasta que pulses el enlace
console.log('hash     →', location.hash);      // ídem
```
