---
example_description: "Mayúsculas y versalitas hechas con CSS sobre texto escrito con normalidad: migas de pan y menú en mayúsculas pequeñas con letter-spacing en em, siglas en versalitas con font-variant-caps dentro del texto y la página actual marcada con un subrayado grueso"
example_tags: "css|tipografia|text-transform|letter-spacing|font-variant-caps|abbr|accesibilidad"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<header class="section-header">
  <nav class="crumbs" aria-label="Migas de pan">
    <ol>
      <li><a href="/">Inicio</a></li>
      <li><a href="/cultura">Cultura</a></li>
      <li><a href="/cultura/libros" aria-current="page">Libros</a></li>
    </ol>
  </nav>
  <nav class="tabs" aria-label="Secciones de Libros">
    <a href="/cultura/libros" aria-current="page">Novedades</a>
    <a href="/cultura/libros/resenas">Reseñas</a>
    <a href="/cultura/libros/entrevistas">Entrevistas</a>
  </nav>
</header>

<article class="story">
  <p class="kicker">Feria del libro</p>
  <h2>El <abbr title="Archivo Histórico de la Ciudad">AHC</abbr> reedita a los cronistas del siglo XIX</h2>
  <p>La colección, preparada con la <abbr title="Biblioteca Pública de la Ciudad">BPC</abbr>, reúne doce crónicas de viajeros que recorrieron la <abbr title="Ciudad de México">CDMX</abbr> entre 1820 y 1890. Los primeros tres tomos llegan a las librerías el 4 de noviembre.</p>
</article>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Versalitas y etiquetas
   - Todo el texto está escrito en el HTML como se lee («Novedades», no
     «NOVEDADES»): el lector de pantalla, el buscador y el traductor ven
     palabras normales, y el diseño puede cambiar sin tocar el contenido.
   - Etiquetas cortas: text-transform: uppercase, letra pequeña y un poco de
     aire en em (0.08em), que se ajusta si cambia el tamaño.
   - Siglas dentro del texto: font-variant-caps: all-small-caps las dibuja en
     VERSALITAS (mayúsculas de la altura de las minúsculas), para que no
     «griten» en mitad de un párrafo. Usa las versalitas de la fuente si las
     tiene (San Francisco, en el Mac, sí); si no, el navegador las sintetiza
     (font-synthesis-small-caps).
   ────────────────────────────────────────────────────────────────────────── */
body {
  color: #1e293b;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}

a {
  color: inherit;
}

a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

/* ─── Migas de pan ─── */
.crumbs ol {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
  color: #475569;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* El separador es decorativo: texto alternativo vacío. */
.crumbs li + li::before {
  content: "/" / "";
  margin-inline-end: 4px;
}

.crumbs a {
  text-decoration: none;
}

.crumbs a:hover {
  text-decoration: underline;
}

.crumbs [aria-current="page"] {
  color: #1e293b;
  font-weight: 600;
}

/* ─── Pestañas ─── */
.tabs {
  display: flex;
  gap: 16px;
  margin-block: 8px 12px;
  border-block-end: 1px solid #cbd5e1;
}

/* Versalitas en el menú: más tranquilas que las mayúsculas. */
.tabs a {
  padding-block: 4px;
  font-variant-caps: all-small-caps;
  font-size: 1.05rem;
  letter-spacing: 0.06em;
  text-decoration: none;
}

/* La página actual: un subrayado grueso y separado, además del color. */
.tabs [aria-current="page"] {
  color: #3730a3;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-thickness: 3px;
  text-underline-offset: 0.45em;
}

/* ─── Noticia ─── */
.kicker {
  margin: 0;
  color: #9a3412;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.story h2 {
  margin: 4px 0 8px;
  font-size: 1.4rem;
  line-height: 1.2;
  text-wrap: balance;
}

.story p {
  max-inline-size: 60ch;
  margin-block: 0;
  text-wrap: pretty;
}

/* Siglas en versalitas, con un poco de aire; en el título también, por
   coherencia. El title de abbr desarrolla la sigla. */
abbr {
  font-variant-caps: all-small-caps;
  letter-spacing: 0.04em;
  text-decoration: none;
}
```
