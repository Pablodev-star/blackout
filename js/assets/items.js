/* ══════════════════════════════════════════════════════════════
   blackout · assets/items.js
   LOS OBJETOS — 16×16 px. Lo que cabe en un bolsillo cuando
   corres a oscuras. Cada carácter es un píxel puesto a mano.
     k contorno   m metal      M metal claro   n metal oscuro
     y amarillo   Y luz        a núcleo luz
     o latón/oro  O oro claro  w madera   W madera clara
     x tela/papel X papel claro  q sangre
     r rojo       g goma       b hoja acero  B brillo acero
     u óxido      e escrito/gris
   Animados: flashlight_on (la luz tiembla) · coin (gira).
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const PAL = {
    k: '#101014',
    m: '#6a7078', M: '#8b929c', n: '#3d4249',
    y: '#c9a227', Y: '#ffd96a', a: '#fff2c0',
    o: '#8a703a', O: '#c9a85a',
    w: '#4a3626', W: '#59422c',
    x: '#d8d0c0', X: '#efe9dc', q: '#5a0f12',
    r: '#a32020', g: '#23252e',
    b: '#9aa4ae', B: '#c8d2dc',
    u: '#7a4a28', e: '#4a4a52',
  };

  const I = {};

  I.flashlight_off = [[
    '................',
    '................',
    '................',
    '....kkkk........',
    '...kMMmmkkkkkk..',
    '..kMyyymmmmmmmk.',
    '..kMyyymmmmmmmk.',
    '..kMyyymmmgggmk.',
    '..kMyyymmmmmmmk.',
    '...kMMmmkkkkkk..',
    '....kkkk........',
    '................',
    '................',
    '................',
    '................',
    '................',
  ]];

  I.flashlight_on = [
    [
      'Y...............',
      '.Y..............',
      'YYY.............',
      'aaYYkkkk........',
      'aaaYMMmmkkkkkk..',
      'aaaaYyymmmmmmmk.',
      'aaaaYyymmmmmmmk.',
      'aaaaYyymmmgggmk.',
      'aaaaYyymmmmmmmk.',
      'aaaYMMmmkkkkkk..',
      'aaYYkkkk........',
      'YYY.............',
      '.Y..............',
      'Y...............',
      '................',
      '................',
    ],
    [
      '................',
      'Y...............',
      'YYY.............',
      'aaYYkkkk........',
      'aaaYMMmmkkkkkk..',
      'aaaaYyymmmmmmmk.',
      'aaaaYyymmmmmmmk.',
      'aaaaYyymmmgggmk.',
      'aaaaYyymmmmmmmk.',
      'aaaYMMmmkkkkkk..',
      'aaYYkkkk........',
      'YYY.............',
      'Y...............',
      '................',
      '................',
      '................',
    ],
  ];

  I.battery = [[
    '................',
    '................',
    '.....kkkk.......',
    '.....kMMk.......',
    '....kkkkkk......',
    '....kmmmmk......',
    '....kyyyyk......',
    '....kyyyyk......',
    '....kmmmmk......',
    '....knnnnk......',
    '....knnnnk......',
    '....kmmmmk......',
    '....kkkkkk......',
    '................',
    '................',
    '................',
  ]];

  I.key_rust = [[
    '................',
    '................',
    '....kkkk........',
    '...kuuuuk.......',
    '..kuu..uuk......',
    '..kuu..uuk......',
    '...kuuuuk.......',
    '....kuuk........',
    '....kuuk........',
    '....kuuk........',
    '....kuukk.......',
    '....kuuuuk......',
    '....kuukkk......',
    '....kuuuuk......',
    '.....kkkkk......',
    '................',
  ]];

  I.bandage = [[
    '................',
    '................',
    '....kkkkkk......',
    '..kkxxxxxxkk....',
    '.kxxXXxxxxxxk...',
    '.kxXxxxxkkxxk...',
    '.kxXxxkkxxkxk...',
    '.kxxkkxxxxkxk...',
    '.kxkxxxxxxkxk...',
    '.kxkxxqxxxkxk...',
    '.kxxkxxxxkxxk...',
    '..kkxxxxxxkk....',
    '....kkkkkk......',
    '................',
    '................',
    '................',
  ]];

  I.medkit = [[
    '................',
    '................',
    '..kkkkkkkkkkkk..',
    '.kXXXXXXXXXXXXk.',
    '.kXXXXXrrXXXXXk.',
    '.kXXXXXrrXXXXXk.',
    '.kXXXrrrrrrXXXk.',
    '.kXXXrrrrrrXXXk.',
    '.kXXXXXrrXXXXXk.',
    '.kXXXXXrrXXXXXk.',
    '.kXXXXXXXXXXXXk.',
    '..kkkkkkkkkkkk..',
    '.....kk..kk.....',
    '................',
    '................',
    '................',
  ]];

  I.coin = [
    [
      '................',
      '................',
      '.....kkkkk......',
      '....kOOOOOk.....',
      '...kOyyyyyOk....',
      '..kOyyokoyyOk...',
      '..kOyokkkoyOk...',
      '..kOyokkkoyOk...',
      '..kOyokkkoyOk...',
      '..kOyyokoyyOk...',
      '...kOyyyyyOk....',
      '....kOOOOOk.....',
      '.....kkkkk......',
      '................',
      '................',
      '................',
    ],
    [
      '................',
      '................',
      '......kkk.......',
      '.....kOOOk......',
      '....kOyyyOk.....',
      '....kOyoyOk.....',
      '....kOyoyOk.....',
      '....kOyoyOk.....',
      '....kOyoyOk.....',
      '....kOyoyOk.....',
      '....kOyyyOk.....',
      '.....kOOOk......',
      '......kkk.......',
      '................',
      '................',
      '................',
    ],
    [
      '................',
      '................',
      '.......k........',
      '......kOk.......',
      '......kOk.......',
      '......kOk.......',
      '......kOk.......',
      '......kOk.......',
      '......kOk.......',
      '......kOk.......',
      '......kOk.......',
      '......kOk.......',
      '.......k........',
      '................',
      '................',
      '................',
    ],
    [
      '................',
      '................',
      '......kkk.......',
      '.....kOyOk......',
      '....kOyyyOk.....',
      '....kOoyoOk.....',
      '....kOoyoOk.....',
      '....kOoyoOk.....',
      '....kOoyoOk.....',
      '....kOoyoOk.....',
      '....kOyyyOk.....',
      '.....kOyOk......',
      '......kkk.......',
      '................',
      '................',
      '................',
    ],
  ];

  I.coin_stack = [[
    '................',
    '................',
    '................',
    '....kkkkkk......',
    '...kOyyyyOk.....',
    '...kkkkkkkk.....',
    '..kOyyyyyyOk....',
    '..kkkkkkkkkk....',
    '.kOyyyyyyyyOk...',
    '.kkkkkkkkkkkk...',
    '.kOyyyoyyyyOk...',
    '.kkkkkkkkkkkk...',
    'kOyyyyyyoyyyOk..',
    'kkkkkkkkkkkkkk..',
    '................',
    '................',
  ]];

  I.matches = [[
    '................',
    '................',
    '..kkkkkkkkkk....',
    '.kxXXXXXXXXxk...',
    '.kxkkkkkkkkxk...',
    '.kxkrkrkrkkxk...',
    '.kxkwkwkwkkxk...',
    '.kxkwkwkwkkxk...',
    '.kxkwkwkwkkxk...',
    '.kxkkkkkkkkxk...',
    '.kxxxxxxxxxxk...',
    '.kxeeeeeeeexk...',
    '..kkkkkkkkkk....',
    '................',
    '................',
    '................',
  ]];

  I.note = [[
    '................',
    '...kkkkkkkkk....',
    '..kXXXXXXXXXk...',
    '..kXeeeeeeXXk...',
    '..kXXXXXXXXXk...',
    '..kXeeeeXXXXk...',
    '..kXXXXXXXXXk...',
    '..kXeeeeeeeXk...',
    '..kXXXXXXXXXk...',
    '..kXeeeXXXXXk...',
    '..kXXXXXXqXXk...',
    '..kXeeXXqqXXk...',
    '..kXXXXXXXXXk...',
    '...kkkkkkkkk....',
    '................',
    '................',
  ]];

  I.photo_old = [[
    '................',
    '..kkkkkkkkkkk...',
    '..kXXXXXXXXXk...',
    '..kXkkkkkkkXk...',
    '..kXkeekeekXk...',
    '..kXkeekeekXk...',
    '..kXkkkkkkkXk...',
    '..kXkeeeeekXk...',
    '..kXkekkkekXk...',
    '..kXkeeeeekXk...',
    '..kXkkkkkkkXk...',
    '..kXXXXXXXXXk...',
    '..kXXXeeXXXXk...',
    '..kkkkkkkkkkk...',
    '................',
    '................',
  ]];

  I.rope = [[
    '................',
    '....kkkkkk......',
    '...kuwwuwwk.....',
    '..kwwuwwuwwk....',
    '..kwuk..kuwk....',
    '..kwwk..kwwk....',
    '..kuwk..kuwk....',
    '..kwwk..kwuk....',
    '..kwuk..kwwk....',
    '..kwwuwwuwwk....',
    '...kuwwuwwk.....',
    '....kkkkkk......',
    '.....kwwk.......',
    '.....kuwk.......',
    '......kk........',
    '................',
  ]];

  I.crowbar = [[
    '................',
    '....kkk.........',
    '...kBbbk........',
    '..kBbkbbk.......',
    '..kbk.kbk.......',
    '...k..kbbk......',
    '.......kbbk.....',
    '........kbbk....',
    '.........kbbk...',
    '..........kbbk..',
    '...........kbbk.',
    '...........kbbbk',
    '............kbbk',
    '.............kk.',
    '................',
    '................',
  ]];

  function sprite(name, frames) {
    return PixelArt.validate({ name: `item.${name}`, w: 16, h: 16, palette: PAL, frames });
  }

  const SPRITES = {};
  for (const [name, frames] of Object.entries(I)) SPRITES[name] = sprite(name, frames);

  window.ITEMS = {
    palette: PAL,
    sprites: SPRITES,
    // secuencias de preview
    FLASHLIGHT_SEQ: [{ f: 0 }, { f: 0 }, { f: 1 }, { f: 0 }, { f: 1 }, { f: 0 }],
    COIN_SEQ: [{ f: 0 }, { f: 1 }, { f: 2 }, { f: 3 }],
  };
})();
