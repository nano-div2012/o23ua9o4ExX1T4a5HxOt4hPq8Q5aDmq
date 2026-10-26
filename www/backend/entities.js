/* Karakter (pemain + 49 bot), AI bot, peluru */
(function (AT) {
  var C = AT.CFG, rnd = AT.rnd, angDiff = AT.angDiff, E = AT.Ent = { list: [], bullets: [], P: null, g: null };

  function geos() {
    if (E.g) return;
    E.g = {
      cyl: new THREE.CylinderGeometry(0.6, 0.7, 1.5, 8), head: new THREE.SphereGeometry(0.45, 8, 6), gun: new THREE.BoxGeometry(0.25, 0.25, 1.3),
      bar: new THREE.BoxGeometry(1.6, 0.16, 0.1), b: new THREE.SphereGeometry(0.22, 6, 6),
      headM: new THREE.MeshLambertMaterial({ color: 0xe3c4a0 }), gunM: new THREE.MeshLambertMaterial({ color: 0x2b2f33 }),
      barM: new THREE.MeshBasicMaterial({ color: 0xe6e6e6 }), bP: new THREE.MeshBasicMaterial({ color: 0xf2d27a }), bE: new THREE.MeshBasicMaterial({ color: 0xeeeeee })
    };
  }

  E.mk = function (x, z, col, isP, name, s) {
    var e = { x: x, z: z, hp: C.HP, yaw: rnd(0, 6.28), cd: rnd(0, 0.5), alive: true, isP: isP, name: name, s: s || 1, kills: 0, kits: isP ? 2 : 0, heal: 0,
      root: null, body: null, bar: null, think: 0, sd: Math.random() < 0.5 ? 1 : -1, tg: null, err: 0, fireOn: false, wx: 0, wz: 0, rank: 0 };
    if (!isP) { // pemain tidak punya badan (POV), hanya bot
      var g = E.g, root = new THREE.Group(), body = new THREE.Group();
      var c = new THREE.Mesh(g.cyl, new THREE.MeshLambertMaterial({ color: col })); c.position.y = 0.85;
      var h = new THREE.Mesh(g.head, g.headM); h.position.y = 1.9;
      var gn = new THREE.Mesh(g.gun, g.gunM); gn.position.set(0.4, 1.2, 0.8);
      body.add(c, h, gn); root.add(body);
      var bar = new THREE.Mesh(g.bar, g.barM); bar.position.y = 2.8; root.add(bar);
      root.position.set(x, 0, z); AT.World.S.add(root);
      e.root = root; e.body = body; e.bar = bar;
    }
    return e;
  };

  E.aliveN = function () { var n = 0; for (var i = 0; i < E.list.length; i++) if (E.list[i].alive) n++; return n; };

  E.spawnAll = function () {
    geos(); var W = AT.World;
    E.list = []; E.bullets = [];
    function spot() {
      var x, z, t = 0;
      do { var a = rnd(0, 6.283), r = Math.sqrt(Math.random()) * (C.ARENA - 8); x = Math.cos(a) * r; z = Math.sin(a) * r; t++; }
      while (t < 120 && (!W.free(x, z) || E.list.some(function (e) { return Math.hypot(e.x - x, e.z - z) < (t > 60 ? 5 : 12); })));
      return [x, z];
    }
    for (var i = 0; i < 40; i++) { var k = spot(); W.addKit(k[0], k[1]); }
    var p = spot(); E.P = E.mk(p[0], p[1], 0x3b6fb6, true, 'Kamu'); E.list.push(E.P);
    var cols = [0x8a4b43, 0x6b5b7a, 0x5c7a6b, 0x7a6b4b, 0x4b6a7a];
    for (var j = 0; j < C.PLAYERS - 1; j++) {
      var q = Math.random(), s = q < 0.25 ? rnd(0.85, 1) : q < 0.7 ? rnd(0.5, 0.8) : rnd(0.2, 0.45); // jago / sedang / pemula
      var sp = spot(); E.list.push(E.mk(sp[0], sp[1], cols[j % 5], false, C.NAMES[j % 25] + (j >= 25 ? j : ''), s));
    }
  };

  // y: tinggi awal peluru, pitch: sudut naik/turun (POV pemain ikut arah crosshair)
  E.shoot = function (o, yaw, pitch, y) {
    var cp = Math.cos(pitch || 0), dx = Math.sin(yaw) * cp, dz = Math.cos(yaw) * cp, dy = Math.sin(pitch || 0);
    var m = new THREE.Mesh(E.g.b, o.isP ? E.g.bP : E.g.bE), x = o.x + dx * 0.9, z = o.z + dz * 0.9, yy = y + dy * 0.9;
    m.position.set(x, yy, z); AT.World.S.add(m);
    E.bullets.push({ x: x, y: yy, z: z, vx: dx * 38, vz: dz * 38, vy: dy * 38, life: 1.1, o: o, dmg: C.DMG_MIN + Math.floor(Math.random() * (C.DMG_MAX - C.DMG_MIN + 1)), m: m });
  };

  // bantuan bidik ringan (sekitar 6 derajat) supaya enak di layar sentuh
  E.aimAssist = function (P, cy, pit) {
    var best = { yaw: cy, pitch: pit }, bd = 0.11;
    for (var i = 0; i < E.list.length; i++) {
      var o = E.list[i]; if (!o.alive || o === P) continue;
      var dx = o.x - P.x, dz = o.z - P.z, d2 = dx * dx + dz * dz; if (d2 > 2025) continue;
      var a = Math.atan2(dx, dz), df = Math.abs(angDiff(a, cy));
      if (df < bd) { bd = df; best = { yaw: a, pitch: Math.atan2(1.1 - 1.6, Math.sqrt(d2)) }; }
    }
    return best;
  };

  E.stepBullets = function (dt, onHit) {
    var W = AT.World;
    for (var i = E.bullets.length - 1; i >= 0; i--) {
      var b = E.bullets[i], dead = false;
      for (var k = 0; k < 2 && !dead; k++) {
        b.x += b.vx * dt / 2; b.z += b.vz * dt / 2; b.y += b.vy * dt / 2;
        if (b.y < 0) { dead = true; break; }
        for (var c = 0; c < W.crates.length; c++) { var cr = W.crates[c]; if (Math.abs(b.x - cr.x) < cr.w && Math.abs(b.z - cr.z) < cr.d && b.y < cr.h) { dead = true; break; } }
        if (dead) break;
        for (var j = 0; j < E.list.length; j++) {
          var e = E.list[j]; if (!e.alive || e === b.o) continue;
          var dx = e.x - b.x, dz = e.z - b.z;
          if (dx * dx + dz * dz < 0.8 && b.y < 2.4) { onHit(e, b.dmg, b.o); dead = true; break; }
        }
      }
      b.life -= dt;
      if (dead || b.life <= 0) { W.S.remove(b.m); E.bullets.splice(i, 1); } else b.m.position.set(b.x, b.y, b.z);
    }
  };

  E.ai = function (b, dt) {
    var zr = AT.Zone.ref(), zx = zr[0], zz = zr[1], zrad = zr[2], W = AT.World;
    b.think -= dt;
    if (b.think <= 0) {
      b.think = 0.25 + Math.random() * 0.35; var best = null, bd = 1e9;
      for (var i = 0; i < E.list.length; i++) {
        var o = E.list[i]; if (o === b || !o.alive) continue;
        var ddx = o.x - b.x, ddz = o.z - b.z; if (Math.abs(ddx) > 40 || Math.abs(ddz) > 40) continue;
        var d = Math.hypot(ddx, ddz); if (d < bd) { bd = d; best = o; }
      }
      b.tg = bd < 22 + b.s * 14 ? best : null;
      b.err = (Math.random() - 0.5) * 2 * (1 - b.s) * 0.5 + (Math.random() - 0.5) * 0.06;
      b.fireOn = Math.random() < 0.45 + 0.5 * b.s; if (Math.random() < 0.3) b.sd *= -1;
      if (!b.wx || Math.hypot(b.wx - b.x, b.wz - b.z) < 2 || Math.random() < 0.1) {
        var a = rnd(0, 6.283), r = Math.random() * Math.max(zrad, 2) * 0.8; b.wx = zx + Math.cos(a) * r; b.wz = zz + Math.sin(a) * r;
      }
      if (b.hp <= 120) { // cari medkit terdekat
        var kit = null, kd = 18;
        for (var q = 0; q < W.kits.length; q++) { var k = W.kits[q]; if (k.on) { var dd = Math.hypot(k.x - b.x, k.z - b.z); if (dd < kd) { kd = dd; kit = k; } } }
        if (kit) { b.wx = kit.x; b.wz = kit.z; b.tg = null; }
      }
    }
    var outZ = Math.hypot(b.x - zx, b.z - zz) > zrad - 4, tg = b.tg && b.tg.alive ? b.tg : null, mx = 0, mz = 0;
    if (outZ) { mx = zx - b.x; mz = zz - b.z; }
    else if (tg) {
      var dx = tg.x - b.x, dz = tg.z - b.z, dist = Math.hypot(dx, dz) || 1;
      if (dist > 16) { mx = dx; mz = dz; } else if (dist < 8) { mx = -dx; mz = -dz; } else { mx = -dz * b.sd; mz = dx * b.sd; }
    } else { mx = b.wx - b.x; mz = b.wz - b.z; }
    var m = Math.hypot(mx, mz) || 1, sp = (4.6 + b.s * 1.2) * (outZ ? 1.25 : 1);
    b.x += mx / m * sp * dt; b.z += mz / m * sp * dt;
    var want = Math.atan2(mx, mz); if (tg) want = Math.atan2(tg.x - b.x, tg.z - b.z) + b.err;
    b.yaw += angDiff(want, b.yaw) * Math.min(1, dt * (4 + b.s * 6));
    if (tg && b.fireOn && b.cd <= 0 && Math.abs(angDiff(want, b.yaw)) < 0.3) { E.shoot(b, b.yaw, 0, 1.3); b.cd = C.FIRE + (1 - b.s) * 0.18; }
  };

  E.sync = function (hd, cy) {
    var P = E.P;
    for (var i = 0; i < E.list.length; i++) {
      var e = E.list[i]; if (!e.alive || e.isP) continue;
      var d = Math.hypot(e.x - P.x, e.z - P.z), v = d < 95; e.root.visible = v; if (!v) continue;
      e.root.position.set(e.x, 0, e.z); e.body.rotation.y = e.yaw; e.bar.visible = d < 40; e.bar.rotation.y = cy; e.bar.scale.x = Math.max(0.02, e.hp / C.HP);
    }
  };
})(window.AT = window.AT || {});
