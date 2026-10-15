---
example_description: "Etiquetas de cierre opcionales: li y p se cierran solos (y es válido)"
example_tags: "parser|etiquetas-opcionales|li|p"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<!-- Algunas etiquetas de cierre son OPCIONALES según el estándar: el parser sabe
     dónde termina el elemento. Un li se cierra al empezar el siguiente li; un p, al
     empezar otro p (o un bloque, como verás en el ejemplo siguiente). Esto es HTML
     válido, pero cerrar siempre deja más claro dónde termina cada cosa. -->
<div id="demo">
<ul>
  <li>Uno
  <li>Dos
  <li>Tres
</ul>
<p>Primer párrafo
<p>Segundo párrafo
</div>
```

# JavaScript

```javascript
// El DOM resultante: cada li y cada p tiene su cierre, aunque no los escribiéramos
console.log(document.querySelector('#demo').innerHTML);
```
