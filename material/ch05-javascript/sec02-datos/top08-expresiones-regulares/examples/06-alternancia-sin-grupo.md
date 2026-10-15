---
example_description: "| tiene la prioridad más baja: /^MXN|USD$/ es «(^MXN) o (USD$)» y acepta «MXN-viejo»; /\\.jpg|png$/ deja pasar «factura.jpg.exe». Un grupo (?:…) encierra la alternancia"
example_tags: "javascript|regex|alternancia|anclas|grupos|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// | significa «o»: /MXN|USD/ encaja con cualquiera de los dos.
// 🐛 Pero | tiene la prioridad MÁS BAJA: parte la regex entera en dos mitades.
//    /^MXN|USD$/ significa «^MXN» o «USD$», no «^(MXN o USD)$».
const buggyCurrency = /^MXN|USD$/;
// ✅ (?:…) agrupa sin capturar (lo verás en el ejemplo siguiente): las anclas
//    quedan fuera y la alternancia, dentro.
const currency = /^(?:MXN|USD)$/;
for (const value of ['MXN', 'USD', 'MXN-viejo', 'AUSD', 'EUR']) {
  console.log(`${value.padEnd(9)} 🐛 ${buggyCurrency.test(value)} · ✅ ${currency.test(value)}`);
}

// 🐛 Lo mismo con extensiones de archivo: /\.jpg|png$/ es «\.jpg» o «png$».
const buggyImage = /\.jpg|png$/i;
const image = /\.(?:jpg|png)$/i;
for (const file of ['foto.jpg', 'logo.PNG', 'factura.jpg.exe', 'diseño-png', 'plano.svg']) {
  console.log(`${file.padEnd(15)} 🐛 ${buggyImage.test(file)} · ✅ ${image.test(file)}`);
}

// El atributo pattern de HTML ya envuelve tu patrón en ^(?:…)$, por eso allí
// pattern="MXN|USD" funciona. En JavaScript, el grupo lo pones tú.
```
