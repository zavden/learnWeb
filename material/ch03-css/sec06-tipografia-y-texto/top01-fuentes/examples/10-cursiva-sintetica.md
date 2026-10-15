---
example_description: "Sin un @font-face para la cursiva, em y cite salen con una cursiva falsa (las letras rectas, inclinadas); con el archivo italic declarado, el navegador usa las letras cursivas de verdad"
example_tags: "css|tipografia|font-face|font-style|cursiva-sintetica|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">❌ Solo se declaró el archivo normal: el navegador inclina las letras rectas</p>
<p class="club is-fake">El club de lectura comenta <cite>Fortunata y Jacinta</cite>, de Galdós. Trae tu ejemplar: <em>la edición no importa</em>.</p>

<p class="caption">✅ Con un segundo <code>@font-face</code> para <code>font-style: italic</code>: letras dibujadas en cursiva</p>
<p class="club is-real">El club de lectura comenta <cite>Fortunata y Jacinta</cite>, de Galdós. Trae tu ejemplar: <em>la edición no importa</em>.</p>

<p class="caption">Compara la <strong>a</strong>, la <strong>f</strong> y la <strong>e</strong> de las dos cursivas:</p>
<p class="letters"><span class="is-fake"><em>afe</em></span> <span class="is-real"><em>afe</em></span></p>
```

# CSS

```css
/* ❌ Una familia con un único archivo: el recto (normal). */
@font-face {
  font-family: "Literata Upright";
  src: url("fonts/literata-normal.woff2") format("woff2");
  font-weight: 200 900;
  font-style: normal;
  font-display: swap;
}

/* ✅ La familia completa: dos @font-face con el MISMO nombre, uno por estilo.
   El navegador elige el archivo según el font-style que pida cada texto, y solo
   descarga la cursiva si algún texto la usa. */
@font-face {
  font-family: "Literata";
  src: url("fonts/literata-normal.woff2") format("woff2");
  font-weight: 200 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Literata";
  src: url("fonts/literata-italic.woff2") format("woff2");
  font-weight: 200 900;
  font-style: italic;
  font-display: swap;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 10px 0 2px;
  font-size: 0.75rem;
}

.club {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.4;
}

/* 🐛 em y cite llevan font-style: italic en la hoja del navegador. Si la familia
   no tiene ninguna cara italic (ni oblique), el navegador SINTETIZA una: inclina
   las letras rectas unos grados. Una cursiva de verdad es otro dibujo, con letras
   de otra forma (mira la a y la f) y más estrechas, no la recta torcida.
   font-synthesis-style: none evitaría la falsificación… dejando em en recto:
   el énfasis desaparecería. Lo correcto es cargar la cursiva. */
.is-fake {
  font-family: "Literata Upright", Georgia, serif;
}

.is-real {
  font-family: Literata, Georgia, serif;
}

.letters {
  margin: 0;
  font-size: 3rem;
}

.letters span {
  padding: 0 8px;
  background: #e0e7ff;
}
```
