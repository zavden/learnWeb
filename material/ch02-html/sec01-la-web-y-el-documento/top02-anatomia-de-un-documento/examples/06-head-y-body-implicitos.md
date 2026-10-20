---
example_description: "El parser crea html, head y body aunque no los escribas (y mueve lo que llega tarde)"
example_tags: "head|body|parser|etiquetas-implicitas|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<!-- 🐛 Este documento no tiene etiquetas html, head ni body… y aun así las tiene:
     el parser las crea él solo, porque las tres existen siempre en el DOM. -->
<meta charset="utf-8">
<title>Etiquetas implícitas</title>
<!-- Al llegar el primer contenido visible, el parser cierra el head y abre el body -->
<p>Este párrafo es lo primero visible: aquí empieza el body.</p>
<!-- ❌ Esta meta llega tarde: el head ya está cerrado, así que acaba DENTRO del body,
     donde no le corresponde (los metadatos del documento van en el head) -->
<meta name="description" content="Una descripción que llega demasiado tarde">
<p>Abre la consola para ver dónde acabó cada elemento.</p>

<script>
  // parentElement (JavaScript) dice quién es el padre de cada elemento en el DOM
  console.log('raíz del documento      →', document.documentElement.tagName);
  console.log('padre de title          →', document.querySelector('title').parentElement.tagName);
  console.log('padre del primer p      →', document.querySelector('p').parentElement.tagName);
  console.log('padre de la meta tardía →',
    document.querySelector('meta[name="description"]').parentElement.tagName);
</script>
```
