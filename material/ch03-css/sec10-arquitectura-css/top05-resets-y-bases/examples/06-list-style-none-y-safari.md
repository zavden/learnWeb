---
example_description: "list-style: none quita las viñetas… y en Safari con VoiceOver también quita la semántica de lista («lista, 3 elementos» deja de anunciarse). Chrome la conserva. El reset moderno solo quita las viñetas a las listas marcadas con role=\"list\", que además recuperan la semántica en Safari"
example_tags: "css|arquitectura|reset|listas|accesibilidad|safari|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="label">❌ <code>ul { list-style: none }</code> en el reset: en Safari, VoiceOver ya no dice «lista, 3 elementos»</p>
<ul class="steps-plain">
  <li>Elige la fecha</li>
  <li>Indica cuántas personas</li>
  <li>Confirma con tu correo</li>
</ul>

<p class="label">✅ <code>role="list"</code> pide la lista sin viñetas y conserva la semántica en todos los navegadores</p>
<ul class="steps" role="list">
  <li>Elige la fecha</li>
  <li>Indica cuántas personas</li>
  <li>Confirma con tu correo</li>
</ul>

<p class="label">Una lista normal, sin <code>role</code>: el reset no la toca y conserva sus viñetas</p>
<ul>
  <li>Se admiten mascotas en la terraza</li>
  <li>Hay trona para bebés</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.label {
  margin: 14px 0 6px;
  font-size: 0.72rem;
}

/* 🐛 El reset de antes: todas las listas sin viñetas.
   Safari (WebKit) decidió que una lista sin marcadores visibles quizá no
   es «una lista» para quien la ve, y con VoiceOver deja de anunciarla como
   tal: se pierde el «lista, 3 elementos» que ayuda a orientarse. Chrome y
   Firefox mantienen la semántica, así que en esta vista previa no notarás
   nada: compruébalo en DevTools → Accessibility (role: list) y, si tienes
   un Mac, con Safari y VoiceOver (⌘ F5). */
.steps-plain {
  padding: 0;
  list-style: none;
}

/* ✅ El reset moderno: sin viñetas SOLO si la lista lo pide con
   role="list". El atributo repone la semántica en Safari, y deja claro en
   el HTML que la falta de viñetas es intencionada. Las demás listas
   conservan las suyas. */
:where(ul, ol)[role="list"] {
  padding: 0;
  list-style: none;
}

.steps-plain li,
.steps li {
  padding: 4px 10px;
  border-left: 3px solid #0f766e;
  margin-bottom: 4px;
}
```
