---
example_description: "padding y margin con 1, 2, 3 o 4 valores (en el sentido de las agujas del reloj) y padding-inline / padding-block"
example_tags: "css|modelo-de-cajas|padding|shorthand"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="pad p1"><div class="content"><code>padding: 16px</code> → los cuatro lados</div></div>
<div class="pad p2"><div class="content"><code>padding: 8px 48px</code> → arriba y abajo 8 · derecha e izquierda 48</div></div>
<div class="pad p3"><div class="content"><code>padding: 4px 48px 28px</code> → arriba 4 · lados 48 · abajo 28</div></div>
<div class="pad p4"><div class="content"><code>padding: 4px 8px 28px 64px</code> → arriba · derecha · abajo · izquierda</div></div>
<div class="pad p5"><div class="content"><code>padding-inline: 48px</code> → izquierda y derecha · <code>padding-block: 0</code> → arriba y abajo</div></div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Verde = padding de cada caja. El hijo azul ocupa su zona de contenido. */
.pad {
  background: #bbf7d0;
  margin-bottom: 12px;
}

.content {
  background: #bfdbfe;
  font-size: 0.9rem;
}

/* Con 4 valores se recorre la caja como las agujas del reloj, empezando arriba:
     top → right → bottom → left
   Con menos valores, los que faltan copian a su lado opuesto:
     1 valor  → los cuatro
     2 valores → (arriba y abajo) (derecha e izquierda)
     3 valores → arriba (derecha e izquierda) abajo        */
.p1 { padding: 16px; }
.p2 { padding: 8px 48px; }
.p3 { padding: 4px 48px 28px; }
.p4 { padding: 4px 8px 28px 64px; }

/* Propiedades lógicas: «inline» es la dirección en la que avanza el texto
   (aquí, horizontal) y «block», la dirección en la que se apilan los bloques (vertical).
   Por qué se llaman así: lección de modos de escritura, en el módulo de tipografía. */
.p5 {
  padding-inline: 48px;
  padding-block: 0;
}

/* margin acepta exactamente la misma sintaxis: margin: 0 auto, margin: 8px 16px 24px… */
```
