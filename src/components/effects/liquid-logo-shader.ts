// Adapted from liquid-logo (MIT): github effect/liquid-logo-main.
// This is intentionally limited to the visual shader; the source project's
// upload, URL state and configuration UI are not part of this application.
export const liquidLogoFragmentShader = `#version 300 es
precision mediump float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D u_mask;
uniform float u_time;
uniform float u_ratio;

#define PI 3.14159265358979323846

vec3 mod289(vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec2 mod289(vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec3 permute(vec3 x) { return mod289(((x * 34.) + 1.) * x); }
float noise(vec2 v) {
  const vec4 c = vec4(.2113248654, .3660254038, -.5773502692, .0243902439);
  vec2 i = floor(v + dot(v, c.yy));
  vec2 x0 = v - i + dot(i, c.xx);
  vec2 i1 = x0.x > x0.y ? vec2(1., 0.) : vec2(0., 1.);
  vec4 x12 = x0.xyxy + c.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
  vec3 m = max(.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.);
  m *= m; m *= m;
  vec3 x = 2. * fract(p * c.www) - 1.;
  vec3 h = abs(x) - .5;
  vec3 ox = floor(x + .5);
  vec3 a0 = x - ox;
  m *= 1.792842914 - .853734721 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130. * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  uv.x *= u_ratio;
  vec2 sampleUv = vec2(vUv.x, 1. - vUv.y);
  float mask = texture(u_mask, sampleUv).a;
  if (mask < .01) discard;

  float time = u_time * .00022;
  float wave = noise(uv * 2.8 - vec2(time, time * .7));
  float stripes = sin((uv.x * 9. + uv.y * 4. - time * 6. + wave * 1.7) * PI);
  float highlight = smoothstep(.25, 1., stripes) * .7 + .3;
  float rim = smoothstep(.08, .55, mask) * (1. - smoothstep(.62, 1., mask));
  vec3 deepGreen = vec3(.015, .23, .15);
  vec3 emerald = vec3(.05, .78, .47);
  vec3 gold = vec3(1., .72, .18);
  vec3 colour = mix(deepGreen, emerald, highlight);
  colour = mix(colour, gold, smoothstep(.72, 1., stripes) * .42);
  colour += rim * vec3(.16, .42, .31);
  fragColor = vec4(colour, mask * .96);
}`;

export const liquidLogoVertexShader = `#version 300 es
in vec2 a_position;
out vec2 vUv;
void main() {
  vUv = .5 * (a_position + 1.);
  gl_Position = vec4(a_position, 0., 1.);
}`;
