// Risograph: a two-colour print run. Each colour of the picture is split
// between the two inks (the mix whose overprint on paper comes closest to
// it), so what suits the first ink prints in it, what suits the second
// in the second, and the darks get both. Each ink goes down through a
// sandy screen, a little uneven as a drum lays it, the second a little
// out of register, and they multiply where they overlap, a little more
// than their sum, as wet ink over ink does. Fixed by the
// seed; sizes in pixels of a frame 1080 pixels on its short side.

const vec3 RISO_PAPER = vec3(0.957, 0.937, 0.894);

float risoHash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float risoNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(risoHash(i), risoHash(i + vec2(1.0, 0.0)), u.x), mix(risoHash(i + vec2(0.0, 1.0)), risoHash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// How much of each ink prints a colour: least squares on what the two
// inks absorb (a, b) against what the colour absorbs
vec2 risoPlates(vec3 rgb, vec3 a, vec3 b) {
  vec3 t = 1.0 - rgb;
  float aa = max(dot(a, a), 1e-4), bb = max(dot(b, b), 1e-4), ab = dot(a, b), at = dot(a, t), bt = dot(b, t);
  float det = aa * bb - ab * ab;
  vec2 x = det > 1e-4 ? vec2(bb * at - ab * bt, aa * bt - ab * at) / det : vec2(at / aa, 0.0);
  if (x.x < 0.0) x = vec2(0.0, bt / bb);
  else if (x.y < 0.0) x = vec2(at / aa, 0.0);
  return clamp(x, 0.0, 1.0);
}

// One ink through its screen: the plate's tone as sand, and the drum's unevenness
float risoInk(float plate, vec2 p, float salt) {
  plate = smoothstep(0.1, 0.88, plate);
  float sand = risoNoise(p / 1.7 + salt) * 0.6 + risoHash(floor(p / 1.15) + salt) * 0.4;
  float hard = smoothstep(sand - 0.12, sand + 0.12, plate * 1.24 - 0.12);
  float drum = 0.84 + 0.16 * risoNoise(p / 150.0 + salt * 1.7);
  return mix(plate, hard, p_grain) * drum * 0.97;
}

vec4 filterColor(vec2 uv) {
  vec4 here = getColor(uv);
  float px = min(resolution.x, resolution.y) / 1080.0;
  vec2 p = uv * resolution / px + mod(seed, 89.0) * 13.7;
  vec2 slip = vec2(1.0, -0.6) * p_misregister * 6.0 * px / resolution;
  vec4 there = getColor(clamp(uv + slip, 0.0, 1.0));
  vec3 one = here.a > 0.0 ? here.rgb / here.a : vec3(1.0);
  vec3 two = there.a > 0.0 ? there.rgb / there.a : vec3(1.0);
  vec3 a = 1.0 - p_ink_a, b = 1.0 - p_ink_b;
  float first = risoInk(risoPlates(one, a, b).x, p, 3.0);
  float second = risoInk(risoPlates(two, a, b).y, p, 41.0);
  vec3 colour = RISO_PAPER * (1.0 - first * a) * (1.0 - second * b) * (1.0 - 0.4 * first * second);
  return mix(here, vec4(colour * here.a, here.a), p_amount);
}
