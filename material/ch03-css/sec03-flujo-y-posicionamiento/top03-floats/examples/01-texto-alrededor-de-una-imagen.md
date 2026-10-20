---
example_description: "Una imagen con float: left se pega a la izquierda y el texto de los párrafos la rodea; cuando la imagen termina, el texto vuelve a ocupar todo el ancho"
example_tags: "css|float|texto|imagen"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<article class="recipe">
  <h2>Pan de masa madre</h2>
  <img class="photo" src="bread.svg" alt="Hogaza de pan con tres cortes en la corteza" width="160" height="120">
  <p>La masa madre es una mezcla de harina y agua en la que viven levaduras y bacterias salvajes. Alimentada a diario, hace subir el pan sin levadura de panadería y le da su sabor ligeramente ácido y su miga irregular.</p>
  <p>Para esta receta necesitas 100 g de masa madre activa, 500 g de harina de fuerza, 350 g de agua templada y 10 g de sal. Mezcla la harina y el agua y deja reposar la masa una hora antes de añadir la masa madre y la sal: es lo que los panaderos llaman autólisis.</p>
</article>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  line-height: 1.5;
}

.recipe {
  max-width: 60ch;
}

.recipe h2 {
  margin: 0 0 8px;
  font-size: 1.2rem;
}

.recipe p {
  margin: 0 0 8px;
}

/* float: left saca la imagen del flujo y la pega al borde izquierdo de su contenedor,
   a la altura en la que estaba. Las LÍNEAS de los párrafos siguientes se acortan para
   rodearla; cuando la imagen termina, vuelven a ocupar todo el ancho.
   El margen derecho e inferior separa el texto de la foto (el de un flotante nunca colapsa). */
.photo {
  float: left;
  width: 120px;
  height: auto;
  margin: 4px 16px 8px 0;
  border-radius: 6px;
}
```
