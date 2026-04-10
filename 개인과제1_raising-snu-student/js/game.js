'use strict';

/* ══════════════════════════════════════════════════
   데이터 정의
══════════════════════════════════════════════════ */

const CHAPTERS = [
  {
    yearLabel: '1학년', nextLabel: '2학년', needed: 5, spaceCount: 10,
    missions: [
      { name: '대학글쓰기 1 과제 하기',  satire: '마감 3시간 전, 처음으로 도서관을 찾았다. 좌석은 이미 없었다.' },
      { name: '동기들과 과팅하기',        satire: '서울대생이라 했더니 상대방 표정이 묘하게 굳었다.' },
      { name: '자휴하고 한강가기',        satire: '드디어 자유다. 그런데 혼자였다.' },
      { name: '선배들과 밥약하기',        satire: '\'취업 걱정은 나중에.\' 선배의 말이 불길하게 들렸다.' },
    ],
    events: ['새내기 배움터 다녀오기'],
  },
  {
    yearLabel: '2학년', nextLabel: '3학년', needed: 10, spaceCount: 15, /* FIX #4: +5/챕터 기준 */
    missions: [
      { name: '교양수업 과제 하기',  satire: '교양이었지만 결코 교양스럽지 않았다.' },
      { name: '시험 응시하기',        satire: '공부한 것만 나왔다면 만점이었을 것이다.' },
      { name: '주말에 야구보기',      satire: '경기는 졌다. 그래도 맥주는 맛있었다.' },
      { name: '후배들과 밥약하기',    satire: '이제 내가 선배가 됐다. 어제 일처럼 느껴졌다.' },
    ],
    events: ['과제 오제출', '애인과의 다툼'],
  },
  {
    yearLabel: '3학년', nextLabel: '4학년', needed: 15, spaceCount: 20,
    missions: [
      { name: '전공 팀플 회의하기',    satire: '2시간 회의, 결론은 \'다음에 다시 얘기하자\'였다.' },
      { name: '랩실에서 밤샘하기',     satire: '새벽 3시, 교수님 메일이 왔다. 오탈자 하나를 지적하셨다.' },
      { name: '시험 응시하기',          satire: '범위가 전부였다. 전부가 문제였다.' },
      { name: '동아리 임원진 회의하기', satire: '안건은 3개, 회의는 3시간, 해결된 것은 0개.' },
    ],
    events: ['소개팅', '지도교수님 미팅', '과제전'],
  },
  {
    yearLabel: '4학년', nextLabel: '졸업', needed: 20, spaceCount: 25,
    missions: [
      { name: '졸업논문 초안 작성하기', satire: '교수님이 \'좀 더 생각해보세요\'라 하셨다. 일곱 번째였다.' },
      { name: '피칭 준비하기',           satire: '발표 5분 전, 마지막 슬라이드가 사라졌다.' },
      { name: '인턴 면접보기',           satire: '\'서울대 나왔으면 잘하겠죠?\' 기대가 부담이 됐다.' },
      { name: '시험 응시하기',           satire: '마지막 학기 시험이었다. 그래도 어려웠다.' },
    ],
    events: ['취업설명회 방문', '학회 홈커밍 준비', '프로젝트 피칭', '졸업 논문쓰기'],
  },
];

const ARROW_KEYS  = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
const ARROW_SYM   = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
const MISSION_TIME = 30;
const MAX_QUEUE    = 6;

/* ══════════════════════════════════════════════════
   게임 상태
══════════════════════════════════════════════════ */

let G          = {};
let queue      = [];
let sel        = [];
let midCtr     = 0;
let addTimer   = null;
let tickFn     = null;
let isEvActive = false;
let isPaused   = false;
let stats      = { done: 0, failed: 0, evTotal: 0, evDone: 0 };

// 이벤트 리스너 참조 (cleanup용)
let evSpaceFn = null;
let evTickFn  = null;

/* ══════════════════════════════════════════════════
   화면 전환
══════════════════════════════════════════════════ */

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

/* ══════════════════════════════════════════════════
   타이틀 → 프롤로그
══════════════════════════════════════════════════ */

function showPrologue() {
  showScreen('prologue');
  const TEXT = '나는 26년 3월, 서울대학교 26학번으로 입학했다.\n\n입학부터 졸업까지,\n무사히 완수해보자!';
  const el   = document.getElementById('prologue-text');
  el.textContent = '';
  let i = 0;
  const t = setInterval(() => {
    if (i < TEXT.length) { el.textContent += TEXT[i++]; }
    else { clearInterval(t); document.getElementById('btn-start').classList.remove('hidden'); }
  }, 55);
}

/* ══════════════════════════════════════════════════
   챕터 시작
══════════════════════════════════════════════════ */

function startChapter(chIdx, opts) {
  G = {
    ch:          chIdx,
    hp:          opts ? opts.hp    : 100,
    lives:       opts ? opts.lives : 3,
    done:        0,
    evTriggered: 0,
  };
  queue  = [];
  sel    = [];
  midCtr = 0;
  isEvActive = false;
  isPaused   = false;
  stopTimers();
  cleanupEvent();

  showScreen('game');
  renderHUD();
  updateGauge();
  renderMissionGrid();
  renderSelBar();

  addMission(); addMission(); addMission();
  addTimer = setInterval(addMission, 3000); /* FIX #3: 5초 → 3초 */
  tickFn   = setInterval(tickMissions, 1000);
}

/* ══════════════════════════════════════════════════
   미션 추가
══════════════════════════════════════════════════ */

function addMission() {
  if (isEvActive || isPaused || queue.length >= MAX_QUEUE) return;
  const ch    = CHAPTERS[G.ch];
  const mData = ch.missions[Math.floor(Math.random() * ch.missions.length)];
  /* FIX #5-3: 챕터별 방향키 수 스케일 (Ch1:4, Ch2:5, Ch3-4:6, 최대 6) */
  const len   = Math.min(4 + G.ch, 6);
  const arrows = Array.from({ length: len }, () =>
    ARROW_KEYS[Math.floor(Math.random() * 4)]
  );
  queue.push({ id: ++midCtr, name: mData.name, satire: mData.satire, arrows, timeLeft: MISSION_TIME });
  renderMissionGrid();
}

/* ══════════════════════════════════════════════════
   미션 타이머 틱 (1초마다)
══════════════════════════════════════════════════ */

function tickMissions() {
  if (isEvActive || isPaused) return;
  const expired = [];
  queue.forEach(m => { if (--m.timeLeft <= 0) expired.push(m.id); });
  if (expired.length > 0) {
    queue = queue.filter(m => !expired.includes(m.id));
    stats.failed += expired.length;
    sel = [];
    expired.forEach(() => loseHp(10));
    renderMissionGrid();
    renderSelBar();
  } else {
    renderMissionGrid(); // 타이머 색상 업데이트
  }
}

/* ══════════════════════════════════════════════════
   방향키 입력 처리
══════════════════════════════════════════════════ */

function handleArrowKey(key) {
  if (isEvActive || isPaused || !ARROW_SYM[key]) return;

  sel.push(key);

  // sel이 prefix로 유효한 미션
  const valid = queue.filter(m =>
    sel.length <= m.arrows.length &&
    sel.every((k, i) => m.arrows[i] === k)
  );

  if (valid.length === 0) {
    shakeAndFlash();
    sel = [];
    renderMissionGrid();
    renderSelBar();
    return;
  }

  // 완전 일치하는 미션
  const full = valid.find(m => m.arrows.length === sel.length);
  if (full) {
    doCompleteMission(full);
    sel = [];
  }

  renderSelBar();
  renderMissionGrid();
}

function cancelSel() {
  if (isEvActive || isPaused) return;
  sel = [];
  renderSelBar();
  renderMissionGrid();
}

/* ══════════════════════════════════════════════════
   미션 완료 처리
══════════════════════════════════════════════════ */

function doCompleteMission(m) {
  const card = document.querySelector(`[data-mid="${m.id}"]`);
  if (card) card.classList.add('flash-ok');

  setTimeout(() => {
    queue = queue.filter(q => q.id !== m.id);
    G.done++;
    stats.done++;
    renderMissionGrid();
    updateGauge();
    renderHUD();
    showSatirePopup(m.satire);
    onMissionDone();
  }, 220);
}

function onMissionDone() {
  if (G.done % 5 === 0) {
    const evIdx  = G.evTriggered;
    const events = CHAPTERS[G.ch].events;
    if (evIdx < events.length) {
      G.evTriggered++;
      stats.evTotal++;
      stopTimers();
      triggerEvent(events[evIdx], (success) => {
        if (success) stats.evDone++;
        if (G.lives > 0) {
          addTimer = setInterval(addMission, 3000); /* FIX #3 */
          tickFn   = setInterval(tickMissions, 1000);
          checkChapterDone();
        }
      });
      return;
    }
  }
  checkChapterDone();
}

function checkChapterDone() {
  if (G.done >= CHAPTERS[G.ch].needed) {
    stopTimers();
    setTimeout(() => {
      if (G.ch === CHAPTERS.length - 1) showEndingScreen();
      else showChapterClear();
    }, 400);
  }
}

/* ══════════════════════════════════════════════════
   HP / 목숨
══════════════════════════════════════════════════ */

function loseHp(amount) {
  G.hp = Math.max(0, G.hp - amount);
  renderHpBar();
  if (G.hp === 0) { G.hp = 100; loseLife(); }
}

function loseLife() {
  flashRed();
  G.lives--;
  renderHUD();
  if (G.lives <= 0) {
    stopTimers();
    cleanupEvent();
    document.getElementById('modal-event').classList.add('hidden');
    setTimeout(doGameOver, 700);
  }
}

function flashRed() {
  const ov = document.getElementById('flash-overlay');
  ov.style.opacity = '1';
  setTimeout(() => { ov.style.opacity = '0'; }, 350);
}

function shakeAndFlash() {
  flashRed();
  const el = document.getElementById('screen-game');
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 400);
}

/* ══════════════════════════════════════════════════
   이벤트: 스페이스바 연타
══════════════════════════════════════════════════ */

function triggerEvent(evName, onDone) {
  isEvActive = true;
  sel = [];
  renderSelBar();

  const required  = CHAPTERS[G.ch].spaceCount;
  let   pressed   = 0;
  let   tLeft     = 5;
  let   handled   = false;

  const timerEl    = document.getElementById('ev-timer');
  const gaugeFill  = document.getElementById('ev-gauge-fill');
  const progressEl = document.getElementById('ev-progress');

  document.getElementById('ev-name').textContent = evName;
  progressEl.textContent = `0 / ${required}`;
  gaugeFill.style.width  = '0%';
  timerEl.textContent    = tLeft;
  timerEl.classList.remove('urgent');
  document.getElementById('modal-event').classList.remove('hidden');

  function finish(success) {
    if (handled) return;
    handled = true;
    cleanupEvent();
    document.getElementById('modal-event').classList.add('hidden');
    isEvActive = false;
    if (!success) loseLife();
    if (G.lives > 0) onDone(success);
  }

  evTickFn = setInterval(() => {
    tLeft--;
    timerEl.textContent = tLeft;
    if (tLeft <= 2) timerEl.classList.add('urgent');
    if (tLeft <= 0) finish(false);
  }, 1000);

  evSpaceFn = (e) => {
    if (handled || e.code !== 'Space') return;
    e.preventDefault();
    pressed++;
    const pct = Math.min(100, (pressed / required) * 100);
    gaugeFill.style.width  = pct + '%';
    progressEl.textContent = `${pressed} / ${required}`;
    if (pressed >= required) finish(true);
  };

  document.addEventListener('keydown', evSpaceFn);
}

function cleanupEvent() {
  if (evSpaceFn) { document.removeEventListener('keydown', evSpaceFn); evSpaceFn = null; }
  if (evTickFn)  { clearInterval(evTickFn);  evTickFn  = null; }
}

/* ══════════════════════════════════════════════════
   챕터 클리어 / 게임오버 / 엔딩
══════════════════════════════════════════════════ */

function showChapterClear() {
  const next = CHAPTERS[G.ch + 1];
  document.getElementById('clear-title').textContent = `${next.yearLabel} 달성!`;
  document.getElementById('btn-next-ch').textContent = `${next.yearLabel} 생활 시작`;
  showScreen('chapter-clear');
}

function nextChapter() {
  startChapter(G.ch + 1, { hp: G.hp, lives: G.lives });
}

function doGameOver() {
  showScreen('gameover');
}

function showEndingScreen() {
  const evRate   = stats.evTotal > 0
    ? Math.round((stats.evDone / stats.evTotal) * 100) : 100;
  const total    = stats.done + stats.failed;
  const failRate = total > 0 ? stats.failed / total : 0;

  let grade, satireText;
  if      (failRate <= 0.05) { grade = 'A+'; satireText = '4년 만에 졸업. 계획대로였다.'; }
  else if (failRate <= 0.15) { grade = 'A';  satireText = '나름 열심히 했다. 다음 생엔 더 잘할 수 있을 것이다.'; }
  else if (failRate <= 0.30) { grade = 'B+'; satireText = '5년 만에 졸업. 이 또한 계획이었다.'; }
  else if (failRate <= 0.50) { grade = 'B';  satireText = '졸업은 했다. 그것으로 충분하다.'; }
  else                        { grade = 'C';  satireText = '6년 만에 졸업. 학교가 먼저 졸업을 권유했다.'; }

  document.getElementById('stat-done').textContent   = stats.done;
  document.getElementById('stat-failed').textContent = stats.failed;
  document.getElementById('stat-ev').textContent     = evRate + '%';
  document.getElementById('stat-grade').textContent  = grade;
  document.getElementById('ending-satire').textContent = satireText;
  showScreen('ending');
}

function restartGame() {
  stats = { done: 0, failed: 0, evTotal: 0, evDone: 0 };
  stopTimers();
  cleanupEvent();
  showScreen('title');
}

/* ══════════════════════════════════════════════════
   일시정지
══════════════════════════════════════════════════ */

function resumeGame() {
  isPaused = false;
  document.getElementById('modal-pause').classList.add('hidden');
}

function restartFromPause() {
  isPaused = false;
  document.getElementById('modal-pause').classList.add('hidden');
  restartGame();
}

/* ══════════════════════════════════════════════════
   풍자 텍스트 팝업
══════════════════════════════════════════════════ */

function showSatirePopup(text) {
  const el = document.getElementById('satire-popup');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ══════════════════════════════════════════════════
   UI 렌더링
══════════════════════════════════════════════════ */

function renderHUD() {
  const ch = CHAPTERS[G.ch];
  document.getElementById('year-badge').textContent = ch.yearLabel;
  document.getElementById('prog-badge').textContent = `${G.done} / ${ch.needed}`;
  renderHpBar();
  renderHearts();
}

function renderHpBar() {
  const fill = document.getElementById('hp-fill');
  if (!fill) return;
  fill.style.width = G.hp + '%';
  fill.style.background =
    G.hp > 60 ? '#4caf50' : G.hp > 30 ? '#ffb300' : '#f44336';

  // 체력 소진 UI: HP ≤30%이면 게임 화면 배경을 살몬색으로 전환
  const game = document.getElementById('screen-game');
  if (game) {
    game.style.background = G.hp <= 30 ? '#c4705a' : '';
  }
}

function renderHearts() {
  for (let i = 0; i < 3; i++) {
    const h = document.getElementById('h' + i);
    if (h) h.classList.toggle('lost', i >= G.lives);
  }
}

function updateGauge() {
  const ch  = CHAPTERS[G.ch];
  const pct = Math.min(100, (G.done / ch.needed) * 100);
  const fill = document.getElementById('gauge-fill');
  const lbl  = document.getElementById('gauge-pct');
  if (fill) fill.style.height = pct + '%';
  if (lbl)  lbl.textContent   = Math.round(pct) + '%';
}

function renderMissionGrid() {
  const grid = document.getElementById('mission-grid');
  grid.innerHTML = '';

  queue.forEach(m => {
    const card = document.createElement('div');
    card.className   = 'm-card';
    card.dataset.mid = m.id;

    // 타이머 색상
    const tPct   = m.timeLeft / MISSION_TIME;
    const tColor = tPct > 0.5 ? '#2e7d32' : tPct > 0.25 ? '#e65100' : '#c62828';

    // 타이머
    const timerEl = document.createElement('div');
    timerEl.className   = 'm-timer';
    timerEl.style.color = tColor;
    timerEl.textContent = m.timeLeft + 's';
    if (tPct <= 0.25) timerEl.classList.add('urgent');

    // 미션 이름
    const nameEl = document.createElement('div');
    nameEl.className   = 'm-name';
    nameEl.textContent = m.name;

    // 방향키 표시
    const isPartial = sel.length > 0 &&
      sel.length <= m.arrows.length &&
      sel.every((k, i) => m.arrows[i] === k);
    if (isPartial) card.classList.add('partial');

    const arrowEl = document.createElement('div');
    arrowEl.className = 'm-arrows';
    m.arrows.forEach((key, i) => {
      const span = document.createElement('span');
      span.className = 'arr-icon';
      if (isPartial) {
        if      (i < sel.length)       span.classList.add('done');
        else if (i === sel.length)     span.classList.add('next');
      }
      span.textContent = ARROW_SYM[key];
      arrowEl.appendChild(span);
    });

    card.appendChild(timerEl);
    card.appendChild(nameEl);
    card.appendChild(arrowEl);
    grid.appendChild(card);
  });
}

function renderSelBar() {
  const container = document.getElementById('sel-chips');
  container.innerHTML = '';
  sel.forEach(key => {
    const chip = document.createElement('span');
    chip.className   = 'sel-chip';
    chip.textContent = ARROW_SYM[key];
    container.appendChild(chip);
  });
}

/* ══════════════════════════════════════════════════
   타이머 헬퍼
══════════════════════════════════════════════════ */

function stopTimers() {
  if (addTimer) { clearInterval(addTimer); addTimer = null; }
  if (tickFn)   { clearInterval(tickFn);   tickFn   = null; }
}

/* ══════════════════════════════════════════════════
   초기화
══════════════════════════════════════════════════ */

window.addEventListener('load', () => {
  showScreen('title');

  document.addEventListener('keydown', (e) => {
    const active = document.querySelector('.screen.active');
    if (!active || active.id !== 'screen-game') return;

    if (ARROW_KEYS.includes(e.key)) {
      e.preventDefault();
      handleArrowKey(e.key);
    }

    if (e.key === 'Escape' && !isEvActive) {
      e.preventDefault();
      isPaused = !isPaused;
      document.getElementById('modal-pause').classList.toggle('hidden', !isPaused);
    }
  });
});
