/* 라시안컷 월드 — 라우터·화면·전환.
   설계 원칙(적대적): 어떤 입력 순서로 눌러도 "마지막 해시"로 수렴한다 / 화면 하나가 죽어도 사이트는 산다 /
   등장 연출은 관찰 대상이 아닌 안쪽 요소에 건다 / 전환은 언제든 시간 제한(워치독)으로 풀린다. */
(function () {
  'use strict';

  var D = window.RC_DATA, A = window.RC_ART;
  var root = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };
  var view = $('view'), menu = $('menu'), menuBtn = $('menuBtn'), curtain = $('curtain'), slats = [].slice.call($('slats').children);
  var live = $('live'), hudWhere = $('hudWhere');
  var reduceMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  var state = { main: 0, sel: 0 };
  var current = null, rendered = null, busy = false, navCount = 0;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function frames(n) { return new Promise(function (r) { var k = function () { if (--n <= 0) r(); else requestAnimationFrame(k); }; requestAnimationFrame(k); setTimeout(r, 120 * n); }); }
  function reduced() { return !!reduceMQ.matches; }
  function mod(n, m) { return ((n % m) + m) % m; }

  /* ---------- 그림 경로: img 필드가 있으면 쓰고, 없거나 깨지면 임시 일러스트 ---------- */
  var memo = {};
  function fallbackSrc(kind, id) {
    var k = kind + id;
    if (!memo[k]) memo[k] = kind === 'char' ? A.figureURI(id) : A.conceptURI(id);
    return memo[k];
  }
  function src(kind, item) { return item.img ? item.img : fallbackSrc(kind, item.id); }
  function imgTag(kind, item, cls, alt, extra) {
    return '<img class="' + (cls || '') + '" src="' + esc(src(kind, item)) + '" alt="' + esc(alt || '') + '" data-kind="' + kind + '" data-id="' + item.id + '" decoding="async" draggable="false"' + (extra || '') + '>';
  }
  function guardImgs(scope) {
    [].forEach.call(scope.querySelectorAll('img[data-kind]'), function (img) {
      var fix = function () {
        img.onerror = null;
        var fb = fallbackSrc(img.dataset.kind, +img.dataset.id);
        if (img.getAttribute('src') !== fb) img.src = fb;
      };
      img.onerror = fix;
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src') && img.getAttribute('src').indexOf('data:') !== 0) fix();
    });
  }

  /* ---------- 글자 단위 등장 ---------- */
  function split(el) {
    if (el.classList.contains('split')) return;
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    el.textContent = '';
    var sr = document.createElement('span'); sr.className = 'sr'; sr.textContent = text;
    var vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true');
    var frag = document.createDocumentFragment(), i = 0;
    text.split(' ').forEach(function (word, wi) {
      if (wi) frag.appendChild(document.createTextNode(' '));
      var chars = Array.from(word), holder = frag;
      if (chars.length <= 14) { holder = document.createElement('span'); holder.className = 'w'; frag.appendChild(holder); }
      chars.forEach(function (ch) {
        var s = document.createElement('span'); s.className = 'c'; s.style.setProperty('--i', i++); s.textContent = ch; holder.appendChild(s);
      });
    });
    vis.appendChild(frag); el.appendChild(sr); el.appendChild(vis);
    el.style.setProperty('--step', Math.max(6, Math.min(24, Math.floor(900 / Math.max(i, 1)))) + 'ms');
    el.classList.add('split');
  }
  function retext(el, text) {
    el.classList.remove('split', 'is-in');
    el.textContent = text;
    split(el);
    void el.offsetWidth;
    el.classList.add('is-in');
  }

  /* ---------- 화면 컨텍스트: 정리 함수·관찰자를 한곳에서 관리 ---------- */
  function newCtx() {
    var ctx = { cleanups: [], io: null, started: false, starters: [] };
    ctx.on = function (target, ev, fn, opt) { target.addEventListener(ev, fn, opt); ctx.cleanups.push(function () { target.removeEventListener(ev, fn, opt); }); };
    ctx.watch = function (el, cb) {
      if (!ctx.io) {
        ctx.io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { ctx.io.unobserve(e.target); e.target._cb && e.target._cb(); } });
        }, { threshold: 0.01, rootMargin: '0px 0px -4% 0px' }) : null;
        ctx.cleanups.push(function () { ctx.io && ctx.io.disconnect(); });
      }
      el._cb = cb;
      if (ctx.io) ctx.io.observe(el); else cb();
    };
    ctx.text = function (scope, baseStep) {
      [].forEach.call(scope.querySelectorAll('.rt'), function (el, k) {
        split(el);
        if (baseStep) el.style.setProperty('--base', (k * baseStep) + 'ms');
        ctx.watch(el, function () { el.classList.add('is-in'); });
      });
    };
    ctx.destroy = function () { ctx.cleanups.forEach(function (fn) { try { fn(); } catch (e) { } }); ctx.cleanups = []; };
    return ctx;
  }
  function enterStagger(screen) {
    [].forEach.call(screen.querySelectorAll('[data-enter]'), function (el, i) { if (!el.style.getPropertyValue('--e')) el.style.setProperty('--e', i); });
    screen.classList.add('entering');
  }
  function drawIcon(el) { if (!el) return; el.classList.remove('draw'); void el.offsetWidth; el.classList.add('draw'); }

  /* ================= 화면들 ================= */
  var ROUTES = {
    main: { n: '01', ko: '메인화면', en: 'HOME' },
    select: { n: '02', ko: '캐릭터 선택', en: 'CHARACTER SELECT' },
    char: { n: '02', ko: '캐릭터 소개', en: 'CHARACTER' },
    gallery: { n: '03', ko: '컨셉아트', en: 'CONCEPT ART' },
    notice: { n: '04', ko: '공지', en: 'NOTICE' }
  };

  /* ---- 메인 ---- */
  function viewMain() {
    var ctx = newCtx(), chars = D.characters, n = chars.length, idx = mod(state.main, n);
    var el = document.createElement('section');
    el.className = 'screen main';
    el.setAttribute('aria-label', '메인화면');
    var figs = chars.map(function (c, k) { return '<div class="m-fig" data-k="' + k + '" aria-hidden="' + (k === idx ? 'false' : 'true') + '">' + imgTag('char', c, '', c.name + ' 임시 일러스트', k === idx ? ' fetchpriority="high"' : '') + '</div>'; }).join('');
    var thumbs = chars.map(function (c, k) { return '<button type="button" data-k="' + k + '" aria-label="' + esc(c.name) + ' 보기" aria-pressed="' + (k === idx) + '">' + imgTag('char', c, '', '') + '<b>' + pad(k + 1) + '</b></button>'; }).join('');
    var rail = [
      ['#/select', 'char', '캐릭터', 'CHARACTER', 'r-char'],
      ['#/gallery', 'art', '컨셉아트', 'CONCEPT ART', 'r-art'],
      ['#/notice', 'note', '공지', 'NOTICE', 'r-note'],
      ['#/char/' + (idx + 1), 'id', '소개', 'PROFILE', 'r-intro']
    ].map(function (r, i) { return '<a href="' + r[0] + '" id="' + r[4] + '" data-enter style="--e:' + (i + 1) + '">' + A.icon(r[1]) + '<span class="rl">' + r[2] + '</span><span class="en">' + r[3] + '</span></a>'; }).join('');
    el.innerHTML =
      '<div class="m-bg" aria-hidden="true">' + A.sigil() + '</div><div class="m-scan" aria-hidden="true"></div>' +
      '<nav class="rail" aria-label="바로가기">' + rail + '</nav>' +
      '<div class="m-stage" id="mStage" role="group" aria-roledescription="캐러셀" aria-label="캐릭터 미리보기. 좌우로 밀거나 방향키로 넘깁니다.">' + figs +
      '<p class="m-count" aria-hidden="true"><b id="mNow">01</b><span>/' + pad(n) + '</span></p></div>' +
      '<div class="m-info"><p class="eyebrow" id="mEn" data-enter style="--e:2"></p>' +
      '<h1 class="m-name rt" id="mName"></h1><p class="m-intro rt" id="mIntro"></p>' +
      '<div class="m-act" data-enter style="--e:4"><a class="btn" id="mGo" href="#/char/1"><span>소개 보기</span>' + A.icon('arrow') + '</a>' +
      '<button class="sq" type="button" id="mPrev" aria-label="이전 캐릭터">' + A.icon('prev') + '</button>' +
      '<button class="sq" type="button" id="mNext" aria-label="다음 캐릭터">' + A.icon('next') + '</button></div>' +
      '<div class="m-thumbs" role="group" aria-label="캐릭터 바로 선택" data-enter style="--e:5">' + thumbs + '</div></div>';
    guardImgs(el);

    var figEls = [].slice.call(el.querySelectorAll('.m-fig')), thumbEls = [].slice.call(el.querySelectorAll('.m-thumbs button'));
    var nameEl = el.querySelector('#mName'), introEl = el.querySelector('#mIntro'), enEl = el.querySelector('#mEn'), nowEl = el.querySelector('#mNow'), goEl = el.querySelector('#mGo'), introLink = el.querySelector('#r-intro');
    function show(i, announce, animate) {
      idx = mod(i, n); state.main = idx; var c = chars[idx];
      figEls.forEach(function (f, k) { f.classList.toggle('on', k === idx); f.classList.toggle('before', k < idx); f.setAttribute('aria-hidden', k === idx ? 'false' : 'true'); });
      thumbEls.forEach(function (t, k) { t.setAttribute('aria-pressed', String(k === idx)); });
      nowEl.textContent = pad(idx + 1); enEl.textContent = c.en + ' / ' + pad(n);
      goEl.setAttribute('href', '#/char/' + c.id); introLink.setAttribute('href', '#/char/' + c.id);
      goEl.setAttribute('aria-label', c.name + ' 소개 보기');
      if (animate) { retext(nameEl, c.name); retext(introEl, c.short); } else { nameEl.textContent = c.name; introEl.textContent = c.short; }
      if (announce) live.textContent = c.name + ', ' + pad(idx + 1) + ' / ' + pad(n);
    }
    show(idx, false, false);
    ctx.on(el.querySelector('#mPrev'), 'click', function () { show(idx - 1, true, true); });
    ctx.on(el.querySelector('#mNext'), 'click', function () { show(idx + 1, true, true); });
    thumbEls.forEach(function (t) { ctx.on(t, 'click', function () { show(+t.dataset.k, true, true); }); });
    ctx.on(document, 'keydown', function (e) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || root.classList.contains('menu-open')) return;
      var tag = (e.target && e.target.tagName) || '';
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      if (e.key === 'ArrowLeft') show(idx - 1, true, true);
      else if (e.key === 'ArrowRight') show(idx + 1, true, true);
    });
    var stage = el.querySelector('#mStage'), sx = 0, sy = 0, tracking = false;
    ctx.on(stage, 'pointerdown', function (e) { sx = e.clientX; sy = e.clientY; tracking = true; });
    ctx.on(stage, 'pointerup', function (e) {
      if (!tracking) return; tracking = false;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) show(idx + (dx < 0 ? 1 : -1), true, true);
    });
    ctx.on(stage, 'pointercancel', function () { tracking = false; });

    return {
      el: el, ctx: ctx,
      start: function () {
        enterStagger(el);
        [nameEl, introEl].forEach(function (t) { split(t); t.classList.add('is-in'); });
        [].forEach.call(el.querySelectorAll('.rail a'), function (a) { drawIcon(a); });
        nameEl.style.setProperty('--base', '200ms'); introEl.style.setProperty('--base', '420ms');
      }
    };
  }

  /* ---- 캐릭터 선택 ---- */
  function viewSelect() {
    var ctx = newCtx(), chars = D.characters, n = chars.length, sel = mod(state.sel, n);
    var el = document.createElement('section');
    el.className = 'screen select';
    el.setAttribute('aria-label', '캐릭터 선택');
    var cards = chars.map(function (c, k) {
      return '<button type="button" class="card" data-k="' + k + '" aria-pressed="' + (k === sel) + '" aria-label="' + esc(c.name) + ', ' + pad(k + 1) + ' / ' + pad(n) + '">' +
        '<span class="rim"></span><span class="in"><span class="art">' + imgTag('char', c, '', '') + '</span><span class="band-b"></span>' +
        '<span class="band"><span class="emb">' + A.emblem(k + 1) + '</span><span class="nm">' + esc(c.name) + '</span><span class="cd">' + esc(c.code) + '</span><span class="go">소개 보기 →</span></span></span></button>';
    }).join('');
    el.innerHTML =
      '<div class="s-wrap"><header class="s-head" data-enter><p class="eyebrow">STEP 01 — CHARACTER SELECT</p>' +
      '<h1 class="s-title">캐릭터 선택</h1><p class="s-lead rt">소개를 볼 캐릭터를 고르세요.</p></header>' +
      '<div class="cards" role="group" aria-label="캐릭터 목록" data-enter style="--e:2">' + cards + '</div></div>' +
      '<div class="s-bar" data-enter style="--e:4"><p class="s-sel"><span class="eyebrow">선택됨</span><span class="nm" id="sName"></span></p>' +
      '<a class="btn" id="sGo" href="#/char/1"><span>소개 보기</span>' + A.icon('arrow') + '</a></div>';
    guardImgs(el);
    var cardEls = [].slice.call(el.querySelectorAll('.card')), sName = el.querySelector('#sName'), sGo = el.querySelector('#sGo');
    function pick(k, focus) {
      sel = mod(k, n); state.sel = sel; state.main = sel; var c = chars[sel];
      cardEls.forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === sel)); });
      sName.textContent = c.name; sGo.setAttribute('href', '#/char/' + c.id); sGo.setAttribute('aria-label', c.name + ' 소개 보기');
      drawIcon(cardEls[sel]);
      if (focus) cardEls[sel].focus();
      live.textContent = c.name + ' 선택됨';
    }
    pick(sel, false);
    cardEls.forEach(function (b) {
      ctx.on(b, 'click', function () {
        var k = +b.dataset.k;
        if (k === sel) { location.hash = '#/char/' + chars[k].id; } else pick(k, false);
      });
      ctx.on(b, 'keydown', function (e) {
        var d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
        if (d) { e.preventDefault(); pick(+b.dataset.k + d, true); }
      });
    });
    return { el: el, ctx: ctx, start: function () { enterStagger(el); ctx.text(el); drawIcon(cardEls[sel]); } };
  }

  /* ---- 캐릭터 소개 ---- */
  function viewChar(t) {
    var ctx = newCtx(), chars = D.characters, n = chars.length, k = mod(t.id - 1, n), c = chars[k];
    state.main = k; state.sel = k;
    var prev = chars[mod(k - 1, n)], next = chars[mod(k + 1, n)];
    var el = document.createElement('section');
    el.className = 'screen char';
    el.setAttribute('aria-label', c.name + ' 소개');
    el.innerHTML =
      '<div class="c-stage" data-enter><div class="c-band" aria-hidden="true"></div><div class="c-line" aria-hidden="true"></div><div class="c-line l2" aria-hidden="true"></div>' +
      '<p class="c-ghost" aria-hidden="true">CHARACTER</p><p class="c-plus" aria-hidden="true">++++</p>' +
      '<div class="c-fig">' + imgTag('char', c, '', c.name + ' 임시 일러스트', ' fetchpriority="high"') + '</div>' +
      (c.img ? '' : '<p class="c-tmp">임시 일러스트 — 실제 그림으로 교체 예정</p>') + '</div>' +
      '<div class="c-text"><div class="c-code" data-enter style="--e:1"><span class="eyebrow">' + esc(c.en) + '</span><b>' + pad(k + 1) + '<span class="dim"> / ' + pad(n) + '</span></b></div>' +
      '<h1 class="c-name rt" data-enter style="--e:2">' + esc(c.name) + '</h1>' +
      '<div class="c-intro">' + c.intro.map(function (p) { return '<p class="rt">' + esc(p) + '</p>'; }).join('') + '</div>' +
      '<dl class="c-specs" data-enter style="--e:4">' + c.specs.map(function (s) { return '<div><dt>' + esc(s[0]) + '</dt><dd>' + esc(s[1]) + '</dd></div>'; }).join('') + '</dl>' +
      '<div class="c-nav" data-enter style="--e:5"><a class="sq" href="#/char/' + prev.id + '" aria-label="이전 캐릭터: ' + esc(prev.name) + '">' + A.icon('prev') + '</a>' +
      '<a class="sq" href="#/char/' + next.id + '" aria-label="다음 캐릭터: ' + esc(next.name) + '">' + A.icon('next') + '</a>' +
      '<a class="btn" href="#/select"><span>다른 캐릭터 고르기</span>' + A.icon('grid') + '</a></div></div>';
    guardImgs(el);
    ctx.on(document, 'keydown', function (e) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || root.classList.contains('menu-open')) return;
      if (e.key === 'ArrowLeft') location.hash = '#/char/' + prev.id;
      else if (e.key === 'ArrowRight') location.hash = '#/char/' + next.id;
    });
    return { el: el, ctx: ctx, start: function () { enterStagger(el); ctx.text(el, 160); } };
  }

  /* ---- 컨셉아트 ---- */
  function viewGallery() {
    var ctx = newCtx(), items = D.concept, total = items.length;
    var el = document.createElement('section');
    el.className = 'screen gal';
    el.setAttribute('aria-label', '컨셉아트');
    var rows = '';
    for (var r = 0; r * 3 < total; r++) {
      rows += '<p class="g-set" aria-hidden="true">' + pad(r * 3 + 1) + ' — ' + pad(Math.min(r * 3 + 3, total)) + '</p><div class="g-row">';
      for (var j = 0; j < 3 && r * 3 + j < total; j++) {
        var it = items[r * 3 + j], big = j === 2;
        rows += '<button type="button" class="plate ' + (big ? 'big' : 'small') + '" data-k="' + (r * 3 + j) + '" aria-label="' + esc(it.title) + ' 크게 보기, ' + pad(it.id) + ' / ' + pad(total) + '">' +
          '<span class="pl-in">' + imgTag('concept', it, '', '', ' loading="lazy"') + '<span class="pl-tag">' + pad(it.id) + '<em>/ ' + pad(total) + '</em></span><span class="pl-ex">' + A.icon('expand') + '</span></span><span class="pl-frame"></span></button>';
      }
      rows += '</div>';
    }
    el.innerHTML =
      '<header class="g-head" data-enter><p class="eyebrow">ARCHIVE — ' + pad(total) + ' PLATES</p><h1 class="g-title">Concept<span>Art</span></h1>' +
      '<div class="g-sub"><p class="g-lead rt">아래로 스크롤하며 컨셉아트를 둘러보세요. 그림을 누르면 크게 볼 수 있습니다.</p></div></header>' +
      '<div class="g-rows">' + rows + '</div>';
    guardImgs(el);

    var plates = [].slice.call(el.querySelectorAll('.plate'));
    /* 라이트박스(<dialog>) */
    var dlg = null, lbIdx = 0, lastBtn = null;
    if (typeof HTMLDialogElement === 'function') {
      dlg = document.createElement('dialog');
      dlg.className = 'lb'; dlg.setAttribute('aria-label', '컨셉아트 크게 보기');
      dlg.innerHTML = '<img class="lb-img" alt="" data-kind="concept" data-id="1"><div class="lb-bar"><p class="lb-cap"></p>' +
        '<button type="button" class="sq" data-a="prev" aria-label="이전 그림">' + A.icon('prev') + '</button><button type="button" class="sq" data-a="next" aria-label="다음 그림">' + A.icon('next') + '</button>' +
        '<button type="button" class="sq" data-a="close" aria-label="닫기">' + A.icon('close') + '</button></div>';
      document.body.appendChild(dlg);
      var lbImg = dlg.querySelector('.lb-img'), lbCap = dlg.querySelector('.lb-cap');
      var fillLb = function (i) {
        lbIdx = mod(i, total); var it = items[lbIdx];
        lbImg.dataset.id = it.id; lbImg.alt = it.title; lbImg.src = src('concept', it);
        lbCap.innerHTML = '<b>' + esc(it.title) + '</b> &nbsp; ' + pad(it.id) + ' / ' + pad(total);
        guardImgs(dlg);
      };
      ctx.on(dlg, 'click', function (e) {
        var a = e.target.closest && e.target.closest('[data-a]');
        if (a) { var act = a.dataset.a; if (act === 'close') dlg.close(); else fillLb(lbIdx + (act === 'next' ? 1 : -1)); }
        else if (e.target === dlg) dlg.close();
      });
      ctx.on(dlg, 'keydown', function (e) {
        if (e.key === 'ArrowLeft') fillLb(lbIdx - 1); else if (e.key === 'ArrowRight') fillLb(lbIdx + 1);
      });
      ctx.on(dlg, 'close', function () { root.classList.remove('lb-open'); if (lastBtn && document.contains(lastBtn)) lastBtn.focus({ preventScroll: true }); });
      plates.forEach(function (p) {
        ctx.on(p, 'click', function () { lastBtn = p; fillLb(+p.dataset.k); root.classList.add('lb-open'); if (!dlg.open) dlg.showModal(); dlg.querySelector('[data-a="close"]').focus(); });
      });
      ctx.cleanups.push(function () { try { if (dlg.open) dlg.close(); } catch (e) { } root.classList.remove('lb-open'); dlg.remove(); });
    }
    return {
      el: el, ctx: ctx,
      start: function () {
        enterStagger(el); ctx.text(el);
        plates.forEach(function (p) { ctx.watch(p, function () { p.classList.add('in'); }); });
      }
    };
  }

  /* ---- 공지 ---- */
  function viewNotice() {
    var ctx = newCtx();
    var el = document.createElement('section');
    el.className = 'screen notice';
    el.setAttribute('aria-label', '공지');
    var list = D.notices.map(function (p, i) {
      var groups = p.groups.map(function (g) {
        return '<div class="pg"><h3>' + esc(g.h) + '</h3><ul>' + g.items.map(function (t) { return '<li class="rt">' + esc(t) + '</li>'; }).join('') + '</ul></div>';
      }).join('');
      return '<details class="patch"' + (i === 0 ? ' open' : '') + ' data-enter style="--e:' + (i + 2) + '"><summary><span class="ps"><span class="pv">' + esc(p.v) + '</span>' +
        '<span class="pdate">' + esc(p.date) + '</span>' + (p.badge ? '<span class="pbadge">' + esc(p.badge) + '</span>' : '') + '</span><span class="ptog" aria-hidden="true"></span></summary>' +
        '<div class="pbody">' + (p.summary ? '<p class="psum rt">' + esc(p.summary) + '</p>' : '') + groups + '</div></details>';
    }).join('');
    el.innerHTML = '<div class="n-wrap"><header class="n-head" data-enter><p class="eyebrow">NOTICE — PATCH NOTES</p><h1 class="n-title">공지</h1></header><div class="n-list">' + list + '</div></div>';
    return { el: el, ctx: ctx, start: function () { enterStagger(el); ctx.text(el, 40); } };
  }

  /* ---- 오류(어떤 화면이 죽어도 사이트 자체는 산다) ---- */
  function viewError() {
    var ctx = newCtx();
    var el = document.createElement('section');
    el.className = 'screen';
    el.innerHTML = '<div class="err"><p class="eyebrow">ERROR</p><h1 class="s-title">화면을 불러오지 못했습니다</h1><p class="dim">잠시 후 다시 시도하거나 메인화면으로 돌아가세요.</p><a class="btn" href="#/main"><span>메인화면으로</span></a></div>';
    return { el: el, ctx: ctx, start: function () { } };
  }

  var VIEWS = { main: viewMain, select: viewSelect, char: viewChar, gallery: viewGallery, notice: viewNotice };

  /* ================= 라우터 ================= */
  function canon(raw) {
    var h = (raw || '').replace(/^#\/?/, ''), parts = h.split('/'), name = parts[0], t;
    if (name === 'char') {
      var id = parseInt(parts[1], 10);
      if (!(id >= 1 && id <= D.characters.length) || String(id) !== parts[1]) t = { name: 'select', key: 'select', hash: '#/select' };
      else t = { name: 'char', id: id, key: 'char/' + id, hash: '#/char/' + id };
    } else if (VIEWS[name] && parts.length === 1) t = { name: name, key: name, hash: '#/' + name };
    else t = { name: 'main', key: 'main', hash: '#/main' };
    if (location.hash !== t.hash) { try { history.replaceState(null, '', t.hash); } catch (e) { location.hash = t.hash; } }
    return t;
  }

  function setMeta(t) {
    var r = ROUTES[t.name];
    root.dataset.screen = t.name;
    var label = t.name === 'char' ? D.characters[t.id - 1].name + ' 소개' : r.ko;
    document.title = label + ' · 라시안컷 월드';
    hudWhere.textContent = r.n + ' / ' + r.en;
    live.textContent = label + ' 화면';
    [].forEach.call(menu.querySelectorAll('a[data-route]'), function (a) {
      var on = a.dataset.route === t.name || (t.name === 'char' && a.dataset.route === 'select');
      if (a.dataset.char) on = t.name === 'char' && +a.dataset.char === t.id;
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function render(t) {
    if (current) { try { current.ctx.destroy(); } catch (e) { } }
    var v;
    try { v = VIEWS[t.name](t); } catch (err) { console.error('[view]', t.key, err); v = viewError(); }
    view.replaceChildren(v.el);
    current = v;
    setMeta(t);
    try { window.scrollTo(0, 0); } catch (e) { }
    return v;
  }
  function startView(v) { try { v.start(); } catch (err) { console.error('[start]', err); } }

  /* 전환: 틈(slat) 6장이 위에서 내려와 덮고, 같은 방향으로 빠져나간다. */
  var DUR = 240, STAG = 32, EASE = 'cubic-bezier(.7,0,.3,1)';
  function slatAnim(s, i, dir) {
    var sk = ' skewX(-14deg)';
    var kf = dir === 'in' ? [{ transform: 'translateY(-101%)' + sk }, { transform: 'translateY(0)' + sk }] : [{ transform: 'translateY(0)' + sk }, { transform: 'translateY(101%)' + sk }];
    return s.animate(kf, { duration: DUR, delay: (dir === 'in' ? i : slats.length - 1 - i) * STAG, easing: EASE, fill: 'forwards' });
  }
  function runSlats(dir) {
    var anims = slats.map(function (s, i) { return slatAnim(s, i, dir); });
    var total = DUR + (slats.length - 1) * STAG;
    return Promise.race([Promise.all(anims.map(function (a) { return a.finished; })), sleep(total + 400)]).catch(function () { });
  }
  function clearCurtain() {
    slats.forEach(function (s) { try { s.getAnimations().forEach(function (a) { a.cancel(); }); } catch (e) { } });
    curtain.classList.remove('on', 'covered');
  }
  function labelCurtain(t) {
    var r = ROUTES[t.name];
    $('clNum').textContent = r.n;
    $('clText').textContent = t.name === 'char' ? D.characters[t.id - 1].name + ' 소개' : r.ko;
  }
  async function cover(t) {
    if (reduced() || !slats[0].animate) return;
    labelCurtain(t);
    curtain.classList.add('on');
    await runSlats('in');
    curtain.classList.add('covered');
  }
  async function reveal() {
    if (!curtain.classList.contains('on')) return;
    curtain.classList.remove('covered');
    await runSlats('out');
    clearCurtain();
  }

  /* 메인 메뉴 */
  var lastFocus = null;
  function menuIsOpen() { return root.classList.contains('menu-open'); }
  function openMenu() {
    if (menuIsOpen()) return;
    lastFocus = document.activeElement;
    root.classList.add('menu-open');
    menu.inert = false; view.inert = true;
    menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.setAttribute('aria-label', '메인 메뉴 닫기');
    var first = menu.querySelector('a');
    setTimeout(function () { if (menuIsOpen() && first) first.focus({ preventScroll: true }); }, 60);
  }
  function closeMenu(skipFocus) {
    if (!menuIsOpen()) return;
    root.classList.remove('menu-open');
    menu.inert = true; view.inert = false;
    menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', '메인 메뉴 열기');
    if (!skipFocus) menuBtn.focus({ preventScroll: true });
  }
  function buildMenu() {
    var items = [['main', '01', '메인화면', 'HOME', 'home'], ['select', '02', '캐릭터 선택', 'CHARACTER', 'char'], ['gallery', '03', '컨셉아트', 'CONCEPT ART', 'art'], ['notice', '04', '공지', 'NOTICE', 'note']];
    menu.innerHTML = '<p class="menu-label">MENU</p><ul class="menu-list">' +
      items.map(function (it, i) { return '<li style="--i:' + i + '"><a href="#/' + it[0] + '" data-route="' + it[0] + '"><span class="mn">' + it[1] + '</span><span class="mk">' + it[2] + '</span><span class="me">' + it[3] + '</span></a></li>'; }).join('') +
      '</ul><p class="menu-label">CHARACTER</p><ol class="menu-chars">' +
      D.characters.map(function (c, i) { return '<li style="--i:' + (i + 4) + '"><a href="#/char/' + c.id + '" data-route="char" data-char="' + c.id + '" aria-label="' + esc(c.name) + ' 소개">' + pad(c.id) + '</a></li>'; }).join('') +
      '</ol><p class="menu-foot">금색 × 검정 · 임시 일러스트 사용 중</p>';
    menuBtn.addEventListener('click', function () { menuIsOpen() ? closeMenu() : openMenu(); });
    $('scrim').addEventListener('click', function () { closeMenu(); });
    menu.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) closeMenu(true); });
    document.addEventListener('keydown', function (e) {
      if (!menuIsOpen()) return;
      if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
      if (e.key === 'Tab') {
        var links = menu.querySelectorAll('a'), first = links[0], last = links[links.length - 1];
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); menuBtn.focus(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); menuBtn.focus(); }
      }
    });
    $('brand').addEventListener('click', function () { closeMenu(true); });
  }

  /* 어떤 순서로 해시가 바뀌어도 마지막 해시로 수렴한다. */
  async function run(first) {
    busy = true;
    try {
      var guard = 0;
      do {
        var t = canon(location.hash);
        if (!first && t.key === rendered) break;
        if (!first) { navCount++; await cover(t); }
        closeMenu(true);
        var t2 = canon(location.hash);              // 덮는 동안 바뀌었을 수 있으니 최신값으로 그린다
        var v = render(t2); rendered = t2.key;
        await frames(2);
        startView(v);
        if (first) { var b = $('boot'); if (b) b.remove(); } else { await reveal(); view.focus({ preventScroll: true }); }
        first = false;
      } while (canon(location.hash).key !== rendered && ++guard < 40);
    } catch (err) {
      console.error('[router]', err);
      try { clearCurtain(); } catch (e) { }
    } finally {
      busy = false; clearCurtain();
    }
  }
  function onHash() { if (!busy) run(false); }

  function boot() {
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) { }
    if (!D || !A) { view.innerHTML = '<div class="err"><p class="eyebrow">ERROR</p><h1 class="s-title">데이터를 불러오지 못했습니다</h1></div>'; return; }
    $('brandSeal').innerHTML = A.seal();
    buildMenu();
    $('skip').addEventListener('click', function () { view.focus(); });
    window.addEventListener('hashchange', onHash);
    document.addEventListener('visibilitychange', function () { if (document.hidden) root.setAttribute('data-hidden', ''); else root.removeAttribute('data-hidden'); });
    window.addEventListener('pageshow', function (e) { if (e.persisted) { clearCurtain(); onHash(); } });
    run(true);
  }
  boot();

  window.__rc = { state: state, get busy() { return busy; }, get navCount() { return navCount; }, get rendered() { return rendered; } };
})();
