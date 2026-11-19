// Cinematic hero: real GaliCrisp crispbread, rebuilt as 3D slabs, tumbling through red haze with sesame and crumbs.
// Textures are crops of the catalogue cover photograph. Scroll inside the hero breaks the stack apart ("the crunch").
import * as THREE from '../vendor/three.module.min.js';

export function start(stage, { reduce = false } = {}) {
  const canvas = stage.querySelector('canvas');
  const A = stage.dataset.assets;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x8a0c22, 0.07);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
  camera.position.set(0, 0, 14);
  const rig = new THREE.Group();
  scene.add(rig);

  // light: warm key from top left, red rim from behind, soft fill
  scene.add(new THREE.HemisphereLight(0xffe6cf, 0x4a0612, 0.85));
  const key = new THREE.DirectionalLight(0xfff1dc, 3.4); key.position.set(-5, 6, 7); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff2c48, 1.7); rim.position.set(6, -1, -6); scene.add(rim);
  const kick = new THREE.PointLight(0xffc89a, 18, 14, 2); kick.position.set(3, 2, 4); scene.add(kick);

  const loader = new THREE.TextureLoader();
  const tex = (name, k) => {
    const t = loader.load(A + 'img/hero/' + name);
    t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.userData.k = k;
    return t;
  };
  // k: scene units one texture tile spans, sized so sesame seeds read at their real scale
  const texSesame = tex('tex-sesame.webp', 1.25);
  const texMid = texSesame;
  const texLam = tex('tex-lam.webp', 1.1);

  // seeded random so the composition is the same on every visit
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const rr = (a, b) => a + rnd() * (b - a);

  // a broken crispbread outline: jagged edges, one bitten corner
  function slabGeometry(w, h, depth) {
    const s = new THREE.Shape(), pts = [], stepLen = 0.09;
    const edge = (x0, y0, x1, y1, amp) => {
      const n = Math.max(3, Math.round(Math.hypot(x1 - x0, y1 - y0) / stepLen));
      for (let i = 0; i < n; i++) {
        const t = i / n, nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny);
        const j = (rnd() - 0.5) * amp;
        pts.push(new THREE.Vector2(x0 + (x1 - x0) * t + nx / l * j, y0 + (y1 - y0) * t + ny / l * j));
      }
    };
    const W = w / 2, H = h / 2, bite = rnd() < 0.6;
    edge(-W, -H, W, -H, 0.03);
    edge(W, -H, W, bite ? H * 0.25 : H, 0.03);
    if (bite) { edge(W, H * 0.25, W * 0.45, H * 0.55, 0.07); edge(W * 0.45, H * 0.55, W * 0.1, H, 0.07); }
    edge(bite ? W * 0.1 : W, H, -W, H, 0.03);
    edge(-W, H, -W, -H, 0.03);
    s.setFromPoints(pts);
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: depth * 0.35, bevelSize: 0.02, bevelSegments: 2, curveSegments: 2 });
    g.center();
    return g;
  }
  const sideMat = new THREE.MeshStandardMaterial({ color: 0xc99a5c, roughness: 0.92 });
  const slabs = [];
  const makeSlab = (map, w, h, pos, rot, scale = 1) => {
    const m = map.clone(); m.needsUpdate = true;
    m.repeat.set(1 / map.userData.k, 1 / map.userData.k); m.offset.set(rnd(), rnd());
    const cap = new THREE.MeshStandardMaterial({ map: m, bumpMap: m, bumpScale: 1.6, roughness: 0.78, metalness: 0 });
    const side = sideMat.clone(); side.map = m;
    const mesh = new THREE.Mesh(slabGeometry(w, h, 0.05), [cap, side]);
    rot[1] = Math.max(-0.8, Math.min(0.8, rot[1]));
    mesh.position.set(...pos); mesh.rotation.set(...rot); mesh.scale.setScalar(scale);
    mesh.userData = { home: mesh.position.clone(), rot0: mesh.rotation.clone(), spin: new THREE.Vector3(rr(-.12, .12), rr(-.16, .16), rr(-.08, .08)), phase: rr(0, 6.28), fly: new THREE.Vector3() };
    rig.add(mesh); slabs.push(mesh);
  };
  // composition: a falling stack on the right third, big pieces close to camera at the edges (like the catalogue cover)
  makeSlab(texSesame, 1.7, 2.3, [3.1, 0.7, 0.4], [0.5, -0.55, 0.38]);
  makeSlab(texSesame, 1.5, 2.0, [4.6, -1.2, -1.4], [-0.35, 0.7, -0.6]);
  makeSlab(texMid, 1.2, 1.6, [2.3, -1.7, 1.4], [0.9, 0.3, 1.1]);
  makeSlab(texSesame, 2.0, 2.6, [-4.9, 3.5, -1.6], [0.2, 0.5, -0.5]);
  makeSlab(texLam, 1.0, 1.5, [5.0, 2.4, -2.2], [-0.6, -0.3, 0.7]);
  makeSlab(texLam, 0.9, 1.3, [4.3, -3.0, 0.9], [0.3, -0.9, 0.2]);
  makeSlab(texMid, 0.9, 1.2, [0.6, 3.2, -3.8], [1.0, 0.4, 0.3]);
  makeSlab(texSesame, 1.4, 1.9, [6.6, 0.2, -4.2], [0.4, -1.0, -0.2]);
  // centre of the crunch, used when the stack breaks apart on scroll
  const centre = new THREE.Vector3(3.3, 0, 0);
  slabs.forEach(s => s.userData.fly.copy(s.userData.home).sub(centre).normalize().multiplyScalar(rr(0.5, 1.1)).add(new THREE.Vector3(-0.8, rr(-.3, .4), rr(0.2, 0.9))));

  // crumbs and sesame seeds as instanced particles in a deep volume
  const dummy = new THREE.Object3D();
  function particles(geo, mat, count, sx, sy, sz) {
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    const data = [];
    for (let i = 0; i < count; i++) {
      const p = new THREE.Vector3(rr(-9, 10), rr(-5.5, 5.5), rr(-10, 4.5));
      if (rnd() < 0.6) p.set(rr(1.2, 7.5), rr(-3.5, 3.5), rr(-4, 3)); // cluster near the stack
      data.push({ p, r: new THREE.Euler(rr(0, 6), rr(0, 6), rr(0, 6)), v: rr(0.08, 0.35), w: new THREE.Vector3(rr(-1, 1), rr(-1, 1), rr(-1, 1)), s: rr(0.6, 1.4), out: new THREE.Vector3(rr(-1, 1), rr(-0.4, 1), rr(0, 1)).multiplyScalar(rr(0.6, 2.2)) });
    }
    mesh.userData = { data, sx, sy, sz };
    rig.add(mesh);
    return mesh;
  }
  const crumbGeo = new THREE.IcosahedronGeometry(1, 0);
  const crumbs = particles(crumbGeo, new THREE.MeshStandardMaterial({ color: 0xd8a466, roughness: 0.9, flatShading: true }), 220, 0.05, 0.035, 0.045);
  const seedGeo = new THREE.SphereGeometry(1, 10, 6);
  const white = particles(seedGeo, new THREE.MeshStandardMaterial({ color: 0xf4e4c4, roughness: 0.55 }), 260, 0.05, 0.028, 0.018);
  const black = particles(seedGeo, new THREE.MeshStandardMaterial({ color: 0x1a120e, roughness: 0.35 }), 120, 0.048, 0.026, 0.017);
  const systems = [crumbs, white, black];

  // size + state
  let w = 1, h = 1, t0 = performance.now(), last = t0, raf = 0, visible = true;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  function resize() {
    const r = stage.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height);
    renderer.setSize(w, h, false); camera.aspect = w / h;
    // narrow screens: frame the stack higher and wider so the copy below stays clear
    const narrow = w / h < 0.9;
    camera.fov = narrow ? 52 : 34; rig.position.set(narrow ? -2.4 : 0, narrow ? 5.6 : 0, 0); rig.scale.setScalar(narrow ? 0.8 : 1);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage); resize();
  addEventListener('pointermove', e => { pointer.tx = e.clientX / innerWidth - 0.5; pointer.ty = e.clientY / innerHeight - 0.5; }, { passive: true });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !reduce) loop(); }).observe(stage);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !reduce) loop(); });

  const ease = x => 1 - Math.pow(1 - x, 4);
  function frame(now) {
    const t = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now;
    const intro = reduce ? 1 : ease(Math.min(1, t / 2.6));
    const p = reduce ? 0 : stage.heroP || 0;
    const crunch = Math.min(1, Math.max(0, (p - 0.05) / 0.8));
    const c = ease(crunch);

    pointer.x += (pointer.tx - pointer.x) * 0.05; pointer.y += (pointer.ty - pointer.y) * 0.05;
    camera.position.set(pointer.x * 0.9, -pointer.y * 0.6 + c * 0.4, 14 - intro * 4.2 - c * 0.9);
    camera.lookAt(0.5, 0.1, 0);
    scene.fog.density = 0.1 - intro * 0.068 + c * 0.012;

    slabs.forEach(s => {
      const u = s.userData, f = Math.sin(t * 0.6 + u.phase);
      s.position.copy(u.home).addScaledVector(u.fly, c);
      s.position.y += f * 0.12 * (reduce ? 0 : 1);
      s.rotation.set(u.rot0.x + u.spin.x * t * (reduce ? 0 : 1) + c * u.spin.x * 10, u.rot0.y + Math.sin(t * u.spin.y * 2 + u.phase) * 0.35 * (reduce ? 0 : 1) + c * u.spin.y * 5, u.rot0.z + u.spin.z * t * (reduce ? 0 : 1));
    });
    systems.forEach(m => {
      const { data, sx, sy, sz } = m.userData;
      data.forEach((q, i) => {
        if (!reduce) {
          q.p.y -= q.v * dt * (1 + c * 2);
          if (q.p.y < -6) q.p.y = 6;
          q.r.x += q.w.x * dt; q.r.y += q.w.y * dt;
        }
        dummy.position.copy(q.p).addScaledVector(q.out, c);
        dummy.rotation.copy(q.r);
        dummy.scale.set(sx * q.s, sy * q.s, sz * q.s);
        dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
    });
    renderer.render(scene, camera);
  }
  function loop() {
    cancelAnimationFrame(raf);
    const tick = now => { if (!visible || document.hidden) return; frame(now); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
  }
  THREE.DefaultLoadingManager.onLoad = () => {
    frame(performance.now());
    stage.classList.add('is-ready');
    if (!reduce) loop();
  };
}
