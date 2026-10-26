/* Fungsi bantu umum: DOM, matematika, toast, pindah halaman, pemuat Three.js */
(function (AT) {
  var $ = function (id) { return document.getElementById(id); };
  AT.$ = $;
  AT.root = document.body.getAttribute('data-root') || '';
  AT.rnd = function (a, b) { return a + Math.random() * (b - a); };
  AT.angDiff = function (a, b) { var d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
  AT.rows = function (a) { return a.map(function (r) { return '<div class="row"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>'; }).join(''); };
  var tt;
  AT.toast = function (t) { var e = $('toast'); if (!e) return; e.textContent = t; e.style.opacity = 1; clearTimeout(tt); tt = setTimeout(function () { e.style.opacity = 0; }, 1800); };
  AT.go = function (page) { location.href = AT.root + page; };
  AT.loadScript = function (src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script'), done = false;
      var to = setTimeout(function () { if (!done) { done = true; rej(new Error('timeout ' + src)); } }, 9000);
      s.onload = function () { if (!done) { done = true; clearTimeout(to); res(); } };
      s.onerror = function () { if (!done) { done = true; clearTimeout(to); rej(new Error('gagal ' + src)); } };
      s.src = src; document.head.appendChild(s);
    });
  };
  AT.loadThree = async function () {
    if (window.THREE) return;
    for (var i = 0; i < AT.CFG.THREE.length; i++) {
      var u = AT.CFG.THREE[i];
      try { await AT.loadScript(/^https?:/.test(u) ? u : AT.root + u); if (window.THREE) return; } catch (e) {}
    }
    throw new Error('Three.js gagal dimuat. Taruh three.min.js (r128) di backend/lib/ atau nyalakan internet.');
  };
})(window.AT = window.AT || {});
