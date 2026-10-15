---
example_description: ":checked y :disabled reflejan el estado actual de los controles; con + se pinta la etiqueta de al lado"
example_tags: "css|pseudoclases|formularios|checked|disabled"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p><input type="checkbox" id="terms"> <label for="terms">Acepto las condiciones (márcame)</label></p>
<p><input type="checkbox" id="news" checked> <label for="news">Quiero el boletín (marcada de inicio: desmárcala)</label></p>
<p><input type="checkbox" id="locked" disabled> <label for="locked">Opción no disponible (disabled)</label></p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* :checked → casillas y botones de radio marcados (y <option> elegidas).
   Refleja el estado ACTUAL, no el atributo checked del HTML: al desmarcar
   la segunda casilla, la regla deja de aplicarse.
   Con + (hermano adyacente) pintamos la etiqueta que va justo detrás. */
input:checked + label {
  background: #bbf7d0;
  font-weight: bold;
}

/* :disabled → controles desactivados (atributo disabled). Su contraria es :enabled. */
input:disabled + label {
  color: #64748b;
  text-decoration: line-through;
}
```
