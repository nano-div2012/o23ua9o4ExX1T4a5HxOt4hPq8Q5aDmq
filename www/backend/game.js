/* Sistem game: alur match (jeda 5 detik, main), loop, HUD, tembak, medkit, menang/kalah */
(function (AT) {
  var C = AT.CFG, $ = AT.$, angDiff = AT.angDiff, G = AT.Game = { phase: 'load', over: false, fz: 0 }, H = null, last = 0, hudT = 0, exA = 0;

  var RENDER = {
    hp: function (v) { $('hpb').style.width = Math.max(0, v / 2) + '%'; $('hpn').textContent = Math.max(0, Math.ceil(v)); },
    alive: function (v) { $('al').textContent = v; }, kills: function (v) { $('kl').textContent = v; },
    kits: function (v) { $('kitN').textContent = v; },
    heal: function (v) { $('kitF').style.height = v > 0 ? ((1 - v / 2) * 100) + '%' : '0'; },
    zone: function (v) { $('zt').textContent = v; }, out: function (v) { $('zt').classList.toggle('bad', v); }
  };

  G.init = async function () {
    if (!AT.App.hasTicket()) { AT.go('lobby/index.html'); return; } // wajib lewat lobby 30 detik
    try { await AT.loadThree(); }
    catch (e) { $('lm').textContent = e.message; var r = $('retry'); r.style.display = 'block'; r.onclick = function () { location.reload(); }; return; }
    AT.App.useTicket();
    var W = AT.World, E = AT.Ent, V = AT.View;
    W.init($('c')); W.build(); E.spawnAll(); AT.Zone.reset();
    V.cy = V.hd = Math.atan2(-E.P.x, -E.P.z); V.pit = 0;
    H = AT.reactive({ hp: C.HP, alive: C.PLAYERS, kills: 0, kits: 2, heal: 0, zone: '', out: false }, function (k, v) { if (RENDER[k]) RENDER[k](v); });
    for (var k in RENDER) RENDER[k](H[k]);
    AT.In.init();
    $('ex').onclick = function () { if (Date.now() - exA < 2500) AT.go('index.html'); else { exA = Date.now(); AT.toast('Tekan Menu sekali lagi untuk keluar dari match'); } };
    $('load').classList.remove('on');
    setTimeout(function () { $('hint').style.display = 'none'; }, 9000);
    G.phase = 'freeze'; G.fz = C.FREEZE_S; G.over = false;
    requestAnimationFrame(loop);
  };

  G.useKit = function () {
    var P = AT.Ent && AT.Ent.P;
    if (G.phase !== 'play' || !P || !P.alive || P.heal > 0 || P.kits <= 0 || P.hp >= C.HP) return;
    P.heal = 2;
  };

  G.hit = function (e, d, by) {
    if (!e.alive) return; e.hp -= d;
    if (e.isP && d >= 3) { var f = $('flash'); f.style.opacity = 1; setTimeout(function () { f.style.opacity = 0; }, 110); }
    if (e.hp <= 0) G.die(e, by);
  };
  G.die = function (e, by) {
    var E = AT.Ent; e.rank = E.aliveN(); e.alive = false; if (e.root) AT.World.S.remove(e.root);
    if (by && by !== e) { by.kills++; if (by.isP) AT.toast('Kamu mengalahkan ' + e.name); else if (e.isP) AT.toast(by.name + ' mengalahkanmu'); }
    else if (e.isP) AT.toast('Kamu gugur di luar zona');
    H.alive = E.aliveN();
    if (e.isP) setTimeout(function () { G.finish(e.rank, false); }, 1300);
    else if (E.P.alive && E.aliveN() === 1) setTimeout(function () { G.finish(1, true); }, 700);
  };
  G.finish = function (rank, win) {
    if (G.over) return; G.over = true; G.phase = 'over';
    AT.App.saveResult(rank, AT.Ent.P.kills, win); AT.go('score/index.html');
  };

  function update(dt) {
    var E = AT.Ent, W = AT.World, Z = AT.Zone, V = AT.View, In = AT.In, P = E.P;
    Z.step(dt); var zd = Z.dmg(), s = Z.s;
    if (In.K.q) V.cy += dt * 2; if (In.K.e) V.cy -= dt * 2;
    if (P.alive) {
      var mv = In.move(), sn = Math.sin(V.cy), cs = Math.cos(V.cy);
      P.x += (sn * mv.fw - cs * mv.st) * 7 * dt; P.z += (cs * mv.fw + sn * mv.st) * 7 * dt;
      var fire = In.fire || In.K[' '];
      if (fire && P.cd <= 0) { var a = E.aimAssist(P, V.cy, V.pit); E.shoot(P, a.yaw, a.pitch, 1.6); P.cd = C.FIRE; W.recoil(); }
      if (fire || mv.m > 0.1) V.hd += angDiff(V.cy, V.hd) * Math.min(1, dt * 8); // badan ikut menghadap arah pandang
      if (P.heal > 0) { P.heal -= dt; if (P.heal <= 0) { P.heal = 0; P.kits--; P.hp = Math.min(C.HP, P.hp + 70); AT.toast('+70 HP'); } }
    }
    for (var i = 0; i < E.list.length; i++) {
      var e = E.list[i]; if (!e.alive) continue;
      e.cd -= dt; if (!e.isP) E.ai(e, dt); W.collide(e);
      if (Math.hypot(e.x - s.x, e.z - s.z) > s.r) G.hit(e, zd * dt, null);
      if (!e.alive) continue;
      for (var j = 0; j < W.kits.length; j++) {
        var k = W.kits[j]; if (!k.on || Math.abs(k.x - e.x) > 1.4 || Math.abs(k.z - e.z) > 1.4) continue;
        if (e.isP) { if (e.kits < 5) { e.kits++; k.on = false; k.m.visible = false; AT.toast('Medkit +1'); } }
        else if (e.hp <= 140) { k.on = false; k.m.visible = false; e.hp = Math.min(C.HP, e.hp + 60); }
      }
    }
    E.stepBullets(dt, G.hit);
    E.sync(V.hd, V.cy); W.setZone(s);
    H.hp = P.hp; H.kills = P.kills; H.kits = P.kits; H.heal = P.heal;
    var inZ = Math.hypot(P.x - s.x, P.z - s.z) <= s.r;
    H.zone = (inZ ? '' : 'Di luar zona! ') + Z.text(); H.out = !inZ;
    hudT -= dt; if (hudT <= 0) { hudT = 0.1; H.alive = E.aliveN(); drawMM(); }
  }

  var mc = null;
  function drawMM() {
    mc = mc || $('mm').getContext('2d'); var P = AT.Ent.P, s = AT.Zone.s, V = AT.View, W = 112, c = W / 2, k = (c - 4) / C.ARENA;
    mc.clearRect(0, 0, W, W); mc.fillStyle = 'rgba(28,36,44,.82)'; mc.beginPath(); mc.arc(c, c, c - 1, 0, 6.283); mc.fill();
    mc.lineWidth = 1.5; mc.strokeStyle = '#fff'; mc.beginPath(); mc.arc(c + s.x * k, c + s.z * k, Math.max(s.r * k, 0.5), 0, 6.283); mc.stroke();
    if (s.nr !== null) { mc.strokeStyle = '#5aa0e0'; mc.beginPath(); mc.arc(c + s.nx * k, c + s.nz * k, Math.max(s.nr * k, 0.5), 0, 6.283); mc.stroke(); }
    var px = c + P.x * k, pz = c + P.z * k, sn = Math.sin(V.cy), cs = Math.cos(V.cy);
    mc.fillStyle = '#f2d27a'; mc.beginPath(); mc.moveTo(px + sn * 6, pz + cs * 6); mc.lineTo(px - sn * 3 - cs * 3.5, pz - cs * 3 + sn * 3.5); mc.lineTo(px - sn * 3 + cs * 3.5, pz - cs * 3 - sn * 3.5); mc.fill();
  }

  function loop(t) {
    requestAnimationFrame(loop);
    var dt = Math.min(0.033, (t - last) / 1000 || 0); last = t;
    var E = AT.Ent, V = AT.View, W = AT.World;
    if (G.phase === 'freeze') {
      G.fz -= dt; $('cdn').textContent = Math.max(1, Math.ceil(G.fz));
      if (G.fz <= 0) { G.phase = 'play'; $('cdw').style.display = 'none'; AT.toast('Pertandingan dimulai!'); }
      E.sync(V.hd, V.cy); W.setZone(AT.Zone.s);
    } else if (G.phase === 'play') update(dt);
    var d = angDiff(V.cy, V.hd); // batas putar kamera relatif badan: 120 derajat tiap sisi (total 240)
    if (d > C.YAW_LIMIT) V.hd = V.cy - C.YAW_LIMIT; else if (d < -C.YAW_LIMIT) V.hd = V.cy + C.YAW_LIMIT;
    W.updateCam(E.P, V, dt); W.render();
  }
})(window.AT = window.AT || {});
