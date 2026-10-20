---
example_description: "credentials: 'include' (enviar cookies a otro origen) falla con Access-Control-Allow-Origin: * aunque sin credenciales funcione: con credenciales, el servidor debe nombrar el origen exacto y añadir Access-Control-Allow-Credentials: true"
example_tags: "javascript|cors|credentials|cookies|access-control-allow-credentials|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
const accountUrl = 'http://127.0.0.1:3001/api/demo/echo';

async function attempt(label, url, options) {
  try {
    const response = await fetch(url, options);
    console.log(`${label} → ${response.status} ${response.statusText}`);
  } catch (error) {
    console.log(`${label} → ${error.name}: ${error.message}`);
  }
}

// Sin credenciales (por defecto, a otro origen no van cookies): * basta.
await attempt('sin credenciales, Allow-Origin: *', accountUrl);

// 🐛 Con credentials: 'include' el navegador enviaría las cookies de
//    127.0.0.1, y entonces NO acepta «*»: un comodín no basta para datos
//    privados de un usuario.
await attempt('🐛 credentials: include, Allow-Origin: *', accountUrl, { credentials: 'include' });

// ✅ El servidor nombra el origen (lo copia de la cabecera Origin) y añade
//    Access-Control-Allow-Credentials: true. Aquí, con ?cors=origin.
await attempt('✅ credentials: include, Allow-Origin: <tu origen>', `${accountUrl}?cors=origin`, { credentials: 'include' });

// credentials: 'omit' (nunca cookies), 'same-origin' (por defecto: solo a tu
// origen) o 'include' (también a otros). Un servidor que «copia» cualquier
// Origin y permite credenciales le abre los datos de sus usuarios a
// cualquier web: debe copiar solo los orígenes de una lista que conoce.
```
