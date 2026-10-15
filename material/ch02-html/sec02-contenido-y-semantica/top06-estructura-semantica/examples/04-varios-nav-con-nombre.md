---
example_description: "nav marca los bloques de navegación importantes; si hay varios, aria-label los distingue para quien navega por regiones"
example_tags: "html|semantica|nav|accesibilidad|aria-label"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<header>
  <nav aria-label="Principal">
    <a href="#">Inicio</a> · <a href="#">Cursos</a> · <a href="#">Precios</a>
  </nav>
</header>

<main>
  <h1>Curso de jardinería</h1>
  <nav aria-label="Ruta de navegación">
    <a href="#">Inicio</a> › <a href="#">Cursos</a> › Jardinería
  </nav>
  <p>Contenido del curso…</p>
</main>

<footer>
  <!-- Unos enlaces cualquiera NO necesitan nav: solo los bloques de navegación importantes. -->
  <p><a href="#">Aviso legal</a> · <a href="#">Cookies</a></p>
</footer>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

nav {
  padding: 6px 10px;
  margin: 8px 0;
  background: #e0f2fe;
}

/* Un lector de pantalla ofrece una lista de regiones: «Principal, navegación» y
   «Ruta de navegación, navegación». Sin aria-label, serían dos «navegación» indistinguibles. */
```
