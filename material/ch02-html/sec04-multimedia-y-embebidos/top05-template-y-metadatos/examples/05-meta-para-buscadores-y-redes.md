---
example_description: "El <head> para buscadores y redes: meta description, meta robots, Open Graph (og:) y Twitter Cards, que deciden cómo se ve tu página en Google y al compartirla"
example_tags: "html|meta|seo|open-graph|twitter-card|head"
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
  <title>Huerto comunitario de Lavapiés · Apúntate a una parcela</title>

  <!-- Para los BUSCADORES -->
  <!-- La descripción que Google suele mostrar bajo el título (unos 155 caracteres) -->
  <meta name="description" content="Cultiva tu propia parcela en el huerto comunitario de Lavapiés: talleres, compostaje y riego por goteo. Apúntate a la lista de espera.">
  <!-- robots: deja indexar y seguir los enlaces (lo contrario sería noindex, nofollow) -->
  <meta name="robots" content="index, follow">

  <!-- Para las REDES SOCIALES: Open Graph (Facebook, WhatsApp, LinkedIn…) -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Huerto comunitario de Lavapiés">
  <meta property="og:description" content="Talleres, compostaje y parcelas libres en el centro de Madrid.">
  <meta property="og:url" content="https://huertolavapies.example/">
  <meta property="og:image" content="https://huertolavapies.example/cover.jpg">
  <meta property="og:locale" content="es_ES">

  <!-- Twitter/X usa su propia tarjeta; completa lo que falte con las og: -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Huerto comunitario de Lavapiés">
  <meta name="twitter:description" content="Talleres, compostaje y parcelas libres en el centro de Madrid.">
  <meta name="twitter:image" content="https://huertolavapies.example/cover.jpg">
</head>
<body style="font-family: system-ui, sans-serif; padding: 1rem;">
  <h1>Huerto comunitario de Lavapiés</h1>
  <p>Esta página casi no se ve, pero su &lt;head&gt; es lo que leen Google y las redes: abre
     DevTools → Elements para recorrerlo, o compártela en un chat para ver la tarjeta.</p>
</body>
</html>
```
