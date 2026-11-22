// Dither: a one-bit picture. The frame becomes a grid of square pixels,
// each either ink or paper; a threshold that changes from pixel to pixel
// decides which, so areas of grey come out as patterns. ordered: the
// 8 × 8 Bayer matrix, the crisp weave of early computer screens. grain:
// a random threshold after a hard contrast, the sandy edge of a stencil
// or a photocopy. Nothing moves. size is in pixels of a frame 1080 pixels
// on its short side, rounded to whole pixels so every square is square.

float ditherHash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float ditherBayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}

// The 8 × 8 ordered matrix as a threshold, 0–1
float ditherBayer8(vec2 a) {
  return ditherBayer2(a * 0.25) * 0.0625 + ditherBayer2(a * 0.5) * 0.25 + ditherBayer2(a) + 0.0078;
}

vec4 filterColor(vec2 uv) {
  vec4 here = getColor(uv);
  float cell = max(1.0, floor(p_size * min(resolution.x, resolution.y) / 1080.0 + 0.5));
  vec2 g = floor(uv * resolution / cell);
  vec4 s = getColor((g + 0.5) * cell / resolution);
  float tone = s.a > 0.0 ? dot(s.rgb, vec3(0.2126, 0.7152, 0.0722)) / s.a : 1.0;
  float edge;
  if (p_pattern == 0) {
    tone = clamp((tone - 0.5) * 1.15 + 0.5, 0.0, 1.0);
    edge = ditherBayer8(g);
  } else {
    tone = clamp((tone - 0.5) * 2.6 + 0.5, 0.0, 1.0);
    edge = ditherHash(g + mod(seed, 97.0)) * 0.98 + 0.01;
  }
  vec3 colour = tone < edge ? p_ink : p_paper;
  return mix(here, vec4(colour * here.a, here.a), p_amount);
}
