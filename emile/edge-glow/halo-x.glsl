// Edge glow, at a quarter of the frame: the halo, the outlines spread
// across by a Gaussian over radius (1 is 5% of the short side) in 25 taps.

vec4 passColor(vec2 uv) {
  float r = p_radius * 0.05 * min(resolution.x, resolution.y);
  vec3 sum = vec3(0.0);
  float total = 0.0;
  for (int i = -12; i <= 12; i++) {
    float x = float(i) / 12.0;
    float k = exp(-4.5 * x * x);
    sum += getPass_edges(uv + vec2(x * r / resolution.x, 0.0)).rgb * k;
    total += k;
  }
  return vec4(sum / total, 1.0);
}
