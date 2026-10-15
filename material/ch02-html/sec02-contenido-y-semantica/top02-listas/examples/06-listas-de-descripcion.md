---
example_description: "dl, dt y dd: parejas término → descripción (glosarios, fichas, horarios)"
example_tags: "html|listas|dl|dt|dd"
example_stage: minimal
example_importance: important
---

# HTML

```html
<!-- dl (description list): parejas término → descripción.
     dt = el término · dd = su descripción. -->
<h2>Glosario</h2>
<dl>
  <dt>Navegador</dt>
  <dd>Programa que descarga páginas web y las dibuja en la pantalla.</dd>
  <dt>Servidor</dt>
  <dd>Ordenador que responde a las peticiones de los navegadores.</dd>
  <!-- Varios términos pueden compartir una descripción… -->
  <dt><abbr>URL</abbr></dt>
  <dt>Dirección web</dt>
  <dd>Texto que identifica un recurso y dice cómo pedirlo.</dd>
</dl>

<!-- …y un término puede tener varias descripciones -->
<h2>Ficha técnica</h2>
<dl>
  <dt>Peso</dt>
  <dd>1,2 kg</dd>
  <dt>Colores disponibles</dt>
  <dd>Negro</dd>
  <dd>Rojo</dd>
  <dd>Verde oliva</dd>
</dl>

<!-- Cada pareja puede ir envuelta en un div (útil para darle estilo con CSS): es lo
     único que admite un dl además de dt y dd -->
<h2>Tren Madrid-Sevilla</h2>
<dl>
  <div>
    <dt>Salida</dt>
    <dd><time datetime="08:15">8:15</time>, Madrid-Puerta de Atocha</dd>
  </div>
  <div>
    <dt>Llegada</dt>
    <dd><time datetime="10:45">10:45</time>, Sevilla-Santa Justa</dd>
  </div>
</dl>
```
