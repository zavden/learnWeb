// FEATURE FLAGS (ejemplo 03 de «Ejemplos profesionales»).
//
// - La configuración es un módulo JSON: se lee una vez al arrancar.
// - Cada función nueva vive en su módulo y se carga con import() SOLO si
//   está activa para esa persona: quien no la ve, no la descarga.
// - El reparto es determinista: la misma persona cae siempre en el mismo
//   «cubo» (0-99) de cada flag, sin guardar nada, gracias a un hash.
// - enabled: false es el interruptor de emergencia: apaga la función para
//   todos sin tocar el código.
// - Un módulo de función que falla al cargar no rompe la página: se avisa
//   y se sigue sin esa función.
import FLAGS from './flags.json' with { type: 'json' };

// Una función por flag, con la ruta escrita entera: un empaquetador hace un
// archivo aparte para cada función.
const LOADERS = {
  'new-checkout': () => import('./features/new-checkout.js'),
  'gift-wrap': () => import('./features/gift-wrap.js'),
  recommendations: () => import('./features/recommendations.js'),
  'dark-mode': () => import('./features/dark-mode.js'),
};

export const FLAG_NAMES = Object.keys(FLAGS);
export const loadedFeatures = new Set();

// Un hash sencillo: el mismo texto da siempre el mismo número. Multiplicar y
// sumar letra a letra no basta (U-001 y U-002 caerían en cubos seguidos), así
// que después se «mezcla» elevando al cuadrado tres veces. Todo es módulo un
// primo de un millón: los cuadrados (< 10¹²) son enteros exactos en un number.
const PRIME = 1_000_003;

export function bucketOf(flag, userId) {
  let hash = 7;
  for (const char of `${flag}:${userId}`) hash = (hash * 31 + char.codePointAt(0)) % PRIME;
  for (let round = 0; round < 3; round++) hash = (hash * hash + 12_345) % PRIME;
  return hash % 100;
}

export function isEnabled(flag, userId, overrides = {}) {
  if (Object.hasOwn(overrides, flag)) return overrides[flag]; // pruebas y QA
  const config = FLAGS[flag];
  if (!config?.enabled) return false; // desconocida o apagada para todos
  if (config.allow?.includes(userId)) return true; // lista de personas concretas
  return bucketOf(flag, userId) < config.rollout; // rollout: % de personas
}

export async function loadFeature(flag, userId, { overrides = {}, onError } = {}) {
  if (!isEnabled(flag, userId, overrides)) return null;
  try {
    const { default: feature } = await LOADERS[flag]();
    loadedFeatures.add(flag);
    return feature;
  } catch (error) {
    onError?.(flag, error);
    return null; // sin la función, pero con la página funcionando
  }
}
