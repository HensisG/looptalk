// LoopTalk — mundo 3D low-poly: calle de bienvenida, cafetería y salas genéricas.
// Todo se dibuja con figuras simples (sin imágenes), funciona sin internet.
import * as THREE from "three";

let LOW = true;
const M = (c, o = {}) => LOW
  ? new THREE.MeshLambertMaterial({ color: c, flatShading: true, ...(o.side ? { side: o.side } : {}), ...(o.transparent ? { transparent: true, opacity: o.opacity } : {}) })
  : new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.85, metalness: 0, ...o });
const addLight = (scene, l) => { if (!LOW) scene.add(l); };
const B = (c) => new THREE.MeshBasicMaterial({ color: c });
function mesh(geo, mat, x = 0, y = 0, z = 0, shadow = true) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  m.castShadow = shadow; m.receiveShadow = true; return m;
}
const ico = (r, d = 1) => new THREE.IcosahedronGeometry(r, d);
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
const rnd = (a, b) => a + Math.random() * (b - a);

/* ---------- búho profesor ---------- */
function makeOwl() {
  const g = new THREE.Group();
  const brown = M("#8b5a2b"), dark = M("#6e4420"), cream = M("#f3e3c3"), ink = M("#1d1626"), orange = M("#f29e38"), white = M("#ffffff"), red = M("#d63a2f"), sun = M("#ffc83d");
  const body = mesh(ico(1, 1), brown, 0, 1.05, 0); body.scale.set(1, 1.12, 0.95); g.add(body);
  const belly = mesh(ico(0.78, 1), cream, 0, 0.95, 0.42); belly.scale.set(1, 1.1, 0.55); g.add(belly);
  for (const s of [-1, 1]) { const f = mesh(new THREE.ConeGeometry(0.16, 0.3, 4), orange, s * 0.38, 0.08, 0.55); f.rotation.x = Math.PI / 2; g.add(f); }
  // pajarita y libro
  for (const s of [-1, 1]) { const t = mesh(new THREE.ConeGeometry(0.16, 0.3, 4), red, s * 0.15, 1.95, 0.78); t.rotation.z = s * Math.PI / 2; g.add(t); }
  const book = mesh(box(0.55, 0.7, 0.18), M("#3b82c4"), 0.85, 0.9, 0.45); book.rotation.z = -0.25; g.add(book);
  // alas (pivote en el hombro)
  const wings = [];
  for (const s of [-1, 1]) {
    const p = new THREE.Group(); p.position.set(s * 0.92, 1.6, 0); g.add(p);
    const w = mesh(ico(0.42, 1), dark, 0, -0.55, 0); w.scale.set(0.55, 1.4, 1); p.add(w);
    p.rotation.z = s * 0.18; wings.push(p);
  }
  // cabeza
  const head = new THREE.Group(); head.position.set(0, 2.45, 0); g.add(head);
  const skull = mesh(ico(0.88, 1), brown); skull.scale.set(1.1, 0.95, 1); head.add(skull);
  const face = mesh(ico(0.62, 1), cream, 0, -0.05, 0.5); face.scale.set(1.3, 0.92, 0.5); head.add(face);
  const lids = [];
  for (const s of [-1, 1]) {
    head.add(mesh(ico(0.27, 2), white, s * 0.31, 0.06, 0.78, false));
    head.add(mesh(ico(0.13, 1), ink, s * 0.31, 0.06, 1.0, false));
    head.add(mesh(ico(0.045, 0), white, s * 0.27, 0.11, 1.1, false));
    const gl = mesh(new THREE.TorusGeometry(0.31, 0.04, 6, 16), ink, s * 0.31, 0.06, 0.98, false); head.add(gl);
    const lid = mesh(ico(0.285, 2), brown, s * 0.31, 0.06, 0.8, false); lid.visible = false; head.add(lid); lids.push(lid);
    const tuft = mesh(new THREE.ConeGeometry(0.2, 0.5, 4), dark, s * 0.62, 0.72, 0); tuft.rotation.z = -s * 0.5; head.add(tuft);
  }
  head.add(mesh(box(0.18, 0.04, 0.04), ink, 0, 0.1, 1.03, false));
  const beakTop = mesh(new THREE.ConeGeometry(0.13, 0.28, 4), orange, 0, -0.2, 0.98); beakTop.rotation.x = Math.PI; head.add(beakTop);
  const jaw = new THREE.Group(); jaw.position.set(0, -0.3, 0.95); head.add(jaw);
  const beakLow = mesh(new THREE.ConeGeometry(0.09, 0.14, 4), M("#d9832a"), 0, -0.05, 0); beakLow.rotation.x = Math.PI; jaw.add(beakLow);
  // birrete
  const cap = new THREE.Group(); cap.position.set(0, 0.78, 0); cap.rotation.z = 0.12; head.add(cap);
  cap.add(mesh(cyl(0.5, 0.55, 0.3, 8), ink, 0, 0, 0));
  const board = mesh(box(1.35, 0.07, 1.35), ink, 0, 0.18, 0); board.rotation.y = Math.PI / 4; cap.add(board);
  cap.add(mesh(ico(0.07, 0), sun, 0, 0.24, 0));
  const tassel = new THREE.Group(); tassel.position.set(0, 0.22, 0); cap.add(tassel);
  const cord = mesh(cyl(0.025, 0.025, 0.7, 4), sun, 0.62, -0.2, 0); tassel.add(cord);
  tassel.add(mesh(cyl(0.02, 0.09, 0.25, 6), sun, 0.62, -0.62, 0));
  g.userData = { kind: "owl", head, jaw, lids, armL: wings[1], armR: wings[0], body, tassel, base: { armL: wings[1].rotation.z, armR: wings[0].rotation.z } };
  return g;
}

/* ---------- persona ---------- */
function makePerson(o) {
  const [skin, hair, shirt, style] = o.av;
  const g = new THREE.Group();
  const S = M(skin), H = M(hair), C = M(shirt), ink = M("#2a1630");
  g.add(mesh(new THREE.CapsuleGeometry(0.22, 0.9, 3, 6), M("#2f3446"), -0.25, 0.55, 0));
  g.add(mesh(new THREE.CapsuleGeometry(0.22, 0.9, 3, 6), M("#2f3446"), 0.25, 0.55, 0));
  const torso = mesh(new THREE.CapsuleGeometry(0.58, 0.85, 4, 8), C, 0, 1.75, 0); torso.scale.z = 0.72; g.add(torso);
  if (o.apron) { const a = mesh(box(0.85, 1.1, 0.06), M(o.apron), 0, 1.55, 0.44); g.add(a); }
  if (o.coat) { for (const s of [-1, 1]) { const c = mesh(box(0.42, 1.3, 0.08), M("#f4f6f8"), s * 0.3, 1.7, 0.42); g.add(c); } }
  g.add(mesh(cyl(0.16, 0.18, 0.3, 8), S, 0, 2.55, 0));
  const arms = [];
  for (const s of [-1, 1]) {
    const p = new THREE.Group(); p.position.set(s * 0.68, 2.25, 0); g.add(p);
    p.add(mesh(new THREE.CapsuleGeometry(0.16, 0.75, 3, 6), C, 0, -0.5, 0));
    p.add(mesh(ico(0.15, 1), S, 0, -1.02, 0));
    p.rotation.z = s * 0.12; arms.push(p);
  }
  const head = new THREE.Group(); head.position.set(0, 3.05, 0); g.add(head);
  const h = mesh(ico(0.56, 1), S); h.scale.set(1, 1.08, 1); head.add(h);
  head.add(mesh(ico(0.07, 0), S, 0, -0.02, 0.56));
  const eyes = [];
  for (const s of [-1, 1]) {
    const e = mesh(ico(0.065, 1), ink, s * 0.2, 0.08, 0.5, false); head.add(e); eyes.push(e);
    const br = mesh(box(0.16, 0.035, 0.03), H, s * 0.21, 0.27, 0.5, false); br.rotation.z = s * 0.12; head.add(br);
    const ck = mesh(ico(0.08, 0), M("#ff8a7a", { transparent: true, opacity: 0.5 }), s * 0.33, -0.1, 0.44, false); head.add(ck);
  }
  const mouth = mesh(box(0.24, 0.06, 0.04), M("#7a2333"), 0, -0.22, 0.53, false); head.add(mouth);
  // pelo
  const cap = mesh(ico(0.6, 1), H, 0, 0.17, -0.06); cap.scale.set(1.02, 0.78, 1.02); head.add(cap);
  if (style === 1) { const back = mesh(box(1.05, 1.0, 0.35), H, 0, -0.3, -0.32); head.add(back); }
  if (style === 2) { const beard = mesh(ico(0.42, 1), H, 0, -0.3, 0.2); beard.scale.set(1.15, 0.7, 0.9); head.add(beard); mouth.position.z = 0.6; }
  if (style === 3) { const brim = mesh(cyl(0.68, 0.68, 0.05, 12), H, 0, 0.32, 0.05); head.add(brim); }
  if (o.glasses) for (const s of [-1, 1]) head.add(mesh(new THREE.TorusGeometry(0.11, 0.02, 4, 12), ink, s * 0.2, 0.08, 0.55, false));
  g.userData = { kind: "person", head, mouth, eyes, armL: arms[1], armR: arms[0], body: torso, base: { armL: arms[1].rotation.z, armR: arms[0].rotation.z } };
  return g;
}

/* ---------- escenarios ---------- */
function lights(scene, o) {
  scene.add(new THREE.HemisphereLight(o.sky, o.ground, o.hemi));
  const d = new THREE.DirectionalLight(o.sun, o.sunI); d.position.set(4, 9, 6);
  d.castShadow = !LOW; d.shadow.mapSize.set(1024, 1024);
  Object.assign(d.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 });
  scene.add(d);
  const f = new THREE.DirectionalLight("#fff1de", o.fill ?? 0.9); f.position.set(0, 4, 14); scene.add(f);
}
function street(scene) {
  scene.background = new THREE.Color("#1a1d3b"); scene.fog = new THREE.Fog("#1a1d3b", 14, 42);
  lights(scene, { sky: "#7f8ad0", ground: "#3a2c40", hemi: 1.1, sun: "#aab8ff", sunI: 0.6, fill: 1.25 });
  scene.add(mesh(box(60, 0.2, 9), M("#7b7480"), 0, -0.1, 2.5));
  scene.add(mesh(box(60, 0.25, 0.3), M("#9b95a0"), 0, 0, -1.9));
  scene.add(mesh(box(60, 0.1, 6), M("#2c2e38"), 0, -0.15, -5));
  for (let x = -24; x < 24; x += 4) scene.add(mesh(box(1.6, 0.02, 0.15), B("#d8c46a"), x, -0.08, -5, false));
  const winOn = B("#ffd27a"), winOff = B("#2a2d46");
  const wins = { on: [], off: [] };
  const colors = ["#8a3b2e", "#6b4a3a", "#4a5168", "#7a5a44", "#93463a", "#5b4a6b"];
  for (let i = -5; i <= 5; i++) {
    const w = rnd(3.6, 4.4), h = rnd(6, 12), x = i * 4.6, z = -10.5;
    const b = mesh(box(w, h, 4), M(colors[(i + 10) % colors.length]), x, h / 2, z); scene.add(b);
    scene.add(mesh(box(w + 0.2, 0.3, 4.2), M("#3a2a2a"), x, h, z));
    for (let y = 1.6; y < h - 0.8; y += 1.5) for (let k = -1; k <= 1; k++) (Math.random() < 0.55 ? wins.on : wins.off).push([x + k * 1.1, y, z + 2.01]);
    if (i % 2 === 0) scene.add(mesh(box(1.1, 1.9, 0.1), M("#2a1a14"), x, 0.95, z + 2.02));
  }
  const wg = new THREE.PlaneGeometry(0.7, 0.9), dummy = new THREE.Object3D();
  for (const [list, mat] of [[wins.on, winOn], [wins.off, winOff]]) {
    const im = new THREE.InstancedMesh(wg, mat, list.length);
    list.forEach((pos, i) => { dummy.position.set(...pos); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); });
    scene.add(im);
  }
  for (const x of [-4.2, 4.6]) { // farolas
    scene.add(mesh(cyl(0.07, 0.1, 4.2, 6), M("#23252e"), x, 2.1, -1.2));
    scene.add(mesh(ico(0.28, 1), B("#ffe4a3"), x, 4.25, -1.2, false));
    const l = new THREE.PointLight("#ffcf7a", 14, 9, 1.6); l.position.set(x, 4, -1.2); addLight(scene, l);
  }
  for (const x of [-7.5, 8]) { // árboles
    scene.add(mesh(cyl(0.15, 0.2, 1.6, 6), M("#5a3b26"), x, 0.8, -0.8));
    scene.add(mesh(ico(1.1, 0), M("#2f6b45"), x, 2.3, -0.8));
  }
  for (const [x, c] of [[-2.5, "#c0392b"], [6.5, "#2c5f8a"], [-10, "#e0c35a"]]) { // carros
    const car = new THREE.Group(); car.position.set(x, 0.1, -3.6);
    car.add(mesh(box(3.2, 0.7, 1.5), M(c), 0, 0.55, 0)); car.add(mesh(box(1.8, 0.6, 1.4), M(c), -0.2, 1.15, 0));
    car.add(mesh(box(1.7, 0.45, 1.42), B("#8fb3d9"), -0.2, 1.15, 0, false));
    for (const [a, b2] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) { const w = mesh(cyl(0.32, 0.32, 0.25, 10), M("#1a1a1a"), a * 1.0, 0.2, b2 * 0.7); w.rotation.x = Math.PI / 2; car.add(w); }
    scene.add(car);
  }
  return { cam: [0, 3.1, 12.5], look: [0, 2.75, 0], actorPos: [0, 0, 1.6] };
}
function cafe(scene, tint) {
  scene.background = new THREE.Color("#2b1b12"); scene.fog = new THREE.Fog("#2b1b12", 12, 30);
  lights(scene, { sky: "#ffe1b8", ground: "#5a3a28", hemi: 0.85, sun: "#fff0d6", sunI: 0.75 });
  scene.add(mesh(box(16, 0.2, 14), M("#8a5a3c"), 0, -0.1, 0));
  for (let x = -7; x < 8; x += 1) scene.add(mesh(box(0.04, 0.01, 14), M("#6f4630"), x, 0.005, 0, false));
  scene.add(mesh(box(16, 8, 0.3), M(tint || "#e9d3b0"), 0, 4, -4));
  scene.add(mesh(box(0.3, 8, 14), M("#d8bf98"), -7, 4, 0)); scene.add(mesh(box(0.3, 8, 14), M("#d8bf98"), 7, 4, 0));
  scene.add(mesh(box(16, 0.6, 0.35), M("#6b4430"), 0, 0.3, -3.85));
  // pizarra del menú y repisas
  scene.add(mesh(box(3.4, 1.8, 0.1), M("#22302a"), 0, 4.3, -3.8));
  for (let i = 0; i < 4; i++) scene.add(mesh(box(2.4, 0.05, 0.02), B("#e9e2cf"), 0, 4.85 - i * 0.38, -3.74, false));
  for (const x of [-3.6, 3.6]) {
    scene.add(mesh(box(2.2, 0.1, 0.5), M("#6b4430"), x, 3.2, -3.6));
    for (let k = 0; k < 4; k++) scene.add(mesh(cyl(0.16, 0.13, 0.36, 8), M(["#e8483b", "#ffc83d", "#3b82c4", "#f4f1ea"][k]), x - 0.75 + k * 0.5, 3.45, -3.55));
  }
  // barra
  scene.add(mesh(box(5.4, 1.2, 1.0), M("#5a3a2a"), 0, 0.6, 0.6));
  scene.add(mesh(box(5.6, 0.12, 1.15), M("#d9c3a0"), 0, 1.26, 0.6));
  const mach = new THREE.Group(); mach.position.set(-1.7, 1.32, 0.5);
  mach.add(mesh(box(1.1, 0.9, 0.7), M("#b8bcc4", { metalness: 0.4, roughness: 0.4 }), 0, 0.45, 0));
  mach.add(mesh(box(1.15, 0.12, 0.75), M("#e8483b"), 0, 0.95, 0));
  for (const s of [-0.25, 0.25]) mach.add(mesh(cyl(0.06, 0.06, 0.25, 6), M("#333"), s, 0.25, 0.4));
  scene.add(mach);
  for (const x of [1.0, 1.4, 1.8]) scene.add(mesh(cyl(0.13, 0.1, 0.22, 8), M("#f4f1ea"), x, 1.43, 0.75));
  scene.add(mesh(box(0.5, 0.6, 0.5), M("#3b2a1e"), 2.4, 1.62, 0.6));
  // lámparas colgantes
  for (const x of [-2.2, 0, 2.2]) {
    scene.add(mesh(cyl(0.01, 0.01, 2.2, 4), M("#222"), x, 6.1, 0.4, false));
    const sh = mesh(new THREE.ConeGeometry(0.4, 0.4, 8, 1, true), M("#2b2b2b", { side: THREE.DoubleSide }), x, 4.9, 0.4); scene.add(sh);
    scene.add(mesh(ico(0.14, 1), B("#ffe7b0"), x, 4.72, 0.4, false));
    const l = new THREE.PointLight("#ffd08a", 7, 7, 1.6); l.position.set(x, 4.6, 0.4); addLight(scene, l);
  }
  // plantas y ventana
  for (const x of [-5.6, 5.6]) { scene.add(mesh(cyl(0.35, 0.28, 0.7, 8), M("#c4703c"), x, 0.35, -2.8)); scene.add(mesh(ico(0.7, 0), M("#3f7d4f"), x, 1.2, -2.8)); }
  scene.add(mesh(box(0.1, 2.6, 3), B("#2d3f6b"), -6.84, 3.2, 0, false));
  return { cam: [0, 3.3, 11], look: [0, 3.05, -0.4], actorPos: [0, 0, -0.5] };
}
function room(scene, tint, kind) {
  const wall = new THREE.Color(tint || "#7c3aed").lerp(new THREE.Color("#ffffff"), 0.62);
  scene.background = new THREE.Color(tint || "#3b1f4a").lerp(new THREE.Color("#000"), 0.55);
  scene.fog = new THREE.Fog(scene.background, 12, 30);
  lights(scene, { sky: "#ffffff", ground: "#6b5d75", hemi: 1.0, sun: "#fff6e8", sunI: 0.8 });
  scene.add(mesh(box(16, 0.2, 14), M("#c9b593"), 0, -0.1, 0));
  scene.add(mesh(box(16, 8, 0.3), M(wall), 0, 4, -4));
  scene.add(mesh(box(0.3, 8, 14), M(wall.clone().multiplyScalar(0.92)), -7, 4, 0));
  scene.add(mesh(box(0.3, 8, 14), M(wall.clone().multiplyScalar(0.92)), 7, 4, 0));
  scene.add(mesh(box(16, 0.5, 0.35), M(tint || "#3b1f4a"), 0, 0.25, -3.85));
  // ventana con cielo
  const win = new THREE.Group(); win.position.set(-3.6, 3.6, -3.82);
  win.add(mesh(box(2.4, 1.9, 0.08), M("#f4f1ea"), 0, 0, 0)); win.add(mesh(box(2.1, 1.6, 0.1), B("#9fd0ff"), 0, 0, 0.02, false));
  win.add(mesh(box(0.06, 1.6, 0.12), M("#f4f1ea"), 0, 0, 0.04)); scene.add(win);
  // cuadro, reloj, planta
  scene.add(mesh(box(1.6, 1.1, 0.08), M("#ffc83d"), 3.6, 3.9, -3.8)); scene.add(mesh(box(1.3, 0.8, 0.1), M(tint || "#e8483b"), 3.6, 3.9, -3.76));
  const clock = mesh(cyl(0.38, 0.38, 0.08, 16), M("#ffffff"), 0, 5.6, -3.8); clock.rotation.x = Math.PI / 2; scene.add(clock);
  scene.add(mesh(cyl(0.35, 0.28, 0.7, 8), M("#c4703c"), 5.5, 0.35, -2.6)); scene.add(mesh(ico(0.75, 0), M("#3f7d4f"), 5.5, 1.25, -2.6));
  // escritorio / mostrador
  const desk = kind === "board"
    ? mesh(box(4.2, 2.2, 0.1), M("#22402f"), 0, 3.5, -3.75)
    : mesh(box(4.6, 1.15, 1.1), M("#6b5a4a"), 0, 0.58, 0.7);
  scene.add(desk);
  if (kind !== "board") {
    scene.add(mesh(box(4.8, 0.1, 1.25), M("#efe6d8"), 0, 1.2, 0.7));
    scene.add(mesh(box(0.9, 0.6, 0.06), M("#1f2230"), 1.5, 1.6, 0.5)); scene.add(mesh(box(0.08, 0.3, 0.08), M("#1f2230"), 1.5, 1.32, 0.5));
    scene.add(mesh(box(0.82, 0.5, 0.02), B("#7fb2ff"), 1.5, 1.62, 0.535, false));
    scene.add(mesh(box(0.6, 0.06, 0.45), M("#f4f1ea"), -1.4, 1.28, 0.8));
  } else {
    for (let i = 0; i < 3; i++) scene.add(mesh(box(2.6 - i * 0.5, 0.04, 0.02), B("#e9e2cf"), -0.2, 4.1 - i * 0.45, -3.69, false));
    for (const x of [-2.6, 2.6]) scene.add(mesh(box(1.5, 0.9, 1.0), M("#a8743f"), x, 0.45, 2.2));
  }
  return { cam: [0, 3.3, 11], look: [0, 3.05, -0.4], actorPos: [0, 0, kind === "board" ? 0.6 : -0.5] };
}

/* ---------- motor ---------- */
export function createWorld(canvas, opts = {}) {
  LOW = opts.quality !== "high";
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: !LOW, powerPreference: "low-power" }); }
  catch (e) { return null; }
  renderer.setPixelRatio(LOW ? Math.min(window.devicePixelRatio || 1, 1) : Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = !LOW; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  let busy = false, last = 0;
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 120);
  let scene = new THREE.Scene(), actor = null, conf = null, running = false, speaking = false;
  let waveUntil = 0, nodUntil = 0, nextBlink = 2, blinkEnd = 0, raf = 0, talkPhase = 0;
  const clock = new THREE.Clock();
  const look = new THREE.Vector3();

  function dispose(obj) {
    obj.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
  }
  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    // en pantallas angostas, la cámara se aleja un poco para que quepa el personaje
    camera.fov = w / h < 0.7 ? 48 : 38; camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize); ro.observe(canvas);

  function setScene(kind, character, tint) {
    dispose(scene); scene = new THREE.Scene();
    conf = kind === "street" ? street(scene) : kind === "cafe" ? cafe(scene, tint) : room(scene, tint, kind);
    actor = character.owl ? makeOwl() : makePerson(character);
    actor.position.set(...conf.actorPos);
    if (character.owl) actor.scale.setScalar(0.95);
    scene.add(actor);
    camera.position.set(...conf.cam); look.set(...conf.look); camera.lookAt(look);
    resize(); waveUntil = clock.getElapsedTime() + 1.6;
    if (!running) start();
  }
  function animate(now) {
    raf = requestAnimationFrame(animate);
    // límite de cuadros: 30 fps normal (24 en modo liviano), casi en pausa mientras la IA piensa
    const fps = busy && !speaking ? 6 : LOW ? 24 : 30;
    if (now - last < 1000 / fps) return;
    last = now;
    const t = clock.getElapsedTime();
    if (actor) {
      const u = actor.userData;
      u.body.position.y = (u.kind === "owl" ? 1.05 : 1.75) + Math.sin(t * 1.8) * 0.025;
      u.head.rotation.y = Math.sin(t * 0.5) * 0.18 + (speaking ? Math.sin(t * 2.3) * 0.06 : 0);
      u.head.rotation.z = Math.sin(t * 0.7) * 0.05;
      u.head.rotation.x = t < nodUntil ? Math.sin((nodUntil - t) * 12) * 0.12 : 0;
      // parpadeo
      if (t > nextBlink) { blinkEnd = t + 0.13; nextBlink = t + rnd(2.2, 5); }
      const closed = t < blinkEnd;
      if (u.lids) u.lids.forEach((l) => (l.visible = closed));
      if (u.eyes) u.eyes.forEach((e) => (e.scale.y = closed ? 0.15 : 1));
      // hablar
      talkPhase += speaking ? 0.35 + Math.random() * 0.25 : 0;
      const open = speaking ? Math.abs(Math.sin(talkPhase)) : 0;
      if (u.jaw) u.jaw.rotation.x = open * 0.55;
      if (u.mouth) u.mouth.scale.y = 1 + open * 3.2;
      // brazos: saludo o gestos al hablar
      const waving = t < waveUntil;
      u.armL.rotation.z = waving ? u.base.armL + 2.3 + Math.sin(t * 10) * 0.35 : u.base.armL + (speaking ? Math.sin(t * 2.1) * 0.25 + 0.2 : Math.sin(t * 1.3) * 0.04);
      u.armR.rotation.z = u.base.armR - (speaking ? Math.abs(Math.sin(t * 1.7)) * 0.3 : 0);
      if (u.tassel) u.tassel.rotation.z = Math.sin(t * 2.2) * 0.25;
    }
    if (conf) {
      camera.position.x = conf.cam[0] + Math.sin(t * 0.18) * 0.35;
      camera.position.y = conf.cam[1] + Math.sin(t * 0.23) * 0.08;
      camera.lookAt(look);
    }
    renderer.render(scene, camera);
  }
  function start() { if (!running) { running = true; clock.start(); raf = requestAnimationFrame(animate); } }
  function stop() { running = false; cancelAnimationFrame(raf); }
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else if (conf && canvas.offsetParent) start(); });
  return {
    setScene, start, stop,
    setSpeaking(v) { speaking = !!v; },
    setBusy(v) { busy = !!v; },
    wave() { waveUntil = clock.getElapsedTime() + 1.6; },
    nod() { nodUntil = clock.getElapsedTime() + 0.6; },
    get ok() { return true; }
  };
}
