/* Proxy reaktif: setiap nilai berubah, callback jalan (dipakai untuk simpan data dan update HUD) */
(function (AT) {
  AT.reactive = function (target, onChange) {
    return new Proxy(target, {
      set: function (t, k, v) { var old = t[k]; t[k] = v; if (old !== v) onChange(k, v, t); return true; }
    });
  };
})(window.AT = window.AT || {});
