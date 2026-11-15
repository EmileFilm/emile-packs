// Palette: the picture in five chosen inks, darkest to lightest. The
// picture's brightness, smoothed a little so the shapes come out clean
// and not speckled, picks the ink; soft decides whether the inks meet at
// an edge (a screen print) or run into each other (a thermal camera). A
// little sand along each edge keeps it from looking cut by a computer.
// exposure lightens or darkens the picture first, so a dark picture
// doesn't fall into the darkest ink whole.
// Nothing moves. Sizes in pixels of a frame 1080 pixels on its short side.

// The inks of a palette, 0 (darkest) to 4 (lightest)
vec3 paletteInk(int palette, int i) {
  if (palette == 0) return i == 0 ? vec3(0.086, 0.086, 0.114) : i == 1 ? vec3(0.478, 0.122, 0.169) : i == 2 ? vec3(0.847, 0.271, 0.180) : i == 3 ? vec3(0.941, 0.714, 0.353) : vec3(0.957, 0.925, 0.847);
  if (palette == 1) return i == 0 ? vec3(0.051, 0.024, 0.188) : i == 1 ? vec3(0.361, 0.102, 0.612) : i == 2 ? vec3(0.878, 0.227, 0.235) : i == 3 ? vec3(1.0, 0.561, 0.122) : vec3(1.0, 0.945, 0.659);
  if (palette == 2) return i == 0 ? vec3(0.027, 0.102, 0.200) : i == 1 ? vec3(0.059, 0.227, 0.420) : i == 2 ? vec3(0.184, 0.435, 0.682) : i == 3 ? vec3(0.612, 0.765, 0.902) : vec3(0.949, 0.965, 0.961);
  if (palette == 3) return i == 0 ? vec3(0.063, 0.125, 0.102) : i == 1 ? vec3(0.141, 0.282, 0.235) : i == 2 ? vec3(0.373, 0.541, 0.404) : i == 3 ? vec3(0.761, 0.788, 0.604) : vec3(0.945, 0.925, 0.839);
  if (palette == 4) return i == 0 ? vec3(0.047, 0.051, 0.059) : i == 1 ? vec3(0.231, 0.243, 0.271) : i == 2 ? vec3(0.498, 0.514, 0.541) : i == 3 ? vec3(0.773, 0.769, 0.745) : vec3(0.953, 0.941, 0.910);
  return i == 0 ? vec3(0.106, 0.106, 0.106) : i == 1 ? vec3(0.122, 0.310, 0.710) : i == 2 ? vec3(0.843, 0.149, 0.118) : i == 3 ? vec3(0.949, 0.765, 0.0) : vec3(0.957, 0.941, 0.902);
}

float paletteHash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

vec4 filterColor(vec2 uv) {
  vec4 here = getColor(uv);
  float px = min(resolution.x, resolution.y) / 1080.0;
  // Brightness over a small disc around the pixel
  float radius = p_smooth * 9.0 * px;
  vec2 sum = vec2(dot(here.rgb, vec3(0.2126, 0.7152, 0.0722)), here.a);
  for (int i = 0; i < 12; i++) {
    float r = sqrt((float(i) + 0.5) / 12.0) * radius;
    float t = float(i) * 2.39996;
    vec4 s = getColor(uv + vec2(cos(t), sin(t)) * r / resolution);
    sum += vec2(dot(s.rgb, vec3(0.2126, 0.7152, 0.0722)), s.a);
  }
  float tone = sum.y > 0.0 ? clamp(sum.x / sum.y, 0.0, 1.0) : 0.0;
  tone = pow(tone, exp2(-p_exposure * 1.6));
  tone = tone < 0.5 ? 0.5 * pow(2.0 * tone, 1.2) : 1.0 - 0.5 * pow(2.0 * (1.0 - tone), 1.2);
  float x = clamp(tone * 5.0 - 0.5, 0.0, 3.999);
  int i = int(floor(x));
  float f = fract(x) + (paletteHash(floor(uv * resolution / (1.4 * px)) + mod(seed, 97.0)) - 0.5) * 0.07 * (1.0 - p_soft);
  float e = mix(0.02, 0.5, p_soft);
  vec3 colour = mix(paletteInk(p_palette, i), paletteInk(p_palette, i + 1), smoothstep(0.5 - e, 0.5 + e, f));
  return mix(here, vec4(colour * here.a, here.a), p_amount);
}
