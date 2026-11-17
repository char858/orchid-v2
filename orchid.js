"use strict";

const orchidImage = document.querySelector("#orchid-image");
const orchidCanvas = document.querySelector("#orchid-canvas");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let stopOrchid = null;

function makeShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}

function startOrchid() {
  const gl = orchidCanvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: false });
  if (!gl || gl.isContextLost()) return null;

  const vertex = makeShader(gl, gl.VERTEX_SHADER, `
    attribute vec2 uv;
    uniform vec2 angle;
    uniform float zoom;
    varying vec2 texCoord;
    void main() {
      vec2 p = (uv - vec2(.5)) * vec2(1.83, 1.84);
      // Curve the textured surface so it has parallax across the petals.
      vec2 offset = (uv - vec2(.58, .47)) * vec2(1.65, 1.48);
      float depth = .18 * exp(-2.9 * dot(offset, offset)) - .19 * dot(offset, offset);
      vec3 q = vec3(p, depth);
      float cx = cos(angle.x), sx = sin(angle.x);
      float cy = cos(angle.y), sy = sin(angle.y);
      q = vec3(q.x * cy + q.z * sy, q.y, q.z * cy - q.x * sy);
      q = vec3(q.x, q.y * cx - q.z * sx, q.y * sx + q.z * cx);
      gl_Position = vec4(q.x * zoom, q.y * zoom, 0.0, 1.0 - q.z * .38);
      texCoord = uv;
    }`);
  const fragment = makeShader(gl, gl.FRAGMENT_SHADER, `
    precision mediump float;
    uniform sampler2D flower;
    varying vec2 texCoord;
    void main() { gl_FragColor = texture2D(flower, texCoord); }`);
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);

  const vertices = [];
  const steps = 32;
  for (let y = 0; y < steps; y++) {
    for (let x = 0; x < steps; x++) {
      const left = x / steps;
      const right = (x + 1) / steps;
      const bottom = y / steps;
      const top = (y + 1) / steps;
      vertices.push(left, bottom, right, bottom, left, top, left, top, right, bottom, right, top);
    }
  }
  const mesh = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  const uv = gl.getAttribLocation(program, "uv");
  gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(uv);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, orchidImage);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  if (gl.getError() !== gl.NO_ERROR) {
    gl.deleteTexture(texture);
    gl.deleteBuffer(mesh);
    gl.deleteProgram(program);
    return null;
  }
  const angle = gl.getUniformLocation(program, "angle");
  const zoom = gl.getUniformLocation(program, "zoom");

  const stage = orchidCanvas.parentElement;
  let pointerX = 0;
  let pointerY = 0;
  let currentX = 0;
  let currentY = 0;
  let currentZoom = 1;
  let frame = 0;
  let visible = true;
  let lastTime = 0;
  let phase = 0;

  function trackPointer(event) {
    if (event.pointerType !== "mouse") return;
    pointerX = event.clientX / window.innerWidth - .5;
    pointerY = event.clientY / window.innerHeight - .5;
  }

  function draw(time) {
    const delta = lastTime ? Math.min(time - lastTime, 40) : 16;
    lastTime = time;
    phase += delta * .00048;
    const progress = Math.min(1, Math.max(0, window.scrollY / stage.offsetHeight));
    const blend = 1 - Math.exp(-delta * .0045);
    currentX += ((pointerY * .14 - progress * .12) - currentX) * blend;
    currentY += ((pointerX * .28 + Math.sin(phase) * .15 + progress * .21) - currentY) * blend;
    currentZoom += ((1 + progress * .24) - currentZoom) * blend;

    const density = Math.min(window.devicePixelRatio || 1, 1.45);
    const width = Math.max(1, Math.round(stage.clientWidth * density));
    const height = Math.max(1, Math.round(stage.clientHeight * density));
    if (orchidCanvas.width !== width || orchidCanvas.height !== height) {
      orchidCanvas.width = width;
      orchidCanvas.height = height;
      gl.viewport(0, 0, width, height);
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(angle, currentX, currentY);
    gl.uniform1f(zoom, currentZoom);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
    frame = visible ? requestAnimationFrame(draw) : 0;
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !frame) {
      lastTime = 0;
      frame = requestAnimationFrame(draw);
    }
  });
  observer.observe(stage);
  addEventListener("pointermove", trackPointer, { passive: true });
  orchidCanvas.hidden = false;
  orchidImage.hidden = true;
  draw(performance.now());

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    removeEventListener("pointermove", trackPointer);
    gl.deleteTexture(texture);
    gl.deleteBuffer(mesh);
    gl.deleteProgram(program);
    orchidCanvas.hidden = true;
    orchidImage.hidden = false;
  };
}

async function updateMotion() {
  stopOrchid?.();
  stopOrchid = null;
  if (reducedMotion.matches) return;
  try {
    await orchidImage.decode();
    if (!reducedMotion.matches && !stopOrchid) stopOrchid = startOrchid();
  } catch {
    orchidImage.hidden = false;
    orchidCanvas.hidden = true;
  }
}

orchidCanvas.addEventListener("webglcontextlost", () => {
  stopOrchid?.();
  stopOrchid = null;
});
reducedMotion.addEventListener("change", updateMotion);
updateMotion();
