// VHS: a tape played many times. What tape does to a picture, in order:
// brightness keeps about 240 lines of detail across, so it goes soft
// sideways and its edges ring; colour keeps far less and arrives late, so
// it smears to the right of what it belongs to; each line lands a little
// off, slowly wandering; the head switches at the bottom of the frame and
// tears the last lines; a band of mistracking drifts up now and then;
// snow in the brightness, slower blotches in the colour, and a rare
// dropout: a white comet along one line. Blacks lift, whites dull, colour
// thins. Everything reads the frame and the seed. amount turns the tape's
// damage down as a whole.

float vhsHash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float vhsNoise(float x) {
  float i = floor(x), f = fract(x);
  return mix(vhsHash(vec2(i, 7.0)), vhsHash(vec2(i + 1.0, 7.0)), f * f * (3.0 - 2.0 * f));
}

vec3 vhsYiq(vec3 c) {
  return vec3(dot(c, vec3(0.299, 0.587, 0.114)), dot(c, vec3(0.596, -0.274, -0.322)), dot(c, vec3(0.211, -0.523, 0.312)));
}

vec3 vhsRgb(vec3 y) {
  return vec3(y.x + 0.956 * y.y + 0.621 * y.z, y.x - 0.272 * y.y - 0.647 * y.z, y.x - 1.106 * y.y + 1.703 * y.z);
}

vec4 filterColor(vec2 uv) {
  vec4 here = getColor(uv);
  if (p_amount <= 0.0) return here;
  float k = p_amount;
  float t = frame + mod(seed, 211.0) * 4.7;
  float line = floor(uv.y * 480.0);
  // Where this line lands
  float wander = (vhsNoise(uv.y * 9.0 + t * 0.21) - 0.5) * 0.0035 + (vhsHash(vec2(line, t)) - 0.5) * 0.0011;
  float head = smoothstep(0.032, 0.0, uv.y);
  float tear = head * (0.012 + 0.05 * vhsHash(vec2(line, t + 3.0)) * head);
  // A band of mistracking: there about a third of the time, drifting up
  float trackY = fract(t * 0.0045 + 0.3);
  float track = smoothstep(0.55, 0.75, vhsNoise(t * 0.035 + 5.0)) * smoothstep(0.012, 0.0, abs(uv.y - trackY));
  float x = uv.x + (wander + tear + track * (vhsHash(vec2(line, t + 9.0)) - 0.5) * 0.06) * p_jitter * k;
  // Brightness: soft sideways
  float stepY = 0.0017 * k;
  vec4 mid = getColor(vec2(x, uv.y));
  vec4 soft = mid * 0.375 + (getColor(vec2(x - stepY, uv.y)) + getColor(vec2(x + stepY, uv.y))) * 0.25 + (getColor(vec2(x - 2.0 * stepY, uv.y)) + getColor(vec2(x + 2.0 * stepY, uv.y))) * 0.0625;
  float alpha = soft.a;
  float y = vhsYiq(soft.rgb).x;
  y += (vhsYiq(mid.rgb).x - y) * 0.6 * k;
  // Colour: from the left of here, so it trails to the right
  float stepC = 0.006 * p_bleed * k;
  vec2 iq = vec2(0.0);
  float total = 0.0;
  for (int i = 0; i < 6; i++) {
    float weight = exp(-0.45 * float(i));
    iq += vhsYiq(getColor(vec2(x - (float(i) + 0.5) * stepC, uv.y)).rgb).yz * weight;
    total += weight;
  }
  iq /= total;
  // Snow, colour blotches, the head's tear, a dropout
  float snow = (vhsHash(vec2(floor(x * 420.0), line) + fract(t * 0.317) * 61.0) - 0.5) * 0.11 * p_noise;
  vec2 blotch = (vec2(vhsHash(vec2(floor(x * 46.0), floor(line * 0.5)) + fract(t * 0.173) * 37.0), vhsHash(vec2(floor(x * 46.0) + 91.0, floor(line * 0.5)) + fract(t * 0.211) * 53.0)) - 0.5) * 0.07 * p_noise;
  float torn = (head * 0.6 + track) * (vhsHash(vec2(floor(x * 160.0), line) + fract(t * 0.619) * 29.0) - 0.35) * 0.7 * p_jitter;
  float chance = vhsHash(vec2(line * 1.7, floor(t)));
  float from = vhsHash(vec2(line, floor(t) + 0.5));
  float comet = chance > 1.0 - 0.006 * p_noise ? step(from, x) * exp(-(x - from) * 22.0) : 0.0;
  y = y * (1.0 - 0.09 * k) + (0.045 * k + (snow + torn + comet) * k) * alpha;
  vec3 rgb = vhsRgb(vec3(y, (iq * (1.0 - 0.18 * k) + blotch * k * alpha)));
  return vec4(clamp(rgb, 0.0, alpha), alpha);
}
