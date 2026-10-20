---
example_description: "Un nombre en árabe o hebreo seguido de un número desordena la línea: el algoritmo bidireccional junta el número con el nombre y lo pinta delante; <bdi> (o unicode-bidi: isolate) aísla el nombre"
example_tags: "css|modos-de-escritura|bidi|bdi|unicode-bidi|rtl|dir-auto|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="label">Los nombres de usuario de una lista de reseñas. En el HTML, cada línea es «nombre: N reseñas».</p>

<p class="caption">❌ Sin aislar: en las dos últimas, el número salta delante del nombre</p>
<ul class="reviewers">
  <li><span class="name">Ana</span>: 12 reseñas</li>
  <li><span class="name" lang="ar">سارة</span>: 5 reseñas</li>
  <li><span class="name" lang="he">דוד</span>: 3 reseñas</li>
</ul>

<p class="caption">✅ Cada nombre en un <code>&lt;bdi&gt;</code>: el orden del HTML</p>
<ul class="reviewers">
  <li><bdi class="name">Ana</bdi>: 12 reseñas</li>
  <li><bdi class="name" lang="ar">سارة</bdi>: 5 reseñas</li>
  <li><bdi class="name" lang="he">דוד</bdi>: 3 reseñas</li>
</ul>

<p class="caption">✅ Para lo que escriben los usuarios, <code>dir="auto"</code>: el campo se orienta según la primera letra. Escribe en árabe o en hebreo para verlo</p>
<label class="field">Tu nombre <input type="text" dir="auto" value="سارة"></label>

<p class="credit">Sara (سارة, en árabe) y David (דוד, en hebreo).</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label,
.caption,
.credit {
  margin: 10px 0 4px;
  font-size: 0.75rem;
}

.reviewers {
  margin: 0;
  padding: 6px 12px;
  list-style: none;
  background: #e0e7ff;
  font-size: 1.125rem;
}

.name {
  font-weight: 700;
}

/* 🐛 El navegador ordena el texto con el algoritmo bidireccional de Unicode.
   Las letras árabes y hebreas son «de derecha a izquierda»; los números y los dos
   puntos son neutros o débiles y se pegan a la dirección de lo que tienen al lado.
   Tras «سارة», el «: 5» se une a la parte de derecha a izquierda y se pinta a la
   izquierda del nombre: la línea se ve como «5 :سارة reseñas». */

/* ✅ <bdi> (bidirectional isolate) aísla su contenido: lo de dentro se ordena por
   su cuenta y lo de fuera lo trata como un bloque neutro. Es el elemento para
   cualquier texto cuya dirección no conoces: nombres de usuario, títulos de
   productos, resultados de búsqueda. En CSS, la misma idea es
   unicode-bidi: isolate (bdi lo lleva en la hoja del navegador). */
bdi {
  unicode-bidi: isolate;   /* ya es su valor por defecto; aquí, para verlo */
}

.field input {
  font: inherit;
}
```
