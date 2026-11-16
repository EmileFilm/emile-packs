// Chromatic aberration: a lens that doesn't bring every colour to the
// same place. lens: as glass does it, nothing at the centre of the frame
// and more towards the corners, pulled outward along the line from the
// centre. shift: the whole frame parted one way (angle), as a prism or a
// misaligned print would. Either way the colours fan out as a spectrum,
// nine samples along the line with red at one end and blue at the other,
// not three hard copies of the picture. amount scales how far they part.

vec4 filterColor(vec2 uv) {
  vec4 here = getColor(uv);
  if (p_amount <= 0.0) return here;
  vec2 spread;
  if (p_mode == 0) {
    vec2 c = uv - 0.5;
    vec2 q = c * vec2(ratio, 1.0);
    float r2 = dot(q, q) / (0.25 * (ratio * ratio + 1.0));
    spread = c * r2 * p_strength * 0.045 * p_amount;
  } else {
    float a = radians(p_angle);
    spread = vec2(cos(a), sin(a)) * p_strength * 0.02 * p_amount * min(resolution.x, resolution.y) / resolution;
  }
  vec4 sum = vec4(0.0);
  vec3 alpha = vec3(0.0), total = vec3(0.0);
  for (int i = 0; i < 9; i++) {
    float t = float(i) / 4.0 - 1.0;
    vec4 s = getColor(uv + spread * t);
    vec3 w = max(vec3(0.0), 1.0 - abs(t - vec3(0.75, 0.0, -0.75)) * 2.0);
    sum.rgb += s.rgb * w;
    alpha += s.a * w;
    total += w;
  }
  vec3 rgb = sum.rgb / total;
  alpha /= total;
  return vec4(rgb, max(alpha.r, max(alpha.g, alpha.b)));
}
