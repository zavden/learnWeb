---
example_description: "El brillo que barre los esqueletos de carga del módulo de efectos visuales: animado con background-position, el navegador repinta la tarjeta en cada fotograma; con un ::after que se desplaza con translate, solo compone. Con reducir movimiento, en lugar del barrido, un pulso lento de opacidad"
example_tags: "css|rendimiento|esqueletos|background-position|translate|pseudoelemento|paint|prefers-reduced-motion"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">Marca «Cargando»: el brillo barre las dos tarjetas 4 veces (en una página real, mientras dure la carga). Se ven iguales; con <strong>Rendering → Paint flashing</strong> (↗ y DevTools), la primera se pinta de verde en cada fotograma y la segunda no. Con «reducir movimiento», las dos laten despacio en lugar de barrer.</p>
<label class="control"><input type="checkbox" id="loading"> Cargando</label>
<section class="feed" aria-busy="true" aria-label="Publicaciones">
  <p class="visually-hidden" role="status">Cargando publicaciones…</p>
  <div class="skeleton is-paint" aria-hidden="true"></div>
  <div class="skeleton is-composite" aria-hidden="true"></div>
</section>
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

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.feed {
  display: grid;
  gap: 12px;
  max-width: 340px;
  margin-top: 12px;
}

/* Un esqueleto = un div; sus «huesos» son capas de fondo (como en el módulo
   de efectos visuales): un avatar redondo y tres líneas. */
.skeleton {
  --bone: #e2e8f0;
  position: relative;
  height: 72px;
  overflow: hidden;
  border-radius: 12px;
  background:
    radial-gradient(circle 20px at 32px 36px, var(--bone) 98%, transparent) no-repeat,
    linear-gradient(var(--bone) 0 0) 64px 14px / 55% 12px no-repeat,
    linear-gradient(var(--bone) 0 0) 64px 32px / 75% 10px no-repeat,
    linear-gradient(var(--bone) 0 0) 64px 48px / 40% 10px no-repeat,
    #f8fafc;
}

/* ❌ El brillo como OTRA capa de fondo, que se desplaza cambiando
   background-position. El fondo es parte de la pintura de la caja: el
   navegador vuelve a pintar la tarjeta entera en cada fotograma. */
.is-paint {
  background:
    linear-gradient(100deg, transparent 30%, rgb(255 255 255 / 0.8) 50%, transparent 70%) 150% 0 / 200% 100% no-repeat,
    radial-gradient(circle 20px at 32px 36px, var(--bone) 98%, transparent) no-repeat,
    linear-gradient(var(--bone) 0 0) 64px 14px / 55% 12px no-repeat,
    linear-gradient(var(--bone) 0 0) 64px 32px / 75% 10px no-repeat,
    linear-gradient(var(--bone) 0 0) 64px 48px / 40% 10px no-repeat,
    #f8fafc;
}

/* background-position es una lista, una posición por capa: hay que repetir
   las de los huesos, que no se mueven. (Con una capa del doble de ancho, de
   150 % a −50 % lleva el brillo de fuera por la izquierda a fuera por la
   derecha.) */
@keyframes sweep-background {
  to {
    background-position: -50% 0, 0 0, 64px 14px, 64px 32px, 64px 48px;
  }
}

/* ✅ El brillo en un pseudoelemento encima de la tarjeta, que se desplaza
   con translate: se pinta una vez y el compositor lo mueve. overflow: hidden
   en la tarjeta lo recorta. */
.is-composite::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, transparent 30%, rgb(255 255 255 / 0.8) 50%, transparent 70%);
  translate: -100% 0;
}

@keyframes sweep-translate {
  to { translate: 100% 0; }
}

@keyframes pulse {
  50% { opacity: 0.5; }
}

/* Para todos: un pulso lento de opacidad (no hay desplazamiento). */
body:has(#loading:checked) .skeleton {
  animation: pulse 1.5s ease-in-out 4;
}

/* Con movimiento: el barrido, en lugar del pulso. */
@media (prefers-reduced-motion: no-preference) {
  body:has(#loading:checked) .is-paint {
    animation: sweep-background 1.5s linear 4;
  }

  body:has(#loading:checked) .is-composite {
    animation: none;
  }

  body:has(#loading:checked) .is-composite::after {
    animation: sweep-translate 1.5s linear 4;
  }
}
```
