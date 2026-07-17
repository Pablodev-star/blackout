/* ══════════════════════════════════════════════════════════════
   blackout · assets/tiles_school.js
   EL COLEGIO — tileset. Bloque base 16×16 px; piezas altas 16×32.
   Pasillos que fueron de niños. La tiza aún escribe sola.
   Cada carácter es un píxel puesto a mano.
     k línea     f linóleo    F linóleo claro  d suciedad
     p yeso      P yeso claro z friso verde   Z friso oscuro
     b pizarra   B pizarra clara  x tiza/papel
     w madera    W madera clara   n metal pata
     l taquilla  L taquilla clara o latón/corcho
     r libro rojo u libro azul   g libro verde
     q sangre    m noche      M luz de luna
     e esfera mar E continente
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const PAL = {
    k: '#12100c',
    f: '#8f8570', F: '#a39a82', d: '#5d5647',
    p: '#8a8474', P: '#9b9584', z: '#43573f', Z: '#2f3f2c',
    b: '#2e4238', B: '#3a5346', x: '#d8d5c5',
    w: '#4a3626', W: '#59422c', n: '#3d4249',
    l: '#4e5a66', L: '#5f6c7a', o: '#8a6a42',
    r: '#8a2a24', u: '#2a4a7a', g: '#3f6a3a',
    q: '#5a0f12', m: '#0e1420', M: '#b8c8d8',
    e: '#3a6a8a', E: '#6a8a4a',
  };

  const T = {};

  T.floor_lino = [
    'ffffffffFfffffff',
    'fFffffffffffffff',
    'ffffffdfffffFfff',
    'ffffffffffffffff',
    'fffFffffffffffff',
    'ffffffffFfffffff',
    'ffffffffffffdfff',
    'fdffffffffffffff',
    'ffffffFfffffffff',
    'ffffffffffffffff',
    'ffFfffffffFfffff',
    'ffffffdfffffffff',
    'ffffffffffffffff',
    'fFffffffffffffFf',
    'ffffffffffdfffff',
    'ffffffffffffffff',
  ];

  T.floor_lino_scratched = [
    'ffffffffFfffffff',
    'fFffffkfffffffff',
    'ffffffkfffffFfff',
    'fffffkffffffffff',
    'fffFfkffffffffff',
    'fffffkffFfffffff',
    'ffffkfffffffdfff',
    'fdffkfffffffffff',
    'ffffkfFfffffffff',
    'fffkffffffffffff',
    'ffFkffffffFfffff',
    'fffkffdfffffffff',
    'ffkfffffffffffff',
    'fFkfffffffffffFf',
    'ffkfffffffdfffff',
    'ffffffffffffffff',
  ];

  T.wall_class = [
    'kkkkkkkkkkkkkkkk',
    'PPPPPPPPPPPPPPPP',
    'pppPpppppppPpppp',
    'ppppppppPppppppp',
    'pPpppppppppppppp',
    'ppppppppppppPppp',
    'pppppPpppppppppp',
    'ppPppppppppppppp',
    'ppppppppppPppppp',
    'kkkkkkkkkkkkkkkk',
    'zzzzZzzzzzzzZzzz',
    'zZzzzzzzZzzzzzzz',
    'zzzzzzzzzzzzzzzz',
    'zzzZzzzzzzZzzzzz',
    'kkkkkkkkkkkkkkkk',
    'ZZZZZZZZZZZZZZZZ',
  ];

  T.wall_chalkboard = [
    'kkkkkkkkkkkkkkkk',
    'PPPPPPPPPPPPPPPP',
    'pwwwwwwwwwwwwwwp',
    'pwbbbbbbbbbbbbwp',
    'pwbxbxbxbbbbbbwp',
    'pwbbbbbbbbxxbbwp',
    'pwbbxxxbbbbbbbwp',
    'pwbbbbbbbxbbbbwp',
    'pwbxbbbbxbxbbbwp',
    'pwbbbbxbbbbbbbwp',
    'pwbbbbbbbbbxbbwp',
    'pwbbbbbbbbbbbbwp',
    'pwwwwwwxxwwwwwwp',
    'kkkkkkkkkkkkkkkk',
    'zzzzZzzzzzzzZzzz',
    'ZZZZZZZZZZZZZZZZ',
  ];

  T.wall_notice_board = [
    'kkkkkkkkkkkkkkkk',
    'PPPPPPPPPPPPPPPP',
    'ppwwwwwwwwwwwwpp',
    'ppwoooooooooowpp',
    'ppwoxxooxxooowpp',
    'ppwoxxooxxooowpp',
    'ppwooooxxooxowpp',
    'ppwoxooooooxowpp',
    'ppwoxoooqoooowpp',
    'ppwooooooooxowpp',
    'ppwwwwwwwwwwwwpp',
    'pppppppppppppppp',
    'kkkkkkkkkkkkkkkk',
    'zzzzZzzzzzzzZzzz',
    'zZzzzzzzZzzzzzzz',
    'ZZZZZZZZZZZZZZZZ',
  ];

  T.wall_window_school = [
    'kkkkkkkkkkkkkkkk',
    'PPPPPPPPPPPPPPPP',
    'pwwwwwwwwwwwwwwp',
    'pwmmmmmwwmmmmmwp',
    'pwmmMmmwwmmMmmwp',
    'pwmMMMmwwmMMMmwp',
    'pwmmMmmwwmmMmmwp',
    'pwmmmmmwwmmmmmwp',
    'pwwwwwwwwwwwwwwp',
    'pwmmmmmwwmmmmmwp',
    'pwmmmmmwwmmmmmwp',
    'pwmmqmmwwmmmmmwp',
    'pwmmmmmwwmmmmmwp',
    'pwwwwwwwwwwwwwwp',
    'kkkkkkkkkkkkkkkk',
    'ZZZZZZZZZZZZZZZZ',
  ];

  T.desk_pupil = [
    '................',
    '................',
    '.kkkkkkkkkkkkk..',
    'kWWWWWWWWWWWWWk.',
    'kWwwwwwwwwwwwWk.',
    'kWwxxxwwwwqwwWk.',
    'kWwxkxwwwwwwwWk.',
    'kWwwwwwwwwwwwWk.',
    'kWWWWWWWWWWWWWk.',
    '.kkkkkkkkkkkkk..',
    '..knk......knk..',
    '..knk......knk..',
    '..knk......knk..',
    '..knk......knk..',
    '.kknkk....kknkk.',
    '................',
  ];

  T.chair_school = [
    '................',
    '...kkkkkkkkk....',
    '...kwwwwwwwk....',
    '...kwWWWWWwk....',
    '...kwwwwwwwk....',
    '...kkkkkkkkk....',
    '...knnnnnnnk....',
    '...kwWWWWWwk....',
    '...kwwwwwwwk....',
    '...kkkkkkkkk....',
    '...knk...knk....',
    '...knk...knk....',
    '...knk...knk....',
    '...knk...knk....',
    '..kknkk.kknkk...',
    '................',
  ];

  T.locker = [
    'kkkkkkkkkkkkkkkk',
    'kllllllkkllllllk',
    'klLLLLLkkLLLLLlk',
    'kllllllkkllllllk',
    'klkkkklkklkkkklk',
    'klkkkklkklkkkklk',
    'kllllllkkllllllk',
    'klkkkklkklkkkklk',
    'klkkkklkklkkkklk',
    'kllllllkkllllllk',
    'klllollkkllolllk',
    'kllllllkkllllllk',
    'kllllllkkllllllk',
    'kllllllkkllllllk',
    'klqllllkkllllllk',
    'klqqlllkkllllllk',
    'kllqlllkkllllllk',
    'kllllllkkllllllk',
    'kllllllkkllllllk',
    'kllllllkkllllllk',
    'kllllllkkllllllk',
    'kllllllkkllllllk',
    'kllllllkkllllllk',
    'kllllllkkllllllk',
    'kllllllkkllllllk',
    'kllllllkkllllllk',
    'kllllllkkllllllk',
    'kllllllkkllllllk',
    'kLLLLLLkkLLLLLLk',
    'kkkkkkkkkkkkkkkk',
    '.kk..........kk.',
    '................',
  ];

  T.bookshelf_school = [
    'kkkkkkkkkkkkkkkk',
    'kWWWWWWWWWWWWWWk',
    'kwkkkkkkkkkkkkwk',
    'kwkrukgrkuggrkwk',
    'kwkrukgrkuggrkwk',
    'kwkrukgrkuggrkwk',
    'kwkrukgrkuggrkwk',
    'kwkkkkkkkkkkkkwk',
    'kwkugkrrkgurgkwk',
    'kwkugkrrkgurgkwk',
    'kwkugkrrkgurgkwk',
    'kwkugkrrkgurgkwk',
    'kwkkkkkkkkkkkkwk',
    'kwkgrkuxkrrugkwk',
    'kwkgrkuxkrrugkwk',
    'kwkgrkuxkrrugkwk',
    'kwkgrkuxkrrugkwk',
    'kwkkkkkkkkkkkkwk',
    'kwkxukkgkkuxrkwk',
    'kwkxukkgkkuxrkwk',
    'kwkxukkgkkuxrkwk',
    'kwkxukkgkkuxrkwk',
    'kwkkkkkkkkkkkkwk',
    'kWWWWWWWWWWWWWWk',
    'kkkkkkkkkkkkkkkk',
    '.kwk........kwk.',
    '.kkk........kkk.',
    '................',
    '................',
    '................',
    '................',
    '................',
  ];

  T.globe = [
    '................',
    '......kkkk......',
    '....kkeeeekk....',
    '...keeEEeeeek...',
    '...keEEEeeEek...',
    '..keeEEeeeEEek..',
    '..keeeEeeeeeek..',
    '..keeeeeeEEeek..',
    '..keEeeeEEEeek..',
    '...keeeeEEeek...',
    '...keEeeeeeek...',
    '....kkeeeekk....',
    '......kkkk......',
    '......kwwk......',
    '.....kwwwwk.....',
    '.....kkkkkk.....',
  ];

  T.door_school = [
    'kkkkkkkkkkkkkkkk',
    'kwwwwwwwwwwwwwwk',
    'kwWWWWWWWWWWWWwk',
    'kwWkkkkkkkkkkWwk',
    'kwWkmmmmmmmmkWwk',
    'kwWkmmMmmmmmkWwk',
    'kwWkmMmmmmmmkWwk',
    'kwWkmmmmmmmmkWwk',
    'kwWkmmmmmmmmkWwk',
    'kwWkkkkkkkkkkWwk',
    'kwWWWWWWWWWWWWwk',
    'kwWwwwwwwwwwwWwk',
    'kwWwwwwwwwwwwWwk',
    'kwWwwwwwwwwwwWwk',
    'kwWwwwwwwwwwwWwk',
    'kwWwwwwwwwwwwWwk',
    'kwWwwwwwwwwwwWwk',
    'kwWwwwwwwwwwwWwk',
    'kwWwwwwwwwoowWwk',
    'kwWwwwwwwwoowWwk',
    'kwWwwwwwwwwwwWwk',
    'kwWwwwwwwwwwwWwk',
    'kwWwwwwwwwwwwWwk',
    'kwWwwwwwwwwwwWwk',
    'kwWwwwwwwwwwwWwk',
    'kwWwwwwwwwwwwWwk',
    'kwWwwwwwwwwwwWwk',
    'kwWwwwwwwwwwwWwk',
    'kwWwwwwwwwwwwWwk',
    'kwWWWWWWWWWWWWwk',
    'kwwwwwwwwwwwwwwk',
    'kkkkkkkkkkkkkkkk',
  ];

  const SPRITES = {};
  for (const [name, rows] of Object.entries(T)) {
    SPRITES[name] = PixelArt.validate({
      name: `school.${name}`,
      w: 16,
      h: rows.length,
      palette: PAL,
      frames: [rows],
    });
  }

  window.TILES_SCHOOL = { palette: PAL, sprites: SPRITES };
})();
