---
example_description: "target=\"_blank\" abre otra pestaña; rel decide si la nueva página ve a la que la abrió (opener) y de dónde viene (referrer)"
example_tags: "html|enlaces|target|rel|noopener|seguridad"
example_stage: minimal
example_importance: important
---

# HTML

```html
<!-- target="_blank" abre el enlace en una pestaña nueva. La página nueva podría saber
     QUIÉN la abrió (window.opener) y DE DÓNDE vienes (document.referrer): depende de rel.
     Ábrelo en el editor o con ↗ y pulsa cada enlace: la pestaña nueva lo muestra. -->

<!-- 1. Hoy, target="_blank" lleva noopener implícito: la página nueva NO puede tocar
        esta pestaña (window.opener es null). Antes de 2021 no era así. -->
<p><a href="pages/opened.html" target="_blank">1. target="_blank"</a> (se abre en una pestaña nueva)</p>

<!-- 2. rel="opener" devuelve el acceso. Solo tiene sentido entre páginas de tu sitio. -->
<p><a href="pages/opened.html" target="_blank" rel="opener">2. target="_blank" rel="opener"</a> (se abre en una pestaña nueva)</p>

<!-- 3. noreferrer, además, no envía la URL de esta página (la cabecera Referer) -->
<p><a href="pages/opened.html" target="_blank" rel="noopener noreferrer">3. target="_blank" rel="noopener noreferrer"</a> (se abre en una pestaña nueva)</p>

<!-- Avisa siempre de que un enlace abre otra pestaña: quien usa lector de pantalla
     no lo ve, y el botón «Atrás» deja de funcionar. Mejor aún: no lo hagas salvo que
     haga falta (un PDF, una ayuda mientras rellenas un formulario). -->
```

# CSS

```css
/* Un poco de aire entre enlaces (CSS: capítulo 3) */
p {
  line-height: 1.6;
}
```
