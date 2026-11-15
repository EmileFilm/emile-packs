// Halftone: the picture as round dots on a turned grid, bigger where it
// is darker, on paper. mode 0: dots of one ink; 1: dots in the picture's
// own colour. cell is in pixels of a frame 1080 pixels high; amount 0
// leaves the picture as it is.

vec4 filterColor(vec2 uv) {
  float cell = p_cell * resolution.y / 1080.0;
  float a = radians(p_angle);
  mat2 turn = mat2(cos(a), sin(a), -sin(a), cos(a));
  // The grid: each cell's centre, and where this pixel lies in its cell
  vec2 g = turn * (uv * resolution) / cell;
  vec2 centre = floor(g) + 0.5;
  vec2 at = (transpose(turn) * (centre * cell)) / resolution;
  vec4 s = getColor(clamp(at, 0.0, 1.0));
  vec3 rgb = s.a > 0.0 ? s.rgb / s.a : vec3(0.0);
  float l = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
  // Black fills the cell (dots touch at the corners), white is bare paper
  float r = sqrt(1.0 - l) * 0.7071;
  float d = length(g - centre);
  float edge = 0.75 / cell;
  float cover = 1.0 - smoothstep(r - edge, r + edge, d);
  vec3 ink = p_mode == 0 ? p_ink : rgb;
  vec3 colour = mix(p_paper, ink, cover);
  vec4 here = getColor(uv);
  return mix(here, vec4(colour * here.a, here.a), p_amount);
}
