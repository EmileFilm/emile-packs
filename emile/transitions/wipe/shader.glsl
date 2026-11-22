// The incoming picture uncovered from the left, behind a soft edge
vec4 transition(vec2 uv) {
  float edge = 0.04;
  // The edge travels from the left to the right: the incoming picture
  // is behind it, the outgoing one ahead of it
  float x = progress * (1.0 + edge) - edge;
  float t = 1.0 - smoothstep(x, x + edge, uv.x);
  return mix(getFromColor(uv), getToColor(uv), t);
}
