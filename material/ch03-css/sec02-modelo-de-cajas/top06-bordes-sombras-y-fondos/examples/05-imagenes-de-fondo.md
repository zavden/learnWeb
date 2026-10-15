---
example_description: "background-image con background-repeat, background-position y background-size (cover y contain) para mosaicos y fotos de fondo"
example_tags: "css|fondos|background-image|background-size"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="panel tile">repeat (mosaico de un SVG de 20×20)</div>
<div class="panel icon">no-repeat + position: right 12px center</div>
<div class="panel cover">size: cover → llena la caja, recorta</div>
<div class="panel contain">size: contain → cabe entera, deja huecos</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.panel {
  width: 320px;
  height: 120px;
  margin-bottom: 12px;
  padding: 8px;
  border: 2px solid #1d4ed8;
  background-color: #e0f2fe;     /* el color se pinta DEBAJO de la imagen */
  font-weight: 600;
}

/* Las rutas relativas de url() se resuelven desde el archivo .css que las contiene; en un <style>
   dentro del HTML, desde el documento (en LearnWeb, la carpeta assets/ del tema). */
.tile    { background-image: url("dots.svg"); }                       /* repeat por defecto */
.icon    { background-image: url("leaf.svg"); background-repeat: no-repeat; background-position: right 12px center; background-size: 48px; }
.cover   { background-image: url("photo.svg"); background-size: cover; background-position: center; color: white; }
.contain { background-image: url("photo.svg"); background-size: contain; background-repeat: no-repeat; background-position: center; }

/* Una imagen de fondo es decoración: no tiene alt. Si la imagen transmite información,
   va en el HTML con <img> (lección de imágenes del capítulo de HTML). */
```
