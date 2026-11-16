// Grain: fine, uneven noise over the picture, a new grain every frame,
// strongest in the mid-tones as on film. size is in pixels of a frame
// 1080 pixels on its short side, so the preview and the export look alike.

float grainHash(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

// Smooth noise on the grain's grid: soft grains, not hard squares
float grainNoise(vec2 q, float t) {
  vec2 i = floor(q), f = fract(q);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = grainHash(vec3(i, t)), b = grainHash(vec3(i + vec2(1.0, 0.0), t));
  float c = grainHash(vec3(i + vec2(0.0, 1.0), t)), d = grainHash(vec3(i + vec2(1.0, 1.0), t));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Two sizes of grain together, centred on 0
float grain(vec2 q, float t) {
  return grainNoise(q, t) * 0.65 + grainNoise(q * 2.3 + 7.1, t + 0.5) * 0.35 - 0.5;
}

vec4 filterColor(vec2 uv) {
  vec4 c = getColor(uv);
  vec3 rgb = c.a > 0.0 ? c.rgb / c.a : vec3(0.0);
  vec2 q = uv * resolution / (p_size * min(resolution.x, resolution.y) / 1080.0);
  float t = frame + mod(seed, 997.0) * 0.013;
  vec3 n = p_colour ? vec3(grain(q, t), grain(q + 31.7, t + 0.25), grain(q + 63.1, t + 0.75)) : vec3(grain(q, t));
  float l = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
  float mid = mix(0.35, 1.0, 1.0 - abs(2.0 * l - 1.0));
  rgb = clamp(rgb + n * p_amount * 0.55 * mid, 0.0, 1.0);
  return vec4(rgb * c.a, c.a);
}
