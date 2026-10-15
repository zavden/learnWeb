---
example_description: "popover + popovertarget: contenido que se abre por encima de todo sin JavaScript, se cierra al pulsar fuera o con Escape y solo deja uno abierto"
example_tags: "html|interactivos|popover|popovertarget|light-dismiss"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<!-- Abre una explicación y luego la otra: la primera se cierra sola. Cierra pulsando fuera,
     con Escape o con el mismo botón. Con el teclado: tras abrir, Tab entra en el popover.
     No hay ni una línea de JavaScript. -->
<p>Para el semillero necesitas dos cosas:</p>
<ul>
  <li>
    fibra de coco
    <!-- popovertarget = id del popover. Un lector de pantalla anuncia el botón como
         «contraído» o «expandido», sin escribir aria-expanded. -->
    <button type="button" popovertarget="coir-info">¿Qué es?</button>
  </li>
  <li>
    humus de lombriz
    <button type="button" popovertarget="humus-info">¿Qué es?</button>
  </li>
</ul>

<!-- popover (igual que popover="auto"): oculto hasta que se abre; se dibuja en la capa
     superior, por encima de todo; se cierra al pulsar fuera o con Escape («light dismiss»),
     y al abrir otro popover auto. -->
<div id="coir-info" popover>
  <p><strong>Fibra de coco:</strong> la cáscara del coco triturada. Retiene el agua sin encharcarse y no lleva semillas de malas hierbas.</p>
</div>
<div id="humus-info" popover>
  <p><strong>Humus de lombriz:</strong> el abono que producen las lombrices al digerir restos vegetales. Es suave: no quema las raíces.</p>
  <!-- popovertargetaction: show, hide o toggle (el valor por defecto) -->
  <button type="button" popovertarget="humus-info" popovertargetaction="hide">Cerrar</button>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* El navegador centra el popover en la ventana; colocarlo junto a su botón es cosa del CSS
   (anchor positioning, capítulo de CSS) */
[popover] {
  max-width: 22rem;
  padding: 0.5rem 1rem;
}

button:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```
