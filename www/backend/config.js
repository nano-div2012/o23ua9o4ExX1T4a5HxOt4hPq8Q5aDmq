/* Konfigurasi game: semua angka penting ada di sini */
(function (AT) {
  AT.CFG = {
    PLAYERS: 50, ARENA: 100, HP: 200, FIRE: 0.2, DMG_MIN: 8, DMG_MAX: 12, // damage 8-12 (rata-rata 10)
    LOBBY_MS: 30000,            // lobby wajib 30 detik
    FREEZE_S: 5,                // semua karakter jeda 5 detik sebelum mulai
    ZONE_IDLE: 10, ZONE_SHRINK: 5,
    ZONE_TARGETS: [70, 48, 32, 20, 10, 4, 0],
    YAW_LIMIT: 120 * Math.PI / 180, // kiri 120 + kanan 120 = 240 derajat
    TIERS: [[0, 'Perunggu'], [600, 'Perak'], [1800, 'Emas'], [4000, 'Platinum'], [8000, 'Master']],
    NAMES: ['Rangga','Dimas','Putri','Bagas','Sinta','Joko','Wulan','Tegar','Ayu','Fajar','Rizki','Mawar','Budi','Citra','Dewi','Eko','Farah','Galih','Hana','Indra','Jaya','Kirana','Lintang','Mega','Naufal'],
    THREE: [
      'backend/lib/three.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
      'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js',
      'https://unpkg.com/three@0.128.0/build/three.min.js'
    ]
  };
})(window.AT = window.AT || {});
