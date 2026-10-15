// 🐛 UN MÓDULO QUE PIDE { products } A UN ARCHIVO JSON (ejemplo 06 de
// «Rutas, import maps y herramientas»). Un módulo JSON solo tiene una
// exportación, la por defecto: el objeto entero.
import { products } from './catalog.json' with { type: 'json' };

console.log('esta línea nunca se imprime', products.length);
