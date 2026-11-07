/* 임시 일러스트·아이콘 생성기. 실제 그림 파일이 없을 때만 쓰인다.
   모든 그림은 SVG 문자열 → data URI 로 만들어 <img> 로 쓴다(실제 그림 경로와 같은 방식으로 교체됨). */
(function () {
  'use strict';
  var V = '#050505', O = '#0c0b09', G1 = '#fff3c4', G3 = '#f2d27a', G5 = '#d4a73a', G7 = '#8f6a1c', G9 = '#3d2d0a', SIG = '#e0603a';

  function rng(seed) {
    var a = (seed * 2654435761) >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function uri(svg) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }
  function f(n) { return Math.round(n * 10) / 10; }

  /* ---------- 캐릭터 6종: 실루엣이 모두 다르다 ---------- */
  var FIG_STYLE = '<style>.b{fill:url(#bd);stroke:' + G3 + ';stroke-width:1.6;stroke-linejoin:round}' +
    '.a{fill:' + G7 + ';stroke:' + G5 + ';stroke-width:1.2;stroke-linejoin:round}' +
    '.d{fill:' + G9 + ';stroke:' + G7 + ';stroke-width:1;stroke-linejoin:round}' +
    '.l{fill:none;stroke:' + G5 + ';stroke-width:1.4;stroke-linecap:round}' +
    '.k{fill:#000;stroke:' + G7 + ';stroke-width:1}' +
    '.e{fill:' + G1 + '}</style>' +
    '<defs><linearGradient id="bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241d11"/><stop offset="1" stop-color="#0a0907"/></linearGradient></defs>';

  function figWrap(inner) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">' + FIG_STYLE + inner + '</svg>';
  }
  function poly(cls, pts) { return '<polygon class="' + cls + '" points="' + pts + '"/>'; }
  function mirror(inner) { return '<g transform="translate(400 0) scale(-1 1)">' + inner + '</g>'; }

  var FIGS = [
    /* 1 두건 + 지팡이: 삼각 외투, 얼굴 없는 후드 */
    function () {
      var s = '';
      s += poly('b', '200,30 248,96 264,184 302,338 334,566 66,566 98,338 136,184 152,96');
      s += poly('k', '200,66 230,108 224,152 200,170 176,152 170,108');
      s += poly('e', '182,114 196,120 196,126 182,122') + poly('e', '218,114 204,120 204,126 218,122');
      s += '<path class="l" d="M200 176 L150 548 M200 176 L200 566 M200 176 L250 548"/>';
      s += poly('a', '200,200 224,232 200,264 176,232') + poly('d', '200,214 212,232 200,250 188,232');
      s += poly('b', '262,238 320,282 326,336 292,346 254,300');
      s += '<rect class="b" x="311" y="76" width="9" height="512"/>';
      s += '<circle class="l" cx="315" cy="58" r="26" style="stroke-width:2"/>' + poly('a', '315,40 327,58 315,76 303,58');
      s += '<path class="l" d="M104 540 L130 566 M270 540 L296 566" />';
      return s;
    },
    /* 2 중갑 + 대검: 넓은 견갑, 투구 볏, 땅에 꽂은 대검 */
    function () {
      var s = '';
      s += poly('d', '250,176 342,236 366,424 332,566 282,430');
      s += poly('b', '148,372 204,372 200,584 130,584 138,500') + poly('b', '206,372 264,372 278,500 270,584 204,584');
      s += poly('a', '122,560 204,560 204,590 112,590') + poly('a', '204,560 282,560 292,590 204,590');
      s += poly('b', '132,170 272,170 288,262 264,382 146,382 116,262');
      s += poly('a', '160,186 244,186 254,252 202,292 150,252') + '<path class="l" d="M202 190 V290 M176 220 H228"/>';
      s += poly('a', '80,150 152,138 160,204 100,226 66,198') + poly('a', '250,138 322,150 338,198 304,226 244,204');
      s += poly('d', '80,150 66,198 40,172') + poly('d', '322,150 338,198 366,172');
      s += poly('b', '170,64 234,64 246,122 230,152 174,152 158,122');
      s += poly('k', '172,104 232,104 226,118 178,118') + '<path class="l" d="M202 120 V150"/>';
      s += poly('a', '196,62 208,62 238,24 170,40');
      s += poly('b', '86,204 126,214 122,336 88,346 66,304');
      s += poly('b', '96,26 116,60 116,486 96,594 76,486 76,60');
      s += '<path class="l" d="M96 72 V470"/>';
      s += poly('a', '46,296 146,296 146,314 46,314') + '<circle class="a" cx="96" cy="332" r="17"/>';
      return s;
    },
    /* 3 질주 + 긴 스카프 + 창: 기울어진 자세 */
    function () {
      var s = '';
      s += poly('a', '184,128 40,170 8,252 92,212 154,172');
      s += poly('d', '180,140 64,232 28,336 122,262 172,184');
      s += poly('a', '176,84 118,66 52,108 118,100 166,116');
      s += poly('b', '176,140 240,148 252,252 226,334 168,322 158,232');
      s += '<ellipse class="b" cx="206" cy="104" rx="28" ry="32"/>';
      s += poly('a', '172,92 200,58 248,78 252,132 232,110 200,98');
      s += poly('k', '206,100 236,100 232,112 206,112');
      s += poly('b', '176,152 140,214 118,256 140,266 172,214');
      s += '<path class="l" d="M178 190 L236 200 M170 240 L240 252"/>';
      s += poly('b', '222,324 264,334 304,454 336,580 302,592 262,474 214,382');
      s += poly('b', '168,322 214,342 184,472 134,582 98,572 140,442');
      s += poly('a', '298,570 350,586 344,600 296,596') + poly('a', '92,566 138,578 134,596 88,590');
      s += poly('d', '28,586 40,598 380,26 370,14');
      s += poly('a', '370,14 398,0 386,42');
      s += poly('b', '238,164 332,206 338,222 232,200');
      s += '<circle class="a" cx="302" cy="212" r="12"/>';
      return s;
    },
    /* 4 정비공: 후광 고리, 큰 배낭, 들어 올린 손의 홀로그램 */
    function () {
      var s = '', i;
      s += '<circle class="l" cx="200" cy="132" r="84" style="stroke-width:2"/><circle class="l" cx="200" cy="132" r="70" style="stroke-dasharray:3 7"/>';
      for (i = 0; i < 24; i++) {
        var an = i / 24 * Math.PI * 2, r1 = 84, r2 = i % 3 === 0 ? 98 : 92;
        s += '<path class="l" d="M' + f(200 + Math.cos(an) * r1) + ' ' + f(132 + Math.sin(an) * r1) + ' L' + f(200 + Math.cos(an) * r2) + ' ' + f(132 + Math.sin(an) * r2) + '"/>';
      }
      s += poly('b', '248,188 342,196 350,334 252,334');
      s += '<path class="l" d="M262 206 V324 M286 202 V328 M310 200 V330 M332 200 V332"/>';
      s += '<path class="l" d="M322 196 L344 98"/><circle class="a" cx="345" cy="92" r="9"/>';
      s += poly('b', '150,178 254,178 270,302 140,302');
      s += '<rect class="a" x="140" y="296" width="130" height="18"/>';
      s += poly('a', '172,206 232,206 232,262 172,262') + '<circle class="e" cx="202" cy="234" r="8"/>';
      s += poly('b', '150,314 204,314 200,502 138,502') + poly('b', '206,314 262,314 266,502 208,502');
      s += poly('a', '122,500 204,500 204,568 112,568') + poly('a', '206,500 290,500 298,568 206,568');
      s += '<circle class="b" cx="202" cy="132" r="46"/>';
      s += poly('k', '170,118 234,118 238,144 166,144') + '<path class="l" d="M176 131 H228" style="stroke:' + G1 + '"/>';
      s += poly('b', '152,194 114,172 82,122 104,108 132,148 162,172');
      s += poly('b', '254,196 296,252 276,304 248,262');
      s += poly('a', '70,38 102,90 70,142 38,90') + '<polygon class="l" points="70,58 88,90 70,122 52,90"/>';
      return s;
    },
    /* 5 날개 + 뿔관: 좌우로 펼친 각진 날개 */
    function () {
      var s = '', wing = poly('b', '172,206 36,52 66,148 14,170 78,232 36,296 112,304 70,386 172,336') +
        '<path class="l" d="M172 206 L66 148 M172 230 L78 232 M172 256 L36 296 M172 282 L70 386"/>';
      s += wing + mirror(wing);
      s += poly('b', '174,150 226,150 238,262 274,566 126,566 162,262');
      s += poly('a', '200,168 216,262 202,566 186,262') + '<path class="l" d="M200 566 V270"/>';
      s += '<ellipse class="b" cx="200" cy="108" rx="25" ry="31"/>';
      var horn = poly('a', '180,86 138,42 122,8 152,18 192,64') + poly('d', '176,92 150,70 160,98');
      s += horn + mirror(horn);
      s += poly('a', '176,80 184,60 192,78 200,54 208,78 216,60 224,80');
      s += poly('k', '188,106 198,110 198,115 188,112') + poly('k', '212,106 202,110 202,115 212,112');
      s += poly('a', '200,286 220,310 200,334 180,310') + '<path class="l" d="M162 262 L200 296 L238 262"/>';
      return s;
    },
    /* 6 가면 쌍검: 웅크린 비대칭 자세, 교차한 두 칼날 */
    function () {
      var s = '';
      s += poly('d', '170,122 98,76 36,102 110,134');
      s += poly('b', '158,208 250,214 274,326 204,366 148,304');
      s += poly('b', '204,354 284,372 306,474 274,486 252,402 190,386');
      s += poly('b', '158,338 118,432 140,522 100,582 152,584 184,522 204,430');
      s += poly('a', '262,470 322,492 316,510 262,500');
      s += '<circle class="b" cx="202" cy="152" r="36"/>';
      s += poly('a', '168,150 236,150 230,178 202,190 174,178') + poly('k', '180,138 198,142 198,150 180,148') + poly('k', '224,138 206,142 206,150 224,148');
      s += poly('a', '174,134 202,108 232,134 202,124');
      s += poly('b', '168,216 216,296 196,314 150,238');
      s += poly('b', '246,222 220,298 236,308 270,246');
      s += '<path class="b" d="M58 424 Q204 314 346 116 L358 128 Q224 336 74 444 Z"/>';
      s += '<path class="b" d="M344 444 Q204 350 74 148 L88 138 Q222 326 358 428 Z"/>';
      s += '<path class="l" d="M72 428 Q210 330 346 124 M346 434 Q210 346 84 144"/>';
      s += poly('a', '194,282 216,292 210,318 190,306');
      return s;
    }
  ];

  function figureURI(n) { return uri(figWrap(FIGS[(n - 1) % FIGS.length]())); }

  /* ---------- 엠블럼(캐릭터별 아이콘) 48x48 ---------- */
  function gearPath() {
    var d = '', i, n = 8, a, r1 = 11, r2 = 16;
    for (i = 0; i < n; i++) {
      a = i / n * Math.PI * 2;
      var w = 0.16;
      d += (i ? 'L' : 'M') + f(24 + Math.cos(a - w) * r1) + ' ' + f(24 + Math.sin(a - w) * r1) +
        'L' + f(24 + Math.cos(a - w * .6) * r2) + ' ' + f(24 + Math.sin(a - w * .6) * r2) +
        'L' + f(24 + Math.cos(a + w * .6) * r2) + ' ' + f(24 + Math.sin(a + w * .6) * r2) +
        'L' + f(24 + Math.cos(a + w) * r1) + ' ' + f(24 + Math.sin(a + w) * r1);
    }
    return d + 'Z M24 19.5 A4.5 4.5 0 1 0 24.01 19.5Z';
  }
  var EMBLEM = [
    gearPath(),
    'M6 24 Q24 9 42 24 Q24 39 6 24Z M24 18.5 A5.5 5.5 0 1 0 24.01 18.5Z M24 4 V9 M24 39 V44',
    'M24 6 C30 15 37 20 35 30 C34 37 29 41 24 41 C18 41 13 37 13 30 C13 24 19 22 19 16 C21 18 23 17 24 6Z M24 41 C20 38 20 33 24 29 C28 33 28 38 24 41Z',
    'M24 36 L7 14 L11 28 L5 30 L17 40Z M24 36 L41 14 L37 28 L43 30 L31 40Z M24 14 V36',
    'M24 5 L30 28 L24 35 L18 28Z M15 35 H33 M24 35 V44 M24 11 V28',
    'M10 12 Q8 28 24 38 Q40 28 38 12 Q31 23 24 23 Q17 23 10 12Z M24 23 V42 M17 42 H31'
  ];
  var BRACKET = 'M3 13 V3 H13 M35 3 H45 V13 M45 35 V45 H35 M13 45 H3 V35';
  function emblem(n, cls) {
    return '<svg class="' + (cls || 'emblem') + '" viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">' +
      '<path d="' + BRACKET + '" stroke-width="1.2" opacity=".7"/><path d="' + EMBLEM[(n - 1) % EMBLEM.length] + '" pathLength="1"/></svg>';
  }

  /* ---------- UI 아이콘 24x24 ---------- */
  var ICON = {
    char: 'M12 2.5 L19.5 7.5 V16.5 L12 21.5 L4.5 16.5 V7.5Z M12 8.5 A2.6 2.6 0 1 0 12.01 8.5Z M7.5 17 Q12 12.5 16.5 17',
    art: 'M3 5 H21 V19 H3Z M3 16 L9 10 L14 15 L17 12 L21 16 M16.5 7.5 A1.5 1.5 0 1 0 16.51 7.5Z',
    note: 'M4 4 H20 V20 H4Z M8 9 H16 M8 13 H16 M8 16.5 H12',
    id: 'M3 5 H21 V19 H3Z M8 12 A2 2 0 1 0 8.01 12Z M5.5 16.5 Q8 13.5 10.5 16.5 M14 9.5 H18.5 M14 13 H18.5 M14 16 H17',
    home: 'M3 11.5 L12 3.5 L21 11.5 M5.5 10 V20.5 H18.5 V10 M10 20.5 V14 H14 V20.5',
    prev: 'M15 4.5 L7.5 12 L15 19.5',
    next: 'M9 4.5 L16.5 12 L9 19.5',
    arrow: 'M4 12 H19 M13 6 L19 12 L13 18',
    close: 'M5 5 L19 19 M19 5 L5 19',
    grid: 'M4 4 H10 V10 H4Z M14 4 H20 V10 H14Z M4 14 H10 V20 H4Z M14 14 H20 V20 H14Z',
    expand: 'M4 9 V4 H9 M15 4 H20 V9 M20 15 V20 H15 M9 20 H4 V15'
  };
  function icon(name, cls) {
    return '<svg class="' + (cls || 'ico') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="miter" stroke-linecap="square"><path d="' + (ICON[name] || ICON.char) + '" pathLength="1"/></svg>';
  }

  /* 브랜드 인장(금색 기하 문양) */
  function seal(cls) {
    return '<svg class="' + (cls || 'seal') + '" viewBox="0 0 32 32" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="miter">' +
      '<path d="M16 1.5 L30.5 16 L16 30.5 L1.5 16Z"/><path d="M16 8 L24 16 L16 24 L8 16Z"/><path d="M16 12.5 L19.5 16 L16 19.5 L12.5 16Z" fill="currentColor"/><path d="M1.5 16 H8 M24 16 H30.5" /></svg>';
  }

  /* 갤러리 메인 장식(참고 9번의 기하 문양을 코드로 다시 그림) */
  function sigil() {
    var s = '<svg class="sigil" viewBox="0 0 800 800" aria-hidden="true" focusable="false" fill="none" stroke="' + G5 + '">', i;
    s += '<g stroke-width="1" opacity=".5"><circle cx="400" cy="400" r="372"/><circle cx="400" cy="400" r="288"/><circle cx="400" cy="400" r="196"/></g>';
    s += '<g class="sg-spin" stroke-width="1.4" opacity=".7">';
    for (i = 0; i < 72; i++) {
      var an = i / 72 * Math.PI * 2, r2 = i % 6 === 0 ? 352 : 362;
      s += '<path d="M' + f(400 + Math.cos(an) * 372) + ' ' + f(400 + Math.sin(an) * 372) + 'L' + f(400 + Math.cos(an) * r2) + ' ' + f(400 + Math.sin(an) * r2) + '"/>';
    }
    s += '</g>';
    s += '<path class="sg-draw" pathLength="1" d="M400 36 L744 400 L400 764 L56 400Z" stroke-width="1.6" opacity=".85"/><path class="sg-draw" pathLength="1" style="--d:.15s" d="M400 116 L664 400 L400 684 L136 400Z" stroke-width="1" opacity=".5"/>';
    s += '<path class="sg-draw" pathLength="1" style="--d:.3s" d="M400 0 V800 M0 400 H800" stroke-width="1" opacity=".22"/>';
    s += '<path class="sg-draw" pathLength="1" style="--d:.45s" d="M30 424 L250 424 L292 378 M770 424 L550 424 L508 378" stroke-width="3" stroke="' + G3 + '"/>';
    s += '<path d="M120 400 L196 400 M604 400 L680 400" stroke-width="1" stroke="' + G3 + '" opacity=".6"/>';
    s += '<path d="M400 36 V74 M400 726 V764" stroke-width="3" stroke="' + G3 + '"/>';
    s += '</svg>';
    return s;
  }

  /* ---------- 컨셉아트 15장: 서로 다른 구도(가로 800x450 기준, 슬라이스로 잘라 씀) ---------- */
  var W = 800, H = 450;
  function wrapC(defs, body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice"><defs>' + defs + '</defs>' + body + '</svg>';
  }
  function lg(id, a, b, vert) {
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (vert === false ? 1 : 0) + '" y2="' + (vert === false ? 0 : 1) + '"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient>';
  }
  function bgR(a, b) { return '<rect width="' + W + '" height="' + H + '" fill="url(#bg)"/>'; }
  function ridge(r, y0, amp, step, fill, op) {
    var d = 'M0 ' + H + ' L0 ' + y0, x;
    for (x = 0; x <= W + step; x += step) d += ' L' + x + ' ' + f(y0 - r() * amp);
    return '<path d="' + d + ' L' + W + ' ' + H + 'Z" fill="' + fill + '" opacity="' + (op || 1) + '"/>';
  }

  var CONCEPT = [
    /* 1 수평선 위의 해 */
    function (r) {
      var s = bgR() + '<circle cx="400" cy="250" r="112" fill="' + G3 + '"/>', i;
      for (i = 0; i < 7; i++) s += '<rect x="270" y="' + (252 + i * 15) + '" width="260" height="' + (3 + i * 2) + '" fill="#120e07"/>';
      for (i = 0; i < 4; i++) {
        var y0 = 312 + i * 30, d = 'M0 450 L0 ' + y0, x;
        for (x = 0; x <= 840; x += 40) d += ' L' + x + ' ' + f(y0 + Math.sin(x / 110 + i * 2.1) * 16 - r() * 8);
        s += '<path d="' + d + ' L800 450Z" fill="' + ['#2a1f08', '#1d1608', '#120e07', V][i] + '"/>';
      }
      return wrapC(lg('bg', O, G7), s);
    },
    /* 2 기하 모노리스 */
    function (r) {
      var s = bgR(), i;
      s += '<g fill="none" stroke="' + G5 + '">';
      for (i = 1; i <= 5; i++) s += '<circle cx="400" cy="225" r="' + (i * 46) + '" stroke-width="1" opacity="' + f(.7 - i * .1) + '"/>';
      s += '<path d="M400 20 L600 225 L400 430 L200 225Z" stroke-width="1.6"/><path d="M400 70 L550 225 L400 380 L250 225Z" stroke-width="1" opacity=".6"/>';
      s += '<path d="M0 225 H800 M400 0 V450" stroke-width="1" opacity=".25"/>';
      s += '<path d="M60 250 L240 250 L274 214 M740 250 L560 250 L526 214" stroke-width="3" stroke="' + G3 + '"/></g>';
      s += '<polygon points="378,150 422,150 422,300 378,300" fill="' + V + '" stroke="' + G3 + '" stroke-width="1.4"/><rect x="386" y="160" width="4" height="60" fill="' + G3 + '"/>';
      return wrapC(lg('bg', V, G9), s);
    },
    /* 3 비 내리는 도시 */
    function (r) {
      var s = bgR(), i, x = -10;
      while (x < W) {
        var w = 24 + r() * 44, h = 120 + r() * 230;
        s += '<rect x="' + f(x) + '" y="' + f(H - h) + '" width="' + f(w) + '" height="' + f(h) + '" fill="' + (r() > .5 ? '#14110a' : '#0a0906') + '" stroke="' + G9 + '"/>';
        for (i = 0; i < w * h / 700; i++) if (r() > .45) s += '<rect x="' + f(x + 4 + r() * (w - 10)) + '" y="' + f(H - h + 8 + r() * (h - 20)) + '" width="3" height="3" fill="' + (r() > .85 ? SIG : G3) + '" opacity="' + f(.35 + r() * .6) + '"/>';
        x += w + 3 + r() * 8;
      }
      s += '<rect x="520" y="110" width="110" height="46" fill="' + G5 + '"/><rect x="528" y="118" width="94" height="30" fill="' + V + '"/><rect x="536" y="130" width="56" height="5" fill="' + G3 + '"/>';
      for (i = 0; i < 46; i++) { var rx = r() * W, ry = r() * H; s += '<path d="M' + f(rx) + ' ' + f(ry) + ' l-8 26" stroke="' + G7 + '" stroke-width="1" opacity=".5"/>'; }
      s += '<rect y="380" width="800" height="70" fill="url(#fog)"/>';
      return wrapC(lg('bg', V, '#2a1f08') + lg('fog', 'rgba(61,45,10,0)', 'rgba(143,106,28,.5)'), s);
    },
    /* 4 아치 폐허 */
    function (r) {
      var s = bgR(), i;
      for (i = 0; i < 6; i++) {
        var sc = 1 - i * .13, w = 150 * sc, cx = 400 + (i % 2 ? 1 : -1) * i * 12, top = 330 - 220 * sc, bot = 380 - i * 8;
        s += '<path d="M' + f(cx - w) + ' ' + bot + ' V' + f(top + w) + ' A' + f(w) + ' ' + f(w) + ' 0 0 1 ' + f(cx + w) + ' ' + f(top + w) + ' V' + bot + ' H' + f(cx + w - 22 * sc) + ' V' + f(top + w) + ' A' + f(w - 22 * sc) + ' ' + f(w - 22 * sc) + ' 0 0 0 ' + f(cx - w + 22 * sc) + ' ' + f(top + w) + ' V' + bot + 'Z" fill="' + [G9, '#2f2308', '#241a07', '#1a1305', '#120d04', '#0b0803'][i] + '" stroke="' + G7 + '" stroke-width="1"/>';
        s += '<rect y="' + (bot - 14) + '" width="800" height="' + (20 + i * 4) + '" fill="' + G5 + '" opacity="' + f(.06 + i * .02) + '"/>';
      }
      s += '<circle cx="400" cy="150" r="14" fill="' + G1 + '"/>';
      s += '<rect y="380" width="800" height="70" fill="' + V + '"/><path d="M0 380 H800" stroke="' + G7 + '"/>';
      return wrapC(lg('bg', '#1a1305', G7), s);
    },
    /* 5 회로 */
    function (r) {
      var s = bgR(), i, j;
      s += '<g stroke="' + G9 + '" stroke-width="1">';
      for (i = 0; i <= 20; i++) s += '<path d="M' + (i * 40) + ' 0 V450"/>';
      for (j = 0; j <= 12; j++) s += '<path d="M0 ' + (j * 40) + ' H800"/>';
      s += '</g>';
      for (i = 0; i < 18; i++) {
        var x = Math.round(r() * 20) * 40, y = Math.round(r() * 11) * 40, d = 'M' + x + ' ' + y, k;
        for (k = 0; k < 3; k++) { x += (r() > .5 ? 1 : -1) * (1 + Math.floor(r() * 3)) * 40; d += ' H' + x; y += (r() > .5 ? 1 : -1) * 40 * (1 + Math.floor(r() * 2)); d += ' V' + y; }
        s += '<path d="' + d + '" fill="none" stroke="' + G5 + '" stroke-width="1.6" opacity="' + f(.4 + r() * .5) + '"/><circle cx="' + x + '" cy="' + y + '" r="5" fill="' + V + '" stroke="' + G3 + '" stroke-width="1.6"/>';
      }
      s += '<rect x="320" y="145" width="160" height="160" fill="' + V + '" stroke="' + G3 + '" stroke-width="2"/><rect x="344" y="169" width="112" height="112" fill="none" stroke="' + G7 + '"/><circle cx="400" cy="225" r="22" fill="' + G5 + '"/><circle cx="400" cy="225" r="8" fill="' + V + '"/>';
      for (i = 0; i < 8; i++) s += '<rect x="' + (332 + i * 18) + '" y="136" width="8" height="9" fill="' + G3 + '"/><rect x="' + (332 + i * 18) + '" y="305" width="8" height="9" fill="' + G3 + '"/>';
      return wrapC(lg('bg', V, O), s);
    },
    /* 6 능선과 달 */
    function (r) {
      var s = bgR(), i;
      for (i = 0; i < 60; i++) s += '<circle cx="' + f(r() * W) + '" cy="' + f(r() * 220) + '" r="' + f(.6 + r() * 1.2) + '" fill="' + G1 + '" opacity="' + f(.3 + r() * .6) + '"/>';
      s += '<circle cx="560" cy="130" r="58" fill="' + G3 + '"/><circle cx="582" cy="118" r="52" fill="url(#bg)"/>';
      var cols = ['#3d2d0a', '#2e2208', '#211906', '#150f04', '#0a0703'];
      for (i = 0; i < 5; i++) s += ridge(r, 250 + i * 42, 70 - i * 6, 28, cols[i], 1);
      return wrapC(lg('bg', V, '#2a1f08'), s);
    },
    /* 7 궤도 */
    function (r) {
      var s = bgR(), i;
      s += '<g fill="none" stroke="' + G5 + '">';
      for (i = 1; i <= 6; i++) s += '<ellipse cx="400" cy="225" rx="' + (i * 62) + '" ry="' + (i * 24) + '" transform="rotate(' + (i * 9 - 24) + ' 400 225)" stroke-width="' + (i === 3 ? 1.8 : 1) + '" opacity="' + f(.8 - i * .09) + '"/>';
      s += '</g>';
      for (i = 0; i < 6; i++) { var a = r() * 6.28, rx = (i + 1) * 62, ry = (i + 1) * 24, rot = ((i + 1) * 9 - 24) * Math.PI / 180, ex = Math.cos(a) * rx, ey = Math.sin(a) * ry; s += '<circle cx="' + f(400 + ex * Math.cos(rot) - ey * Math.sin(rot)) + '" cy="' + f(225 + ex * Math.sin(rot) + ey * Math.cos(rot)) + '" r="' + f(3 + r() * 5) + '" fill="' + (i === 4 ? SIG : G3) + '"/>'; }
      s += '<circle cx="400" cy="225" r="34" fill="' + G3 + '"/><circle cx="400" cy="225" r="46" fill="none" stroke="' + G1 + '" stroke-width="1"/>';
      return wrapC(lg('bg', V, G9), s);
    },
    /* 8 일점 투시 복도 */
    function (r) {
      var s = bgR(), i, cx = 400, cy = 210;
      for (i = 0; i < 14; i++) {
        var k = Math.pow(.78, i), w = 470 * k, h = 330 * k;
        s += '<rect x="' + f(cx - w / 2) + '" y="' + f(cy - h / 2) + '" width="' + f(w) + '" height="' + f(h) + '" fill="none" stroke="' + (i % 4 === 0 ? G3 : G7) + '" stroke-width="' + f(Math.max(.6, 2.2 * k)) + '" opacity="' + f(.35 + (13 - i) * .04) + '"/>';
      }
      for (i = 0; i < 12; i++) { var a = i / 12 * 6.283; s += '<path d="M' + cx + ' ' + cy + ' L' + f(cx + Math.cos(a) * 700) + ' ' + f(cy + Math.sin(a) * 500) + '" stroke="' + G9 + '" stroke-width="1"/>'; }
      s += '<rect x="388" y="196" width="24" height="30" fill="' + G1 + '"/><rect x="0" y="0" width="800" height="450" fill="url(#vg)"/>';
      return wrapC(lg('bg', V, V) + '<radialGradient id="vg" cx=".5" cy=".47" r=".6"><stop offset=".3" stop-color="rgba(5,5,5,0)"/><stop offset="1" stop-color="rgba(5,5,5,.9)"/></radialGradient>', s);
    },
    /* 9 기둥 숲과 빛줄기 */
    function (r) {
      var s = bgR(), i;
      for (i = 0; i < 5; i++) s += '<polygon points="' + f(160 + i * 130) + ',0 ' + f(190 + i * 130) + ',0 ' + f(260 + i * 130 - 80) + ',450 ' + f(150 + i * 130 - 80) + ',450" fill="' + G3 + '" opacity="' + f(.05 + r() * .06) + '"/>';
      var x = -20;
      while (x < W + 20) {
        var w = 18 + r() * 38, d = r();
        s += '<polygon points="' + f(x) + ',450 ' + f(x + w * .22) + ',0 ' + f(x + w * .78) + ',0 ' + f(x + w) + ',450" fill="' + (d > .6 ? '#241a07' : d > .3 ? '#150f04' : '#0a0703') + '" stroke="' + G9 + '"/>';
        x += w * (.6 + r() * .9);
      }
      for (i = 0; i < 50; i++) s += '<circle cx="' + f(r() * W) + '" cy="' + f(r() * H) + '" r="' + f(.8 + r() * 1.6) + '" fill="' + G3 + '" opacity="' + f(.2 + r() * .6) + '"/>';
      return wrapC(lg('bg', '#2a1f08', V), s);
    },
    /* 10 등고선 */
    function (r) {
      var s = bgR(), i, x;
      s += '<circle cx="560" cy="120" r="70" fill="' + G5 + '" opacity=".85"/>';
      for (i = 0; i < 26; i++) {
        var y = 110 + i * 14, d = 'M0 ' + y;
        for (x = 0; x <= 820; x += 20) d += ' L' + x + ' ' + f(y + Math.sin(x / 90 + i * .35) * (10 + i * .9) + Math.sin(x / 37 + i) * 3);
        s += '<path d="' + d + ' L800 450 L0 450Z" fill="' + (i % 2 ? '#120e07' : V) + '" stroke="' + (i % 5 === 0 ? G3 : G7) + '" stroke-width="' + (i % 5 === 0 ? 1.6 : .8) + '"/>';
      }
      return wrapC(lg('bg', O, G7), s);
    },
    /* 11 광륜 문 */
    function (r) {
      var s = bgR(), i;
      for (i = 0; i < 36; i++) { var a = i / 36 * 6.283; s += '<path d="M400 250 L' + f(400 + Math.cos(a) * 640) + ' ' + f(250 + Math.sin(a) * 640) + '" stroke="' + G3 + '" stroke-width="' + (i % 3 ? 1 : 2.4) + '" opacity="' + (i % 3 ? .14 : .28) + '"/>'; }
      s += '<path d="M250 450 V230 A150 150 0 0 1 550 230 V450 H500 V230 A100 100 0 0 0 300 230 V450Z" fill="' + V + '" stroke="' + G3 + '" stroke-width="2"/>';
      s += '<path d="M300 450 V230 A100 100 0 0 1 500 230 V450Z" fill="' + G1 + '" opacity=".9"/>';
      for (i = 0; i < 6; i++) s += '<rect x="' + (330 + i * 3) + '" y="' + (440 - i * 12) + '" width="' + (140 - i * 6) + '" height="12" fill="' + (i % 2 ? G9 : V) + '" stroke="' + G7 + '"/>';
      s += '<polygon points="400,196 420,262 380,262" fill="' + V + '"/>';
      return wrapC(lg('bg', O, G9), s);
    },
    /* 12 성좌 */
    function (r) {
      var s = bgR(), pts = [], i, j;
      for (i = 0; i < 20; i++) pts.push([60 + r() * 680, 40 + r() * 370]);
      for (i = 0; i < pts.length; i++) {
        var best = [];
        for (j = 0; j < pts.length; j++) if (i !== j) best.push([Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]), j]);
        best.sort(function (a, b) { return a[0] - b[0]; });
        for (j = 0; j < 2; j++) s += '<path d="M' + f(pts[i][0]) + ' ' + f(pts[i][1]) + ' L' + f(pts[best[j][1]][0]) + ' ' + f(pts[best[j][1]][1]) + '" stroke="' + G7 + '" stroke-width="1" opacity=".7"/>';
      }
      for (i = 0; i < pts.length; i++) s += '<circle cx="' + f(pts[i][0]) + '" cy="' + f(pts[i][1]) + '" r="' + f(2 + r() * 4) + '" fill="' + (i === 3 ? SIG : G3) + '"/>';
      s += '<g transform="translate(' + f(pts[0][0]) + ' ' + f(pts[0][1]) + ')"><path d="M0 -34 L5 -5 L34 0 L5 5 L0 34 L-5 5 L-34 0 L-5 -5Z" fill="' + G1 + '"/></g>';
      for (i = 0; i < 70; i++) s += '<circle cx="' + f(r() * W) + '" cy="' + f(r() * H) + '" r=".8" fill="' + G1 + '" opacity="' + f(.2 + r() * .5) + '"/>';
      return wrapC(lg('bg', V, '#1a1305'), s);
    },
    /* 13 첨탑 */
    function (r) {
      var s = bgR(), i;
      for (i = 0; i < 5; i++) s += '<rect y="' + (110 + i * 54) + '" width="800" height="' + (10 + i * 5) + '" fill="' + G5 + '" opacity="' + f(.05 + i * .02) + '"/>';
      s += '<polygon points="400,20 428,430 372,430" fill="' + V + '" stroke="' + G3 + '" stroke-width="1.6"/>';
      for (i = 0; i < 12; i++) { var y = 60 + i * 32, w = 6 + i * 2.2; s += '<path d="M' + f(400 - w) + ' ' + y + ' L' + f(400 + w) + ' ' + (y + 32) + ' M' + f(400 + w) + ' ' + y + ' L' + f(400 - w) + ' ' + (y + 32) + ' M' + f(400 - w) + ' ' + y + ' H' + f(400 + w) + '" stroke="' + G7 + '" stroke-width="1"/>'; }
      s += '<circle cx="400" cy="20" r="9" fill="' + SIG + '"/><circle cx="400" cy="20" r="22" fill="none" stroke="' + SIG + '" opacity=".5"/>';
      s += '<path d="M0 430 H800 V450 H0Z" fill="' + V + '"/>';
      for (i = 0; i < 14; i++) { var bx = r() * 780, bw = 14 + r() * 30, bh = 30 + r() * 80; s += '<rect x="' + f(bx) + '" y="' + f(430 - bh) + '" width="' + f(bw) + '" height="' + f(bh) + '" fill="#120e07" stroke="' + G9 + '"/>'; }
      return wrapC(lg('bg', '#3d2d0a', V), s);
    },
    /* 14 파편 */
    function (r) {
      var s = bgR(), i;
      for (i = 0; i < 46; i++) {
        var a = r() * 6.283, d = 30 + r() * 360, cx = 400 + Math.cos(a) * d * 1.5, cy = 225 + Math.sin(a) * d * .75, sz = 10 + r() * 56, a2 = a + (r() - .5) * 1.4;
        s += '<polygon points="' + f(cx) + ',' + f(cy) + ' ' + f(cx + Math.cos(a2) * sz) + ',' + f(cy + Math.sin(a2) * sz) + ' ' + f(cx + Math.cos(a2 + 2.1) * sz * .6) + ',' + f(cy + Math.sin(a2 + 2.1) * sz * .6) + '" fill="' + (r() > .8 ? G3 : r() > .5 ? G7 : G9) + '" stroke="' + G5 + '" stroke-width=".8" opacity="' + f(.5 + r() * .5) + '"/>';
      }
      s += '<circle cx="400" cy="225" r="26" fill="' + V + '" stroke="' + G1 + '" stroke-width="2"/><circle cx="400" cy="225" r="8" fill="' + G1 + '"/>';
      return wrapC(lg('bg', V, G9), s);
    },
    /* 15 인장 */
    function (r) {
      var s = bgR(), i;
      s += '<g fill="none" stroke="' + G5 + '">';
      for (i = 0; i < 14; i++) { var z = 190 - i * 12; s += '<rect x="' + (400 - z) + '" y="' + (225 - z) + '" width="' + (z * 2) + '" height="' + (z * 2) + '" transform="rotate(' + (i * 6.4) + ' 400 225)" stroke-width="' + (i % 4 === 0 ? 1.8 : .9) + '" opacity="' + f(.9 - i * .05) + '"/>'; }
      s += '<circle cx="400" cy="225" r="80" stroke-width="1.4"/><circle cx="400" cy="225" r="56" stroke-width="1" stroke-dasharray="2 6"/></g>';
      s += '<path d="M330 225 Q400 170 470 225 Q400 280 330 225Z" fill="' + V + '" stroke="' + G3 + '" stroke-width="2"/><circle cx="400" cy="225" r="20" fill="' + G3 + '"/><circle cx="400" cy="225" r="8" fill="' + V + '"/>';
      return wrapC(lg('bg', O, '#2a1f08'), s);
    }
  ];

  function conceptURI(n) { return uri(CONCEPT[(n - 1) % CONCEPT.length](rng(n * 97 + 13))); }

  window.RC_ART = { figureURI: figureURI, conceptURI: conceptURI, emblem: emblem, icon: icon, seal: seal, sigil: sigil };
})();
