// Bloom: light spilling from the brightest points into the dark beside
// them. In one pass: 40 points on a spiral around the pixel gather what
// is brighter than the threshold, nearer ones counting more. Light only
// spills where it is scarce: twelve more points on two wider rings read
// how bright the surroundings are, and where they are bright
// already (a white page) nothing is added, so a light picture keeps its
// contrast and its type. warmth turns the spill towards the red-orange of
// film halation. The spill is laid on as a screen, so black stays black
// away from light and white never clips. radius 1 is 2.2% of the frame's
// short side: wider than that needs more than one pass.

// A small turn of the spiral for each pixel: enough that its points
// don't trace the picture's edges again around them, not enough to show as grain
float bloomTurn(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z) - 0.5;
}

vec4 filterColor(vec2 uv) {
  vec4 here = getColor(uv);
  float radius = p_radius * 0.022 * min(resolution.x, resolution.y);
  float turn = bloomTurn(uv * resolution) * 0.7;
  vec3 spill = vec3(0.0);
  float near = 0.0, total = 0.0;
  for (int i = 0; i < 40; i++) {
    float r = sqrt((float(i) + 0.5) / 40.0);
    float t = float(i) * 2.39996323 + turn;
    vec4 s = getColor(uv + vec2(cos(t), sin(t)) * r * radius / resolution);
    float l = dot(s.rgb, vec3(0.2126, 0.7152, 0.0722));
    float hot = clamp((l - p_threshold) / (1.0 - p_threshold), 0.0, 1.0);
    float weight = exp(-2.5 * r * r);
    spill += s.rgb * hot * hot * weight;
    near += l;
    total += weight;
  }
  spill /= total;
  float far = 0.0;
  for (int i = 0; i < 12; i++) {
    float t = float(i) * 0.5236;
    float r = i % 2 == 0 ? 3.5 : 6.0;
    far += dot(getColor(uv + vec2(cos(t), sin(t)) * radius * r / resolution).rgb, vec3(0.2126, 0.7152, 0.0722));
  }
  // Scarce light spills; a field of light doesn't
  float scarce = 1.0 - smoothstep(0.22, 0.55, near / 40.0 * 0.35 + far / 12.0 * 0.65);
  float l = dot(spill, vec3(0.2126, 0.7152, 0.0722));
  spill = mix(spill, l * vec3(1.9, 0.62, 0.3), p_warmth);
  spill = clamp(spill * 2.2 * scarce * p_amount, 0.0, 1.0);
  float lit = max(spill.r, max(spill.g, spill.b));
  return vec4(here.rgb + spill * (1.0 - here.rgb), here.a + lit * (1.0 - here.a));
}
