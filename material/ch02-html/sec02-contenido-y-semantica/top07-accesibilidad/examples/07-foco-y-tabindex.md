---
example_description: "tabindex positivo rompe el orden del teclado; tabindex=0 añade un elemento al recorrido y tabindex=-1 lo hace enfocable solo por código"
example_tags: "html|accesibilidad|tabindex|foco|teclado|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p>Pulsa Tab repetidamente y observa el orden del recuadro.</p>

<!-- 🐛 tabindex mayor que 0 se recorre ANTES que todo lo demás, en orden numérico:
     el foco salta del campo 3 al 1 sin seguir el orden visual. -->
<p>
  <input placeholder="Campo 1" aria-label="Campo 1">
  <input placeholder="Campo 2" aria-label="Campo 2">
  <input placeholder="Campo 3 (tabindex=1)" aria-label="Campo 3" tabindex="1">
</p>

<!-- ✅ tabindex="0": un elemento que no es enfocable entra en el recorrido, en su orden natural. -->
<div class="scroll-box" tabindex="0" role="region" aria-label="Condiciones">Un área con scroll debe poder enfocarse para desplazarla con las flechas…</div>

<!-- tabindex="-1": enfocable con element.focus() pero fuera del recorrido con Tab. -->
<h2 id="results" tabindex="-1">Resultados (enfocable solo por código)</h2>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

input {
  padding: 6px;
  margin-right: 6px;
}

.scroll-box {
  width: 260px;
  padding: 8px;
  border: 1px solid #94a3b8;
}

/* :focus-visible: el anillo aparece al navegar con teclado, no al hacer clic con el ratón.
   Nunca quites el foco con outline: none sin poner otro indicador. */
:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 2px;
}
```
