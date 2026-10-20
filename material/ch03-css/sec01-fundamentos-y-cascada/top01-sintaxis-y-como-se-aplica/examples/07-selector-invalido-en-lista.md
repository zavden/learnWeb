---
example_description: "Un solo selector inválido en una lista descarta la regla completa; soluciones con reglas separadas o :is()"
example_tags: "css|errores|selectores|lista"
example_stage: common-error
example_importance: important
---

# HTML

```html
<h2>❌ h2 · está en la lista «h2, .note:hovr» → debería ser rojo… y no lo es</h2>
<h3>✅ h3 · tiene su propia regla → rojo</h3>
<h4>✅ h4 · está dentro de :is(h4, .note:hovr) → rojo</h4>
```

# CSS

```css
/* ❌ Una lista de selectores es TODO O NADA.
   «:hovr» no existe (es :hover mal escrito) → .note:hovr es un selector inválido
   → el navegador descarta la regla COMPLETA, también para h2. */
h2, .note:hovr {
  color: crimson;
}

/* ✅ Solución 1: reglas separadas. La inválida se descarta sola. */
h3 { color: crimson; }
.note:hovr { color: crimson; }   /* descartada, pero no arrastra a la de h3 */

/* ✅ Solución 2: :is() acepta una lista «indulgente»: ignora el selector inválido
   y conserva el resto. (:is() se explica en la lección de pseudoclases.) */
:is(h4, .note:hovr) {
  color: crimson;
}

/* Caso real típico: mezclar en una lista un selector con prefijo de otro navegador,
   como  input::-moz-placeholder, input::placeholder { … }
   Chrome no conoce ::-moz-placeholder → descarta la regla entera. */
```
