---
example_description: "La carta de un restaurante: secciones con índice, platos como listas de descripción, precios, vinos en una tabla, menú del día, alérgenos y horario"
example_tags: "profesional|restaurante|carta|dl|tablas|fragmentos"
example_stage: professional
example_importance: useful
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Carta de otoño · Casa Merche, cocina de mercado</title>
  <meta name="description" content="Carta de otoño de Casa Merche: entrantes, arroces, pescados, postres caseros y menú del día. Con la información de alérgenos de cada plato.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <style>
    /* Solo legibilidad; el CSS se estudia en el capítulo 3 */
    .dishes div { padding-block: 0.75rem; border-bottom: 1px dotted #9ca3af; }
    .dishes dt { font-size: 1.1rem; font-weight: 700; }
    .dishes dd { margin: 0; }
    .dishes .allergens { font-size: 0.9rem; color: #4b5563; }
    .dishes .price { font-weight: 700; }
    .menu-of-the-day { padding: 1rem; border: 2px solid #7c2d12; background: #ffedd5; }
    .menu-of-the-day h3 { margin-bottom: 0.25rem; }
  </style>
  <!-- Herramienta del curso: revisa el documento y escribe el resultado en la consola -->
  <script defer src="js/audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://casamerche.example/">Casa Merche</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://casamerche.example/">Inicio</a></li>
        <li><a href="https://casamerche.example/carta/" aria-current="page">Carta</a></li>
        <li><a href="https://casamerche.example/reservas/">Reservas</a></li>
        <li><a href="https://casamerche.example/donde-estamos/">Dónde estamos</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main prose" tabindex="-1">
    <h1>Carta de otoño</h1>
    <p class="lead">Cocina de mercado: la carta cambia con las estaciones y lo que traen cada mañana los productores de la comarca.</p>

    <figure>
      <img src="img/dining-room.svg" alt="El comedor: tres ventanas con cuarterones, dos mesas con mantel blanco y una planta grande en el centro." width="960" height="400">
      <figcaption>El comedor, en la planta baja de una casa de 1910.</figcaption>
    </figure>

    <!-- Un índice de la carta: enlaces a fragmentos de esta misma página -->
    <nav aria-label="Secciones de la carta">
      <ul class="menu">
        <li><a href="#starters">Entrantes</a></li>
        <li><a href="#mains">Principales</a></li>
        <li><a href="#desserts">Postres</a></li>
        <li><a href="#wines">Vinos</a></li>
        <li><a href="#daily-menu">Menú del día</a></li>
        <li><a href="#allergens">Alérgenos</a></li>
      </ul>
    </nav>

    <!-- Cada plato es una pareja «nombre → detalles»: una lista de descripción.
         Un dt puede tener varios dd (descripción, alérgenos, precio); el div agrupa cada plato -->
    <section>
      <h2 id="starters">Entrantes</h2>
      <dl class="dishes">
        <div>
          <dt>Croquetas de jamón</dt>
          <dd>Seis unidades, con bechamel de leche fresca.</dd>
          <dd class="allergens">Alérgenos: gluten, leche y huevo.</dd>
          <dd class="price">9,50&nbsp;€</dd>
        </div>
        <div>
          <dt>Ensalada de granada y queso de cabra</dt>
          <dd>Con nueces y brotes de la huerta. Vegetariana.</dd>
          <dd class="allergens">Alérgenos: leche y frutos de cáscara.</dd>
          <dd class="price">11,00&nbsp;€</dd>
        </div>
        <div>
          <dt>Setas de temporada a la plancha</dt>
          <dd>Con ajo, perejil y yema curada. Vegetariana.</dd>
          <dd class="allergens">Alérgenos: huevo.</dd>
          <dd class="price">13,50&nbsp;€</dd>
        </div>
      </dl>
    </section>

    <section>
      <h2 id="mains">Principales</h2>
      <dl class="dishes">
        <div>
          <dt>Arroz meloso de pato y setas</dt>
          <!-- small: la letra pequeña de un plato -->
          <dd>Con caldo de ave hecho en casa. <small>Mínimo dos personas; precio por persona.</small></dd>
          <dd class="allergens">Alérgenos: apio y sulfitos.</dd>
          <dd class="price">17,00&nbsp;€</dd>
        </div>
        <div>
          <dt>Merluza en salsa verde con almejas</dt>
          <dd>Merluza de pincho, del puerto de Burela.</dd>
          <dd class="allergens">Alérgenos: pescado, moluscos y gluten.</dd>
          <dd class="price">19,50&nbsp;€</dd>
        </div>
        <div>
          <dt>Carrillera de ternera al vino tinto</dt>
          <dd>Guisada durante seis horas, con puré de patata.</dd>
          <dd class="allergens">Alérgenos: leche, apio y sulfitos.</dd>
          <dd class="price">18,00&nbsp;€</dd>
        </div>
      </dl>
    </section>

    <section>
      <h2 id="desserts">Postres</h2>
      <dl class="dishes">
        <div>
          <dt>Torrija caramelizada con helado de vainilla</dt>
          <dd class="allergens">Alérgenos: gluten, leche y huevo.</dd>
          <dd class="price">6,50&nbsp;€</dd>
        </div>
        <div>
          <dt>Tarta de queso al horno</dt>
          <dd class="allergens">Alérgenos: leche, huevo y gluten.</dd>
          <dd class="price">6,00&nbsp;€</dd>
        </div>
        <div>
          <dt>Fruta de temporada</dt>
          <dd>Pregunta por la de hoy.</dd>
          <dd class="price">4,50&nbsp;€</dd>
        </div>
      </dl>
    </section>

    <section>
      <h2 id="wines">Vinos</h2>
      <!-- Cada precio se lee cruzando vino y formato: aquí sí hay una tabla -->
      <div class="table-scroll" role="region" aria-labelledby="wines-caption" tabindex="0">
        <table>
          <caption id="wines-caption">Vinos por copa y por botella</caption>
          <thead>
            <tr>
              <th scope="col">Vino</th>
              <th scope="col" class="num">Copa</th>
              <th scope="col" class="num">Botella</th>
            </tr>
          </thead>
          <tbody>
            <tr><th scope="row">Tinto joven de la comarca</th><td class="num">2,80&nbsp;€</td><td class="num">13,00&nbsp;€</td></tr>
            <tr><th scope="row">Blanco verdejo</th><td class="num">3,20&nbsp;€</td><td class="num">16,00&nbsp;€</td></tr>
            <tr><th scope="row">Rosado de garnacha</th><td class="num">3,00&nbsp;€</td><td class="num">14,50&nbsp;€</td></tr>
          </tbody>
        </table>
      </div>
      <p>Agua, refrescos, cerveza y cafés: consulta la pizarra de la barra.</p>
    </section>

    <section class="menu-of-the-day">
      <h2 id="daily-menu">Menú del día</h2>
      <p>De martes a viernes, al mediodía: <strong>16,50&nbsp;€</strong>. <small>Pan, bebida y postre o café incluidos. IVA incluido.</small></p>
      <h3>Primeros, a elegir</h3>
      <ul>
        <li>Crema de calabaza asada</li>
        <li>Lentejas estofadas con verduras</li>
      </ul>
      <h3>Segundos, a elegir</h3>
      <ul>
        <li>Pollo de corral al ajillo</li>
        <li>Bacalao con pisto</li>
      </ul>
      <p>Los platos del menú cambian cada semana.</p>
    </section>

    <section>
      <h2 id="allergens">Alérgenos</h2>
      <p><strong>Si tienes alguna alergia o intolerancia, avísanos antes de pedir.</strong> Cada plato indica cuáles de los catorce alérgenos de declaración obligatoria contiene:</p>
      <!-- El orden da igual: ul. sub: la fórmula química del dióxido de azufre -->
      <ul>
        <li>Gluten</li>
        <li>Crustáceos</li>
        <li>Huevo</li>
        <li>Pescado</li>
        <li>Cacahuetes</li>
        <li>Soja</li>
        <li>Leche</li>
        <li>Frutos de cáscara</li>
        <li>Apio</li>
        <li>Mostaza</li>
        <li>Sésamo</li>
        <li>Dióxido de azufre (SO<sub>2</sub>) y sulfitos</li>
        <li>Altramuces</li>
        <li>Moluscos</li>
      </ul>
    </section>
  </main>

  <aside class="site-aside" aria-labelledby="hours-title">
    <h2 id="hours-title">Horario</h2>
    <div class="table-scroll" role="region" aria-labelledby="hours-caption" tabindex="0">
      <table>
        <caption id="hours-caption">Horario de comidas y cenas</caption>
        <thead>
          <tr>
            <th scope="col">Día</th>
            <th scope="col">Comidas</th>
            <th scope="col">Cenas</th>
          </tr>
        </thead>
        <tbody>
          <!-- colspan: «Cerrado» vale para las dos columnas -->
          <tr><th scope="row">Lunes</th><td colspan="2">Cerrado</td></tr>
          <tr><th scope="row">Martes a jueves</th><td><time datetime="13:30">13:30</time>–<time datetime="16:00">16:00</time></td><td>Cerrado</td></tr>
          <tr><th scope="row">Viernes y sábado</th><td><time datetime="13:30">13:30</time>–<time datetime="16:00">16:00</time></td><td><time datetime="20:30">20:30</time>–<time datetime="23:30">23:30</time></td></tr>
          <tr><th scope="row">Domingo</th><td><time datetime="13:30">13:30</time>–<time datetime="16:30">16:30</time></td><td>Cerrado</td></tr>
        </tbody>
      </table>
    </div>
  </aside>

  <footer class="site-footer">
    <!-- address: el contacto del restaurante, responsable de esta web -->
    <address>
      Casa Merche · Calle del Horno, 3 · Ribera<br>
      Reservas: <a href="tel:+34925111222">925 11 12 22</a> · <a href="mailto:reservas@casamerche.example?subject=Reserva">reservas@casamerche.example</a>
    </address>
    <p><small>© 2026 Casa Merche · Precios con IVA incluido.</small></p>
  </footer>
</body>
</html>
```
