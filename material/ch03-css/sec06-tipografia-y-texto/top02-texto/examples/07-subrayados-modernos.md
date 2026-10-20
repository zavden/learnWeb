---
example_description: "El subrayado moderno: grosor, separación y color propios con text-decoration-thickness, text-underline-offset y text-decoration-color; skip-ink que rodea las letras que bajan, y la ondulada para marcar una falta"
example_tags: "css|tipografia|text-decoration|text-underline-offset|enlaces|accesibilidad"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">❌ <code>text-decoration: none</code>: el enlace solo se distingue por el color</p>
<p class="text is-bare">Consulta los <a href="/horarios">horarios de verano</a> antes de venir.</p>

<p class="caption">El subrayado por defecto: fino y pegado a la letra</p>
<p class="text">Consulta los <a href="/horarios">horarios de verano</a> antes de venir.</p>

<p class="caption">✅ Grosor, separación y color a medida (pasa el ratón por encima)</p>
<p class="text is-custom">Consulta los <a href="/horarios">horarios de verano</a> antes de venir.</p>

<p class="caption"><code>text-decoration-skip-ink</code>: <code>auto</code> (inicial) rodea la g, la j y la p; <code>none</code> las atraviesa</p>
<p class="big"><span class="skip">guayabas y pájaros</span> <span class="skip is-no-skip">guayabas y pájaros</span></p>

<p class="caption"><code>u</code> con una línea ondulada roja: una falta de ortografía señalada</p>
<p class="text">Escribe «haya», no <u class="spelling">haiga</u>.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 10px 0 2px;
  font-size: 0.75rem;
}

.text {
  margin: 0;
  font-size: 1.125rem;
}

a {
  color: #1d4ed8;
}

/* ❌ Sin subrayado, un enlace dentro de un párrafo solo se distingue por el
   color: quien no distingue bien los colores, o tiene una pantalla con reflejos,
   no lo ve (pauta WCAG 1.4.1). En menús y botones, donde la forma ya dice que es
   un enlace, se puede quitar; en el texto, no. */
.is-bare a {
  text-decoration: none;
}

/* ✅ Las propiedades sueltas de text-decoration:
   - thickness: el grosor (en em, crece con la letra);
   - offset: la distancia a la línea base (text-underline-offset);
   - color: un tono más suave que el texto, que no compita con él. */
.is-custom a {
  text-decoration-color: #93c5fd;
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.2em;
}

/* Al pasar el ratón, el subrayado engorda y toma el color del texto. */
.is-custom a:hover {
  text-decoration-color: currentColor;
  text-decoration-thickness: 0.14em;
}

.big {
  margin: 0;
  font-size: 1.75rem;
}

.skip {
  text-decoration: underline;
  text-decoration-color: #b91c1c;
  text-decoration-thickness: 0.06em;
}

/* skip-ink: auto interrumpe la línea donde una letra baja de la línea base. */
.is-no-skip {
  text-decoration-skip-ink: none;
}

/* El atajo text-decoration admite línea, estilo y color a la vez. */
.spelling {
  text-decoration: underline wavy #b91c1c;
  text-decoration-thickness: 1px;
}
```
