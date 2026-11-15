// The incoming picture uncovered from the left, behind a soft edge
vec4 transition(vec2 uv) {
  float edge = 0.04;
  float x = progress * (1.0 + edge) - edge;
  float t = smoothstep(x, x + edge, 1.0 - uv.x);
  return mix(getFromColor(uv), getToColor(uv), t);
}
