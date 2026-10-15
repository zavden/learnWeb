---
example_description: "El cambio con el mínimo de monedas: recursión ingenua (66 282 llamadas) frente a memoizada, el voraz que falla con monedas antiguas, las 73 682 formas de pagar 2 € y la versión iterativa para importes enormes"
example_tags: "javascript|profesional|recursion|memoizacion|programacion-dinamica|closures"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// EL CAMBIO DE UNA CAJA REGISTRADORA: ¿con qué monedas se paga un importe usando
// el menor número posible?
//
// Decisiones:
// - Importes en CÉNTIMOS enteros (lección «Números»): nada de 0.1 + 0.2.
// - La definición es recursiva: monedas(n) = 1 + el mínimo de monedas(n − c) para cada
//   moneda c ≤ n. Escrita tal cual repite trabajo de forma explosiva; memoizada, cada
//   importe se resuelve UNA vez.
// - El solucionador es una FÁBRICA: makeChangeSolver(coins) devuelve funciones que
//   comparten su caché privada (closure). Cada sistema de monedas tiene la suya.
// - Para cada importe se guarda también QUÉ moneda dio el óptimo: así se reconstruye
//   el desglose sin volver a calcular.
// - La profundidad de la recursión depende del ORDEN en que se prueban las monedas;
//   para importes enormes, la versión iterativa (de abajo arriba) no usa la pila.
//
// Alcance: módulos 1-3 (recursión, memoización, closures, Map, Intl).

const EURO_COINS = [200, 100, 50, 20, 10, 5, 2, 1]; // céntimos, de mayor a menor
const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const coinLabel = (cents) => (cents >= 100 ? `${cents / 100} €` : `${cents} cént.`);

// ── 1. Recursión ingenua: correcta, pero exponencial ────────────────────
let naiveCalls = 0;
function naiveMinCoins(amount, coins) {
  naiveCalls += 1;
  if (amount === 0) return 0;
  let best = Infinity;
  for (const coin of coins) {
    if (coin <= amount) best = Math.min(best, 1 + naiveMinCoins(amount - coin, coins));
  }
  return best;
}
console.log(`ingenua: 20 cént. → ${naiveMinCoins(20, EURO_COINS)} moneda (${naiveCalls} llamadas)`);

// ── 2. Fábrica de solucionadores memoizados ─────────────────────────────
function makeChangeSolver(coins) {
  const best = new Map(); // importe → { count, coin }: la caché, privada de este solucionador
  let calls = 0;
  let depth = 0;
  let maxDepth = 0;

  function solve(amount) {
    calls += 1;
    if (amount === 0) return { count: 0, coin: null };
    if (best.has(amount)) return best.get(amount);
    depth += 1;
    maxDepth = Math.max(maxDepth, depth);
    let result = { count: Infinity, coin: null };
    for (const coin of coins) {
      if (coin > amount) continue;
      const rest = solve(amount - coin);
      if (rest.count + 1 < result.count) result = { count: rest.count + 1, coin };
    }
    depth -= 1;
    best.set(amount, result);
    return result;
  }

  // Desglose: se siguen las monedas elegidas, importe a importe, sin recalcular nada.
  function breakdown(amount) {
    const used = new Map();
    for (let rest = amount; rest > 0; rest -= solve(rest).coin) {
      const { coin } = solve(rest);
      used.set(coin, (used.get(coin) ?? 0) + 1);
    }
    return used;
  }

  return { solve, breakdown, stats: () => ({ calls, cached: best.size, maxDepth }) };
}

const euroSolver = makeChangeSolver(EURO_COINS);
for (const cents of [499, 1234, 88]) {
  const parts = [...euroSolver.breakdown(cents)].map(([coin, n]) => `${n} × ${coinLabel(coin)}`);
  console.log(`${money.format(cents / 100).padStart(9)} → ${euroSolver.solve(cents).count} monedas: ${parts.join(' + ')}`);
}
console.log('memoizada →', euroSolver.stats());

// ── 3. El algoritmo voraz no siempre acierta ────────────────────────────
// «Coge siempre la moneda más grande que quepa» funciona con el euro, pero no con
// cualquier sistema. Monedas británicas anteriores a 1971, en peniques:
// penny, threepence, sixpence, shilling (12), florin (24) y half crown (30).
const OLD_BRITISH = [30, 24, 12, 6, 3, 1];
function greedy(amount, coins) {
  const used = [];
  let rest = amount;
  for (const coin of coins) {
    while (coin <= rest) {
      used.push(coin);
      rest -= coin;
    }
  }
  return used;
}
const britishSolver = makeChangeSolver(OLD_BRITISH);
console.log('48 peniques, voraz →', greedy(48, OLD_BRITISH).join(' + '), '(3 monedas)');
console.log('48 peniques, óptimo →', [...britishSolver.breakdown(48)].map(([coin, n]) => `${n} × ${coin}`).join(' + '),
  `(${britishSolver.solve(48).count} monedas)`);

// ── 4. ¿De cuántas formas se pueden pagar 2 €? ──────────────────────────
// ways(n, i) = formas de pagar n usando las monedas desde la posición i:
// o usas coins[i] (y puedes volver a usarla), o la descartas para siempre.
function countWays(amount, coins) {
  const cache = new Map();
  function ways(rest, index) {
    if (rest === 0) return 1;
    if (rest < 0 || index === coins.length) return 0;
    const key = `${rest}|${index}`; // dos números → una clave de texto para el Map
    if (!cache.has(key)) cache.set(key, ways(rest - coins[index], index) + ways(rest, index + 1));
    return cache.get(key);
  }
  return { total: ways(amount, 0), cached: cache.size };
}
console.log('formas de pagar 2 € →', countWays(200, EURO_COINS));

// ── 5. Profundidad: el orden de las monedas importa ─────────────────────
// Probando de la MENOR a la mayor, la primera rama es n → n−1 → n−2 → … : un marco
// por céntimo. Con importes grandes, la pila se desborda.
const ascendingSolver = makeChangeSolver(EURO_COINS.toReversed());
try {
  ascendingSolver.solve(50_000);
} catch (error) {
  console.log('500 €, monedas de menor a mayor →', error.name, '|', error.message);
}
const descendingSolver = makeChangeSolver(EURO_COINS);
descendingSolver.solve(50_000);
console.log('500 €, monedas de mayor a menor → profundidad máxima', descendingSolver.stats().maxDepth);

// Versión iterativa, de abajo arriba: resuelve 0, 1, 2… n en un array. Sin pila.
function minCoinsIterative(amount, coins) {
  const counts = new Array(amount + 1).fill(Infinity);
  counts[0] = 0;
  for (let value = 1; value <= amount; value++) {
    for (const coin of coins) {
      if (coin <= value && counts[value - coin] + 1 < counts[value]) counts[value] = counts[value - coin] + 1;
    }
  }
  return counts[amount];
}
console.log(`iterativa: ${money.format(2500)} → ${minCoinsIterative(250_000, EURO_COINS.toReversed())} monedas`);
```
