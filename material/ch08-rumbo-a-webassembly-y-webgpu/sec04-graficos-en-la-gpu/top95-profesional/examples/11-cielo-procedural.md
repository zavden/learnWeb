---
renderer: shader
resolution: 640x360
shader_uniforms: "hour:float=18.5[5,23.5,0.25]|clouds:float=0.5[0,1,0.05]|speed:float=1[0,6,0.5]"
example_description: "Un cielo procedural sobre el valle de México, solo con un shader de LearnWeb: la hora del día (control hour) coloca el sol en su arco y mezcla los colores del cielo de día, del atardecer y de la noche; nubes de ruido fractal (5 octavas) que deriva con u_time; estrellas que titilan de noche; y las siluetas de dos volcanes con nieve y bruma. Con ▶, el día avanza una hora cada 20 s (control speed). El fotograma quieto de las tarjetas es el atardecer de las 18:30"
example_tags: "shader|glsl|webgl|procedural|ruido|fbm|cielo|u-time|uniforms|profesional"
example_stage: professional
example_importance: important
---

# Vertex

```vertex
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
```

# Fragment

```fragment
// highp si la GPU la tiene en los fragment shaders (el ruido con sin() la necesita);
// si no, mediump. En el Mac del curso, las dos son de 32 bits.
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float hour;   // 5 a 23.5: la hora del día
uniform float clouds; // 0 = despejado, 1 = cubierto
uniform float speed;  // horas que pasan cada 20 s con ▶

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) { // ruido de valor: azar en una rejilla, interpolado
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) { // 5 octavas: cada una, el doble de detalle y la mitad de fuerza
  float sum = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    sum += amplitude * noise(p);
    p *= 2.03;
    amplitude *= 0.5;
  }
  return sum;
}
float mountains(float x) { // la altura de las siluetas en cada x (unidades cuadradas)
  float volcano = 0.34 - 0.55 * abs(x - 0.55);                        // un cono
  float ridge = 0.27 - 0.25 * abs(x - 1.1) + 0.012 * sin(x * 19.0);   // una cresta larga
  float hills = 0.15 + 0.025 * sin(x * 7.0) + 0.012 * sin(x * 23.0);  // lomas cercanas
  return max(max(volcano, ridge), hills);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y); // unidades cuadradas: el sol, redondo
  float pixel = 1.0 / u_resolution.y;

  // El sol recorre un arco de 6:30 a 19:30; de noche, queda bajo el horizonte
  float h = mod(hour + u_time * speed / 20.0, 24.0);
  float day = (h - 6.5) / 13.0;                          // 0 al salir, 1 al ponerse
  float elevation = sin(clamp(day, -0.25, 1.25) * 3.14159);
  vec2 sun = vec2(mix(0.15, 0.85, day) * aspect, 0.2 + 0.7 * elevation);
  float daylight = smoothstep(-0.1, 0.35, elevation);   // 0 de noche, 1 a pleno día
  float dusk = smoothstep(-0.3, 0.0, elevation) * (1.0 - smoothstep(0.05, 0.4, elevation));

  // El cielo: tres degradados (noche, día, atardecer) mezclados según el sol
  vec3 night = mix(vec3(0.05, 0.07, 0.16), vec3(0.01, 0.02, 0.07), uv.y);
  vec3 noon = mix(vec3(0.62, 0.8, 0.95), vec3(0.16, 0.4, 0.82), uv.y);
  vec3 sunset = mix(vec3(0.98, 0.52, 0.28), vec3(0.24, 0.22, 0.48), smoothstep(0.1, 0.8, uv.y));
  vec3 sky = mix(night, noon, daylight);
  float nearSun = 1.0 - smoothstep(0.0, 1.4, abs(p.x - sun.x)); // el atardecer, más cerca del sol
  sky = mix(sky, sunset, dusk * (0.55 + 0.45 * nearSun));

  // El sol y su halo
  vec3 sunColor = mix(vec3(1.0, 0.45, 0.2), vec3(1.0, 0.96, 0.86), daylight);
  float d = distance(p, sun);
  sky += sunColor * (0.55 * exp(-d * 7.0) * smoothstep(-0.2, 0.0, elevation));
  sky = mix(sky, sunColor, 1.0 - smoothstep(0.035, 0.035 + 2.0 * pixel, d));

  // Estrellas: de noche, una celda de cada 300 brilla y titila
  vec2 cell = floor(gl_FragCoord.xy / 3.0);
  float star = step(0.9967, hash(cell)) * (1.0 - daylight) * smoothstep(0.35, 0.7, uv.y);
  sky += star * (0.6 + 0.4 * sin(u_time * 3.0 + hash(cell + 7.0) * 6.28));

  // Nubes: ruido fractal que deriva con el tiempo, iluminado por el color del sol
  float n = fbm(vec2(p.x * 1.6 + u_time * 0.02 * speed, p.y * 3.5));
  float cover = smoothstep(1.0 - clouds * 0.6, 1.2 - clouds * 0.6, n + 0.2) * smoothstep(0.28, 0.5, uv.y);
  vec3 cloudColor = mix(vec3(0.14, 0.15, 0.22), mix(vec3(0.96), sunColor, dusk * 0.8), max(daylight, dusk));
  sky = mix(sky, cloudColor * (0.75 + 0.25 * n), cover * 0.9);

  // Las montañas: silueta con bruma, y nieve en las cumbres altas
  float top = mountains(p.x);
  vec3 rock = mix(vec3(0.03, 0.04, 0.09), vec3(0.2, 0.24, 0.32), daylight);
  rock = mix(rock, sky, 0.3 * smoothstep(0.1, 0.3, p.y)); // más lejos (más arriba), más bruma
  float snow = smoothstep(top - 0.045, top - 0.03, p.y) * step(0.26, top);
  rock = mix(rock, mix(vec3(0.85, 0.88, 0.95), sunColor, dusk * 0.5) * (0.25 + 0.75 * max(daylight, dusk)), snow);
  vec3 color = mix(rock, sky, smoothstep(top - pixel, top + pixel, p.y));

  gl_FragColor = vec4(color, 1.0);
}

// En el editor: pulsa ▶ y mira pasar la tarde; prueba «hour» (las 13:00, las 22:00…),
// «clouds» y «speed» (con 0, solo derivan las nubes y titilan las estrellas).
```
