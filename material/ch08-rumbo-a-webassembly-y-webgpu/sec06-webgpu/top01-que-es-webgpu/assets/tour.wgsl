// Un recorrido por WGSL, el lenguaje de los shaders de WebGPU.
// Lo carga el ejemplo 09 de la lección «¿Qué es WebGPU?» con fetch('tour.wgsl').

// Tipos: f32 (float32), i32, u32 y bool. No hay f64, y nada se convierte solo.
// Vectores: vec2f, vec3f, vec4f (de f32); vec2i, vec3u… (de enteros). Matrices: mat4x4f…
const TAX_RATE: f32 = 0.16;            // const: un valor que se conoce al compilar

struct Product {                       // una estructura: datos con nombre, sin métodos
  price: f32,
  units: u32,
}

// fn nombre(parámetro: tipo) -> tipo del resultado
fn total(product: Product) -> f32 {
  let subtotal = product.price * f32(product.units); // let no cambia; f32(…) convierte
  return subtotal * (1.0 + TAX_RATE);
}

fn luminance(color: vec3f) -> f32 {
  return dot(color, vec3f(0.2126, 0.7152, 0.0722)); // de serie: dot, mix, clamp, max…
}

fn transform(matrix: mat4x4f, point: vec4f) -> vec4f {
  return matrix * point;               // matriz × vector, como en GLSL (por columnas)
}

// Un búfer de la GPU (lección 2): @group y @binding dicen dónde lo conecta JavaScript
@group(0) @binding(0) var<storage, read_write> results: array<f32>;

// @compute marca un punto de entrada de cómputo; @workgroup_size, cuántos hilos por grupo
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3u) { // @builtin: un valor que pone la GPU
  var sum = 0.0;                       // var sí cambia (0.0 es decimal: sum es f32)
  for (var i = 0u; i < 4u; i++) {      // bucles, siempre con un límite fijo
    sum += f32(i);
  }
  let basket = Product(19.99, 3u);     // construir una estructura
  if (id.x < arrayLength(&results)) {
    results[id.x] = total(basket) + sum + luminance(vec3f(1.0));
  }
}

// Dos puntos de entrada más, para dibujar (lección 3): uno por vértice y otro por píxel
@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  let corner = vec2f(f32(index % 2u), f32(index / 2u));
  return vec4f(corner * 2.0 - 1.0, 0.0, 1.0);
}

@fragment
fn fragmentMain() -> @location(0) vec4f {   // @location(0): el primer destino del dibujo
  return vec4f(0.882, 0.114, 0.282, 1.0);   // #e11d48, de 0 a 1 como en GLSL
}
