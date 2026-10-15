---
example_description: "Cada declaración se valida por separado: las inválidas se descartan en silencio y el resto se aplica"
example_tags: "css|errores|declaracion|depuracion"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="card">❌ <code>.card</code>: de sus cinco declaraciones solo se aplican dos (texto azul y negrita).</p>
<p class="card-expected">✅ <code>.card-expected</code>: así se vería si las cinco fueran válidas.</p>
```

# CSS

```css
/* El navegador valida CADA declaración por separado. Si una es inválida,
   la descarta en silencio (ningún error en la consola) y sigue con la siguiente.
   En DevTools → Styles verás las descartadas tachadas, con un icono de aviso. */
.card {
  color: navy;              /* ✅ válida */
  backgroud: #fde68a;       /* ❌ propiedad mal escrita (falta una «n») → descartada */
  border: 3px solid rojo;   /* ❌ «rojo» no es un color de CSS → se descarta el border ENTERO */
  padding: 12;              /* ❌ falta la unidad (12px) → descartada.
                                  Solo se aceptaría sin DOCTYPE, en quirks mode. */
  font-weight: bold;        /* ✅ válida: los errores de arriba no la afectan */
}

/* La misma regla, corregida, para comparar */
.card-expected {
  color: navy;
  background: #fde68a;
  border: 3px solid red;
  padding: 12px;
  font-weight: bold;
}
```
