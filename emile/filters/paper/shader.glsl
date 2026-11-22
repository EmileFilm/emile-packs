// Paper: the picture printed on a sheet. The paper's tone shows through
// the lights, ink never quite reaches black, and the sheet has a surface:
// a tooth lit from one side, a soft mottle, a few long fibres. All of it
// fixed by the seed; sizes in pixels of a frame 1080 pixels on its short
// side.

float paperHash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float paperNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(paperHash(i), paperHash(i + vec2(1.0, 0.0)), u.x), mix(paperHash(i + vec2(0.0, 1.0)), paperHash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// The sheet's height: a fine tooth on a coarser one
float paperHeight(vec2 p) {
  return paperNoise(p / 1.6) * 0.45 + paperNoise(p / 4.2 + 17.0) * 0.35 + paperNoise(p / 11.0 + 43.0) * 0.2;
}

// Long thin fibres one way: noise stretched along a direction, kept where
// it crosses its middle
float paperFibres(vec2 p, float angle) {
  vec2 d = vec2(cos(angle), sin(angle));
  vec2 q = vec2(dot(p, d) / 70.0, dot(p, vec2(-d.y, d.x)) / 1.6);
  float n = paperNoise(q);
  float gate = smoothstep(0.55, 0.8, paperNoise(p / 90.0 + angle * 13.0));
  return (1.0 - smoothstep(0.0, 0.05, abs(n - 0.5))) * gate;
}

vec4 filterColor(vec2 uv) {
  vec4 c = getColor(uv);
  if (p_amount <= 0.0) return c;
  vec2 p = uv * resolution / (min(resolution.x, resolution.y) / 1080.0) + mod(seed, 89.0) * 7.13;
  // Light from the upper left catches the tooth
  float lit = paperHeight(p + vec2(-0.9, 0.9)) - paperHeight(p + vec2(0.9, -0.9));
  float mottle = paperNoise(p / 70.0) * 0.6 + paperNoise(p / 210.0) * 0.4;
  float fibres = paperFibres(p, 0.4) + paperFibres(p + 31.0, 2.1) + paperFibres(p + 77.0, 3.5);
  float surface = 1.0 + lit * 0.5 * p_texture + (mottle - 0.5) * 0.04 * p_texture - fibres * 0.09 * p_fibres;
  vec3 rgb = c.a > 0.0 ? c.rgb / c.a : vec3(0.0);
  // Ink on paper: never quite black, the paper's tone in the lights
  vec3 inked = mix(vec3(0.085, 0.08, 0.075), vec3(1.0), rgb) * p_tone * surface;
  vec3 outc = mix(rgb, clamp(inked, 0.0, 1.0), p_amount);
  return vec4(outc * c.a, c.a);
}
