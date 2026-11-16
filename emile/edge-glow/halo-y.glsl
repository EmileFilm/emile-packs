// Edge glow, at a quarter of the frame: the halo, the outlines spread
// down by a Gaussian over radius (1 is 5% of the short side) in 25 taps.

vec4 passColor(vec2 uv) {
  float r = p_radius * 0.05 * min(resolution.x, resolution.y);
  vec3 sum = vec3(0.0);
  float total = 0.0;
  for (int i = -12; i <= 12; i++) {
    float x = float(i) / 12.0;
    float k = exp(-4.5 * x * x);
    sum += getPass_halo_x(uv + vec2(0.0, x * r / resolution.y)).rgb * k;
    total += k;
  }
  return vec4(sum / total, 1.0);
}
