---
example_description: "Listas anidadas: la sublista va dentro del li al que pertenece"
example_tags: "html|listas|anidamiento|ul|ol"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- Una sublista va DENTRO del li al que pertenece, después de su texto y antes de
     su </li>. El navegador cambia la viñeta en cada nivel: disco, círculo, cuadrado. -->
<h2>Equipaje para la montaña</h2>
<ul>
  <li>Ropa
    <ul>
      <li>Forro polar</li>
      <li>Chubasquero</li>
      <li>Calcetines de lana
        <ul>
          <li>Dos pares de repuesto</li>
        </ul>
      </li>
    </ul>
  </li>
  <li>Comida
    <ul>
      <li>Frutos secos</li>
      <li>Bocadillos</li>
    </ul>
  </li>
  <li>Botiquín</li>
</ul>

<!-- Se pueden mezclar: pasos numerados con detalles en los que el orden no importa -->
<h2>Pan casero</h2>
<ol>
  <li>Mezcla los ingredientes:
    <ul>
      <li>500 g de harina</li>
      <li>350 ml de agua</li>
      <li>10 g de sal</li>
    </ul>
  </li>
  <li>Amasa diez minutos y deja reposar una hora.</li>
</ol>
```

# JavaScript

```javascript
// La sublista es HIJA del li «Ropa»: pertenece a ese elemento
const sublist = document.querySelector('ul ul');
console.log('padre de la sublista →', sublist.parentElement.tagName.toLowerCase());
console.log('texto de ese padre   →', sublist.parentElement.firstChild.textContent.trim());
```
