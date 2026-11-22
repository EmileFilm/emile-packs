// Edge glow, at half the frame: the light's core, the outlines spread
// across by a Gaussian over 0.4% of the short side in 13 taps.

vec4 passColor(vec2 uv) {
  float r = 0.004 * min(resolution.x, resolution.y);
  vec3 sum = vec3(0.0);
  float total = 0.0;
  for (int i = -6; i <= 6; i++) {
    float x = float(i) / 6.0;
    float k = exp(-4.5 * x * x);
    sum += getPass_edges(uv + vec2(x * r / resolution.x, 0.0)).rgb * k;
    total += k;
  }
  return vec4(sum / total, 1.0);
}
