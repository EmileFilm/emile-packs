// CRT: the picture on a glass tube. The face bulges a little and its
// corners round off into the dark; the beam draws 180 lines down a frame
// 1080 pixels high, fat enough to survive being watched small, each one
// swelling where the picture is brighter until the lines of a highlight
// run together; three stripes of phosphor (red, green, blue) repeat
// across it, each given the same room so white stays white; the beam's
// spot softens the picture sideways; a faint band of brightness drifts
// up the screen as mains hum does. Lines too fine for the frame's size
// fade out instead of shimmering. amount turns the whole tube down, its
// bulge included.

vec4 filterColor(vec2 uv) {
  vec4 here = getColor(uv);
  if (p_amount <= 0.0) return here;
  float k = p_amount;
  float px = min(resolution.x, resolution.y) / 1080.0;
  // The bulge: the corners stay put, the middle of each side swells past the frame
  vec2 c = uv * 2.0 - 1.0;
  float b = p_curvature * k * 0.11;
  vec2 at = c * (1.0 + b * c.yx * c.yx) / (1.0 + b);
  vec2 src = at * 0.5 + 0.5;
  // The beam's spot: three samples side by side
  vec2 spot = vec2(1.5 * px * k / resolution.x, 0.0);
  vec4 s = getColor(src) * 0.5 + (getColor(src - spot) + getColor(src + spot)) * 0.25;
  vec3 rgb = s.rgb;
  float l = clamp(dot(rgb, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
  // Scan lines: a beam that widens with brightness, its light kept whole
  float pitch = 6.0 * px;
  float dy = fract(src.y * resolution.y / pitch) - 0.5;
  float width = mix(0.36, 0.62, l);
  float beam = exp(-dy * dy / (width * width)) / (width * 1.7725 * tanh(0.6 / width));
  rgb *= mix(1.0, beam, p_scanlines * k * smoothstep(1.6, 3.0, pitch));
  // Phosphor stripes, a whole number of pixels each
  float stripe = max(1.0, floor(px + 0.5));
  int which = int(mod(floor(uv.x * resolution.x / stripe), 3.0));
  vec3 phosphor = which == 0 ? vec3(1.0, 0.55, 0.55) : which == 1 ? vec3(0.55, 1.0, 0.55) : vec3(0.55, 0.55, 1.0);
  rgb *= mix(vec3(1.0), phosphor * 1.43, p_mask * k);
  // Hum: a soft band of light drifting up
  float band = abs(fract(src.y - frame / max(fps, 1.0) * 0.11 - mod(seed, 13.0) * 0.077) - 0.5);
  rgb *= 1.0 + 0.035 * k * smoothstep(0.5, 0.2, band);
  // The tube's edge: darker towards the corners, rounded off
  float round = 0.09 * k + 1e-4;
  float corner = length(max(abs(at) - (1.0 - round), 0.0)) / round;
  rgb *= (1.0 - 0.22 * k * pow(dot(c, c) * 0.5, 1.5)) * (1.0 - smoothstep(0.75, 1.0, corner));
  return vec4(clamp(rgb, 0.0, 1.0), s.a);
}
