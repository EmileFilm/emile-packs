// The outgoing picture grows and fades as the incoming one settles from large
vec4 transition(vec2 uv) {
  float p = smoothstep(0.0, 1.0, progress);
  vec2 c = vec2(0.5);
  vec4 a = getFromColor(c + (uv - c) / (1.0 + p * 0.6));
  vec4 b = getToColor(c + (uv - c) / (1.6 - p * 0.6));
  return mix(a, b, p);
}
