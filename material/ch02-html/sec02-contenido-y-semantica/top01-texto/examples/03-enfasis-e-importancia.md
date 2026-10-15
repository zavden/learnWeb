---
example_description: "em/strong frente a i/b: se ven igual, pero significan cosas distintas"
example_tags: "html|texto|em|strong|semantica"
example_stage: minimal
example_importance: important
---

# HTML

```html
<!-- em = ÉNFASIS: cambia el sentido de la frase, como cuando lo dices en voz alta -->
<p><em>Yo</em> no he dicho que llegues tarde. (Lo dijo otra persona.)</p>
<p>Yo no he dicho que llegues <em>tarde</em>. (He dicho otra cosa.)</p>

<!-- strong = IMPORTANCIA, gravedad o urgencia -->
<p><strong>Atención:</strong> la placa sigue caliente después de apagarla.</p>

<!-- i = otra «voz» dentro del texto: palabras de otro idioma, términos técnicos,
     nombres científicos, pensamientos. Con lang, el lector de pantalla las pronuncia
     en su idioma (ja-Latn = japonés escrito con letras latinas). -->
<p>Tengo un caso grave de <i lang="ja-Latn">tsundoku</i>: compro libros más deprisa de lo que los leo.</p>
<p>El olivo (<i lang="la">Olea europaea</i>) puede vivir más de mil años.</p>

<!-- b = llamar la atención SIN añadir importancia: palabras clave, nombres de
     producto, la primera frase de una noticia -->
<p>Probamos dos cafeteras, la <b>Aroma 6</b> y la <b>Crema Plus</b>: la segunda hace más espuma.</p>

<!-- Se anidan: más niveles, más énfasis o más importancia -->
<p><strong>No toques el cable. <strong>Nunca.</strong></strong></p>
```
