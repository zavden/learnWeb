---
example_description: "Varias animaciones en un elemento, separadas por comas: un aviso que entra en 0,3 s y se va solo a los 4 s con una segunda animación con retardo. Las dos tocan opacity: gana la que va después en la lista. Cuatro copias congeladas en 0,15, 2, 4,15 y 5 s muestran cada fase"
example_tags: "css|animaciones|varias-animaciones|animation|listas|animation-delay|aviso|congelar"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">Un aviso que aparece y se va solo, sin JavaScript: dos animaciones en la misma declaración. Debajo, congelado en cuatro instantes. Marca la casilla para verlo en vivo (dura 4,3 s).</p>
<label class="control"><input type="checkbox" id="play"> Guardar el pedido</label>
<p class="toast is-live">✓ Pedido guardado</p>
<ol class="frames">
  <li style="--t: 0.15s"><span class="toast">✓ Pedido guardado</span>0,15 s: entrando</li>
  <li style="--t: 2s"><span class="toast">✓ Pedido guardado</span>2 s: visible</li>
  <li style="--t: 4.15s"><span class="toast">✓ Pedido guardado</span>4,15 s: saliendo</li>
  <li style="--t: 5s"><span class="toast">✓ Pedido guardado</span>5 s: se fue</li>
</ol>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption {
  margin: 8px 0;
  font-size: 0.72rem;
}

.control {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid #64748b;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.toast {
  display: block;
  width: fit-content;
  padding: 8px 12px;
  border-radius: 8px;
  background: #14532d;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 600;
}

.is-live {
  margin: 10px 0;
  visibility: hidden;          /* hasta que se guarda */
}

.frames {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.7rem;
}

.frames li {
  padding: 6px;
  border: 1px dashed #64748b;
  border-radius: 8px;
}

.frames .toast {
  margin-bottom: 4px;
}

@keyframes toast-in {
  from { opacity: 0; }
}

@keyframes toast-out {
  to { opacity: 0; visibility: hidden; }
}

/* Dos animaciones, separadas por comas. Cada una con su duración, su curva,
   su retardo y su fill-mode:
   1. toast-in: 300 ms al empezar; «both» la deja en su final (opacity: 1).
   2. toast-out: espera 4 s y se funde en 300 ms; «forwards» la deja invisible.
   Entre los 4 y los 4,3 s, LAS DOS dan un valor a opacity. Cuando dos
   animaciones tocan la misma propiedad, gana la que va DESPUÉS en la lista
   (toast-out), igual que gana la última declaración en la cascada.
   visibility (discreta) también se anima: cambia a hidden al final de toast-out,
   así el aviso no se queda «invisible pero presente» para un lector de pantalla. */
body:has(#play:checked) .is-live {
  visibility: visible;
  animation:
    toast-in 300ms ease-out both,
    toast-out 300ms ease-in 4s forwards;
}

/* Congeladas en el instante --t: cada animación de la lista tiene su retardo,
   así que hay que restar --t a cada uno (0s − t y 4s − t). */
.frames .toast {
  animation:
    toast-in 300ms ease-out both paused,
    toast-out 300ms ease-in 4s forwards paused;
  animation-delay: calc(0s - var(--t)), calc(4s - var(--t));
}

/* Las listas de longhands se emparejan por posición. Si una es más corta, se
   repite: animation-duration: 300ms vale para las dos animaciones. */
```
