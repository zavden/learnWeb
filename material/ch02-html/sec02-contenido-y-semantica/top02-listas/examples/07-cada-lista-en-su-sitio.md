---
example_description: "Una receta con los tres tipos de lista: ul para ingredientes, ol para pasos, dl para la ficha"
example_tags: "html|listas|ul|ol|dl"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<!-- Cada tipo de lista responde a una pregunta distinta:
     ¿importa el orden? → ol · ¿no importa? → ul · ¿son parejas nombre → valor? → dl -->
<h1>Gazpacho andaluz</h1>

<!-- Ficha: parejas dato → valor -->
<dl>
  <dt>Raciones</dt>
  <dd>4</dd>
  <dt>Tiempo</dt>
  <dd><time datetime="PT15M">15 minutos</time> y <time datetime="PT2H">2 horas</time> de nevera</dd>
  <dt>Dificultad</dt>
  <dd>Fácil</dd>
</dl>

<!-- Ingredientes: da igual en qué orden los compres -->
<h2>Ingredientes</h2>
<ul>
  <li>1 kg de tomates maduros</li>
  <li>1 pimiento verde</li>
  <li>1 pepino</li>
  <li>1 diente de ajo</li>
  <li>50 ml de aceite de oliva virgen extra</li>
  <li>Sal y vinagre al gusto</li>
</ul>

<!-- Pasos: el orden es la receta -->
<h2>Preparación</h2>
<ol>
  <li>Lava y trocea las verduras.</li>
  <li>Tritúralas con el ajo, la sal y el vinagre.</li>
  <li>Añade el aceite poco a poco sin dejar de triturar.</li>
  <li>Cuela la mezcla y guárdala en la nevera.</li>
</ol>
```
