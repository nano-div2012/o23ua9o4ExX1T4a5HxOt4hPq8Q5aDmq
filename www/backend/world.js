/* Dunia 3D (Three.js): scene, arena, peti, medkit, kamera POV, senjata di tangan */
(function (AT) {
  var C = AT.CFG, rnd = AT.rnd, W = AT.World = { crates: [], kits: [], S: null, R: null, cam: null, gun: null, flash: null };

  W.init = function (canvas) {
    var R = W.R = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    var S = W.S = new THREE.Scene();
    S.background = new THREE.Color(0x9fb4c4); S.fog = new THREE.Fog(0x9fb4c4, 50, 130);
    var cam = W.cam = new THREE.PerspectiveCamera(72, 1, 0.05, 300);
    cam.rotation.order = 'YXZ'; S.add(cam);
    S.add(new THREE.HemisphereLight(0xffffff, 0x5a6a55, 0.95));
    var sun = new THREE.DirectionalLight(0xffffff, 0.55); sun.position.set(30, 50, 20); S.add(sun);
    var ground = new THREE.Mesh(new THREE.CircleGeometry(C.ARENA + 4, 64), new THREE.MeshLambertMaterial({ color: 0x6f8f5a }));
    ground.rotation.x = -Math.PI / 2; S.add(ground);
    var outP = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshLambertMaterial({ color: 0x4d5f49 }));
    outP.rotation.x = -Math.PI / 2; outP.position.y = -0.05; S.add(outP);
    W.zoneM = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 10, 64, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xb04a42, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false }));
    S.add(W.zoneM);
    // senjata POV (menempel di kamera)
    var gun = W.gun = new THREE.Group();
    var body = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.13, 0.55), new THREE.MeshLambertMaterial({ color: 0x2b2f33 }));
    var grip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.1), new THREE.MeshLambertMaterial({ color: 0x3b3f44 })); grip.position.set(0, -0.14, 0.12);
    var fl = W.flash = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.12), new THREE.MeshBasicMaterial({ color: 0xf2d27a })); fl.position.set(0, 0, -0.34); fl.visible = false;
    gun.add(body, grip, fl); gun.position.set(0.24, -0.24, -0.55); cam.add(gun);
    function resize() { R.setSize(window.innerWidth, window.innerHeight, false); cam.aspect = window.innerWidth / window.innerHeight; cam.updateProjectionMatrix(); }
    window.addEventListener('resize', resize); resize();
  };

  W.build = function () {
    var crateGeo = new THREE.BoxGeometry(1, 1, 1), crateMat = new THREE.MeshLambertMaterial({ color: 0x8a6d4b });
    var NC = 85, im = new THREE.InstancedMesh(crateGeo, crateMat, NC), dm = new THREE.Object3D();
    im.frustumCulled = false; W.crates = [];
    for (var i = 0; i < NC; i++) {
      var w = rnd(1.5, 3.4), d = rnd(1.5, 3.4), h = rnd(2, 3.2), a = rnd(0, 6.283), r = Math.sqrt(Math.random()) * (C.ARENA - 6);
      var c = { x: Math.cos(a) * r, z: Math.sin(a) * r, w: w, d: d, h: h }; W.crates.push(c);
      dm.position.set(c.x, h / 2, c.z); dm.scale.set(w * 2, h, d * 2); dm.updateMatrix(); im.setMatrixAt(i, dm.matrix);
    }
    im.instanceMatrix.needsUpdate = true; W.S.add(im);
    W.kitGeo = new THREE.BoxGeometry(0.9, 0.5, 0.9); W.kitMat = new THREE.MeshLambertMaterial({ color: 0xdfe6e0 });
  };

  W.free = function (x, z) { return !W.crates.some(function (c) { return Math.abs(x - c.x) < c.w + 1.2 && Math.abs(z - c.z) < c.d + 1.2; }); };
  W.addKit = function (x, z) { var m = new THREE.Mesh(W.kitGeo, W.kitMat); m.position.set(x, 0.3, z); W.S.add(m); W.kits.push({ x: x, z: z, m: m, on: true }); };

  W.collide = function (e) {
    for (var i = 0; i < W.crates.length; i++) {
      var c = W.crates[i], cx = Math.max(c.x - c.w, Math.min(e.x, c.x + c.w)), cz = Math.max(c.z - c.d, Math.min(e.z, c.z + c.d));
      var dx = e.x - cx, dz = e.z - cz, d = Math.hypot(dx, dz);
      if (d < 0.7) { if (d < 1e-4) { e.x += 0.8; continue; } e.x += dx / d * (0.7 - d); e.z += dz / d * (0.7 - d); }
    }
    var m = Math.hypot(e.x, e.z); if (m > C.ARENA) { e.x *= C.ARENA / m; e.z *= C.ARENA / m; }
  };

  W.setZone = function (z) { var r = Math.max(z.r, 0.01); W.zoneM.scale.set(r, 1, r); W.zoneM.position.set(z.x, 5, z.z); };
  W.recoil = function () { W.gun.position.z = -0.47; W.flash.visible = true; setTimeout(function () { W.flash.visible = false; }, 45); };
  // kamera POV: tepat di kepala karakter
  W.updateCam = function (P, V, dt) {
    var c = W.cam; c.position.set(P.x, 1.7, P.z); c.rotation.set(V.pit, V.cy + Math.PI, 0);
    W.gun.visible = P.alive; W.gun.position.z += (-0.55 - W.gun.position.z) * Math.min(1, dt * 20);
  };
  W.render = function () { W.R.render(W.S, W.cam); };
})(window.AT = window.AT || {});
