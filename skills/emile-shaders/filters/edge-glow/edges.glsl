// Edge glow, first pass, at half the frame: where the outlines are. A
// Sobel over the picture's colour, its nine points 0.8% of the short side
// apart and each the mean of four taps around it, so the step and the
// softening scale with the frame (720p and 4K alike) and fine texture
// (grass, hair, pores, grain) averages away before it is measured: what
// is left are the edges of shapes. Each channel's gradient is measured and
// the largest kept, so a red shape on green counts as much as dark on
// light. Edges over the threshold, eased in, carry the light's colour.

vec3 edgeAt(vec2 uv, vec2 d) {
  vec2 q = d * 0.5;
  return (getColor(uv + vec2(-q.x, -q.y)).rgb + getColor(uv + vec2(q.x, -q.y)).rgb
    + getColor(uv + vec2(-q.x, q.y)).rgb + getColor(uv + vec2(q.x, q.y)).rgb) * 0.25;
}

vec4 passColor(vec2 uv) {
  vec2 d = vec2(0.008 * min(resolution.x, resolution.y)) / resolution;
  vec3 a = edgeAt(uv + vec2(-d.x, d.y), d), b = edgeAt(uv + vec2(0.0, d.y), d), c = edgeAt(uv + d, d);
  vec3 l = edgeAt(uv + vec2(-d.x, 0.0), d), r = edgeAt(uv + vec2(d.x, 0.0), d);
  vec3 e = edgeAt(uv - d, d), f = edgeAt(uv + vec2(0.0, -d.y), d), g = edgeAt(uv + vec2(d.x, -d.y), d);
  vec3 gx = (c + 2.0 * r + g) - (a + 2.0 * l + e);
  vec3 gy = (a + 2.0 * b + c) - (e + 2.0 * f + g);
  vec3 m = sqrt(gx * gx + gy * gy) * 0.25;
  float strength = max(m.r, max(m.g, m.b));
  float from = mix(0.08, 0.5, p_threshold);
  float edge = smoothstep(from, from + 0.12, strength);
  return vec4(p_colour * edge, 1.0);
}
