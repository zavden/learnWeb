---
example_description: "Una caja de inicio de sesión centrada con min() y márgenes fluidos, campos al 100 % con border-box, anillos de foco sin saltos, botones con icono de fondo y un separador con texto hecho con un desbordamiento"
example_tags: "css|profesional|formularios|box-sizing|clamp|foco"
example_stage: professional
example_importance: critical
---

# HTML

```html
<main class="auth">
  <img class="auth-logo" src="logo.svg" width="96" height="96" alt="">
  <h1 class="auth-title">Entra en Ultramarinos Lucía</h1>
  <p class="auth-intro">Consulta tus pedidos, repite la compra de la semana y gestiona tus direcciones.</p>

  <a class="btn btn--alt icon-key" href="#">Entrar con una llave de acceso</a>
  <a class="btn btn--alt icon-mail" href="#">Recibir un enlace por correo</a>

  <p class="divider"><span>o con tu contraseña</span></p>

  <form class="auth-form" action="#" method="post">
    <p class="field">
      <label for="login-email">Correo electrónico</label>
      <input id="login-email" name="email" type="email" autocomplete="email" required placeholder="nombre@ejemplo.es">
    </p>
    <p class="field">
      <label for="login-password">Contraseña</label>
      <input id="login-password" name="password" type="password" autocomplete="current-password" required minlength="8" aria-describedby="password-hint">
      <span class="field-hint" id="password-hint">Al menos 8 caracteres.</span>
    </p>
    <p class="auth-options">
      <label class="check"><input type="checkbox" name="remember"> Recordarme en este dispositivo</label>
      <a class="forgot" href="#">¿Has olvidado tu contraseña?</a>
    </p>
    <button class="btn btn--primary" type="submit">Entrar</button>
  </form>

  <p class="auth-footer">¿Todavía no tienes cuenta? <a href="#">Crea una en un minuto</a></p>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Caja de acceso
   - La caja: width: min(100% − 2rem, 25rem) + margin-inline: auto. En un móvil
     deja 1rem a cada lado; en una pantalla grande, 25rem centrados. El margen
     superior es fluido con clamp(): poco en pantallas bajas, más en las altas.
   - Todos los controles miden de borde a borde (border-box) y ocupan el 100 %.
   - Ningún estado cambia un borde de grosor: el foco es outline + box-shadow y el
     error cambia solo el color del borde.
   - Sin flexbox: el separador «o con tu contraseña» se hace con una caja de media
     línea de alto, un borde inferior y el texto desbordando por debajo.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
  }

  img {
    display: block;
    max-width: 100%;
    height: auto;
  }

  input,
  button {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-page: #eef2ff;
    --color-surface: #ffffff;
    --color-text: #1e293b;
    --color-text-muted: #475569;
    --color-border: #e2e8f0;
    --color-border-strong: #64748b;
    --color-brand: #1d4ed8;
    --color-brand-strong: #1e40af;
    --color-danger: #b91c1c;
    --color-focus: #1d4ed8;

    --radius-md: 10px;
    --radius-lg: 18px;
    --control-height: 2.75rem;
    --shadow-card: 0 1px 2px rgb(15 23 42 / 0.06), 0 20px 48px rgb(30 58 138 / 0.14);
  }
}

@layer base {
  /* El fondo del body se propaga a todo el lienzo (html no tiene fondo propio):
     un color y un punteado que llenan la ventana, scroll incluido. */
  body {
    background: url("dots.svg") 0 0 / 20px, var(--color-page);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  :where(a) {
    color: var(--color-brand);
  }

  :where(a):hover {
    color: var(--color-brand-strong);
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .auth {
    width: min(100% - 2rem, 25rem);
    margin: clamp(1rem, 8vh, 4rem) auto 2rem;
    padding: clamp(1.25rem, 6vw, 2.25rem);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
    text-align: center;
  }

  /* Un bloque con ancho fijo se centra con márgenes auto */
  .auth-logo {
    width: 3.5rem;
    margin: 0 auto 1rem;
    border-radius: 12px;
  }

  .auth-title {
    margin-bottom: 0.5rem;
    font-size: clamp(1.375rem, 4vw, 1.625rem);
    line-height: 1.2;
  }

  .auth-intro {
    margin-bottom: 1.5rem;
    color: var(--color-text-muted);
  }

  /* ─── Botones de ancho completo ─── */
  .btn {
    display: block;
    width: 100%;                        /* <button> no se estira solo; los <a> de bloque, sí */
    min-height: var(--control-height);
    margin-bottom: 0.75rem;
    padding: 0.55rem 1rem;
    border: 2px solid var(--color-border-strong);
    border-radius: var(--radius-md);
    background-color: var(--color-surface);
    color: var(--color-text);
    font-weight: 600;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
  }

  .btn:hover {
    border-color: var(--color-text);    /* solo cambia el color: el grosor es fijo */
    color: var(--color-text);
  }

  .btn:active {
    box-shadow: inset 0 2px 4px rgb(15 23 42 / 0.2);
  }

  .btn--primary {
    border-color: var(--color-brand);
    background-color: var(--color-brand);
    color: #ffffff;
  }

  .btn--primary:hover {
    border-color: var(--color-brand-strong);
    background-color: var(--color-brand-strong);
    color: #ffffff;
  }

  /* Icono de fondo a la izquierda; el relleno izquierdo es igual al derecho para que
     el texto quede centrado en el botón y no en el hueco que deja el icono. */
  .btn--alt {
    padding-inline: 2.75rem;
    background-repeat: no-repeat;
    background-position: left 1rem center;
    background-size: 1.25rem;
  }

  .icon-key  { background-image: url("icon-key.svg"); }
  .icon-mail { background-image: url("icon-mail.svg"); }

  /* ─── Separador con texto ─── */
  /* La caja mide media línea de alto (0.8em = 1.6 / 2) y dibuja un borde inferior:
     la línea pasa justo por el centro del texto, que desborda por debajo (overflow:
     visible). El span tapa la línea con el fondo blanco: el fondo de una caja en línea
     se pinta después que los bordes de los bloques. (Con flexbox se hará más sencillo.) */
  .divider {
    height: 0.8em;
    margin: 1.5rem 0 2rem;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: 0.875rem;
    line-height: 1.6;
  }

  .divider span {
    padding-inline: 0.75rem;
    background: var(--color-surface);
  }

  /* ─── Formulario ─── */
  .auth-form {
    text-align: start;
  }

  .field {
    margin-bottom: 1rem;
  }

  .field label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 600;
  }

  /* 100 % de ancho con relleno y borde: sin border-box se saldría 1.5rem + 4px */
  .field input {
    display: block;
    width: 100%;
    min-height: var(--control-height);
    padding: 0.5rem 0.75rem;
    border: 2px solid var(--color-border-strong);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
  }

  /* Foco: el outline de la capa base (por fuera, sin ocupar sitio) y, además, el borde
     cambia de color. Un halo claro de box-shadow quedaría bonito, pero sobre blanco no
     llega al contraste 3:1 que necesita un indicador de foco. */
  .field input:focus-visible {
    outline-offset: 1px;
    border-color: var(--color-focus);
  }

  /* :user-invalid solo se activa cuando la persona ya ha tocado el campo */
  .field input:user-invalid {
    border-color: var(--color-danger);
  }

  .field-hint {
    display: block;
    margin-top: 0.25rem;
    color: var(--color-text-muted);
    font-size: 0.8125rem;
  }

  .auth-options {
    margin-bottom: 1.25rem;
    font-size: 0.875rem;
  }

  /* La casilla y el enlace en líneas propias: con textos largos, nada se pisa */
  .check {
    display: block;
    margin-bottom: 0.5rem;
    cursor: pointer;
  }

  .check input {
    margin-right: 0.375rem;
  }

  .forgot {
    display: inline-block;
    padding-block: 0.125rem;            /* zona de clic algo mayor que la letra */
  }

  .auth-footer {
    margin-top: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: 0.9375rem;
  }
}
```
