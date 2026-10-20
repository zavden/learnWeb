---
example_description: "perspective en el padre da un solo punto de vista para todos los hijos (una escena); perspective() dentro de cada transform da a cada hijo el suyo, y todos se ven iguales. Y perspective() tiene que ir la primera de la lista: después de rotateY no hace nada"
example_tags: "css|transformaciones-3d|perspective|punto-de-fuga|orden|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Cuatro paneles con <code>rotateY(45deg)</code>, como una fila de puertas abiertas</p>

<p class="label">✅ <code>perspective: 400px</code> en el contenedor: un solo ojo frente al centro de la fila. Cada panel se ve desde un ángulo distinto, como en una foto.</p>
<div class="row is-scene">
  <div class="panel">1</div><div class="panel">2</div><div class="panel">3</div><div class="panel">4</div>
</div>

<p class="label">⚠️ <code>transform: perspective(400px) rotateY(45deg)</code> en cada panel: cada uno tiene su propio ojo justo enfrente, y los cuatro se ven idénticos</p>
<div class="row">
  <div class="panel is-own">1</div><div class="panel is-own">2</div><div class="panel is-own">3</div><div class="panel is-own">4</div>
</div>

<p class="label">❌ <code>transform: rotateY(45deg) perspective(400px)</code>: la perspectiva llega después del giro y no hace nada (paneles planos)</p>
<div class="row">
  <div class="panel is-late">1</div><div class="panel is-late">2</div><div class="panel is-late">3</div><div class="panel is-late">4</div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 10px 0 6px;
  font-size: 0.72rem;
}

.row {
  display: flex;
  gap: 16px;
  justify-content: center;
  max-width: 440px;
  padding: 12px 0;
  background: #e2e8f0;
}

.panel {
  display: grid;
  place-items: center;
  width: 80px;
  height: 80px;
  border: 2px solid #1e293b;
  box-sizing: border-box;
  background: #fbbf24;
  font-size: 1.5rem;
  font-weight: 800;
  transform: rotateY(45deg);
}

/* ✅ La propiedad perspective (en el PADRE) crea un solo punto de vista para
   todos sus hijos, situado frente al centro del contenedor. Los paneles de
   los lados se ven más de lado que los del centro: una escena coherente. */
.is-scene {
  perspective: 400px;
}

/* ⚠️ La FUNCIÓN perspective() va dentro del transform de cada elemento: cada
   uno se proyecta desde un ojo frente a su propio centro. Sirve para un
   elemento suelto; en una fila, todos salen iguales. */
.is-own {
  transform: perspective(400px) rotateY(45deg);
}

/* ❌ Las funciones se aplican en orden (lección anterior). perspective() solo
   afecta a lo que viene DETRÁS de ella en la lista: aquí no queda nada, y el
   giro se proyecta sin profundidad. */
.is-late {
  transform: rotateY(45deg) perspective(400px);
}
```
