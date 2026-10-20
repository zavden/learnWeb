---
example_description: "En el atajo animation, el primer tiempo es la duración y el segundo el retardo: «aparecer en 0,3 s tras esperar 2 s» escrito como animation: toast-in 2s 300ms espera 0,3 s y tarda 2 s en aparecer. Además, el atajo reinicia las propiedades que no escribes, y un nombre de keyframes que coincide con una palabra clave no funciona"
example_tags: "css|animaciones|animation|atajo|animation-duration|animation-delay|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">La idea: el aviso de cookies espera 2 s a que la página se asiente y luego aparece rápido, en 0,3 s. Marca la casilla y cuenta.</p>
<label class="control"><input type="checkbox" id="play"> Reproducir</label>

<p class="label">❌ <code>animation: toast-in 2s 300ms both</code> · empieza enseguida (a los 0,3 s) y tarda 2 s en aparecer</p>
<p class="toast is-swapped">Usamos cookies para recordar tu cesta.</p>

<p class="label">✅ <code>animation: toast-in 300ms 2s both</code> · no se ve nada durante 2 s; luego aparece en 0,3 s</p>
<p class="toast is-right">Usamos cookies para recordar tu cesta.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption,
.label {
  margin: 8px 0 4px;
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
  width: fit-content;
  margin: 0 0 10px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #0f172a;
  color: #ffffff;
  font-size: 0.85rem;
  opacity: 0;               /* oculto hasta que se reproduce */
}

@keyframes toast-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* 🐛 El atajo reconoce cada valor por su tipo: el nombre, la curva (ease,
   linear…), el número de repeticiones, la dirección, el fill-mode… Pero hay
   DOS valores del mismo tipo, dos tiempos, y ahí decide el ORDEN:
   el primero es animation-duration y el segundo, animation-delay.
   «toast-in 2s 300ms» = dura 2 s y espera 0,3 s. */
body:has(#play:checked) .is-swapped {
  animation: toast-in 2s 300ms both;
}

/* ✅ Duración primero, retardo después. Si dudas, escribe los longhands:
     animation-name: toast-in; animation-duration: 300ms; animation-delay: 2s; */
body:has(#play:checked) .is-right {
  animation: toast-in 300ms 2s both;
}

/* Otras dos trampas del atajo:
   - Reinicia TODO lo que no escribes. Un animation-play-state: paused (o un
     animation-timeline, lección de animaciones modernas) escrito ANTES del
     atajo vuelve a su valor inicial. Los longhands, siempre después.
   - Un nombre de keyframes que coincide con una palabra clave del atajo
     (ease, linear, infinite, alternate, forwards, none…) se lee como esa
     palabra: @keyframes ease { … } con «animation: ease 1s» no anima nada.
     Usa nombres con guion y significado: toast-in, shake, drop-in. */
```
