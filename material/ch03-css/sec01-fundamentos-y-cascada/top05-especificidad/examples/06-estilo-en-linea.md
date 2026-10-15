---
example_description: "El atributo style gana a cualquier selector de una hoja, por muy específico que sea"
example_tags: "css|especificidad|inline|style"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p id="msg" class="message" style="background: #bbf7d0;">Mi fondo verde lo pone mi atributo <code>style</code>.</p>
<ul class="legend">
  <li class="swatch-red"><code>body p#msg.message</code> → (1, 1, 2), en la hoja</li>
  <li class="swatch-green"><code>style="…"</code> → en línea: por encima de cualquier selector</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Un selector muy específico: (1,1,2) */
body p#msg.message {
  background: #fecaca;
  padding: 8px;               /* esta sí se aplica: el atributo style no declara padding */
}

/* Aun así, su background pierde. Las declaraciones del atributo style no tienen selector
   y la cascada las coloca POR ENCIMA de cualquier selector de una hoja.
   Se suele resumir como «especificidad (1,0,0,0)»: una cuarta posición delante de los id.
   Lo único que gana a un style en línea es !important (siguiente ejemplo). */

.legend {
  list-style: none;
  padding: 0;
}

.legend li {
  padding: 4px 8px;
  margin: 4px 0;
}

.swatch-red { background: #fecaca; }
.swatch-green { background: #bbf7d0; }
```
