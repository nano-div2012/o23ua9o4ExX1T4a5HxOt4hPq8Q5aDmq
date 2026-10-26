/* Halaman menu utama */
(function (AT) {
  var $ = AT.$;
  AT.Menu = {
    init: function () {
      var d = AT.App.profile;
      $('tier').textContent = 'Tier: ' + AT.App.tierOf(d.pts);
      $('stats').innerHTML = AT.rows([['Poin', d.pts], ['Main', d.games], ['Menang', d.wins], ['Total kill', d.kills], ['Peringkat terbaik', d.games ? '#' + d.best : '-']]);
      var top = d.runs.slice(0, 5);
      $('top').innerHTML = top.length ? top.map(function (r) { return '<li>' + r.s + ' poin · #' + r.r + ' · ' + r.k + ' kill</li>'; }).join('') : '<li>Belum ada riwayat</li>';
      $('play').onclick = function () { AT.go('lobby/index.html'); };
    }
  };
})(window.AT = window.AT || {});
