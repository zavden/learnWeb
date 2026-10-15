---
example_description: "font-size en em se multiplica en cada nivel de anidamiento; en rem siempre se mide contra la raíz"
example_tags: "css|unidades|em|rem"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p>❌ Cada <code>li</code> con <code>font-size: 1.2em</code>:</p>
<ul class="em-list">
  <li>Nivel 1 · 1.2 × 16px = 19.2px
    <ul>
      <li>Nivel 2 · 1.2 × 19.2px = 23px
        <ul>
          <li>Nivel 3 · 1.2 × 23px = 27.6px</li>
        </ul>
      </li>
    </ul>
  </li>
</ul>
<p>✅ Cada <code>li</code> con <code>font-size: 1.2rem</code>:</p>
<ul class="rem-list">
  <li>Nivel 1 · 1.2 × 16px = 19.2px
    <ul>
      <li>Nivel 2 · 19.2px
        <ul>
          <li>Nivel 3 · 19.2px</li>
        </ul>
      </li>
    </ul>
  </li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* 🐛 En font-size, em significa «× la fuente del PADRE». Cada li anidado tiene como
   padre un ul que ha heredado el tamaño del li anterior → el factor se multiplica:
   1.2 → 1.44 → 1.73… Con muchos niveles, el texto se dispara (o, con 0.8em, desaparece). */
.em-list li {
  font-size: 1.2em;
}

/* ✅ rem siempre mide contra <html>: el mismo tamaño en todos los niveles. */
.rem-list li {
  font-size: 1.2rem;
}
```
