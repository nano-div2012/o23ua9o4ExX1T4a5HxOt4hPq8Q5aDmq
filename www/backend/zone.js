/* Zona: diam 10 detik, mengecil 5 detik, berulang sampai habis */
(function (AT) {
  var C = AT.CFG, Z = AT.Zone = { s: null };
  function plan() {
    var s = Z.s, tr = C.ZONE_TARGETS[s.ph];
    if (tr === undefined) { s.nr = null; return; }
    var a = AT.rnd(0, 6.283), o = Math.random() * (s.r - tr) * 0.85;
    s.nx = s.x + Math.cos(a) * o; s.nz = s.z + Math.sin(a) * o; s.nr = tr;
  }
  Z.reset = function () { Z.s = { x: 0, z: 0, r: C.ARENA, ph: 0, t: C.ZONE_IDLE, shr: false, fx: 0, fz: 0, fr: 0, nx: 0, nz: 0, nr: null }; plan(); };
  Z.step = function (dt) {
    var s = Z.s; if (s.nr === null) return; s.t -= dt;
    if (!s.shr) { if (s.t <= 0) { s.shr = true; s.t = C.ZONE_SHRINK; s.fx = s.x; s.fz = s.z; s.fr = s.r; } }
    else {
      var k = 1 - Math.max(0, s.t) / C.ZONE_SHRINK;
      s.r = s.fr + (s.nr - s.fr) * k; s.x = s.fx + (s.nx - s.fx) * k; s.z = s.fz + (s.nz - s.fz) * k;
      if (s.t <= 0) { s.shr = false; s.r = s.nr; s.x = s.nx; s.z = s.nz; s.ph++; s.t = C.ZONE_IDLE; plan(); }
    }
  };
  Z.ref = function () { var s = Z.s; return (s.nr !== null && (s.shr || s.t < 7)) ? [s.nx, s.nz, s.nr] : [s.x, s.z, s.r]; }; // bot menuju zona berikutnya lebih awal
  Z.dmg = function () { return 6 + Z.s.ph * 3; };
  Z.text = function () { var s = Z.s; return s.nr === null ? 'Zona habis' : s.shr ? 'Zona menyempit... ' + Math.ceil(s.t) + 's' : 'Zona ' + (s.ph + 1) + ' menyempit dalam ' + Math.ceil(s.t) + 's'; };
})(window.AT = window.AT || {});
