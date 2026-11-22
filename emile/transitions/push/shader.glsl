// The incoming picture pushes the outgoing one out to the left
vec4 transition(vec2 uv) {
  float p = smoothstep(0.0, 1.0, progress);
  vec2 from = uv + vec2(p, 0.0);
  vec2 to = uv + vec2(p - 1.0, 0.0);
  return from.x <= 1.0 ? getFromColor(from) : getToColor(to);
}
