// The two pictures mixed, eased at both ends
vec4 transition(vec2 uv) {
  float p = smoothstep(0.0, 1.0, progress);
  return mix(getFromColor(uv), getToColor(uv), p);
}
