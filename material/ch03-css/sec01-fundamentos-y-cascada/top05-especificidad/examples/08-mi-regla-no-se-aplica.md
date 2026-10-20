---
example_description: "El caso real: .btn no puede cambiar el color porque #sidebar a pesa más; se arregla bajando la especificidad"
example_tags: "css|especificidad|depuracion|where"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<nav id="sidebar">
  <p>❌ Enlaces con <code>#sidebar a</code> → (1, 0, 1)</p>
  <a href="#">Enlace normal</a>
  <a href="#" class="btn">Botón: debería ser blanco sobre azul</a>
</nav>
<nav class="sidebar">
  <p>✅ Enlaces con <code>:where(.sidebar) a</code> → (0, 0, 1)</p>
  <a href="#">Enlace normal</a>
  <a href="#" class="btn">Botón: blanco sobre azul</a>
</nav>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

nav {
  border: 1px solid #cbd5e1;
  padding: 0 8px 8px;
  margin: 8px 0;
}

/* ❌ Color de los enlaces de la barra lateral, escrito con un id */
#sidebar a { color: #1e3a8a; }               /* (1,0,1) */

/* ✅ El mismo estilo con la especificidad mínima */
:where(.sidebar) a { color: #1e3a8a; }       /* (0,0,1): :where() vale 0, solo cuenta la a */

/* …más abajo en la hoja, un componente «botón» */
.btn {
  color: #ffffff;                            /* (0,1,0) */
  background: #2563eb;
  padding: 4px 10px;
}

/* En #sidebar, color: #ffffff pierde contra (1,0,1): texto azul oscuro sobre azul, ilegible.
   El fondo y el padding sí se aplican, porque ninguna otra regla los declara.
   En DevTools → Styles verás  color: #ffffff  tachado: esa es la pista.
   ❌ Parches que agravan el problema: #sidebar .btn {…} o color: #ffffff !important.
   ✅ Arreglo de raíz: que la regla general pese poco (una clase o :where()). */
```
