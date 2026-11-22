// Displace: bands of the picture slip sideways and hold. Three layers of
// bands (a few tall, more of middle height, many thin) each leave most of
// their bands where they are and slip a few, the thin ones farthest, so
// the picture stays whole with decisive breaks in it. A slipped band's
// red and blue part a little, in step with how far it slipped. The
// arrangement holds, then on a beat (speed: up to three a second; 0 holds
// one arrangement for good) it changes three frames running and holds
// again: a hit, not a flicker. A band that slips off one side comes back
// in on the other. amount scales the distance.

float displaceHash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

// One layer of bands at height y: 0 for a band that holds, else how far
// it slipped (-1 to 1). share: how many slip; turn: which arrangement
float displaceLayer(float y, float bands, float salt, float share, float turn) {
  float band = floor(y * bands + fract(salt * 0.37));
  if (displaceHash(vec2(band + 0.37, salt + turn * 1.618)) > share) return 0.0;
  return displaceHash(vec2(band + 0.71, salt + turn * 2.414)) * 2.0 - 1.0;
}

vec4 filterColor(vec2 uv) {
  vec4 here = getColor(uv);
  if (p_amount <= 0.0) return here;
  float salt = mod(seed, 61.0) + 3.0;
  // Beats so far, and frames since the last: three quick changes, then it holds
  float rate = p_speed * 3.0;
  float beats = frame / max(fps, 1.0) * rate;
  float since = floor(fract(beats) / max(rate, 1e-4) * max(fps, 1.0) + 0.001);
  float turn = floor(beats) * 3.0 + min(since, 2.0);
  float share = 0.1 + p_slices * 0.6;
  float d = displaceLayer(uv.y, 4.3, salt, share * 0.7, turn) * 0.3
    + displaceLayer(uv.y, 13.7, salt + 11.0, share * 0.6, turn) * 0.6
    + displaceLayer(uv.y, 41.3, salt + 23.0, share * 0.45, turn);
  d *= p_shift * 0.12 * p_amount;
  float fringe = d * p_split * 0.6;
  vec4 r = getColor(vec2(fract(uv.x + d + fringe), uv.y));
  vec4 g = getColor(vec2(fract(uv.x + d), uv.y));
  vec4 b = getColor(vec2(fract(uv.x + d - fringe), uv.y));
  return vec4(r.r, g.g, b.b, max(g.a, max(r.a, b.a)));
}
