---
example_description: "Un «saltar al contenido» oculto que aparece al recibir el foco permite a quien usa el teclado evitar el menú en cada página"
example_tags: "html|accesibilidad|skip-link|teclado|foco"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<!-- El primer elemento enfocable de la página. Haz clic en la vista previa y pulsa Tab. -->
<a class="skip-link" href="#content">Saltar al contenido</a>

<header>
  <nav aria-label="Principal">
    <a href="#">Inicio</a> · <a href="#">Recetas</a> · <a href="#">Huerto</a> · <a href="#">Tienda</a> · <a href="#">Blog</a> · <a href="#">Contacto</a>
  </nav>
</header>

<main id="content" tabindex="-1">
  <h1>Receta de pisto</h1>
  <p>Sin el enlace, quien usa el teclado tendría que pasar por los seis enlaces del menú en cada página.</p>
</main>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Fuera de la vista hasta que recibe el foco. (position se estudia en el capítulo de CSS.) */
.skip-link {
  position: absolute;
  left: 8px;
  top: -40px;
  padding: 8px 12px;
  background: #1e293b;
  color: white;
}

.skip-link:focus {
  top: 8px;
}

main:focus {
  outline: none;     /* main solo recibe el foco para mover el punto de lectura */
}

header {
  margin-top: 48px;
}
```
