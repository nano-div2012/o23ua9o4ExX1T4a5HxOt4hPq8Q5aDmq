/* Layar skor: MENANG atau KALAH */
(function (AT) {
  var $ = AT.$;
  AT.Score = {
    init: function () {
      var l = AT.App.profile.last;
      if (!l) { AT.go('index.html'); return; }
      $('sc').className = 'card ' + (l.win ? 'win' : 'lose');
      $('st').textContent = l.win ? 'MENANG' : 'KALAH';
      $('sp').textContent = l.win ? 'Kamu pemain terakhir yang bertahan. Mantap!' : 'Kamu gugur di peringkat #' + l.rank + '. Coba lagi, pelajari pola zonanya.';
      $('ss').innerHTML = AT.rows([['Peringkat', '#' + l.rank + ' dari 50'], ['Kill', l.kills], ['Skor ronde', l.sc], ['Total poin', l.pts], ['Tier', l.tier + (l.up ? ' (naik!)' : '')]]);
      $('again').onclick = function () { AT.go('lobby/index.html'); };
      $('tomenu').onclick = function () { AT.go('index.html'); };
    }
  };
})(window.AT = window.AT || {});
