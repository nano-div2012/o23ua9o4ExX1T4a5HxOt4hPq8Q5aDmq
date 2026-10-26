/* Kontrol: stick kiri (gerak), geser kanan (putar kamera POV), tombol tembak & medkit, keyboard */
(function (AT) {
  var $ = AT.$, V = AT.View = { cy: 0, hd: 0, pit: 0 }, In = AT.In = { K: {}, fire: false, L: { x: 0, y: 0 } };

  function stick(el, knob, base) {
    var s = { x: 0, y: 0, on: false, id: null, ox: 0, oy: 0 };
    el.addEventListener('pointerdown', function (e) {
      if (s.on) return; s.on = true; s.id = e.pointerId; try { el.setPointerCapture(e.pointerId); } catch (x) {}
      s.ox = e.clientX; s.oy = e.clientY; base.style.left = s.ox + 'px'; base.style.top = s.oy + 'px'; base.style.display = 'block'; knob.style.transform = 'translate(0,0)'; e.preventDefault();
    });
    el.addEventListener('pointermove', function (e) {
      if (!s.on || e.pointerId !== s.id) return;
      var dx = e.clientX - s.ox, dy = e.clientY - s.oy, m = Math.hypot(dx, dy), M = 50;
      if (m > M) { dx *= M / m; dy *= M / m; } s.x = dx / M; s.y = dy / M; knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    });
    function end(e) { if (e.pointerId !== s.id) return; s.on = false; s.x = s.y = 0; base.style.display = 'none'; }
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    return s;
  }

  In.look = function (dx, dy) { V.cy -= dx * 0.0065; V.pit = Math.max(-0.7, Math.min(0.7, V.pit - dy * 0.004)); };

  In.init = function () {
    In.L = stick($('padL'), $('kL'), $('bL'));
    var pr = $('padR'), dp = null;
    pr.addEventListener('pointerdown', function (e) { if (dp) return; dp = { id: e.pointerId, x: e.clientX, y: e.clientY }; try { pr.setPointerCapture(e.pointerId); } catch (x) {} e.preventDefault(); });
    pr.addEventListener('pointermove', function (e) { if (!dp || e.pointerId !== dp.id) return; In.look(e.clientX - dp.x, e.clientY - dp.y); dp.x = e.clientX; dp.y = e.clientY; });
    function pend(e) { if (dp && e.pointerId === dp.id) dp = null; }
    pr.addEventListener('pointerup', pend); pr.addEventListener('pointercancel', pend);
    var fb = $('fireB');
    fb.addEventListener('pointerdown', function (e) { In.fire = true; try { fb.setPointerCapture(e.pointerId); } catch (x) {} e.preventDefault(); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (n) { fb.addEventListener(n, function () { In.fire = false; }); });
    $('kitB').addEventListener('pointerdown', function (e) { AT.Game.useKit(); e.preventDefault(); });
    window.addEventListener('keydown', function (e) { var k = e.key.toLowerCase(); In.K[k] = 1; if (k === 'h') AT.Game.useKit(); });
    window.addEventListener('keyup', function (e) { In.K[e.key.toLowerCase()] = 0; });
  };

  In.move = function () {
    var K = In.K, L = In.L;
    var fw = ((K.w || K.arrowup) ? 1 : 0) - ((K.s || K.arrowdown) ? 1 : 0) - L.y, st = ((K.d || K.arrowright) ? 1 : 0) - ((K.a || K.arrowleft) ? 1 : 0) + L.x, m = Math.hypot(fw, st);
    if (m > 1) { fw /= m; st /= m; } return { fw: fw, st: st, m: Math.min(1, m) };
  };
})(window.AT = window.AT || {});
