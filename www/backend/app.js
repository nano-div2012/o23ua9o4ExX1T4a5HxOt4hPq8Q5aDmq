/* Penyimpanan lokal (localStorage), rank, tier, tiket lobby */
(function (AT) {
  var C = AT.CFG, KEY = 'arena_terakhir_v3', App = AT.App = {};
  function def() { return { v: 0, runs: [], games: 0, wins: 0, kills: 0, pts: 0, best: 51, ticket: 0, lobbyStart: 0, last: null }; }
  function parse(s) { try { return JSON.parse(s); } catch (e) { return null; } }
  function read() {
    var a = null, b = null;
    try { a = parse(localStorage.getItem(KEY)); } catch (e) {}
    var w = parse(window.name); if (w && w.__at) b = w.__at; // cadangan bila localStorage tidak dibagi antar halaman
    var d = (a && b) ? ((b.v || 0) > (a.v || 0) ? b : a) : (a || b);
    return Object.assign(def(), d || {});
  }
  function write(d) {
    var s = JSON.stringify(d);
    try { localStorage.setItem(KEY, s); } catch (e) {}
    try { window.name = JSON.stringify({ __at: d }); } catch (e) {}
  }
  App.profile = AT.reactive(read(), function (k, v, t) { if (k !== 'v') { t.v = (t.v || 0) + 1; write(t); } });
  App.tierOf = function (p) { var t = C.TIERS[0][1]; C.TIERS.forEach(function (x) { if (p >= x[0]) t = x[1]; }); return t; };
  App.giveTicket = function () { App.profile.ticket = Date.now(); };
  App.hasTicket = function () { var t = App.profile.ticket; return t > 0 && Date.now() - t < 180000; };
  App.useTicket = function () { App.profile.ticket = 0; };
  App.saveResult = function (rank, kills, win) {
    var p = App.profile, sc = (C.PLAYERS + 1 - rank) * 10 + kills * 50 + (win ? 500 : 0), before = App.tierOf(p.pts);
    p.games = p.games + 1; p.kills = p.kills + kills; p.pts = p.pts + sc;
    if (win) p.wins = p.wins + 1;
    p.best = Math.min(p.best || 51, rank);
    p.runs = [{ s: sc, r: rank, k: kills }].concat(p.runs).sort(function (a, b) { return b.s - a.s; }).slice(0, 20);
    var after = App.tierOf(p.pts);
    p.last = { rank: rank, kills: kills, win: !!win, sc: sc, pts: p.pts, tier: after, up: after !== before };
  };
})(window.AT = window.AT || {});
