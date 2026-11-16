// CMYK: four-colour process printing seen up close. The picture is
// separated into cyan, magenta, yellow and black, each printed through its
// own screen at its own angle (15°, 75°, 0°, 45°: together they make the
// rosette), in inks that are not quite pure, each plate a little out of
// place. Black carries the darks so colours stay clean. dots is in pixels
// of a frame 1080 pixels on its short side.

const vec3 CMYK_CYAN = vec3(0.0, 0.62, 0.89);
const vec3 CMYK_MAGENTA = vec3(0.90, 0.0, 0.49);
const vec3 CMYK_YELLOW = vec3(1.0, 0.93, 0.0);
const vec3 CMYK_KEY = vec3(0.11, 0.11, 0.105);

// A colour as cyan, magenta, yellow, black
vec4 cmykOf(vec3 rgb) {
  float k = 1.0 - max(rgb.r, max(rgb.g, rgb.b));
  float key = smoothstep(0.15, 0.85, k);
  vec3 cmy = clamp((1.0 - rgb - key) / max(1.0 - key, 1e-3), 0.0, 1.0);
  return vec4(cmy, key);
}

// One plate: how much of its ink lies on this pixel (p in pixels)
float cmykPlate(vec2 p, float angle, vec2 slip, float cell, int channel, float hereInk) {
  float a = radians(angle);
  mat2 turn = mat2(cos(a), sin(a), -sin(a), cos(a));
  vec2 g = turn * (p - slip) / cell;
  vec2 centre = floor(g + 0.5);
  vec4 s = getColor(clamp(transpose(turn) * (centre * cell) / resolution, 0.0, 1.0));
  float cellInk = cmykOf(s.a > 0.0 ? s.rgb / s.a : vec3(1.0))[channel];
  // A dot keeps its cell's tone, except where the picture has an edge
  float much = mix(cellInk, hereInk, max(0.25, smoothstep(0.15, 0.45, abs(hereInk - cellInk))));
  float soft = 1.6 / cell;
  float spot = 0.5 - 0.25 * (cos(6.2832 * g.x) + cos(6.2832 * g.y));
  return max(smoothstep(-soft, soft, much - spot) * smoothstep(0.03, 0.1, much), smoothstep(0.96, 1.0, much));
}

vec4 filterColor(vec2 uv) {
  vec4 here = getColor(uv);
  float cell = p_dots * min(resolution.x, resolution.y) / 1080.0;
  vec2 p = uv * resolution;
  vec4 ink = cmykOf(here.a > 0.0 ? here.rgb / here.a : vec3(1.0));
  float off = p_offset * 0.55 * cell;
  float c = cmykPlate(p, 15.0, vec2(1.0, 0.4) * off, cell, 0, ink.x);
  float m = cmykPlate(p, 75.0, vec2(-0.6, 0.8) * off, cell, 1, ink.y);
  float y = cmykPlate(p, 0.0, vec2(0.3, -1.0) * off, cell, 2, ink.z);
  float k = cmykPlate(p, 45.0, vec2(0.0), cell, 3, ink.w);
  vec3 colour = p_paper * mix(vec3(1.0), CMYK_CYAN, c) * mix(vec3(1.0), CMYK_MAGENTA, m) * mix(vec3(1.0), CMYK_YELLOW, y) * mix(vec3(1.0), CMYK_KEY, k);
  return mix(here, vec4(colour * here.a, here.a), p_amount);
}
