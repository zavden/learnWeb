---
example_description: "Cada token de sandbox devuelve UN permiso: allow-scripts ejecuta scripts, allow-same-origin le da origen propio (y almacenamiento), allow-popups deja abrir pestañas"
example_tags: "html|iframe|sandbox|allow-scripts|allow-same-origin|allow-popups"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<h1>Un permiso por token</h1>

<!-- Cada frame tiene un sandbox distinto. Su documento ejecuta un script (necesita
     allow-scripts) que informa de dos cosas: su ORIGEN (window.origin) y si puede usar
     localStorage. Un origen opaco se escribe "null" y no tiene almacenamiento. -->

<p><code>sandbox="allow-scripts"</code></p>
<iframe sandbox="allow-scripts" title="Solo scripts" width="420" height="80" srcdoc="
  <div style='font-family: system-ui, sans-serif; margin: .5rem; font-size: .9rem'>
    <p id='r'>…</p>
    <script>
      var storage; try { localStorage.length; storage = 'sí'; } catch (e) { storage = 'no (origen opaco)'; }
      document.getElementById('r').textContent = 'origen: ' + origin + ' · almacenamiento: ' + storage;
    </script>
  </div>"></iframe>

<p><code>sandbox="allow-scripts allow-same-origin"</code> &mdash; recupera su origen</p>
<iframe sandbox="allow-scripts allow-same-origin" title="Scripts y mismo origen" width="420" height="80" srcdoc="
  <div style='font-family: system-ui, sans-serif; margin: .5rem; font-size: .9rem'>
    <p id='r'>…</p>
    <script>
      var storage; try { localStorage.length; storage = 'sí'; } catch (e) { storage = 'no'; }
      document.getElementById('r').textContent = 'origen: ' + origin + ' · almacenamiento: ' + storage;
    </script>
  </div>"></iframe>

<p><code>sandbox="allow-scripts allow-popups"</code> &mdash; pulsa el botón</p>
<iframe sandbox="allow-scripts allow-popups" title="Scripts y popups" width="420" height="80" srcdoc="
  <div style='font-family: system-ui, sans-serif; margin: .5rem; font-size: .9rem'>
    <button type='button' id='b'>Abrir una pestaña</button> <span id='r'></span>
    <script>
      document.getElementById('b').addEventListener('click', function () {
        var w = window.open('https://developer.mozilla.org/', '_blank', 'noopener');
        document.getElementById('r').textContent = w ? 'se abrió' : 'bloqueado';
      });
    </script>
  </div>"></iframe>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  padding: 1rem;
}

h1 {
  font-size: 1.3rem;
}

iframe {
  display: block;
  border: 1px solid #64748b;
  border-radius: 8px;
}
```
