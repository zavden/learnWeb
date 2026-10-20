---
example_description: "Una lista de tareas con un anillo de progreso que se llena con suavidad: cada casilla marcada suma 1 a una custom property, --progress (registrada con @property como <percentage>) se calcula con calc() y su transición anima el conic-gradient. Las tareas hechas se tachan con un subrayado que crece (scale desde la izquierda)"
example_tags: "css|integracion|property|custom-properties|conic-gradient|transiciones|has|calc|scale"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<section class="tasks" aria-labelledby="tasks-title">
  <div class="tasks__head">
    <div class="ring" aria-hidden="true"></div>
    <div>
      <h2 id="tasks-title">Prepara tu huerto</h2>
      <p class="tasks__hint">Marca lo que ya hiciste.</p>
    </div>
  </div>
  <ul class="tasks__list">
    <li><label><input type="checkbox" id="task-1"> <span>Elegir un sitio con 6 horas de sol</span></label></li>
    <li><label><input type="checkbox" id="task-2"> <span>Comprar sustrato y composta</span></label></li>
    <li><label><input type="checkbox" id="task-3"> <span>Hacer agujeros de drenaje</span></label></li>
    <li><label><input type="checkbox" id="task-4"> <span>Sembrar albahaca y cilantro</span></label></li>
  </ul>
</section>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────
   Tareas con anillo
   - Cada casilla marcada pone a 1 su variable (--t1 … --t4) en la
     sección, con :has(). --progress = suma × 25 %.
   - --progress está registrada como <percentage>: cuando cambia su valor
     calculado, su transición la interpola, y el conic-gradient que la usa
     se redibuja en cada fotograma (sin registrar, saltaría de golpe).
   - El anillo cambia de color, no se mueve: se anima también con
     «reducir movimiento». El tachado crece desde la izquierda con scale
     (solo con movimiento; si no, aparece de golpe).
   ────────────────────────────────────────────────────────────────────── */
@property --progress {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 0%;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.tasks {
  --t1: 0;
  --t2: 0;
  --t3: 0;
  --t4: 0;
  max-width: 340px;
  padding: 14px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
}

.tasks:has(#task-1:checked) { --t1: 1; }
.tasks:has(#task-2:checked) { --t2: 1; }
.tasks:has(#task-3:checked) { --t3: 1; }
.tasks:has(#task-4:checked) { --t4: 1; }

.tasks__head {
  display: flex;
  gap: 12px;
  align-items: center;
}

.tasks h2 {
  margin: 0;
  font-size: 1rem;
}

.tasks__hint {
  margin: 2px 0 0;
  color: #475569;
  font-size: 0.8rem;
}

/* El anillo: --progress se calcula aquí, en el propio anillo (inherits:
   false: la variable registrada no baja de la sección; las --t sí). */
.ring {
  --progress: calc((var(--t1) + var(--t2) + var(--t3) + var(--t4)) * 25%);
  flex: none;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: conic-gradient(#15803d var(--progress), #e2e8f0 0);
  mask-image: radial-gradient(circle, transparent 54%, #000 55%);
  transition: --progress 500ms cubic-bezier(0.2, 0, 0, 1);
}

.tasks__list {
  display: grid;
  gap: 6px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.9rem;
}

.tasks__list label {
  display: flex;
  gap: 8px;
  align-items: center;
  cursor: pointer;
}

.tasks__list input {
  width: 18px;
  height: 18px;
  accent-color: #15803d;
}

/* El tachado: una línea (::after) sobre el texto que crece desde la
   izquierda. El texto también se apaga un poco. */
.tasks__list span {
  position: relative;
  transition: color 200ms;
}

.tasks__list span::after {
  content: "";
  position: absolute;
  top: 55%;
  left: 0;
  width: 100%;
  height: 2px;
  background: currentColor;
  transform-origin: left;
  scale: 0 1;
}

.tasks__list input:checked + span {
  color: #475569;
}

.tasks__list input:checked + span::after {
  scale: 1 1;
}

@media (prefers-reduced-motion: no-preference) {
  .tasks__list span::after {
    transition: scale 300ms cubic-bezier(0.2, 0, 0, 1);
  }
}
```
