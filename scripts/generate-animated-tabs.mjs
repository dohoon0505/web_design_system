#!/usr/bin/env node
/**
 * Web Reference Lab — Category Generator: Animated Tabs (v1)
 * stripe.com 제품 페이지 탭 표준 참고 — 10종 애니메이티드 탭 인터랙션 카탈로그
 *
 * - 클릭 전환 인터랙션 (탭 4개 + 콘텐츠 패널: 한국어 카피 + 미니 그라디언트 아트워크)
 * - 인디케이터 표준 기법: offsetLeft/offsetWidth 측정 → transform(translateX)+width 적용
 * - 검정 배경(#000) + Pretendard Variable + 한국어 라벨
 * - ↻ 다시 보기 = 첫 탭으로 초기화 (window.__reset)
 *
 * Usage: node scripts/generate-animated-tabs.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'animated-tabs');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'animated-tabs');

const CATEGORY = {
  id: 'animated-tabs',
  title: '애니메이티드 탭',
  type: 'category',
  date: '2026-06-10',
  url: 'https://stripe.com',
  summary: '활성 인디케이터가 미끄러지듯 따라오는 탭 전환 10종. 세그먼티드 컨트롤·언더라인·콘텐츠 크로스페이드·호버 스포트라이트·버티컬 레일·카운트 뱃지·가변 폭 필·패널 슬라이드·아이콘 팝·오토 프로그레스 — SaaS 제품 페이지·가격표 토글의 표준 내비게이션 문법을 비교 카탈로그로 정리. 인디케이터 위치·폭은 offsetLeft/offsetWidth 측정 후 transform을 적용하는 것이 표준 기법.'
};

/* ================================================================
   탭 콘텐츠 세트 (탭 4개 + 패널: 한국어 카피 + 그라디언트 아트)
   ================================================================ */

const SAAS = [
  { label: '개요', title: '한눈에 보는 대시보드', body: '제품의 핵심 지표를 실시간으로 모아 보여줍니다. 팀 전체가 같은 화면을 보며 의사결정을 내릴 수 있습니다.', art: 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)' },
  { label: '기능', title: '모듈형 워크플로', body: '자동화 규칙부터 권한 관리까지 필요한 기능만 골라 켤 수 있습니다. 설정은 전부 코드 없이 끝납니다.', art: 'linear-gradient(135deg,#06b6d4 0%,#3b82f6 100%)' },
  { label: '요금', title: '쓴 만큼만 청구', body: '종량제와 고정 요금제 중 선택할 수 있고, 14일 무료 체험 동안 모든 기능이 열립니다.', art: 'linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)' },
  { label: '문의', title: '24시간 안에 답변', body: '도입 상담과 기술 지원 모두 채팅과 이메일로 받습니다. 평일 기준 24시간 안에 답변드립니다.', art: 'linear-gradient(135deg,#10b981 0%,#14b8a6 100%)' }
];

const SETTINGS = [
  { label: '프로필', title: '프로필 설정', body: '이름·아바타·소개를 수정합니다. 변경 사항은 저장 즉시 팀 전체 워크스페이스에 반영됩니다.', art: 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)' },
  { label: '알림', title: '알림 설정', body: '채널별로 알림 수준을 조절합니다. 방해 금지 시간을 지정하면 그동안의 알림은 요약으로 모아 받습니다.', art: 'linear-gradient(135deg,#06b6d4 0%,#3b82f6 100%)' },
  { label: '보안', title: '보안 설정', body: '2단계 인증과 로그인 기록을 관리합니다. 의심스러운 접속은 즉시 이메일로 알려드립니다.', art: 'linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)' },
  { label: '결제', title: '결제 설정', body: '카드 정보와 청구서 수신 이메일을 관리합니다. 영수증은 매월 1일 자동으로 발송됩니다.', art: 'linear-gradient(135deg,#10b981 0%,#14b8a6 100%)' }
];

const WORK = [
  { label: '전체', n: 24, title: '모든 작업 24건', body: '이번 스프린트에 등록된 전체 작업입니다. 마감일 순으로 정렬되어 가장 급한 일이 먼저 보입니다.', art: 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)' },
  { label: '진행 중', n: 8, title: '진행 중 8건', body: '지금 누군가 작업하고 있는 항목입니다. 담당자 아바타와 마지막 업데이트 시각이 함께 표시됩니다.', art: 'linear-gradient(135deg,#06b6d4 0%,#3b82f6 100%)' },
  { label: '완료', n: 12, title: '완료 12건', body: '이번 주에 닫힌 작업입니다. 완료 항목은 7일 뒤 자동으로 아카이브로 이동합니다.', art: 'linear-gradient(135deg,#10b981 0%,#14b8a6 100%)' },
  { label: '보류', n: 4, title: '보류 4건', body: '외부 응답을 기다리는 작업입니다. 보류 사유와 재개 예정일을 메모로 남길 수 있습니다.', art: 'linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)' }
];

const NAV = [
  { label: '홈', title: '서비스 홈', body: '브랜드 메시지와 핵심 CTA가 모인 첫 화면입니다. 라벨이 가장 짧은 탭으로 필 폭이 최소가 됩니다.', art: 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)' },
  { label: '제품 기능', title: '제품 기능 살펴보기', body: '핵심 기능 6가지를 카드 그리드로 소개합니다. 중간 길이 라벨 — 필 폭이 한 단계 늘어납니다.', art: 'linear-gradient(135deg,#06b6d4 0%,#3b82f6 100%)' },
  { label: '고객 사례 모음', title: '고객 사례 모음', body: '업종별 도입 사례와 성과 지표를 모았습니다. 가장 긴 라벨로 필 폭 모핑이 가장 크게 보입니다.', art: 'linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)' },
  { label: '문의', title: '도입 문의', body: '팀 규모와 요구 사항을 남기면 영업팀이 연락드립니다. 다시 짧은 라벨로 필이 수축합니다.', art: 'linear-gradient(135deg,#10b981 0%,#14b8a6 100%)' }
];

const SHOWCASE = [
  { label: '디자인', title: '01 디자인', body: '컴포넌트 라이브러리에서 블록을 끌어다 화면을 조립합니다. 디자인 토큰은 코드와 자동 동기화됩니다.', art: 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)' },
  { label: '개발', title: '02 개발', body: '디자인이 곧 코드입니다. 변경 사항은 풀 리퀘스트로 만들어져 리뷰 후 머지됩니다.', art: 'linear-gradient(135deg,#06b6d4 0%,#3b82f6 100%)' },
  { label: '배포', title: '03 배포', body: '머지하면 프리뷰 환경에 즉시 배포됩니다. 롤백은 클릭 한 번으로 끝납니다.', art: 'linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)' },
  { label: '분석', title: '04 분석', body: '배포 후 전환율과 성능 지표를 자동 수집합니다. 이상 징후는 슬랙으로 바로 알려드립니다.', art: 'linear-gradient(135deg,#10b981 0%,#14b8a6 100%)' }
];

/* ================================================================
   HTML 빌더 헬퍼
   ================================================================ */

function tabBtns(set, inner) {
  return set.map(function (c, i) {
    var content = inner ? inner(c, i) : c.label;
    return '    <button class="tab" id="tab-' + i + '" role="tab" aria-selected="' + (i === 0 ? 'true' : 'false') + '" aria-controls="panel-' + i + '">' + content + '</button>';
  }).join('\n');
}

function panelsHTML(set, opts) {
  opts = opts || {};
  var inner = set.map(function (c, i) {
    var hidden = opts.track ? '' : (i === 0 ? '' : ' hidden');
    return '    <div class="panel" id="panel-' + i + '" role="tabpanel" aria-labelledby="tab-' + i + '"' + hidden + '>\n'
      + '      <div class="panel-art" style="background:' + c.art + '"></div>\n'
      + '      <h2 class="panel-title">' + c.title + '</h2>\n'
      + '      <p class="panel-body">' + c.body + '</p>\n'
      + '    </div>';
  }).join('\n');
  if (opts.track) {
    return '<div class="panels">\n    <div class="track">\n' + inner + '\n    </div>\n  </div>';
  }
  return '<div class="panels">\n' + inner + '\n  </div>';
}

/* ================================================================
   공통 CSS / 공통 JS 코어
   ================================================================ */

const BASE_CSS = ''
  + '.stage {\n'
  + '  min-height: 100vh; display: flex; flex-direction: column;\n'
  + '  align-items: center; justify-content: center;\n'
  + '  gap: 28px; padding: 64px 24px 48px;\n'
  + '}\n'
  + '.tablist { position: relative; display: inline-flex; align-items: center; }\n'
  + '.tab {\n'
  + '  position: relative; z-index: 1; appearance: none; border: 0; background: transparent;\n'
  + '  cursor: pointer; font: 600 14px/1 "Pretendard Variable","Pretendard",sans-serif;\n'
  + '  color: rgba(255,255,255,0.55); padding: 10px 18px; border-radius: 999px;\n'
  + '  transition: color 0.18s ease; -webkit-tap-highlight-color: transparent;\n'
  + '}\n'
  + '.tab:hover { color: rgba(255,255,255,0.85); }\n'
  + '.tab[aria-selected="true"] { color: #fff; }\n'
  + '.panels { position: relative; width: min(520px, 88vw); }\n'
  + '.panel {\n'
  + '  background: rgba(255,255,255,0.045); border: 1px solid rgba(255,255,255,0.09);\n'
  + '  border-radius: 16px; padding: 22px;\n'
  + '}\n'
  + '.panel[hidden] { display: none; }\n'
  + '.panel-art { height: 110px; border-radius: 10px; margin: 0 0 16px; }\n'
  + '.panel-title { margin: 0 0 8px; font: 700 17px/1.35 "Pretendard Variable","Pretendard",sans-serif; color: #fff; letter-spacing: -0.01em; }\n'
  + '.panel-body { margin: 0; font: 400 14px/1.7 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.62); }\n';

const JS_CORE = ''
  + 'var tabs = [].slice.call(document.querySelectorAll(".tab"));\n'
  + 'var panels = [].slice.call(document.querySelectorAll(".panel"));\n'
  + 'var current = 0;\n'
  + 'function showPanel(i){ panels.forEach(function(pn, j){ pn.hidden = j !== i; }); }\n'
  + 'function select(i){\n'
  + '  var prev = current; current = i;\n'
  + '  tabs.forEach(function(t, j){ t.setAttribute("aria-selected", j === i ? "true" : "false"); });\n'
  + '  update(i, prev);\n'
  + '}\n'
  + 'tabs.forEach(function(t, i){ t.addEventListener("click", function(){ select(i); }); });\n'
  + 'document.querySelector(".tablist").addEventListener("keydown", function(e){\n'
  + '  var dir = (e.key === "ArrowRight" || e.key === "ArrowDown") ? 1 : ((e.key === "ArrowLeft" || e.key === "ArrowUp") ? -1 : 0);\n'
  + '  if (!dir) return;\n'
  + '  e.preventDefault();\n'
  + '  var n = (current + dir + tabs.length) % tabs.length;\n'
  + '  select(n); tabs[n].focus();\n'
  + '});\n'
  + 'window.addEventListener("resize", function(){ update(current, current); });\n'
  + 'window.__reset = function(){ select(0); };\n'
  + 'select(0);';

/* ================================================================
   10 패턴 정의
   ================================================================ */

const PATTERNS = [
];
