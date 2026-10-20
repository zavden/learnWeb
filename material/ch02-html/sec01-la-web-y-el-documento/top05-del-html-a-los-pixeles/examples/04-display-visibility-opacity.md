---
example_description: "display:none, visibility:hidden y opacity:0: el botón invisible que sigue recibiendo clics"
example_tags: "render-tree|display|visibility|opacity|accesibilidad|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<!-- Tres formas de ocultar el botón del medio. Haz clic en el hueco entre «Antes» y
     «Después» de cada fila y mira la consola. También puedes recorrer los botones con Tab.
     (onclick ejecuta JavaScript al hacer clic: los eventos se explican más adelante.) -->

<h2>display: none</h2>
<!-- Fuera del árbol de render: no ocupa sitio, no recibe clics ni foco -->
<p>
  <button type="button">Antes</button>
  <button type="button" class="display-none" onclick="console.log('clic en display: none')">Oculto</button>
  <button type="button">Después</button>
</p>

<h2>visibility: hidden</h2>
<!-- Ocupa su sitio en el layout, pero no se pinta ni recibe clics ni foco -->
<p>
  <button type="button">Antes</button>
  <button type="button" class="visibility-hidden" onclick="console.log('clic en visibility: hidden')">Oculto</button>
  <button type="button">Después</button>
</p>

<h2>opacity: 0</h2>
<!-- 🐛 Ocupa su sitio, se pinta (totalmente transparente)… y SIGUE recibiendo clics y
     foco, y los lectores de pantalla lo anuncian. Un botón fantasma. -->
<p>
  <button type="button">Antes</button>
  <button type="button" class="opacity-zero" onclick="console.log('🐛 clic en opacity: 0: ¡el botón invisible funciona!')">Oculto</button>
  <button type="button">Después</button>
</p>
```

# CSS

```css
.display-none {
  display: none;
}

.visibility-hidden {
  visibility: hidden;
}

.opacity-zero {
  opacity: 0;
}
```
