/* ══════════════════════════════════════════════════════════════
   blackout · assets/tiles_infirmary.js
   LA ENFERMERÍA — tileset. Bloque base 16×16 px; piezas altas
   16×32. Azulejo que fue blanco, metal frío y cosas que gotean.
   Cada carácter es un píxel puesto a mano.
     k línea      t azulejo    T azulejo claro  g mugre  G mugre oscura
     c baldosa A  C baldosa B  d suciedad suelo
     q sangre     Q sangre clara
     m metal      M metal claro  n metal oscuro
     s sábana     S sábana clara  p almohada
     r cruz roja  w madera     x papel/píldora
     l líquido    L líquido claro  u cortina  U cortina clara
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const PAL = {
    k: '#101214',
    t: '#a8b4a8', T: '#c2ccc2', g: '#7f8b7f', G: '#535e54',
    c: '#8d9a90', C: '#6f7c72', d: '#4c5750',
    q: '#5a0f12', Q: '#7c1518',
    m: '#6a7078', M: '#8b929c', n: '#3d4249',
    s: '#b7bdc2', S: '#d5dade', p: '#e4e8ea',
    r: '#a32020', w: '#4a3626', x: '#e2ded2',
    l: '#7fa8b8', L: '#b8d5e0', u: '#6d7f7d', U: '#87999a',
  };

  const T_ = {};

  T_.floor_tiles = [
    'ccccccccCCCCCCCC',
    'ccccccccCCCCCCCC',
    'cccdccccCCCCCCCC',
    'ccccccccCCCCdCCC',
    'ccccccccCCCCCCCC',
    'ccccccccCCCCCCCC',
    'ccccccccCCCCCCCC',
    'ccccccccCCCCCCCC',
    'CCCCCCCCcccccccc',
    'CCCCCCCCcccccccc',
    'CCCCCCCCccdccccc',
    'CCCdCCCCcccccccc',
    'CCCCCCCCcccccccc',
    'CCCCCCCCcccccccc',
    'CCCCCCCCccccdccc',
    'CCCCCCCCcccccccc',
  ];

  T_.floor_tiles_blood = [
    'ccccccccCCCCCCCC',
    'ccccccccCCCCCCCC',
    'cccdccqcCCCCCCCC',
    'cccccqqqCCCCdCCC',
    'ccccqqQqqCCCCCCC',
    'ccccqQQQqqCCCCCC',
    'cccqqQQQQqqCCCCC',
    'ccccqQQQqqCCCCCC',
    'CCCCqqQqqccccccc',
    'CCCCCqqqcccccccc',
    'CCCCCCqqccdccccc',
    'CCCdCCCqcccccccc',
    'CCCCCCCCccqccccc',
    'CCCCCCCCcccccccc',
    'CCCCCCCCccccdccc',
    'CCCCCCCCcccccccc',
  ];

  T_.wall_tiles = [
    'kkkkkkkkkkkkkkkk',
    'TTTTTTTTTTTTTTTT',
    'tttTtttktttTtttk',
    'ttttttTkTttttttk',
    'tttttttktttttttk',
    'kkkkkkkkkkkkkkkk',
    'tTtttttktttttTtk',
    'ttttgttktttttttk',
    'tttgggtkttgttttk',
    'kkkkkkkkkkkkkkkk',
    'ttttttTktTttgttk',
    'tttttttkttggggtk',
    'ttgttttktgggGggk',
    'kkkkkkkkkkkkkkkk',
    'GGGGGGGGGGGGGGGG',
    'kkkkkkkkkkkkkkkk',
  ];

  T_.wall_tiles_smear = [
    'kkkkkkkkkkkkkkkk',
    'TTTTTTTTTTTTTTTT',
    'tttTtttkttqTtttk',
    'ttttttTkTqqttttk',
    'tttttttktqqqtttk',
    'kkkkkkkkkqqkkkkk',
    'tTtttttkqqtttTtk',
    'ttttttqkqqtttttk',
    'tttttqqqqqtttttk',
    'kkkkkqqqqkkkkkkk',
    'ttttttqqqtttgttk',
    'ttttttqqtttgggtk',
    'ttgtttqttttgGggk',
    'kkkkkkqkkkkkkkkk',
    'GGGGGGqGGGGGGGGG',
    'kkkkkkkkkkkkkkkk',
  ];

  T_.wall_red_cross = [
    'kkkkkkkkkkkkkkkk',
    'TTTTTTTTTTTTTTTT',
    'tttTtttktttTtttk',
    'ttkkkkkkkkkkkttk',
    'ttkxxxxrrxxxxttk',
    'ttkxxxxrrxxxxttk',
    'ttkxxrrrrrrxxttk',
    'ttkxxrrrrrrxxttk',
    'ttkxxxxrrxxxxttk',
    'ttkxxxxrrxxxxttk',
    'ttkkkkkkkkkkkttk',
    'tttttttkttttgttk',
    'ttgttttktgggggtk',
    'kkkkkkkkkkkkkkkk',
    'GGGGGGGGGGGGGGGG',
    'kkkkkkkkkkkkkkkk',
  ];

  T_.wall_eye_chart = [
    'kkkkkkkkkkkkkkkk',
    'TTTTTTTTTTTTTTTT',
    'tttkkkkkkkkkkttk',
    'tttkxxxxxxxxkttk',
    'tttkxkkkkkkxkttk',
    'tttkxxxxxxxxkttk',
    'tttkxkkxkkxxkttk',
    'tttkxxxxxxxxkttk',
    'tttkxkxkxkxxkttk',
    'tttkxxxxxxxxkttk',
    'tttkxkxxkxxxkttk',
    'tttkxxxxxxxxkttk',
    'tttkkkkkkkkkkttk',
    'kkkkkkkkkkkkkkkk',
    'GGGGGGGGGGGGGGGG',
    'kkkkkkkkkkkkkkkk',
  ];

  T_.hospital_bed = [
    'kkkkkkkkkkkkkkkk',
    'kmMMMMMMMMMMMMmk',
    'kmkkkkkkkkkkkkmk',
    'kmkppppppppppkmk',
    'kmkppppppppppkmk',
    'kmkkkkkkkkkkkkmk',
    'kmkSSSSSSSSSSkmk',
    'kmksssssssssskmk',
    'kmkssSSsssssskmk',
    'kmksssssssssskmk',
    'kmksssssSSssskmk',
    'kmksssssssssskmk',
    'kmkssqqsssssskmk',
    'kmksssqsssssskmk',
    'kmksssssssssskmk',
    'kmkssssssSSsskmk',
    'kmksssssssssskmk',
    'kmksssssssssskmk',
    'kmkSSsssssssskmk',
    'kmksssssssssskmk',
    'kmkkkkkkkkkkkkmk',
    'kmMMMMMMMMMMMMmk',
    'kmkkkkkkkkkkkkmk',
    'kmk..........kmk',
    'kmk..........kmk',
    'knk..........knk',
    'knk..........knk',
    'knnk........knnk',
    '.kk..........kk.',
    '................',
    '................',
    '................',
  ];

  T_.iv_stand = [
    '......kk........',
    '.....kmmk.......',
    '....kllllk......',
    '....klLllk......',
    '....kllllk......',
    '....kllllk......',
    '.....kllk.......',
    '......kmk.......',
    '......kmk.......',
    '......kmk.......',
    '......kmk.......',
    '......kmk.......',
    '......kmk.......',
    '.....kmmmk......',
    '...kmmkmkmmk....',
    '...kk..k..kk....',
  ];

  T_.cabinet_meds = [
    'kkkkkkkkkkkkkkkk',
    'kmmmmmmmmmmmmmmk',
    'kmkkkkkkkkkkkkmk',
    'kmkLLLLLLLLLLkmk',
    'kmkLllxLlxLLLkmk',
    'kmkLllxLlxLlLkmk',
    'kmkkkkkkkkkkkkmk',
    'kmkLLLLLLLLLLkmk',
    'kmkLxLlqLxLlLkmk',
    'kmkLxLlqLxLlLkmk',
    'kmkkkkkkkkkkkkmk',
    'kmkLLLLLLLLLLkmk',
    'kmkLlxLLxLqlLkmk',
    'kmkLlxLLxLqlLkmk',
    'kmkkkkkkkkkkkkmk',
    'kmmmmmmmmmmmmmmk',
    'kmkkkkkkkkkkkkmk',
    'kmkxxxxkkxxxxkmk',
    'kmkxkkxkkxkkxkmk',
    'kmkxxxxkkxxxxkmk',
    'kmkkMMxkkxMMkkmk',
    'kmkxxxxkkxxxxkmk',
    'kmkkkkkkkkkkkkmk',
    'kmmmmmmmmmmmmmmk',
    'kkkkkkkkkkkkkkkk',
    '.kmk........kmk.',
    '.kmk........kmk.',
    '.kkk........kkk.',
    '................',
    '................',
    '................',
    '................',
  ];

  T_.desk_medical = [
    '................',
    '................',
    '.kkkkkkkkkkkkkk.',
    'kMMMMMMMMMMMMMMk',
    'kmxxxxmmmmxxmmmk',
    'kmxkkxmmmmxxmmmk',
    'kmxxxxmmmmmmqmmk',
    'kMMMMMMMMMMMMMMk',
    '.kkkkkkkkkkkkkk.',
    '..knk......knk..',
    '..knk......knk..',
    '..knk......knk..',
    '..knk......knk..',
    '..knk......knk..',
    '.kknkk....kknkk.',
    '................',
  ];

  T_.wheelchair = [
    '................',
    '....kkkkkkk.....',
    '....knnnnnk.....',
    '....knnnnnk.....',
    '....knnnnnk.....',
    '...kkkkkkkkk....',
    '...kmmmmmmmk....',
    '...kmnnnnnmk....',
    '..kkkkkkkkkkk...',
    '.kmk.......kmk..',
    'kmmmk.....kmmmk.',
    'kmkmk.....kmkmk.',
    'kmmmk.....kmmmk.',
    '.kmk.......kmk..',
    '..k.........k...',
    '................',
  ];

  T_.curtain_divider = [
    'kkkkkkkkkkkkkkkk',
    'kmmmmmmmmmmmmmmk',
    'kUuUuUuUuUuUuUuk',
    'kUuUuUuUuUuUuUuk',
    'kUuUuUuUuUuUuUuk',
    'kUuUuUuUuUuUuUuk',
    'kUuUuUuUuUuUuUuk',
    'kUuUuUuUuUuUuUuk',
    'kUuUuUuUuUuUuUuk',
    'kUuUuUuUuUuUuUuk',
    'kUuUuUuUuUuUuUuk',
    'kUuUuUuUuUuUuUuk',
    'kUuUuUuUuUuUuUuk',
    'kUuUuUuUuUuUuUuk',
    'kUuUuUuUqUuUuUuk',
    'kUuUuUuqqquUuUuk',
    'kUuUuUuUqUuUuUuk',
    'kUuUuUuUuUuUuUuk',
    'kUuUuUuUuUuUuUuk',
    'kUuUuUuUuUuUuUuk',
    'kUuUuUuUuUuUuUuk',
    'kUuUuUuUuUuUuUuk',
    'kUuUuUuUuUuUuUuk',
    'kUuUuUuUuUuUuUuk',
    'kUuUuUuUuUuUuUuk',
    'kUuUuUuUuUuUuUuk',
    'kkkkkkkkkkkkkkkk',
    '.......kmk......',
    '.......kmk......',
    '.......kmk......',
    '......kmmmk.....',
    '......kkkkk.....',
  ];

  T_.sink = [
    '................',
    '......kmmk......',
    '......kmk.......',
    '..kkkkkmkkkkk...',
    '.kTTTTTTTTTTTk..',
    '.kTtttttttttTk..',
    '.kTttkkkktttTk..',
    '.kTttkllktttTk..',
    '.kTttkkkktttTk..',
    '.kTtttttttttTk..',
    '.kTTTTTTTTTTTk..',
    '..kkkkkkkkkkk...',
    '.....knnk.......',
    '.....knnk.......',
    '....kknnkk......',
    '................',
  ];

  const SPRITES = {};
  for (const [name, rows] of Object.entries(T_)) {
    SPRITES[name] = PixelArt.validate({
      name: `infirmary.${name}`,
      w: 16,
      h: rows.length,
      palette: PAL,
      frames: [rows],
    });
  }

  window.TILES_INFIRMARY = { palette: PAL, sprites: SPRITES };
})();
