/* 사이트 내용 데이터 — 여기만 고치면 화면에 반영된다.
   - CHARS[].img / CONCEPTS[].img 에 그림 경로(예: "img/char-01.webp")를 넣으면 임시 그림 대신 실제 그림이 나온다.
   - CHARS[].name 등의 문구는 임시 문구다. 정해지면 바꿔 넣는다. */
(function () {
  'use strict';
  const pad = (n) => String(n).padStart(2, '0');

  const NAV = [
    { r: 'main',    ko: '메인',    en: 'HOME',      icon: 'i-home' },
    { r: 'select',  ko: '캐릭터',  en: 'CHARACTER', icon: 'i-char' },
    { r: 'gallery', ko: '컨셉아트', en: 'CONCEPT',   icon: 'i-art' },
    { r: 'notice',  ko: '공지',    en: 'NOTICE',    icon: 'i-note' },
  ];

  const CHARS = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    code: 'CH-' + pad(i + 1),
    ko: '캐릭터 ' + pad(i + 1),
    en: 'CHARACTER ' + pad(i + 1),
    role: '소속·역할 미정',
    lines: [
      '캐릭터 소개문이 들어갈 자리입니다.',
      '설정이 정해지면 이 문단이 소개문으로 바뀝니다.',
    ],
    img: null,
  }));

  const CONCEPTS = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    title: 'CONCEPT ' + pad(i + 1),
    img: null,
  }));

  const PATCHES = [
    {
      v: 'Patch v-1.0.0',
      date: '2026-11-07',
      items: [
        '메인 화면 추가 — 캐릭터 캐러셀, 좌측 메뉴, 우측 상단 메뉴',
        '캐릭터 선택 창 추가',
        '캐릭터 소개 페이지 추가',
        '컨셉아트 갤러리 추가 — 15장, 스크롤로 열람',
        '화면 전환 애니메이션 추가',
        '모바일 화면 지원',
      ],
    },
  ];

  window.RC = { NAV, CHARS, CONCEPTS, PATCHES };
})();
