---
example_description: "El fondo se pinta también debajo del borde: con un borde punteado o semitransparente se ve; background-clip: padding-box lo evita"
example_tags: "css|fondos|background-clip|bordes|bug"
example_stage: common-error
example_importance: useful
---

# HTML

```html
<div class="box">❌ background-clip: border-box (por defecto): el azul asoma entre los puntos</div>
<div class="box clipped">✅ background-clip: padding-box: el fondo termina donde empieza el borde</div>
<div class="box glass">❌ borde semitransparente sobre fondo azul: el borde se ve azulado</div>
<div class="box glass clipped">✅ con padding-box el borde semitransparente muestra lo que hay detrás</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  padding: 12px;
  background: #fde68a;           /* fondo de la página: amarillo */
}

/* 🐛 Por defecto, el fondo de una caja ocupa el área del BORDE (border-box), no solo la del padding. */
.box {
  width: 360px;
  margin-bottom: 14px;
  padding: 12px;
  background: #3b82f6;
  color: white;
  border: 8px dashed #1e3a8a;
  font-size: 0.9rem;
}

.glass {
  border: 10px solid rgb(255 255 255 / 0.5);
}

/* ✅ background-clip decide hasta dónde llega el fondo: border-box, padding-box o content-box. */
.clipped {
  background-clip: padding-box;
}
```
