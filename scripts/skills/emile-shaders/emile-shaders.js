// emile-shaders.js: run one of these filters or transitions with plain
// WebGL2. One file, no dependencies; a classic script, so it loads from
// file:// too.
//
//   <script src="emile-shaders.js"></script>
//   const fx = EmileShaders.filter(canvas, pack, glsl)     // pack: its pack.json (parsed), glsl: its shader.glsl as text
//   fx.draw(picture, { params: { cell: 24 }, frame: 0, fps: 30, seed: 0 })
//
//   const tr = EmileShaders.transition(canvas, pack, glsl)
//   tr.draw(from, to, progress, { params, frame, fps, seed })   // progress 0–1
//
// picture, from, to: anything WebGL2 takes as a texture (an <img> once
// loaded, a <video> that has a frame, a <canvas>, an ImageBitmap). The
// frame is drawn the size of the canvas; set canvas.width and height
// first. params: by the ids in pack.json; one left out takes its default.
// frame and fps stand in for a clock (there is none): advance frame to
// make a moving filter move; keep seed fixed for the same picture every
// time.
//
// A pack's shader.glsl runs unchanged: it is wrapped here the way Émile's
// compositor wraps it (references/contract.md), so the text below is the
// same as Émile's, name for name. Pictures go in premultiplied, as the
// contract asks, and the result is drawn premultiplied.

;(function (root) {
  const SHARED = { resolution: 'vec2', ratio: 'float', frame: 'float', fps: 'float', seed: 'float' }
  const PARAM_GLSL = { float: 'float', int: 'int', bool: 'bool', color: 'vec3', vec2: 'vec2', choice: 'int' }

  const HEAD = `#version 300 es
precision highp float;
precision highp int;
in vec2 uv;
out vec4 emile_out;
${Object.entries(SHARED).map(([n, t]) => `uniform ${t} ${n};`).join('\n')}`

  const paramUniforms = params => params.map(p => `uniform ${PARAM_GLSL[p.type]} p_${p.id};`).join('\n')

  // The whole fragment shader around a pack's shader.glsl. #line 1: a
  // compile error names the line of the pack's own file
  function fragmentSource(kind, glsl, params = []) {
    if (kind === 'filter') return `${HEAD}
uniform sampler2D emile_src;
${paramUniforms(params)}
vec4 getColor(vec2 p) { return texture(emile_src, p); }
#line 1
${glsl}
void main() { emile_out = filterColor(uv); }`
    if (kind === 'transition') return `${HEAD}
uniform sampler2D emile_from, emile_to;
uniform float progress;
${paramUniforms(params)}
vec4 getFromColor(vec2 p) { return texture(emile_from, p); }
vec4 getToColor(vec2 p) { return texture(emile_to, p); }
#line 1
${glsl}
void main() { emile_out = transition(uv); }`
    throw new Error(`a ${kind} has no shader`)
  }

  const VERT = `#version 300 es
in vec2 pos;
out vec2 uv;
void main() { uv = pos * 0.5 + 0.5; gl_Position = vec4(pos, 0.0, 1.0); }`

  const COLOR = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i

  // Each parameter's uniform: the value given, else its default.
  // color '#rrggbb' → vec3 0–1, choice → its option's index, bool, int
  function paramValues(params, set = {}) {
    const out = {}
    for (const p of params) {
      let v = set[p.id] ?? p.default
      if (p.type === 'color') {
        const m = COLOR.exec(String(v)) ?? COLOR.exec(String(p.default))
        v = m ? m.slice(1).map(h => parseInt(h, 16) / 255) : [0, 0, 0]
      } else if (p.type === 'choice') v = Math.max(0, (p.options ?? []).indexOf(v))
      else if (p.type === 'bool') v = !!v
      else if (p.type === 'int') v = Math.round(Number(v))
      out[`p_${p.id}`] = { type: PARAM_GLSL[p.type], value: v }
    }
    return out
  }

  function context(target) {
    if (typeof WebGL2RenderingContext !== 'undefined' && target instanceof WebGL2RenderingContext) return target
    const gl = target.getContext('webgl2', { premultipliedAlpha: true, preserveDrawingBuffer: true })
    if (!gl) throw new Error('WebGL2 is not available here')
    return gl
  }

  function compile(gl, type, text) {
    const s = gl.createShader(type)
    gl.shaderSource(s, text)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s))
    return s
  }

  function texture(gl) {
    const t = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, t)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    return t
  }

  // A pack's shader compiled on a canvas (or a WebGL2 context), and how to draw it
  function make(target, kind, pack, glsl) {
    if (pack.kind !== kind) throw new Error(`${pack.id} is a ${pack.kind}, not a ${kind}`)
    const gl = context(target)
    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, fragmentSource(kind, glsl, pack.params ?? [])))
    gl.bindAttribLocation(prog, 0, 'pos')
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog))
    const quad = gl.createBuffer()
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.bindVertexArray(null)
    const names = kind === 'filter' ? ['emile_src'] : ['emile_from', 'emile_to']
    const textures = names.map(() => texture(gl))

    function draw(pictures, uniforms, { params = {}, frame = 0, fps = 30, seed = 0 } = {}) {
      const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, w, h)
      gl.useProgram(prog)
      gl.bindVertexArray(vao)
      gl.disable(gl.BLEND)
      pictures.forEach((picture, i) => {
        gl.activeTexture(gl.TEXTURE0 + i)
        gl.bindTexture(gl.TEXTURE_2D, textures[i])
        // uv runs from the bottom left; colours premultiplied
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, picture)
        gl.uniform1i(gl.getUniformLocation(prog, names[i]), i)
      })
      const all = {
        resolution: { type: 'vec2', value: [w, h] }, ratio: { type: 'float', value: w / h },
        frame: { type: 'float', value: frame }, fps: { type: 'float', value: fps },
        seed: { type: 'float', value: ((seed % 65536) + 65536) % 65536 },
        ...uniforms, ...paramValues(pack.params ?? [], params)
      }
      for (const [name, { type, value }] of Object.entries(all)) {
        const at = gl.getUniformLocation(prog, name)
        if (type === 'int' || type === 'bool') gl.uniform1i(at, Number(value) | 0)
        else if (type === 'float') gl.uniform1f(at, value)
        else gl[`uniform${value.length}fv`](at, value)
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      gl.bindVertexArray(null)
    }

    const dispose = () => {
      textures.forEach(t => gl.deleteTexture(t))
      gl.deleteBuffer(quad)
      gl.deleteVertexArray(vao)
      gl.deleteProgram(prog)
    }
    return kind === 'filter'
      ? { draw: (picture, o) => draw([picture], {}, o), dispose }
      : { draw: (from, to, progress, o) => draw([from, to], { progress: { type: 'float', value: progress } }, o), dispose }
  }

  const api = {
    filter: (target, pack, glsl) => make(target, 'filter', pack, glsl),
    transition: (target, pack, glsl) => make(target, 'transition', pack, glsl),
    fragmentSource,
    paramValues
  }
  root.EmileShaders = Object.assign(root.EmileShaders ?? {}, api)
  if (typeof module === 'object' && module.exports) module.exports = api
})(typeof globalThis !== 'undefined' ? globalThis : this)
