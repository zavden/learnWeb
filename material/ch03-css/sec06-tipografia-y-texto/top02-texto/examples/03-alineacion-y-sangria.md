---
example_description: "text-align alinea las líneas dentro del bloque (start, justify) y text-indent sangra la primera; el párrafo de libro, el de web y una bibliografía con sangría francesa"
example_tags: "css|tipografia|text-align|text-indent|justify|sangria"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="pair">
  <section class="column" aria-label="Estilo de libro">
    <p class="caption">Libro: <code>justify</code>, sin espacio entre párrafos y <code>text-indent</code> desde el segundo</p>
    <div class="book">
      <p>En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor.</p>
      <p>Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados, lentejas los viernes…</p>
    </div>
  </section>

  <section class="column" aria-label="Estilo de web">
    <p class="caption">Web: <code>start</code> (bandera a la derecha) y un renglón en blanco entre párrafos</p>
    <div class="web">
      <p>En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor.</p>
      <p>Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados, lentejas los viernes…</p>
    </div>
  </section>
</div>

<p class="caption">Bibliografía: sangría <strong>francesa</strong> (la primera línea sobresale) con <code>text-indent</code> negativo</p>
<ul class="references">
  <li>Alas «Clarín», Leopoldo. <cite>La Regenta</cite>. Barcelona: Daniel Cortezo, 1884-1885.</li>
  <li>Cervantes, Miguel de. <cite>El ingenioso hidalgo don Quijote de la Mancha</cite>. Madrid: Juan de la Cuesta, 1605.</li>
  <li>Pérez Galdós, Benito. <cite>Fortunata y Jacinta</cite>. Madrid: La Guirnalda, 1887.</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 8px 0 4px;
  font-size: 0.75rem;
}

.pair {
  display: flex;
  gap: 16px;
  align-items: start;
}

.column {
  flex: none;
  inline-size: 180px;
}

.book,
.web {
  font-family: Georgia, serif;
  font-size: 0.9rem;
  line-height: 1.5;
  outline: 1px dashed #4338ca;
}

/* text-align se escribe en el BLOQUE y alinea cada una de sus cajas de línea.
   justify estira los espacios para que todas lleguen a los dos bordes, salvo la
   última. En columnas estrechas abre huecos grandes entre palabras: lo arreglan
   los guiones automáticos (próxima lección). */
.book {
  text-align: justify;
}

.book p {
  margin: 0;
}

/* text-indent sangra la PRIMERA línea de cada bloque. El primer párrafo tras un
   título no se sangra: el espacio ya marca el principio. */
.book p + p {
  text-indent: 1.5em;
}

/* start: alineado al lado donde empieza el texto (a la izquierda en español, a la
   derecha en árabe). Es el valor por defecto; mejor que left, que no gira. */
.web {
  text-align: start;
}

.web p {
  margin: 0 0 1lh;
}

.references {
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: Georgia, serif;
  font-size: 0.85rem;
  line-height: 1.4;
}

/* Sangría francesa: todo el bloque se aparta 2em y la primera línea vuelve atrás
   esos 2em. Así el apellido del autor queda a la vista, como en un índice. */
.references li {
  margin-block-end: 4px;
  padding-inline-start: 2em;
  text-indent: -2em;
}
```
