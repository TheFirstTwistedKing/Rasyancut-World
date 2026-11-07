/* 라시안컷 월드 — 모션 레이어.
   설계 원칙(적대적): 모든 효과는 "꺼져도 사이트가 산다". 루프는 하나(rAF)뿐이고, 구독자가 없거나 탭이 숨겨지면 멈춘다.
   시간·강도·개수는 아래 MOTION 한 곳에서만 고친다. (CSS 쪽 길이는 :root 변수로 내려보낸다.) */
(function () {
  'use strict';

  var MOTION = {
    intro: {
      enabled: true,          // false 면 인트로를 아예 쓰지 않는다
      storageKey: 'rc-intro-seen',
      draw: 1000,             // 문양이 선으로 그려지는 시간(ms)
      wordAt: 620,            // RASYANCUT 글자 등장 시작
      openAt: 1300,           // 화면이 열리기 시작(= 메인 연출 시작, 이후 클릭이 메인에 전달됨)
      open: 650,              // 화면이 열리는 시간
      hardCap: 3000,          // 어떤 일이 있어도 이 시간 안에 인트로를 치운다
      gateMax: 1900           // 메인 시작을 인트로가 붙잡아 둘 수 있는 최대 시간
    },
    breathe: { period: 5600 },                                   // 캐릭터 숨쉬기 주기(ms), 크기 변화는 CSS 의 --m-breath-y
    parallax: { ease: 0.09, touchRange: 120 },                   // 포인터 시차 보간 / 터치 드래그 기준 거리(px)
    dust: { desktop: 24, mobile: 10, alpha: 0.4 },                // 입자 개수(데스크톱/모바일)와 최대 투명도
    sweep: 640,                                                  // 홀로그램 스캔(캐릭터가 바뀔 때) ms
    lightbox: { open: 460, close: 240, slide: 240 },
    details: 340,                                                // 공지 접고 펴기
    lite: { slowMs: 42, sustainMs: 1500 }                        // 프레임 간격(EMA)이 slowMs 를 sustainMs 넘게 넘으면 단계적으로 효과를 줄인다
  };

  var root = document.documentElement;
  var EASE = 'cubic-bezier(.2,.7,.2,1)', EASE_IO = 'cubic-bezier(.7,0,.2,1)';
  var mqReduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var mqCoarse = window.matchMedia ? window.matchMedia('(pointer: coarse)') : { matches: false };
  var canAnimate = typeof Element !== 'undefined' && !!Element.prototype.animate;
  function reduced() { return !!mqReduce.matches; }
  function small() { return !!mqCoarse.matches || window.innerWidth < 768; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function noop() { }
  function cancelAll(list) { (list || []).forEach(function (a) { try { a.cancel(); } catch (e) { } }); }

  root.style.setProperty('--m-breath', MOTION.breathe.period + 'ms');
  root.style.setProperty('--m-sweep', MOTION.sweep + 'ms');

  /* ================= 공용 rAF 루프: 구독자가 있고 탭이 보일 때만 돈다 ================= */
  var subs = [], raf = 0, last = 0, ticks = 0, ema = 16, slowFor = 0, level = 0;
  function degrade() {
    level++; slowFor = 0;
    if (level === 1) root.classList.add('fx-lite1');           // 1단계: 금가루 절반
    if (level >= 2) root.classList.add('fx-lite');             // 2단계: 금가루·숨쉬기·스캔선 끔
  }
  function frame(t) {
    raf = 0;
    if (document.hidden || !subs.length) { last = 0; return; }
    var dt = last ? Math.min(t - last, 100) : 16;
    last = t; ticks++;
    ema += (dt - ema) * 0.1;
    if (ema > MOTION.lite.slowMs && level < 2) { slowFor += dt; if (slowFor > MOTION.lite.sustainMs) degrade(); } else slowFor = 0;
    var copy = subs.slice();
    for (var i = 0; i < copy.length; i++) { try { copy[i].fn(dt, t); } catch (e) { console.error('[fx]', e); } }
    if (subs.length) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && subs.length && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
  function loop(fn) {
    var s = { fn: fn };
    subs.push(s); kick();
    return function stop() {
      var i = subs.indexOf(s); if (i >= 0) subs.splice(i, 1);
      if (!subs.length && raf) { cancelAnimationFrame(raf); raf = 0; last = 0; }
    };
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = 0; } last = 0; } else kick();
  });

  /* ================= 입장 인트로 ================= */
  var gateResolve = null, gate = Promise.resolve(), intro = null;
  var SVGNS = 'http://www.w3.org/2000/svg';

  function shouldIntro() {
    var c = MOTION.intro;
    if (!c.enabled || reduced() || !canAnimate) return false;
    var h = (location.hash || '').replace(/^#\/?/, '');
    if (h && h !== 'main') return false;                 // 깊은 링크(#/char/3 등)는 인트로 없이 바로 그 화면
    try {
      if (sessionStorage.getItem(c.storageKey)) return false;
      sessionStorage.setItem(c.storageKey, '1');         // 시작할 때 표시: 인트로 도중 새로고침해도 다시 재생하지 않는다
    } catch (e) { /* 저장소를 못 쓰면 매번 재생 */ }
    return true;
  }

  function buildIntro() {
    var el = document.createElement('div');
    el.className = 'intro'; el.id = 'intro';
    var letters = 'RASYANCUT'.split('').map(function (ch) { return '<span>' + ch + '</span>'; }).join('');
    el.innerHTML =
      '<div class="in-half in-top"></div><div class="in-half in-bot"></div>' +
      '<div class="in-bloom"></div><div class="in-line"></div>' +
      '<div class="in-center" aria-hidden="true">' +
      '<svg class="in-seal" viewBox="0 0 160 160" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="miter">' +
      '<circle class="p" pathLength="1" cx="80" cy="80" r="72"/>' +
      '<path class="p" pathLength="1" d="M80 10 L150 80 L80 150 L10 80Z"/>' +
      '<path class="p" pathLength="1" d="M80 42 L118 80 L80 118 L42 80Z"/>' +
      '<path class="p" pathLength="1" d="M10 80 H42 M118 80 H150 M80 0 V10 M80 150 V160"/>' +
      '<path class="ctr" d="M80 66 L94 80 L80 94 L66 80Z" fill="currentColor" stroke="none"/></svg>' +
      '<p class="in-word">' + letters + '</p></div>' +
      '<button type="button" class="in-skip">건너뛰기</button>';
    return el;
  }

  function startIntro() {
    var C = MOTION.intro, el = buildIntro(), done = false, timers = [], anims = [], opened = false;
    gate = new Promise(function (r) { gateResolve = r; });
    var wd = setTimeout(function () { gateOpen(); }, C.gateMax);
    function gateOpen() { clearTimeout(wd); if (gateResolve) { var r = gateResolve; gateResolve = null; r(); } }
    function A(node, kf, opt) { var a = node.animate(kf, opt); anims.push(a); return a; }
    function T(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function q(sel) { return el.querySelector(sel); }

    function finish(fast) {
      if (done) return; done = true;
      timers.forEach(clearTimeout); gateOpen();
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('pageshow', onShow);
      el.style.pointerEvents = 'none';
      var kill = function () { cancelAll(anims); if (el.parentNode) el.parentNode.removeChild(el); root.classList.remove('intro-on'); intro = null; };
      if (fast && el.animate) {
        try { var f = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' }); f.finished.then(kill, kill); } catch (e) { kill(); }
        setTimeout(kill, 400);
      } else kill();
    }
    function onKey(e) {
      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;
      if (!opened) e.stopImmediatePropagation();         // 건너뛰려고 누른 키가 메인의 방향키 동작으로 새지 않게
      finish(true);
    }
    function onHash() { finish(true); }
    function onShow(e) { if (e.persisted) finish(false); }
    el.addEventListener('click', function () { finish(true); });
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('hashchange', onHash);
    window.addEventListener('pageshow', onShow);

    root.classList.add('intro-on');
    document.body.appendChild(el);

    var ps = [].slice.call(el.querySelectorAll('.p'));
    ps.forEach(function (p, i) {
      p.style.strokeDasharray = '1'; p.style.strokeDashoffset = '1';
      A(p, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: C.draw * (i === 0 ? .8 : .7), delay: i * C.draw * .1, easing: EASE_IO, fill: 'both' });
    });
    A(q('.ctr'), [{ opacity: 0 }, { opacity: 1 }], { duration: 320, delay: C.draw * .75, fill: 'both' });
    A(q('.in-line'), [{ transform: 'scaleX(0)', opacity: 1 }, { transform: 'scaleX(1)', opacity: 1 }], { duration: 520, delay: C.wordAt - 120, easing: EASE, fill: 'both' });
    [].forEach.call(el.querySelectorAll('.in-word span'), function (s, i) {
      A(s, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 360, delay: C.wordAt + i * 42, easing: EASE, fill: 'both' });
    });
    A(q('.in-skip'), [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 500, fill: 'both' });

    T(function () {
      opened = true; gateOpen();
      el.style.pointerEvents = 'none';
      A(q('.in-center'), [{ opacity: 1 }, { opacity: 0 }], { duration: 240, fill: 'forwards' });
      A(q('.in-skip'), [{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' });
      A(q('.in-line'), [{ opacity: 1 }, { opacity: 0 }], { duration: C.open * .7, delay: 120, fill: 'forwards' });
      A(q('.in-bloom'), [{ transform: 'scale(.3)', opacity: 0 }, { opacity: 1, offset: .35 }, { transform: 'scale(1.5)', opacity: 0 }], { duration: C.open + 150, easing: EASE, fill: 'forwards' });
      A(q('.in-top'), [{ transform: 'none' }, { transform: 'translateY(-101%)' }], { duration: C.open, easing: EASE_IO, fill: 'forwards' });
      A(q('.in-bot'), [{ transform: 'none' }, { transform: 'translateY(101%)' }], { duration: C.open, easing: EASE_IO, fill: 'forwards' });
    }, C.openAt);
    T(function () { finish(false); }, C.openAt + C.open + 60);
    T(function () { finish(true); }, C.hardCap);
    intro = { skip: function () { finish(true); } };
  }

  try { if (shouldIntro()) startIntro(); } catch (e) { console.error('[intro]', e); gate = Promise.resolve(); root.classList.remove('intro-on'); var stale = document.getElementById('intro'); if (stale) stale.remove(); }

  /* ================= 시차: 마우스는 화면 전체, 터치는 스테이지를 끌 때만 ================= */
  function pointerFx(ctx, host, touchHost, apply) {
    if (reduced()) return;
    var cx = 0, cy = 0, tx = 0, ty = 0, stop = null, down = false, sx = 0, ease = MOTION.parallax.ease, range = MOTION.parallax.touchRange;
    function step(dt) {
      var k = 1 - Math.pow(1 - ease, dt / 16.7);
      cx += (tx - cx) * k; cy += (ty - cy) * k;
      if (Math.abs(tx - cx) < 0.003 && Math.abs(ty - cy) < 0.003) { cx = tx; cy = ty; apply(cx, cy); if (stop) { stop(); stop = null; } return; }
      apply(cx, cy);
    }
    function go() { if (!stop) stop = loop(step); }
    ctx.on(host, 'pointermove', function (e) {
      if (e.pointerType === 'touch') {
        if (!down) return;
        tx = clamp((e.clientX - sx) / range, -1, 1); ty = 0; go(); return;
      }
      var r = host.getBoundingClientRect();
      tx = clamp(((e.clientX - r.left) / r.width - .5) * 2, -1, 1); ty = clamp(((e.clientY - r.top) / r.height - .5) * 2, -1, 1); go();
    });
    ctx.on(host, 'pointerleave', function (e) { if (e.pointerType === 'touch') return; tx = 0; ty = 0; go(); });
    ctx.on(touchHost, 'pointerdown', function (e) { if (e.pointerType === 'touch') { down = true; sx = e.clientX; } });
    var up = function () { if (!down) return; down = false; tx = 0; ty = 0; go(); };
    ctx.on(host, 'pointerup', up); ctx.on(host, 'pointercancel', up);
    ctx.cleanups.push(function () { if (stop) { stop(); stop = null; } apply(0, 0); });
  }

  /* ================= 금가루 (메인 전용, 절제) =================
     측정 결과: rAF 로 그리는 캔버스는 입자 30개여도 메인 스레드를 초당 약 100ms 쓴다(빈 rAF 루프만으로도 같은 비용).
     그래서 입자는 transform/opacity 만 쓰는 CSS 애니메이션(컴포지터 전용)으로 만들고, JS 는 배치만 한다. */
  function dust(ctx, host, stageEl, avoidEls) {
    if (reduced() || !host || !stageEl) return;
    var box = document.createElement('div');
    box.className = 'fx-dust'; box.setAttribute('aria-hidden', 'true');
    host.appendChild(box);
    var io = null, ro = null, timer = 0;
    function build() {
      var hr = host.getBoundingClientRect(), sr = stageEl.getBoundingClientRect();
      if (!sr.width || !sr.height) return;
      box.style.left = (sr.left - hr.left) + 'px'; box.style.top = (sr.top - hr.top) + 'px';
      box.style.width = sr.width + 'px'; box.style.height = sr.height + 'px';
      // 글자(캐러셀 번호, 좌측 메뉴, 소개 영역) 뒤로는 입자가 지나가지 않도록 그 가로 범위를 피한다
      var cut = (avoidEls || []).filter(Boolean).map(function (e) { var r = e.getBoundingClientRect(); return [r.left - sr.left - 16, r.right - sr.left + 16]; });
      var n = small() ? MOTION.dust.mobile : MOTION.dust.desktop, html = '', tries, x, ok, i, k;
      for (i = 0; i < n; i++) {
        for (tries = 0, ok = false; tries < 12 && !ok; tries++) {
          x = Math.random() * sr.width; ok = true;
          for (k = 0; k < cut.length; k++) if (x > cut[k][0] && x < cut[k][1]) { ok = false; break; }
        }
        if (!ok) continue;
        var dur = 14 + Math.random() * 14;
        html += '<i style="left:' + x.toFixed(1) + 'px;--dur:' + dur.toFixed(1) + 's;--dl:-' + (Math.random() * dur).toFixed(1) + 's;--dx:' + ((Math.random() - .5) * 28).toFixed(1) + 'px;--a:' + (MOTION.dust.alpha * (0.5 + Math.random() * 0.5)).toFixed(2) + '"></i>';
      }
      box.innerHTML = html; box.style.setProperty('--h', sr.height);
    }
    build();
    if ('ResizeObserver' in window) {
      var first = true;
      ro = new ResizeObserver(function () { if (first) { first = false; return; } clearTimeout(timer); timer = setTimeout(build, 120); });
      ro.observe(stageEl);
    } else ctx.on(window, 'resize', build);
    if ('IntersectionObserver' in window) {                       // 화면 밖이면 입자 애니메이션을 멈춘다
      io = new IntersectionObserver(function (es) { box.classList.toggle('idle', !es[es.length - 1].isIntersecting); }, { threshold: 0 });
      io.observe(box);
    }
    var again = setTimeout(build, 700);                           // 글꼴이 바뀌어 글자 영역이 달라졌을 수 있다
    // 성능 프로브: 시작 후 4초만 프레임 간격을 본다(상시 루프 아님). 느리면 단계적으로 줄이고, 끝내 느리면 끈다.
    var stopProbe = loop(noop), pt = setTimeout(function () { stopProbe(); }, 4200);
    ctx.cleanups.push(function () {
      clearTimeout(timer); clearTimeout(again); clearTimeout(pt); stopProbe();
      if (io) io.disconnect(); if (ro) ro.disconnect();
      if (box.parentNode) box.parentNode.removeChild(box);
    });
  }

  /* ================= 홀로그램 스캔: 이미지가 아래에서 위로 "출력"되고 선이 그 끝을 따라간다 ================= */
  function cancelFx(node) { if (node && node._fx) { cancelAll(node._fx); node._fx = null; } }
  function sweep(stage, img, line, ms) {
    if (reduced() || !canAnimate || !img) return;
    cancelFx(img);
    var dur = ms || MOTION.sweep, list = [];
    list.push(img.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)' }], { duration: dur, easing: EASE_IO }));
    img._fx = list;
    if (line && stage) {
      line.getAnimations().forEach(function (a) { a.cancel(); });
      var sr = stage.getBoundingClientRect(), ir = img.getBoundingClientRect();
      var y0 = ir.bottom - sr.top, y1 = ir.top - sr.top;
      line.animate([{ transform: 'translateY(' + y0 + 'px)', opacity: .9 }, { transform: 'translateY(' + y1 + 'px)', opacity: .9, offset: .9 }, { transform: 'translateY(' + y1 + 'px)', opacity: 0 }], { duration: dur, easing: EASE_IO });
    }
  }
  function reveal(img, ms) {            // 선 없이 같은 방식으로 나타남(선택 카드)
    if (reduced() || !canAnimate || !img) return;
    cancelFx(img);
    img._fx = [img.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)' }], { duration: ms || 420, easing: EASE_IO })];
  }

  /* ================= 라이트박스: 클릭한 그림에서 커지며 열리고, 그 자리로 돌아가며 닫힌다 ================= */
  function flipTransform(from, to) {
    return 'translate(' + (from.left - to.left) + 'px,' + (from.top - to.top) + 'px) scale(' + (from.width / to.width) + ',' + (from.height / to.height) + ')';
  }
  function lbOpen(dlg, img, bar, fromEl) {
    if (reduced() || !canAnimate || !fromEl) return;
    var fr = fromEl.getBoundingClientRect(), to = img.getBoundingClientRect();
    if (!fr.width || !to.width) return;
    cancelAll(img.getAnimations()); cancelAll(bar.getAnimations());
    var tok = dlg._tok = (dlg._tok || 0) + 1;                 // 늦게 도착한 정리 콜백(취소·타이머)이 새 연출의 클래스를 지우지 않게 한다
    dlg.classList.add('lb-fly'); img.style.transformOrigin = '0 0';
    var d = MOTION.lightbox.open;
    var a = img.animate([{ transform: flipTransform(fr, to), opacity: .5 }, { transform: 'none', opacity: 1 }], { duration: d, easing: EASE });
    bar.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: d * .5, easing: EASE, fill: 'backwards' });
    var clean = function () { if (dlg._tok !== tok) return; dlg.classList.remove('lb-fly'); img.style.transformOrigin = ''; };
    a.finished.then(clean, clean);
    setTimeout(clean, d + 400);
  }
  function lbClose(dlg, img, bar, toEl, done) {
    var fin = false, tok = dlg._tok = (dlg._tok || 0) + 1;
    function end() { if (fin || dlg._tok !== tok) return; fin = true; dlg.classList.remove('lb-fly', 'lb-closing'); img.style.transformOrigin = ''; done(); cancelAll(img.getAnimations()); cancelAll(bar.getAnimations()); }
    if (reduced() || !canAnimate) { end(); return; }
    cancelAll(img.getAnimations()); cancelAll(bar.getAnimations());
    var d = MOTION.lightbox.close, from = img.getBoundingClientRect(), tr = toEl && toEl.getBoundingClientRect();
    dlg.classList.add('lb-fly', 'lb-closing'); img.style.transformOrigin = '0 0';
    var onScreen = tr && tr.width && tr.bottom > 0 && tr.top < window.innerHeight && tr.right > 0 && tr.left < window.innerWidth;
    var a = img.animate(onScreen ? [{ transform: 'none', opacity: 1 }, { transform: flipTransform(tr, from), opacity: .4 }] : [{ transform: 'none', opacity: 1 }, { transform: 'scale(.96)', opacity: 0 }], { duration: d, easing: EASE_IO, fill: 'forwards' });
    bar.animate([{ opacity: 1 }, { opacity: 0 }], { duration: d * .5, fill: 'forwards' });
    a.finished.then(end, end);
    setTimeout(end, d + 250);
  }
  function lbSlide(img, dir) {
    if (reduced() || !canAnimate || !dir) return;
    cancelAll(img.getAnimations());
    img.animate([{ opacity: 0, transform: 'translateX(' + (dir > 0 ? 28 : -28) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: MOTION.lightbox.slide, easing: EASE });
  }

  /* ================= 공지 접고 펴기: 높이를 애니메이션하지 않고 transform + clip-path 로 (FLIP) ================= */
  function endDetails(det) { var f = det._fxEnd; if (f) { det._fxEnd = null; f(); } }
  function toggleDetails(det) {
    var body = det.querySelector('.pbody');
    if (reduced() || !canAnimate || !body) return false;           // false → 브라우저 기본 동작에 맡긴다
    endDetails(det);
    var opening = !det.open, sibs = [], n = det.nextElementSibling, ended = false, list = [];
    for (; n; n = n.nextElementSibling) sibs.push(n);
    var h0 = det.getBoundingClientRect().height, d;
    if (opening) { det.open = true; d = det.getBoundingClientRect().height - h0; }
    else { d = body.getBoundingClientRect().height; det.classList.add('closing'); }
    if (!(d > 1)) { if (!opening) { det.classList.remove('closing'); det.open = false; } return true; }
    var o = { duration: MOTION.details, easing: EASE_IO, fill: 'both' };
    if (opening) {
      list.push(body.animate([{ clipPath: 'inset(0 0 ' + d + 'px 0)', opacity: 0 }, { clipPath: 'inset(0 0 0px 0)', opacity: 1 }], o));
      sibs.forEach(function (s) { list.push(s.animate([{ transform: 'translateY(' + (-d) + 'px)' }, { transform: 'none' }], o)); });
    } else {
      list.push(body.animate([{ clipPath: 'inset(0 0 0px 0)', opacity: 1 }, { clipPath: 'inset(0 0 ' + d + 'px 0)', opacity: 0 }], o));
      sibs.forEach(function (s) { list.push(s.animate([{ transform: 'none' }, { transform: 'translateY(' + (-d) + 'px)' }], o)); });
    }
    function end() {
      if (ended) return; ended = true; det._fxEnd = null;
      if (!opening) det.open = false;                              // 레이아웃이 줄어드는 순간과 transform 취소가 같은 틱에서 일어난다
      cancelAll(list); det.classList.remove('closing');
    }
    det._fxEnd = end;
    Promise.all(list.map(function (a) { return a.finished; })).then(end, end);
    setTimeout(end, MOTION.details + 250);
    return true;
  }

  window.RC_MOTION = {
    cfg: MOTION, reduced: reduced, small: small, loop: loop,
    introGate: function () { return gate; },
    introActive: function () { return !!intro; },
    pointerFx: pointerFx, dust: dust, sweep: sweep, reveal: reveal,
    lbOpen: lbOpen, lbClose: lbClose, lbSlide: lbSlide, toggleDetails: toggleDetails, endDetails: endDetails,
    stats: function () { return { subs: subs.length, raf: !!raf, ticks: ticks, level: level, dustBoxes: document.querySelectorAll('.fx-dust').length, dustParticles: document.querySelectorAll('.fx-dust i').length, intro: !!intro }; }
  };
})();
