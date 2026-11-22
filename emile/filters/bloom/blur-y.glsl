// Bloom, at a quarter of the frame: the light spread down, a
// Gaussian over radius (1 is 10% of the frame's short side) in 33 taps;
// the picture is a quarter size, so the taps sit under two of its pixels
// apart and its linear filtering fills between them.

vec4 passColor(vec2 uv) {
  float r = p_radius * 0.10 * min(resolution.x, resolution.y);
  vec3 sum = vec3(0.0);
  float total = 0.0;
  for (int i = -16; i <= 16; i++) {
    float x = float(i) / 16.0;
    float k = exp(-4.5 * x * x);
    sum += getPass_blur_x(uv + vec2(0.0, x * r / resolution.y)).rgb * k;
    total += k;
  }
  return vec4(sum / total, 1.0);
}
