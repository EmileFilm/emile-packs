// Bloom, at a quarter of the frame: the light spread down over a quarter of
// the radius, a Gaussian in 17 taps. With the wide spread (blur-x.glsl,
// blur-y.glsl) it makes the glow: bright close to the light, falling off
// smoothly far from it.

vec4 passColor(vec2 uv) {
  float r = p_radius * 0.025 * min(resolution.x, resolution.y);
  vec3 sum = vec3(0.0);
  float total = 0.0;
  for (int i = -8; i <= 8; i++) {
    float x = float(i) / 8.0;
    float k = exp(-4.5 * x * x);
    sum += getPass_tight_x(uv + vec2(0.0, x * r / resolution.y)).rgb * k;
    total += k;
  }
  return vec4(sum / total, 1.0);
}
