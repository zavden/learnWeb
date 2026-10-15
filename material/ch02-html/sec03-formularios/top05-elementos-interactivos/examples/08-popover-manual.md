---
example_description: "popover=\"manual\" no se cierra al pulsar fuera ni al abrir otro popover: solo cuando se pide, como un aviso que debe quedarse"
example_tags: "html|interactivos|popover|manual|auto"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<!-- Abre el aviso y después el menú. Pulsa fuera: el menú se cierra, el aviso se queda. -->
<p>
  <button type="button" popovertarget="sync-notice" popovertargetaction="show">Mostrar aviso (manual)</button>
  <button type="button" popovertarget="garden-menu">Menú del huerto (auto)</button>
</p>

<!-- popover="manual": no hay «light dismiss»; ni pulsar fuera, ni Escape, ni abrir otro
     popover lo cierran. Se cierra con su botón (o con hidePopover() desde JavaScript). -->
<div id="sync-notice" popover="manual" class="notice">
  <p>Hay cambios sin guardar en tu calendario de riego.</p>
  <button type="button" popovertarget="sync-notice" popovertargetaction="hide">Cerrar aviso</button>
</div>

<!-- popover (auto): se cierra al pulsar fuera, con Escape o al abrir otro popover auto -->
<div id="garden-menu" popover>
  <ul>
    <li><a href="https://huerta.example/parcelas">Parcelas</a></li>
    <li><a href="https://huerta.example/calendario">Calendario de riego</a></li>
    <li><a href="https://huerta.example/talleres">Talleres</a></li>
  </ul>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* El aviso, abajo a la derecha en vez de en el centro (inset y position: capítulo de CSS) */
.notice {
  inset: auto 1rem 1rem auto;
  margin: 0;
  max-width: 18rem;
  border: 2px solid #b45309;
  background: #fffbeb;
}
```
