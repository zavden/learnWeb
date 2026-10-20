---
example_description: "El elemento <link rel> conecta la página con otros recursos: icono, canonical, preload (con as), preconnect y versiones alternativas (hreflang, feed RSS)"
example_tags: "html|link|rel|icon|canonical|preload|head"
example_stage: intermediate
example_importance: important
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Huerto comunitario · Blog</title>

  <!-- Icono de la pestaña (y marcadores). brand.svg está en la carpeta assets/ del tema -->
  <link rel="icon" href="brand.svg" type="image/svg+xml">
  <!-- Icono para cuando alguien guarda la web en la pantalla de inicio del móvil -->
  <link rel="apple-touch-icon" href="brand.svg">

  <!-- canonical: "la dirección oficial de esta página", para que el buscador no trate como
       duplicados la misma página con y sin "?utm_source=…" o con y sin "/" final -->
  <link rel="canonical" href="https://huertolavapies.example/blog/compostaje/">

  <!-- preload: pide YA un recurso que hará falta en breve, con as= para saber su tipo.
       La portada de abajo se descarga antes porque la hemos precargado. -->
  <link rel="preload" href="cover.svg" as="image">

  <!-- preconnect adelanta DNS + TCP + TLS con un dominio del que pronto pedirás algo
       (una fuente, un CDN). Como es a otro sitio, aquí va comentado:
       <link rel="preconnect" href="https://fonts.example" crossorigin> -->

  <!-- Versiones alternativas de ESTA página -->
  <!-- en inglés (hreflang): el buscador ofrece a cada quien la de su idioma -->
  <link rel="alternate" hreflang="en" href="https://huertolavapies.example/en/blog/composting/">
  <!-- el feed RSS, para lectores de noticias -->
  <link rel="alternate" type="application/rss+xml" title="Blog del huerto" href="https://huertolavapies.example/blog/feed.xml">
</head>
<body style="font-family: system-ui, sans-serif; padding: 1rem;">
  <h1>Cómo montar tu compostador</h1>
  <!-- Esta imagen usa el recurso precargado: por eso el preload de arriba no se desperdicia -->
  <img src="cover.svg" alt="Ilustración del huerto comunitario" width="600" height="315" style="max-width: 100%; height: auto;">
  <p>Mira la pestaña del navegador: muestra el icono del enlace <code>rel="icon"</code>.</p>
</body>
</html>
```
