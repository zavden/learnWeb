---
example_description: "hyphens: auto depende del atributo lang: el mismo texto español sin idioma no se parte, con lang=\"en\" (la plantilla en inglés de siempre) separa las dos erres (guer-rilleros, car-retera) y con lang=\"es\" las mantiene juntas (guerri-lleros, carre-tera)"
example_tags: "css|tipografia|hyphens|lang|guiones|accesibilidad|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="label">Las tres columnas tienen <code>hyphens: auto</code> y el mismo texto en español. Solo cambia su atributo <code>lang</code>.</p>

<div class="cases">
  <section aria-label="Sin idioma">
    <p class="caption">❌ <code>lang=""</code>: idioma desconocido, ningún guion</p>
    <p class="column" lang="">El desarrollo del ferrocarril llegó a la chocolatería, la tortillería y la pollería; los guerrilleros callejeros recorrían la carretera con la caballería.</p>
  </section>

  <section aria-label="Idioma inglés">
    <p class="caption">❌ <code>lang="en"</code>: separa la «rr» (guer-rilleros, car-retera)</p>
    <p class="column" lang="en">El desarrollo del ferrocarril llegó a la chocolatería, la tortillería y la pollería; los guerrilleros callejeros recorrían la carretera con la caballería.</p>
  </section>

  <section aria-label="Idioma español">
    <p class="caption">✅ <code>lang="es"</code>: la «rr» va junta (guerri-lleros, carre-tera)</p>
    <p class="column" lang="es">El desarrollo del ferrocarril llegó a la chocolatería, la tortillería y la pollería; los guerrilleros callejeros recorrían la carretera con la caballería.</p>
  </section>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 0 0 8px;
  font-size: 0.75rem;
}

.cases {
  display: flex;
  gap: 10px;
  align-items: start;
}

.cases > section {
  flex: none;
  inline-size: 130px;
}

.caption {
  margin: 0 0 4px;
  font-size: 0.7rem;
}

.column {
  margin: 0;
  outline: 1px dashed #4338ca;
  font-family: Georgia, serif;
  font-size: 1rem;
  line-height: 1.5;
  text-align: justify;
  hyphens: auto;
}

/* 🐛 El navegador parte las palabras con el diccionario del idioma del elemento,
   y el idioma lo dice lang (el del propio elemento o el del antepasado más
   cercano que lo tenga).
   - lang="" significa «idioma desconocido»: no hay diccionario y no se parte nada.
     Es lo que pasa en una página sin lang en <html>.
   - lang="en" aplica las reglas del inglés: parte donde partiría una palabra
     inglesa, y el inglés sí separa las dos erres (guer-rilleros, car-retera,
     fer-rocarril). En español, «rr» y «ll» son un solo sonido y nunca se separan.
     Es el error más común, porque muchas plantillas empiezan con
     <html lang="en"> (también la de Emmet, el «!» de VS Code).
   - lang="es": cortes entre sílabas españolas (guerri-lleros, carre-tera,
     fe-rrocarril, torti-llería).
   El mismo lang decide la voz del lector de pantalla, la corrección ortográfica,
   el traductor automático y las mayúsculas de text-transform. */
```
