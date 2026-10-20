---
example_description: "Un informe anual con gráficos accesibles: barras y una línea en SVG (role=\"img\", title, desc y viewBox), una minigráfica en canvas nítida con devicePixelRatio y su tabla de datos dentro, y todos los datos en tablas"
example_tags: "profesional|informe|svg|canvas|devicepixelratio|accesibilidad|tabla"
example_stage: professional
example_importance: important
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Informe anual 2026 · Huerto comunitario de Lavapiés</title>
  <meta name="description" content="Cosecha, agua y temperatura del huerto comunitario de Lavapiés en 2026, con gráficos accesibles y todos los datos en tablas.">
  <link rel="canonical" href="https://huertolavapies.example/informes/2026/">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/media-audit.js"></script>
  <style>
    /* Textos de los gráficos SVG */
    .chart-label { font-size: 12px; fill: #1f2937; }
    /* La caja de la minigráfica: el script ajusta su mapa de bits a la pantalla */
    #water-sparkline { width: 280px; height: 60px; vertical-align: middle; }
  </style>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://huertolavapies.example/">Huerto comunitario de Lavapiés</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://huertolavapies.example/el-huerto/">El huerto</a></li>
        <li><a href="https://huertolavapies.example/informes/" aria-current="page">Informes</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Informe anual 2026</h1>
    <p class="lead">Un año con menos lluvia y más calor que la media: cosechamos más tomate y menos lechuga, y gastamos un 18 % más de agua.</p>

    <h2>Cosecha por cultivo</h2>
    <!-- 1. Gráfico de barras en SVG: informativo, así que role="img" con title (el nombre) y
         desc (los datos). El viewBox lo hace escalar sin deformarse. -->
    <figure>
      <svg viewBox="0 0 420 200" width="420" height="200" role="img" aria-labelledby="harvest-title" aria-describedby="harvest-desc">
        <title id="harvest-title">Cosecha de 2026 por cultivo, en kilos</title>
        <desc id="harvest-desc">Tomate 312 kg, calabacín 145 kg, lechuga 64 kg, judía verde 98 kg y pimiento 120 kg.</desc>
        <g fill="#be123c">
          <rect x="30" y="20" width="56" height="156"/>
          <rect x="106" y="103.5" width="56" height="72.5"/>
          <rect x="182" y="144" width="56" height="32"/>
          <rect x="258" y="127" width="56" height="49"/>
          <rect x="334" y="116" width="56" height="60"/>
        </g>
        <line x1="20" y1="176" x2="400" y2="176" stroke="#475569"/>
        <g class="chart-label" text-anchor="middle">
          <text x="58" y="192">tomate</text><text x="134" y="192">calabacín</text><text x="210" y="192">lechuga</text>
          <text x="286" y="192">judía</text><text x="362" y="192">pimiento</text>
          <text x="58" y="14">312</text><text x="134" y="97">145</text><text x="210" y="138">64</text>
          <text x="286" y="121">98</text><text x="362" y="110">120</text>
        </g>
      </svg>
      <figcaption>El tomate dio más de la mitad de toda la cosecha.</figcaption>
    </figure>
    <details>
      <summary>Ver los datos de la cosecha</summary>
      <table>
        <caption>Cosecha de 2026</caption>
        <thead><tr><th scope="col">Cultivo</th><th scope="col" class="num">Kilos</th></tr></thead>
        <tbody>
          <tr><td>Tomate</td><td class="num">312</td></tr><tr><td>Calabacín</td><td class="num">145</td></tr>
          <tr><td>Lechuga</td><td class="num">64</td></tr><tr><td>Judía verde</td><td class="num">98</td></tr>
          <tr><td>Pimiento</td><td class="num">120</td></tr>
        </tbody>
      </table>
    </details>

    <h2>Temperatura máxima media</h2>
    <!-- 2. Una línea quebrada: fill="none" (si no, se rellena de negro) y stroke -->
    <figure>
      <svg viewBox="0 0 420 160" width="420" height="160" role="img" aria-labelledby="temp-title" aria-describedby="temp-desc">
        <title id="temp-title">Temperatura máxima media por mes de mayo a septiembre</title>
        <desc id="temp-desc">Mayo 26 grados, junio 31, julio 36, agosto 35 y septiembre 29.</desc>
        <line x1="20" y1="70" x2="400" y2="70" stroke="#64748b" stroke-dasharray="6 4"/>
        <text class="chart-label" x="398" y="64" text-anchor="end">30 °C</text>
        <polyline points="40,90 120,65 200,40 280,45 360,75" fill="none" stroke="#b45309" stroke-width="3" stroke-linejoin="round"/>
        <g fill="#b45309"><circle cx="40" cy="90" r="4"/><circle cx="120" cy="65" r="4"/><circle cx="200" cy="40" r="4"/><circle cx="280" cy="45" r="4"/><circle cx="360" cy="75" r="4"/></g>
        <g class="chart-label" text-anchor="middle">
          <text x="40" y="150">may</text><text x="120" y="150">jun</text><text x="200" y="150">jul</text><text x="280" y="150">ago</text><text x="360" y="150">sep</text>
        </g>
      </svg>
      <figcaption>Julio y agosto pasaron de 35 °C de media: las tomateras lo agradecieron y las lechugas, no.</figcaption>
    </figure>

    <h2>Agua de la última semana</h2>
    <!-- 3. Una minigráfica en canvas: un gráfico con datos, así que sin role; su tabla va
         dentro como contenido alternativo (la leen los lectores de pantalla). Va en un figure
         y no en un p: una <table> dentro de un <p> cerraría el párrafo (lección del parser). -->
    <figure>
      <canvas id="water-sparkline" width="280" height="60">
        <table>
          <caption>Agua de la última semana, en litros</caption>
          <tr><th scope="row">Lunes</th><td>42</td></tr><tr><th scope="row">Martes</th><td>38</td></tr>
          <tr><th scope="row">Miércoles</th><td>55</td></tr><tr><th scope="row">Jueves</th><td>61</td></tr>
          <tr><th scope="row">Viernes</th><td>47</td></tr><tr><th scope="row">Sábado</th><td>30</td></tr>
          <tr><th scope="row">Domingo</th><td>28</td></tr>
        </table>
      </canvas>
      <figcaption>Litros de agua por día, de lunes a domingo.</figcaption>
    </figure>
    <p class="muted">El jueves fue el día de más consumo (61 litros), por la ola de calor.</p>
  </main>

  <footer class="site-footer">
    <p>Datos recogidos por el grupo de riego · <a href="https://huertolavapies.example/informes/2026/datos.csv">Descarga los datos en CSV</a></p>
  </footer>

  <script>
    // Adelanto: JavaScript (y la API 2D del canvas) se explican en sus capítulos.
    // Mapa de bits = caja CSS × devicePixelRatio, y scale para dibujar en píxeles CSS.
    const water = [42, 38, 55, 61, 47, 30, 28];
    const sparkline = document.getElementById('water-sparkline');
    const ratio = window.devicePixelRatio;
    sparkline.width = Math.round(280 * ratio);
    sparkline.height = Math.round(60 * ratio);
    const ctx = sparkline.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    water.forEach((liters, day) => {
      const x = 10 + day * 43;
      const y = 55 - liters * 0.8;
      if (day === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    // El punto más alto, marcado
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(10 + 3 * 43, 55 - 61 * 0.8, 4, 0, 2 * Math.PI);
    ctx.fill();
    console.log(`minigráfica → caja 280 × 60, mapa de bits ${sparkline.width} × ${sparkline.height} (devicePixelRatio ${ratio})`);
  </script>
</body>
</html>
```
