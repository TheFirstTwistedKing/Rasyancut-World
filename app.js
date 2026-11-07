(function () {
  'use strict';
  const { NAV, CHARS, CONCEPTS, PATCHES } = window.RC;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = (n) => String(n).padStart(2, '0');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const icon = (id, cls = '') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;

  /* ── 그림: 실제 이미지가 있으면 그것을, 없으면 임시 일러스트 ── */
  const charArt = (c) => (c.img ? `<img class="art" src="${esc(c.img)}" alt="${esc(c.ko)}" style="object-fit:cover">` : RCArt.char(c.id));
  const conceptArt = (c) => (c.img ? `<img class="art" src="${esc(c.img)}" alt="${esc(c.title)}" loading="lazy" style="object-fit:cover">` : RCArt.concept(c.id - 1));

  /* ── 글자 애니메이션 ── */
  function splitText(el, base, step) {
    const t = el.textContent;
    el.setAttribute('aria-label', t);
    let n = 0;
    el.innerHTML = t.split(/(\s+)/).map((w) => (/^\s+$/.test(w) ? ' ' :
      `<span class="w" aria-hidden="true">${[...w].map((c) => `<span class="ch" style="--d:${base + (n++) * step}ms">${esc(c)}</span>`).join('')}</span>`)).join('');
  }
  function play(root) {
    let i = 0;
    $$('[data-type]', root).forEach((el) => {
      const d = el.dataset.delay !== undefined ? +el.dataset.delay : 250 + i * 160;
      i++;
      if (!reduce) splitText(el, d, 16);
    });
    $$('[data-wipe]', root).forEach((el) => {
      el.style.setProperty('--d', (el.dataset.delay || 150) + 'ms');
      if (!reduce) el.classList.add('wipe');
    });
    $$('[data-rise]', root).forEach((el, k) => {
      el.style.setProperty('--d', (el.dataset.delay !== undefined ? +el.dataset.delay : 500 + k * 110) + 'ms');
      if (!reduce) el.classList.add('rise');
    });
  }

  /* ── 화면 렌더링 ── */
  const EMBLEM = [
    '<circle cx="19" cy="19" r="6"/><path d="M19 7v6M19 25v6M7 19h6M25 19h6"/>',
    '<path d="M19 7l10 12-10 12L9 19z"/><circle cx="19" cy="19" r="3"/>',
    '<path d="M9 28l10-20 10 20z"/><path d="M14 22h10"/>',
    '<circle cx="19" cy="19" r="10"/><path d="M12 12l14 14M26 12L12 26"/>',
    '<path d="M10 12h18M10 19h18M10 26h18"/><circle cx="19" cy="19" r="9"/>',
    '<path d="M19 6c8 4 8 22 0 26-8-4-8-22 0-26z"/><path d="M19 12v14"/>',
  ];
  const emblem = (i) => `<svg viewBox="0 0 38 38" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><rect x="2" y="2" width="34" height="34" opacity=".55"/>${EMBLEM[i % EMBLEM.length]}</svg>`;

  const VIEWS = {
    main() {
      const slides = CHARS.map((c, i) => `<div class="hero-slide${i ? '' : ' on'}" data-i="${i}">${charArt(c)}</div>`).join('');
      const dots = CHARS.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('');
      return `<div class="hero">
        <div class="hero-copy">
          <p class="kicker mono" data-type>Sanctuary of all creations</p>
          <h1 class="gold-title" data-wipe>라시안컷</h1>
          <p class="lead" data-type data-delay="500">모든 창조물들의 성소</p>
          <p class="sub" data-type data-delay="900">빛과 어둠이 맞물리는 세계의 기록을 펼쳐 봅니다.</p>
          <div class="cta" data-rise data-delay="1500">
            <a class="btn" href="#/select">캐릭터 보기 ${icon('i-next')}</a>
            <a class="btn ghost" href="#/gallery">컨셉아트</a>
          </div>
        </div>
        <div class="hero-art" data-rise data-delay="300">
          <div class="hero-frame"></div>
          <div class="hero-stage">${slides}</div>
          <div class="hero-dots" aria-hidden="true">${dots}</div>
          <button class="hero-nav prev" type="button" aria-label="이전 캐릭터">${icon('i-prev')}</button>
          <button class="hero-nav next" type="button" aria-label="다음 캐릭터">${icon('i-next')}</button>
          <div class="hero-info">
            <div><div class="hero-count" id="heroCount"></div><span class="hero-name" id="heroName" aria-live="polite"></span></div>
            <a class="hero-more" id="heroMore" href="#/char/1">자세히 보기 →</a>
          </div>
        </div>
      </div>`;
    },
    select() {
      const cards = CHARS.map((c, i) => `<a class="ccard" style="--i:${i}" href="#/char/${c.id}" aria-label="${esc(c.ko)} 소개 보기">
        <span class="cc-in">
          <span class="cc-art">${charArt(c)}</span>
          <span class="cc-no mono">${pad(c.id)}</span>
          <span class="cc-meta">${emblem(i)}<b>${esc(c.ko)}</b><small>${esc(c.en)}</small></span>
        </span></a>`).join('');
      return `<div class="select">
        <header class="sec-head">
          <p class="kicker mono" data-type>Select · Character</p>
          <h2 class="gold-title" data-wipe>캐릭터 선택</h2>
          <p class="sub" data-type data-delay="700">소개를 볼 캐릭터를 골라 주세요.</p>
        </header>
        <div class="cards" role="list">${cards}</div>
      </div>`;
    },
    char(id) {
      const n = CHARS.length, i = Math.min(Math.max(id, 1), n) - 1, c = CHARS[i];
      const prev = CHARS[(i + n - 1) % n].id, next = CHARS[(i + 1) % n].id;
      const lines = c.lines.map((l, k) => `<p data-type data-delay="${900 + k * 500}">${esc(l)}</p>`).join('');
      return `<div class="intro">
        <div class="intro-copy">
          <p class="kicker mono" data-type>The Character · ${esc(c.code)}</p>
          <h2 class="gold-title" data-wipe data-delay="200">${esc(c.ko)}</h2>
          <p class="en mono" data-type data-delay="600">${esc(c.en)}</p>
          <div class="rule" aria-hidden="true"><i></i><i></i><i></i><b></b></div>
          <div class="intro-lines">${lines}</div>
          <dl class="readout mono" data-rise data-delay="1500">
            <dt>ID</dt><dd>${esc(c.code)}</dd><dt>ROLE</dt><dd>${esc(c.role)}</dd><dt>SEC</dt><dd>R.S.S. / ${pad(c.id)}</dd>
          </dl>
          <div class="intro-nav" data-rise data-delay="1700">
            <a class="btn ghost" href="#/char/${prev}" aria-label="이전 캐릭터">${icon('i-prev')}이전</a>
            <a class="btn ghost" href="#/select">목록</a>
            <a class="btn" href="#/char/${next}" aria-label="다음 캐릭터">다음${icon('i-next')}</a>
          </div>
        </div>
        <div class="intro-art">
          <div class="band"></div>
          <div class="art-wrap">${charArt(c)}</div>
          ${c.img ? '' : '<span class="ph-tag mono">Illustration · placeholder</span>'}
          <div class="intro-count" aria-hidden="true">${pad(c.id)}<small>/ ${pad(n)}</small></div>
        </div>
      </div>`;
    },
    gallery() {
      const tiles = CONCEPTS.map((c, i) => `<button class="tile${i % 3 === 2 ? ' big' : ''}" type="button" data-i="${i}" aria-label="${esc(c.title)} 크게 보기">
        <span class="t-art">${conceptArt(c)}</span><span class="t-scan"></span><span class="t-cap mono">${esc(c.title)} / ${pad(CONCEPTS.length)}</span></button>`).join('');
      return `<div class="gallery">
        <header class="sec-head">
          <p class="kicker mono" data-type>Concept Art · ${pad(CONCEPTS.length)}</p>
          <h2 class="gold-title" data-wipe>컨셉아트</h2>
          <p class="sub" data-type data-delay="700">그림을 누르면 크게 볼 수 있습니다. 아래로 스크롤해 더 보세요.</p>
        </header>
        <div class="mosaic">${tiles}</div>
      </div>`;
    },
    notice() {
      const list = PATCHES.map((p) => `<article class="patch" data-rise>
        <h3 class="gold-title">${esc(p.v)}</h3><time class="date mono">${esc(p.date)}</time>
        <ul>${p.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></article>`).join('');
      return `<div class="notice">
        <header class="sec-head">
          <p class="kicker mono" data-type>Notice</p>
          <h2 class="gold-title" data-wipe>공지</h2>
        </header>${list}
      </div>`;
    },
  };

  /* ── 화면별 후처리 ── */
  let heroTimer = 0, tileObs = null;
  function stopLive() { clearInterval(heroTimer); if (tileObs) tileObs.disconnect(); tileObs = null; }

  const AFTER = {
    main(root) {
      let cur = 0, locked = false;
      const slides = $$('.hero-slide', root), dots = $$('.hero-dots i', root);
      const show = (n, first) => {
        cur = (n + CHARS.length) % CHARS.length;
        slides.forEach((s, i) => s.classList.toggle('on', i === cur));
        dots.forEach((d, i) => d.classList.toggle('on', i === cur));
        $('#heroCount', root).innerHTML = `${pad(CHARS[cur].id)}<small>/ ${pad(CHARS.length)}</small>`;
        const nm = $('#heroName', root);
        nm.textContent = CHARS[cur].ko;
        if (!reduce) splitText(nm, first ? 900 : 200, 20);
        $('#heroMore', root).href = '#/char/' + CHARS[cur].id;
      };
      const step = (d) => { if (locked) return; locked = true; show(cur + d); setTimeout(() => (locked = false), 700); restart(); };
      const restart = () => { clearInterval(heroTimer); if (!reduce) heroTimer = setInterval(() => show(cur + 1), 7000); };
      $('.hero-nav.prev', root).onclick = () => step(-1);
      $('.hero-nav.next', root).onclick = () => step(1);
      show(0, true); restart();
    },
    gallery(root) {
      const tiles = $$('.tile', root);
      tileObs = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); tileObs.unobserve(e.target); }
      }), { root, threshold: 0.12 });
      tiles.forEach((t) => tileObs.observe(t));
      root.onclick = (e) => { const t = e.target.closest('.tile'); if (t) openLB(+t.dataset.i); };
    },
  };

  /* ── 라이트박스 ── */
  const lb = $('#lightbox'); let lbI = 0, lbFrom = null;
  function lbRender() {
    const c = CONCEPTS[lbI];
    $('#lbArt').innerHTML = conceptArt(c);
    $('#lbCap').textContent = `${c.title} / ${pad(CONCEPTS.length)}`;
  }
  function openLB(i) { lbI = i; lbFrom = document.activeElement; lbRender(); lb.hidden = false; $('#lbClose').focus(); }
  function closeLB() { lb.hidden = true; if (lbFrom && lbFrom.focus) lbFrom.focus(); }
  const lbStep = (d) => { lbI = (lbI + d + CONCEPTS.length) % CONCEPTS.length; lbRender(); };
  $('#lbClose').onclick = closeLB;
  $('#lbPrev').onclick = () => lbStep(-1);
  $('#lbNext').onclick = () => lbStep(1);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });

  /* ── 메뉴 (우측 상단 아이콘) ── */
  const menuBtn = $('#menuBtn'), panel = $('#menuPanel');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    panel.inert = !open;
  }
  menuBtn.onclick = () => setMenu(!document.body.classList.contains('menu-open'));
  $('#scrim').onclick = () => setMenu(false);
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (!lb.hidden) closeLB(); else setMenu(false); }
    if (!lb.hidden) { if (e.key === 'ArrowLeft') lbStep(-1); if (e.key === 'ArrowRight') lbStep(1); }
  });

  /* 좌측 메뉴 + 우측 패널 메뉴는 같은 데이터에서 만든다 */
  $('#rail').innerHTML = NAV.map((n) => `<a class="rail-btn" href="#/${n.r}" data-r="${n.r}">${icon(n.icon)}<b>${n.ko}</b><small>${n.en}</small></a>`).join('');
  $('#menuList').innerHTML = NAV.map((n, i) => `<a class="mi" style="--i:${i}" href="#/${n.r}" data-r="${n.r}">${icon(n.icon)}<b>${n.ko}</b><small>${n.en}</small></a>`).join('');
  document.addEventListener('click', (e) => { if (e.target.closest('.mi, .rail-btn, .brand')) setMenu(false); });

  /* ── 화면 전환 (슬랫 + 스캔선 + 문양) ── */
  const tr = $('#tr'), slatBox = $('#trSlats'), line = $('#trLine'), core = $('#trCore'), label = $('#trLabel');
  const SLATS = 10;
  slatBox.innerHTML = '<i></i>'.repeat(SLATS);
  const slats = [...slatBox.children];

  async function transition(text, mid) {
    if (reduce) { await mid(); return; }
    label.textContent = text;
    tr.classList.add('on');
    slats.forEach((s) => (s.style.transformOrigin = 'top'));
    const inA = slats.map((s, i) => s.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 380, delay: i * 26, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }));
    line.animate([{ top: '0%', opacity: 1 }, { top: '100%', opacity: 1 }], { duration: 640, easing: 'ease-in', fill: 'forwards' });
    core.animate([{ opacity: 0, transform: 'translate(-50%,-50%) scale(.7)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }], { duration: 360, delay: 220, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });
    await Promise.all(inA.map((a) => a.finished));
    await mid();
    await sleep(180);
    slats.forEach((s) => (s.style.transformOrigin = 'bottom'));
    const outA = slats.map((s, i) => s.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 380, delay: (SLATS - i) * 26, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }));
    core.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, fill: 'forwards' });
    line.animate([{ top: '100%', opacity: 1 }, { top: '0%', opacity: 0 }], { duration: 560, easing: 'ease-out', fill: 'forwards' });
    await Promise.all(outA.map((a) => a.finished));
    tr.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    tr.classList.remove('on');
  }

  /* ── 라우터 ── */
  const TITLES = { main: '메인', select: '캐릭터', char: '캐릭터', gallery: '컨셉아트', notice: '공지' };
  let current = '', busy = false, pending = null;

  function parse() {
    const m = location.hash.replace(/^#\/?/, '').split('/');
    const name = VIEWS[m[0]] ? m[0] : 'main';
    return { name, arg: name === 'char' ? parseInt(m[1], 10) || 1 : null, key: name === 'char' ? 'char/' + (parseInt(m[1], 10) || 1) : name };
  }
  function mount(route) {
    stopLive();
    $$('.screen').forEach((s) => (s.hidden = true));
    const root = $('#s-' + route.name);
    root.hidden = false;
    root.onclick = null;
    root.innerHTML = VIEWS[route.name](route.arg);
    root.scrollTop = 0;
    play(root);
    if (AFTER[route.name]) AFTER[route.name](root);
    const group = route.name === 'char' ? 'select' : route.name;
    $$('.rail-btn, .mi').forEach((a) => a.classList.toggle('on', a.dataset.r === group));
    document.title = (route.name === 'main' ? '' : TITLES[route.name] + ' · ') + 'Rasyancut World';
  }
  async function render() {
    const route = parse();
    if (route.key === current) return;
    if (busy) { pending = true; return; }
    busy = true;
    const first = current === '';
    current = route.key;
    await transition((first ? 'BOOT' : 'TRANSIT') + ' // ' + TITLES[route.name], () => mount(route));
    busy = false;
    if (pending) { pending = false; render(); }
  }
  addEventListener('hashchange', render);
  render();

  /* ── 금가루 파티클 ── */
  (function dust() {
    const c = $('#dust'), x = c.getContext('2d');
    let w, h, dpr, ps = [];
    const spr = document.createElement('canvas'); spr.width = spr.height = 32;
    const sx = spr.getContext('2d'), g = sx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,243,196,1)'); g.addColorStop(.3, 'rgba(242,210,122,.55)'); g.addColorStop(1, 'rgba(212,167,58,0)');
    sx.fillStyle = g; sx.fillRect(0, 0, 32, 32);
    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.width = innerWidth * dpr; h = c.height = innerHeight * dpr;
      const n = innerWidth < 700 ? 34 : 80;
      ps = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, s: (1.5 + Math.random() * 5) * dpr, v: (.08 + Math.random() * .3) * dpr, ph: Math.random() * 6.28, a: .15 + Math.random() * .6 }));
    }
    function draw(t) {
      x.clearRect(0, 0, w, h); x.globalCompositeOperation = 'lighter';
      for (const p of ps) {
        p.y -= p.v; if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w; }
        const px = p.x + Math.sin(t / 2200 + p.ph) * 14 * dpr;
        x.globalAlpha = p.a * (.55 + .45 * Math.sin(t / 900 + p.ph));
        x.drawImage(spr, px - p.s * 2, p.y - p.s * 2, p.s * 4, p.s * 4);
      }
      if (!reduce) requestAnimationFrame(draw);
    }
    size(); addEventListener('resize', size);
    requestAnimationFrame(draw);
  })();
})();
