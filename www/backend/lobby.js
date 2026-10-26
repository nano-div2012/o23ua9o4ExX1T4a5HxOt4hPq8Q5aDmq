/* Lobby: wajib menunggu 30 detik (tidak bisa dilewati dengan refresh) */
(function (AT) {
  var $ = AT.$, C = AT.CFG;
  AT.Lobby = {
    init: function () {
      var p = AT.App.profile, now = Date.now(), t0 = p.lobbyStart;
      if (!t0 || now - t0 > C.LOBBY_MS + 15000) { t0 = now; p.lobbyStart = t0; }
      var n = 1;
      var timer = setInterval(function () {
        var e = Date.now() - t0, k = Math.min(1, e / C.LOBBY_MS);
        n = Math.max(n, Math.min(C.PLAYERS, 1 + Math.floor((C.PLAYERS - 1) * Math.pow(k, 0.8) + (k < 1 ? Math.random() * 2 : 0))));
        if (k >= 1) n = C.PLAYERS;
        $('lc').textContent = n + ' / ' + C.PLAYERS;
        $('lb').style.width = (k * 100) + '%';
        $('lt').textContent = k >= 1 ? 'Pemain lengkap! Masuk arena...' : 'Mulai dalam ' + Math.ceil((C.LOBBY_MS - e) / 1000) + ' detik';
        if (k >= 1) { clearInterval(timer); p.lobbyStart = 0; AT.App.giveTicket(); AT.go('in-game/index.html'); }
      }, 250);
      $('cancel').onclick = function () { clearInterval(timer); p.lobbyStart = 0; AT.go('index.html'); };
    }
  };
})(window.AT = window.AT || {});
