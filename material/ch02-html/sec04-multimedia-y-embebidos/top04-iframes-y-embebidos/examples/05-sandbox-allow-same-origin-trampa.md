---
example_description: "sandbox=\"allow-scripts allow-same-origin\" en un documento del MISMO origen no es ningún sandbox: su script entra en la página anfitriona y hasta se quita su propio sandbox"
example_tags: "html|iframe|sandbox|allow-same-origin|allow-scripts|seguridad|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<!-- Ábrelo en el editor (botón «Abrir en el editor»): allí la página vive en un origen
     real (http://localhost:3001) y la trampa se ve con claridad en la consola. -->
<h1 id="secret">Datos privados de la página anfitriona</h1>
<p>Marco con <code>allow-scripts allow-same-origin</code>: <strong id="report-trampa">(aún nada)</strong></p>
<p>Marco con <code>allow-scripts</code> solo: <strong id="report-seguro">(aún nada)</strong></p>

<!-- 🐛 allow-scripts + allow-same-origin a la vez, sobre un documento del MISMO origen
     (un srcdoc hereda el origen de quien lo embebe), deja al marco en TU origen: su script
     ya puede entrar en tu página, leerla, cambiarla y hasta quitarse el sandbox a sí mismo.
     Es «sandbox» solo de nombre. Chrome avisa en la consola de DevTools cuando lo detecta. -->
<iframe sandbox="allow-scripts allow-same-origin" title="Marco que escapa del sandbox" width="10" height="10" srcdoc="
  <script>
    parent.document.getElementById('report-trampa').textContent = 'leí «' + parent.document.getElementById('secret').textContent + '» y te lo cambié';
    parent.document.getElementById('secret').style.color = '#be123c';
    window.frameElement.removeAttribute('sandbox'); /* se quita su propio sandbox */
  </script>"></iframe>

<!-- ✅ Sin allow-same-origin, el marco tiene un origen opaco: es de VERDAD otro origen,
     así que parent.document le está prohibido y no puede tocar nada de tu página. -->
<iframe sandbox="allow-scripts" title="Marco de verdad aislado" width="10" height="10" srcdoc="
  <script>
    try {
      parent.document.getElementById('report-seguro').textContent = 'entré';
    } catch (e) {
      /* El acceso a la página anfitriona lanza un SecurityError: el marco está aislado */
    }
  </script>"></iframe>
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script sí corre en la página
// anfitriona; lee qué dejaron los marcos para mostrar el resultado en la consola.
setTimeout(() => {
  const frames = document.querySelectorAll('iframe');
  console.log('🐛 marco allow-same-origin →', document.getElementById('report-trampa').textContent);
  console.log('   ¿se quitó su propio sandbox? →', frames[0].getAttribute('sandbox') === null ? 'sí, ya no tiene' : 'no');
  console.log('✅ marco solo allow-scripts →', document.getElementById('report-seguro').textContent);
  console.warn('Un marco con allow-scripts + allow-same-origin del mismo origen puede escapar: no uses esa pareja con HTML en el que no confías.');
}, 300);
```
