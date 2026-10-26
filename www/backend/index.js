/* Pintu masuk: jalankan modul sesuai halaman (data-page di <body>) */
(function (AT) {
  var page = document.body.getAttribute('data-page');
  var map = { menu: AT.Menu, lobby: AT.Lobby, score: AT.Score, game: AT.Game };
  if (map[page]) map[page].init();
})(window.AT);
