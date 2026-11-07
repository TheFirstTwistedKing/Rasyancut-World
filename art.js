/* 임시 일러스트 생성기
   실제 그림 파일이 없을 때 금색 신성 기하학으로 캐릭터·컨셉아트 자리를 채운다.
   data.js 의 img 에 경로를 넣으면 이 파일의 그림 대신 실제 그림이 나온다. */
(function () {
  'use strict';
  let uid = 0;
  const G = { 100: '#fff3c4', 300: '#f2d27a', 500: '#d4a73a', 700: '#8f6a1c', 900: '#3d2d0a' };

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const f = (n) => Math.round(n * 10) / 10;

  function defs(id) {
    return `<defs>
      <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${G[700]}"/><stop offset=".42" stop-color="${G[300]}"/>
        <stop offset=".52" stop-color="${G[100]}"/><stop offset="1" stop-color="${G[500]}"/>
      </linearGradient>
      <radialGradient id="${id}r" cx=".5" cy=".42" r=".75">
        <stop offset="0" stop-color="#2b2110"/><stop offset=".55" stop-color="#0d0b08"/><stop offset="1" stop-color="#050505"/>
      </radialGradient>
      <linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#050505" stop-opacity="0"/><stop offset="1" stop-color="#050505" stop-opacity=".92"/>
      </linearGradient>
      <filter id="${id}b" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7"/></filter>
    </defs>`;
  }

  function shards(r, n, W, H, id) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = r() * W, y = r() * H, l = 6 + r() * 26, a = -0.6 + r() * 0.3;
      const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l;
      s += `<path d="M${f(x)} ${f(y)} L${f(x2)} ${f(y2)} L${f(x + l * 0.2)} ${f(y + l * 0.25)}Z" fill="url(#${id}g)" opacity="${f(0.12 + r() * 0.45)}"/>`;
    }
    return s;
  }

  function sigil(id, cx, cy, R) {
    let s = '<g class="spin">';
    [0.52, 0.74, 1].forEach((k, i) => {
      s += `<circle cx="${cx}" cy="${cy}" r="${f(R * k)}" fill="none" stroke="url(#${id}g)" stroke-width="${i === 2 ? 1.2 : 0.8}" opacity="${0.28 + i * 0.1}" ${i === 1 ? 'stroke-dasharray="2 9"' : ''}/>`;
    });
    for (let k = 0; k < 60; k++) {
      const a = (k * Math.PI) / 30, l = k % 5 === 0 ? 14 : 6;
      s += `<line x1="${f(cx + Math.cos(a) * R)}" y1="${f(cy + Math.sin(a) * R)}" x2="${f(cx + Math.cos(a) * (R + l))}" y2="${f(cy + Math.sin(a) * (R + l))}" stroke="${G[500]}" stroke-width=".8" opacity=".5"/>`;
    }
    s += '</g>';
    const d = R * 0.74;
    s += `<path d="M${cx} ${f(cy - d)} L${f(cx + d)} ${cy} L${cx} ${f(cy + d)} L${f(cx - d)} ${cy}Z" fill="none" stroke="${G[700]}" stroke-width=".9" opacity=".6"/>`;
    return s;
  }

  const BODY = 'M30 600 C34 520 84 468 148 452 L168 428 H232 L252 452 C316 468 366 520 370 600 Z';

  /* 캐릭터 상반신 실루엣 (임시) */
  function char(seed) {
    const id = 'h' + ++uid, r = rng(seed * 131 + 7), v = seed % 3;
    let head = '', detail = '';
    if (v === 0) { // 후드
      head = '<path d="M138 452 C118 340 148 262 200 252 C252 262 282 340 262 452 C240 440 160 440 138 452Z"/>';
      detail = `<ellipse cx="200" cy="362" rx="32" ry="46" fill="#000" stroke="${G[900]}"/>
        <path d="M184 358 l10 3 M216 358 l-10 3" stroke="${G[100]}" stroke-width="2.4" stroke-linecap="round"/>`;
    } else if (v === 1) { // 뿔
      head = `<ellipse cx="200" cy="352" rx="44" ry="58"/>
        <path d="M156 342 C150 282 250 282 244 342 C230 312 170 312 156 342Z"/>
        <path d="M164 306 C130 280 120 230 140 196 C146 240 164 262 182 290Z"/>
        <path d="M236 306 C270 280 280 230 260 196 C254 240 236 262 218 290Z"/>`;
      detail = `<path d="M180 356 l12 2 M220 356 l-12 2" stroke="${G[100]}" stroke-width="2.4" stroke-linecap="round"/>`;
    } else { // 투구
      head = `<path d="M154 442 V342 C154 288 246 288 246 342 V442Z"/>
        <path d="M200 290 L188 226 L214 226Z"/>
        <path d="M154 342 L128 312 L150 392Z M246 342 L272 312 L250 392Z"/>`;
      detail = `<path d="M162 354 H238" stroke="${G[100]}" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M200 290 V440" stroke="${G[900]}" stroke-width="1"/>`;
    }
    const shape = `<path d="${BODY}"/>${head}`;
    const sh = r() * 40;
    return `<svg class="art" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="캐릭터 일러스트 자리 ${seed}">
      ${defs(id)}
      <rect width="400" height="600" fill="url(#${id}r)"/>
      ${sigil(id, 200, 270, 150 + sh * 0.3)}
      ${shards(r, 34, 400, 600, id)}
      <g filter="url(#${id}b)" opacity=".6" fill="none" stroke="url(#${id}g)" stroke-width="5">${shape}</g>
      <g fill="#070605" stroke="url(#${id}g)" stroke-width="2" stroke-linejoin="round">${shape}</g>
      ${detail}
      <path d="M92 520 C130 480 170 470 200 470 C230 470 270 480 308 520" fill="none" stroke="${G[700]}" stroke-width="1" opacity=".7"/>
      <rect y="380" width="400" height="220" fill="url(#${id}f)"/>
    </svg>`;
  }

  /* 컨셉아트 (임시) — 가로 16:9 */
  function concept(i) {
    const id = 'c' + ++uid, r = rng(i * 977 + 13), cx = 320, cy = 180, v = i % 5;
    let s = '';
    if (v === 0) { // 동심원 태양
      s += '<g class="spin">';
      for (let k = 1; k <= 11; k++) s += `<circle cx="${cx}" cy="${cy}" r="${k * 30}" fill="none" stroke="url(#${id}g)" stroke-width="${k % 4 === 0 ? 1.6 : 0.7}" opacity="${f(0.14 + (k % 3) * 0.12)}" ${k % 5 === 0 ? 'stroke-dasharray="3 7"' : ''}/>`;
      for (let k = 0; k < 36; k++) {
        const a = (k * Math.PI) / 18, l = k % 3 ? 150 : 330;
        s += `<line x1="${f(cx + Math.cos(a) * 40)}" y1="${f(cy + Math.sin(a) * 40)}" x2="${f(cx + Math.cos(a) * l)}" y2="${f(cy + Math.sin(a) * l)}" stroke="${G[500]}" stroke-width=".5" opacity=".35"/>`;
      }
      s += `</g><circle cx="${cx}" cy="${cy}" r="46" fill="url(#${id}g)" filter="url(#${id}b)" opacity=".7"/><circle cx="${cx}" cy="${cy}" r="20" fill="${G[100]}"/>`;
    } else if (v === 1) { // 마름모 격자와 눈
      for (let k = 1; k <= 8; k++) {
        const d = k * 28;
        s += `<path d="M${cx} ${cy - d} L${cx + d * 1.6} ${cy} L${cx} ${cy + d} L${cx - d * 1.6} ${cy}Z" fill="none" stroke="url(#${id}g)" stroke-width="${k % 3 ? 0.7 : 1.4}" opacity="${f(0.18 + k * 0.05)}"/>`;
      }
      s += `<path d="M200 180 Q320 90 440 180 Q320 270 200 180Z" fill="#070605" stroke="url(#${id}g)" stroke-width="1.8"/>
        <circle cx="${cx}" cy="${cy}" r="30" fill="none" stroke="${G[300]}" stroke-width="1.4"/>
        <circle cx="${cx}" cy="${cy}" r="10" fill="${G[100]}"/>
        <path d="M0 180 H200 M440 180 H640" stroke="${G[500]}" stroke-width=".8" opacity=".6"/>`;
    } else if (v === 2) { // 지평선 · 폐허
      s += `<rect y="0" width="640" height="240" fill="url(#${id}s)"/>
        <circle cx="${f(250 + r() * 140)}" cy="236" r="${f(60 + r() * 24)}" fill="url(#${id}g)" opacity=".92"/>`;
      for (let L = 0; L < 2; L++) {
        let d = `M0 360 L0 ${250 + L * 28}`;
        for (let x = 0; x <= 640; x += 32) d += ` L${x} ${f(236 + L * 30 - r() * (70 - L * 24))}`;
        d += ' L640 360Z';
        s += `<path d="${d}" fill="${L ? '#050505' : '#0b0906'}" stroke="${G[700]}" stroke-width=".8" opacity="${L ? 1 : 0.9}"/>`;
      }
      for (let k = 0; k < 4; k++) { const x = 90 + k * 150 + r() * 40; s += `<path d="M${f(x)} 300 V${f(210 + r() * 40)}" stroke="${G[500]}" stroke-width="2" opacity=".7"/>`; }
    } else if (v === 3) { // 문
      for (let k = 0; k < 6; k++) {
        const w = 260 - k * 40, ty = 60 + w / 2 + k * 8;
        s += `<path d="M${cx - w / 2} 330 V${ty} A${w / 2} ${w / 2} 0 0 1 ${cx + w / 2} ${ty} V330" fill="${k === 5 ? '#000' : 'none'}" stroke="url(#${id}g)" stroke-width="${k ? 1 : 1.8}" opacity="${f(0.45 + k * 0.1)}"/>`;
      }
      s += `<path d="M${cx - 20} 330 L${cx + 20} 330 L${cx + 120} 360 L${cx - 120} 360Z" fill="url(#${id}g)" opacity=".28"/>
        <path d="M${cx - 8} 330 V312 a8 8 0 1 1 16 0 V330Z" fill="${G[100]}" opacity=".9"/>`;
    } else { // 궤도
      for (let k = 0; k < 70; k++) s += `<circle cx="${f(r() * 640)}" cy="${f(r() * 360)}" r="${f(0.4 + r() * 1.2)}" fill="${G[300]}" opacity="${f(0.2 + r() * 0.6)}"/>`;
      const px = 250 + r() * 140;
      s += `<circle cx="${f(px)}" cy="${cy}" r="82" fill="url(#${id}g)" filter="url(#${id}b)" opacity=".55"/>
        <circle cx="${f(px)}" cy="${cy}" r="70" fill="#070605" stroke="url(#${id}g)" stroke-width="2"/>`;
      [[270, 62], [210, 46], [156, 34]].forEach(([rx, ry], k) => {
        s += `<ellipse cx="${f(px)}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${-18 + k * 9} ${f(px)} ${cy})" fill="none" stroke="${G[700]}" stroke-width="1" opacity=".55"/>`;
        const a = r() * 6.28;
        s += `<circle cx="${f(px + Math.cos(a) * rx * 0.9)}" cy="${f(cy + Math.sin(a) * ry * 0.9)}" r="5" fill="${G[100]}"/>`;
      });
    }
    return `<svg class="art" viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice" role="img" aria-label="컨셉아트 자리 ${i + 1}">
      <defs>${defs(id).replace(/<\/?defs>/g, '')}
        <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050505"/><stop offset="1" stop-color="#3a2a0c"/></linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#${id}r)"/>
      ${s}${shards(r, 26, 640, 360, id)}
    </svg>`;
  }

  window.RCArt = { char, concept };
})();
