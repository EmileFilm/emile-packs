// Halftone: the picture printed through a screen, one ink on paper. The
// screen is the pressroom's own: round dots in the lights that grow,
// touch at the half-tone and leave round holes of paper in the darks, so
// black prints solid and white stays bare. A dot takes its tone from the
// whole of its cell, so moving footage doesn't make dots flicker, and the
// detail under it still cuts its edge, so type stays type. The screen
// sits at 45°, where the eye notices it least. exposure lightens or
// darkens the picture before it is screened: a dark picture prints almost
// solid unless it is opened up. cell is in pixels of a frame 1080 pixels
// on its short side.

float halftoneHash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

// The picture's brightness at a point (premultiplied) and how much is there
vec2 halftoneTone(vec2 at) {
  vec4 s = getColor(clamp(at, 0.0, 1.0));
  return vec2(dot(s.rgb, vec3(0.2126, 0.7152, 0.0722)), s.a);
}

vec4 filterColor(vec2 uv) {
  vec4 here = getColor(uv);
  float px = min(resolution.x, resolution.y) / 1080.0;
  float cell = p_cell * px;
  mat2 turn = mat2(0.7071, 0.7071, -0.7071, 0.7071);
  mat2 back = transpose(turn);
  vec2 g = turn * (uv * resolution) / cell;
  vec2 centre = floor(g + 0.5);
  // The cell's tone: its middle and four points around it
  vec2 sum = halftoneTone(back * (centre * cell) / resolution) * 0.4;
  for (int i = 0; i < 4; i++) {
    float t = float(i) * 1.5708 + 0.7854;
    sum += halftoneTone(back * ((centre + 0.3 * vec2(cos(t), sin(t))) * cell) / resolution) * 0.15;
  }
  float cellTone = sum.y > 0.0 ? sum.x / sum.y : 1.0;
  float hereTone = here.a > 0.0 ? dot(here.rgb, vec3(0.2126, 0.7152, 0.0722)) / here.a : 1.0;
  // A dot keeps its cell's tone, except where the picture has an edge (type, a silhouette)
  float tone = mix(cellTone, hereTone, max(0.25, smoothstep(0.15, 0.45, abs(hereTone - cellTone))));
  // The press: paper stays clean, black goes solid
  float soft = 1.6 / cell;
  tone = pow(clamp(tone, 0.0, 1.0), exp2(-p_exposure * 1.6));
  float dark = smoothstep(0.05, 0.93, 1.0 - tone);
  float spot = 0.5 - 0.25 * (cos(6.2832 * g.x) + cos(6.2832 * g.y));
  // Ink never lands with a clean edge
  spot += (halftoneHash(floor(uv * resolution / (1.5 * px)) + mod(seed, 97.0)) - 0.5) * 0.05;
  float ink = smoothstep(-soft, soft, dark - spot);
  ink = max(ink * smoothstep(0.0, 0.04, dark), smoothstep(0.96, 1.0, dark));
  vec3 colour = mix(p_paper, p_ink, ink);
  return mix(here, vec4(colour * here.a, here.a), p_amount);
}
