// Fluted glass: the picture behind a pane of reeded glass. Each rib is a
// rod of glass: it gathers a strip of picture wider than itself and
// squeezes it into its own width, most near its edges, so neighbouring
// ribs repeat a little of each other, shapes survive as upright bands
// and detail does not. The glass has a body: a dark seam where two ribs meet,
// a thin line of light down one side, a little frost, and red and blue
// bent a touch apart. amount turns the glass itself down (less bend, less
// frost), so half of it is thinner glass, not two pictures. width is a
// share of the frame's short side.

vec4 filterColor(vec2 uv) {
  vec4 here = getColor(uv);
  if (p_amount <= 0.0) return here;
  float a = radians(p_angle);
  vec2 axis = vec2(cos(a), sin(a));
  float w = max(p_width * min(resolution.x, resolution.y), 2.0);
  vec2 p = uv * resolution;
  float f = fract(dot(p, axis) / w) - 0.5;
  // A rod bends light least down its middle, most near its edges
  float bend = f * w * p_refraction * p_amount * (0.6 + 6.4 * f * f);
  float frost = p_frost * p_amount * w * 0.3;
  vec4 sum = vec4(0.0);
  float total = 0.0;
  for (int i = -3; i <= 3; i++) {
    float o = float(i) / 3.0;
    float weight = exp(-2.0 * o * o);
    vec4 mid = getColor((p + axis * (bend + o * frost)) / resolution);
    float red = getColor((p + axis * (bend * 1.08 + o * frost)) / resolution).r;
    float blue = getColor((p + axis * (bend * 0.92 + o * frost)) / resolution).b;
    sum += vec4(red, mid.g, blue, mid.a) * weight;
    total += weight;
  }
  vec4 c = sum / total;
  float seam = smoothstep(0.3, 0.5, abs(f));
  float glint = exp(-pow((f + 0.27) / 0.055, 2.0));
  c.rgb = c.rgb * (1.0 - 0.22 * p_amount * seam * seam) + 0.08 * p_amount * glint * c.a;
  return vec4(min(c.rgb, vec3(c.a)), c.a);
}
