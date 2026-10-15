---
example_description: "!important gana a las declaraciones normales; entre dos !important vuelve a decidir la especificidad"
example_tags: "css|especificidad|important"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="hint">En los tres casos, el verde es la declaración que gana y el rojo, la que pierde.</p>
<p id="first" class="case-1">Caso 1 · <code>.case-1 {… !important}</code> (0,1,0) gana a <code>#first {…}</code> (1,0,0)</p>
<p id="second" class="case-2">Caso 2 · dos <code>!important</code>: vuelve a decidir la especificidad y gana <code>#second</code></p>
<p class="case-3" style="background: #fecaca;">Caso 3 · <code>.case-3 {… !important}</code> gana a mi atributo <code>style</code>, que no lleva !important</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

p {
  padding: 6px 8px;
}

/* Caso 1: !important gana a cualquier declaración normal, aunque esta sea más específica */
.case-1 { background: #bbf7d0 !important; }   /* (0,1,0) + !important */
#first  { background: #fecaca; }              /* (1,0,0) normal → pierde */

/* Caso 2: entre dos !important, vuelve a decidir la especificidad */
.case-2 { background: #fecaca !important; }   /* (0,1,0) */
#second { background: #bbf7d0 !important; }   /* (1,0,0) → gana */

/* Caso 3: un !important de la hoja gana incluso al atributo style (si este no lo lleva) */
.case-3 { background: #bbf7d0 !important; }

/* !important es un martillo. Úsalo solo para utilidades que DEBEN ganar siempre
   (por ejemplo, una clase .hidden que oculta pase lo que pase) o para pelear con CSS
   ajeno que no puedes cambiar. Si lo usas para tapar un problema de especificidad,
   la próxima vez necesitarás otro !important… y ahí empieza la guerra. */
```
