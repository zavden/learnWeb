# HTML-FULL

```html-full
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hello HTML-FULL</title>
  <style>
    html {
      margin: 0;
      padding: 24px;
      font-family: system-ui, sans-serif;
      background: #0f172a;
      color: red;
    }

    .card {
      max-width: 420px;
      padding: 18px;
      border-radius: 16px;
      background: rgba(148, 163, 184, 0.14);
    }
  </style>
</head>
<body>
  <main class="card">
    <h1>Hello HTML-FULL</h1>
    <button id="hello-btn" type="button">Click me</button>
  </main>
  <script>
    const button = document.getElementById("hello-btn");
    button?.addEventListener("click", () => {
      button.textContent = "Pressed";
    });
  </script>
</body>
</html>
```