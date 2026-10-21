// 页面状态机：intro -> quiz -> calc -> result
// 所有渲染逻辑都在这里，数据在 js/data，算法在 js/scoring.js。

const TOTAL = QUESTIONS.length;
const STORE_KEY = 'digital-forecast-v1';

const state = {
  screen: 'intro',
  index: 0,               // 当前题号
  answers: [],            // [{ qid, optionIndex, order }]
  result: null,
  copyIndex: 0,
};

const $app = document.getElementById('app');

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function answerOf(qid) {
  return state.answers.find((a) => a.qid === qid);
}

function setAnswer(qid, optionIndex) {
  const found = answerOf(qid);
  if (found) found.optionIndex = optionIndex;
  else state.answers.push({ qid, optionIndex, order: state.answers.length });
  persist();
}

function persist() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify({ answers: state.answers, index: state.index })); } catch (e) {}
}
function restore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.answers)) state.answers = data.answers;
    state.index = Math.min(data.index || 0, TOTAL - 1);
  } catch (e) {}
}
function clearStore() {
  try { localStorage.removeItem(STORE_KEY); } catch (e) {}
}

let toastTimer;
function toast(msg) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1900);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('已复制，去朋友圈粘贴吧');
    return;
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast('已复制，去朋友圈粘贴吧'); }
    catch (err) { toast('复制失败，长按文字手动复制'); }
    ta.remove();
  }
}

// ---------------- 首屏 ----------------
function renderIntro() {
  const finished = state.answers.length === TOTAL;
  $app.innerHTML = `
  <div class="hero fade-in">
    <div class="hero-mark">DIGITAL FORECAST / 20 个场景 · 约 6 分钟</div>
    <h1>回答 20 个真实场景，<br>拿到一份<em>只属于你的</em><br>大学人格档案</h1>
    <p>不是"你属于哪一类人"，而是把你平时的选择翻译成：一个型别、一组性格标签、三个职业方向、一个虚拟形象，和一条你今天就能发出去的朋友圈文案。</p>
    <div class="pills">
      <span class="pill">MBTI 四维倾向</span><span class="pill">性格标签 ×5</span>
      <span class="pill">职业方向 ×3</span><span class="pill">专属虚拟形象</span>
      <span class="pill">朋友圈文案 ×3</span>
    </div>
    <div class="card stack" style="margin-top:22px">
      <div class="sec-title">怎么玩</div>
      <ol class="steps">
        <li>每题四句话：背景、场景、在场的人，然后凭第一反应选，别挑"更好的那个"。</li>
        <li>前 16 题决定型别；后 4 题决定你的标签、形象配件和文案调性。</li>
        <li>结果页可以一键复制文案，或存一张带形象的分享图。</li>
      </ol>
    </div>
    <div style="margin-top:20px" class="btn-row">
      ${finished
        ? `<button class="btn btn-primary" id="btn-view">查看我的档案</button><button class="btn" id="btn-start">重新测</button>`
        : state.answers.length
          ? `<button class="btn btn-primary" id="btn-resume">继续答题 (${state.answers.length}/${TOTAL})</button><button class="btn" id="btn-start">重新开始</button>`
          : `<button class="btn btn-primary" id="btn-start">开始测试</button>`}
    </div>
    <p class="note" style="margin-top:18px">本结果用于自我探索和社交分享，不构成专业心理评估或志愿填报依据。</p>
  </div>`;

  document.getElementById('btn-start').onclick = () => {
    state.answers = [];
    state.index = 0;
    persist();
    go('quiz');
  };
  const view = document.getElementById('btn-view');
  if (view) view.onclick = () => {
    state.result = computeResult(state.answers.slice());
    state.copyIndex = 0;
    go('result');
  };
  const resume = document.getElementById('btn-resume');
  if (resume) resume.onclick = () => {
    state.index = Math.max(0, QUESTIONS.findIndex((q) => !answerOf(q.id)));
    go('quiz');
  };
}

// 每题一张场景图，按题目 id 约定路径，换题只改 assets/scenes 里的文件
const SCENE_IMG = (id) => `assets/scenes/${id}.jpg`;

// ---------------- 答题 ----------------
function renderQuiz() {
  const q = QUESTIONS[state.index];
  const picked = answerOf(q.id);
  const pct = ((state.index + (picked ? 1 : 0)) / TOTAL) * 100;

  $app.innerHTML = `
  <div class="fade-in">
    <div class="quiz-top">
      <button class="link" id="btn-exit">← 退出</button>
      <button class="link" id="btn-end">结束测试，看已答部分 →</button>
    </div>
    <div class="progress">
      <div class="bar"><i style="width:${pct}%"></i></div>
      <span class="tiny muted">${String(state.index + 1).padStart(2, '0')} / ${TOTAL}</span>
    </div>
    <div class="qnav" aria-label="题目序号">
      ${QUESTIONS.map((qq, i) => {
        const done = !!answerOf(qq.id);
        const cls = i === state.index ? 'on' : done ? 'done' : '';
        return `<button class="qn ${cls}" data-n="${i}"${i === state.index ? ' aria-current="step"' : ''}>${i + 1}</button>`;
      }).join('')}
    </div>
    <p class="qnav-hint tiny muted">已答 ${state.answers.length} / ${TOTAL} · 点序号可直接跳到任意一题</p>
    <figure class="qimg">
      <img src="${SCENE_IMG(q.id)}" alt="${esc(q.kicker)}的场景插画">
    </figure>
    <span class="kicker">${esc(q.kicker)}${q.axis === null ? ' · 风味题' : ''}</span>
    <div class="scene">
      <p class="scene-bg">${esc(q.bg)}</p>
      <p class="scene-at">${esc(q.scene)}</p>
      <p class="scene-cast"><span>在场</span>${esc(q.cast)}</p>
    </div>
    <div class="qtext">${esc(q.text)}</div>
    <p class="muted tiny" style="margin:6px 0 0">${q.axis === null ? esc(FLAVORS[q.flavor]) : '凭第一反应，四个选项没有对错'}</p>
    <div class="options">
      ${q.options.map((o, i) => `
        <button class="opt ${picked && picked.optionIndex === i ? 'on' : ''}" data-i="${i}">
          <span class="dot"></span><span class="ol">${'ABCD'[i]}</span><span>${esc(o.label)}</span>
        </button>`).join('')}
    </div>
    <div class="quiz-foot">
      <button class="link" id="prev" ${state.index === 0 ? 'disabled' : ''}>← 上一题</button>
      <button class="link" id="toend">${state.index < TOTAL - 1 ? '跳到最后一题 →' : ''}</button>
    </div>
  </div>`;

  const scene = $app.querySelector('.qimg img');
  scene.onerror = () => scene.closest('.qimg').remove();
  const upNext = QUESTIONS[state.index + 1];
  if (upNext) (new Image()).src = SCENE_IMG(upNext.id);

  $app.querySelectorAll('.opt').forEach((btn) => {
    btn.onclick = () => {
      const i = Number(btn.dataset.i);
      setAnswer(q.id, i);
      $app.querySelectorAll('.opt').forEach((b) => b.classList.toggle('on', b === btn));
      $app.querySelector('.bar i').style.width = (((state.index + 1) / TOTAL) * 100) + '%';
      setTimeout(next, 260);
    };
  });
  $app.querySelectorAll('.qn').forEach((btn) => {
    btn.onclick = () => {
      const n = Number(btn.dataset.n);
      if (n === state.index) return;
      state.index = n;
      go('quiz');
    };
  });
  document.getElementById('prev').onclick = () => {
    if (state.index > 0) { state.index--; go('quiz'); }
  };
  document.getElementById('btn-exit').onclick = () => {
    persist();
    go('intro');
    toast('进度已保存，随时回来继续');
  };
  document.getElementById('btn-end').onclick = () => {
    state.result = computeResult(state.answers.slice());
    state.copyIndex = 0;
    go('result');
  };
  const toend = document.getElementById('toend');
  toend.onclick = () => {
    const missing = QUESTIONS.findIndex((qq) => !answerOf(qq.id));
    if (missing === -1) { state.index = TOTAL - 1; go('quiz'); }
    else { state.index = missing; go('quiz'); toast(`还有 ${TOTAL - state.answers.length} 题没答`); }
  };
}

function next() {
  if (state.index < TOTAL - 1) { state.index++; go('quiz'); }
  else finishQuiz();
}

function finishQuiz() {
  const missing = QUESTIONS.filter((q) => !answerOf(q.id));
  if (missing.length) {
    state.index = QUESTIONS.indexOf(missing[0]);
    go('quiz');
    toast(`还有 ${missing.length} 题没答完`);
    return;
  }
  go('calc');
}

// ---------------- 计算 ----------------
const CALC_LINES = [
  '正在统计你的四个维度倾向…',
  `在 ${Object.keys(TAGS).length} 个标签里挑出最像你的 5 个…`,
  '匹配职业方向和成长理由…',
  '拼装你的虚拟形象…',
  '从文案库里找那句最像你会发的话…',
];
function renderCalc() {
  $app.innerHTML = `
    <div class="calc fade-in">
      <div class="ring"></div>
      <h3 style="margin:0 0 10px">正在生成你的档案</h3>
      <p id="calc-line">${CALC_LINES[0]}</p>
    </div>`;
  let i = 0;
  const tick = setInterval(() => {
    i++;
    const el = document.getElementById('calc-line');
    if (el && i < CALC_LINES.length) el.textContent = CALC_LINES[i];
    if (i >= CALC_LINES.length) {
      clearInterval(tick);
      state.result = computeResult(state.answers.slice());
      state.copyIndex = 0;
      go('result');
    }
  }, 380);
}

// ---------------- 结果 ----------------
function axisRows(r) {
  return r.axes.map((a) => `
    <div class="axis-row">
      <div class="labels">
        <span class="${a.pole === a.leftLetter ? 'on' : ''}">${esc(a.leftLetter)} ${esc(a.leftName)}</span>
        <span class="${a.pole === a.rightLetter ? 'on' : ''}">${esc(a.rightName)} ${esc(a.rightLetter)}</span>
      </div>
      <div class="axis-track ${a.missing ? 'empty' : ''}"><i style="left:${(a.markerAt * 100).toFixed(1)}%"></i></div>
      <div class="axis-pct">${esc(a.name)} · ${a.missing ? '一题没答' : Math.round(a.share * 100) + '% 偏向 ' + esc(a.poleName)}</div>
    </div>`).join('');
}

function tagChips(r) {
  if (!r.tags.length) return '<p class="tiny muted">还没有答题签名可以提取。</p>';
  return `<div class="chips">${r.tags.map((t) => `<button class="chip ${t.source !== 'option' ? 'highlight' : ''}" data-tag="${esc(t.fragment)}">${esc(t.name)}<small>${esc(t.desc)}</small></button>`).join('')}</div>`;
}

// 提前结束：只展示不依赖完整型别的部分
function renderPartialResult() {
  const r = state.result;
  const rest = QUESTIONS.filter((q) => !r.answers.some((a) => a.qid === q.id)).length;
  $app.innerHTML = `
  <div class="stack fade-in">
    <div class="card result-hero">
      <span class="kicker">提前结束</span>
      <div class="type-line"><b>${esc(r.type)}</b></div>
      <p class="oneliner">你答了 ${r.answers.length} / ${TOTAL} 题，有 ${r.missingCount} 个维度一题都没答，型别算不出来。</p>
      <p class="blurb">职业方向和朋友圈文案都要靠完整的四字母型别才能生成，所以这两块先空着——不是不给，是给了就是瞎猜。</p>
      <div class="btn-row" style="margin-top:18px">
        <button class="btn btn-primary" id="btn-finish">继续补完（还剩 ${rest} 题）</button>
        <button class="btn" id="btn-quit">退出</button>
      </div>
    </div>

    <div class="card">
      <div class="sec-title">已答出来的维度</div>
      ${axisRows(r)}
    </div>

    <div class="card">
      <div class="sec-title">目前能确定的性格标签</div>
      ${tagChips(r)}
    </div>

    <p class="note">进度还在，回来接着答就行。</p>
  </div>`;

  $app.querySelectorAll('.chip').forEach((c) => { c.onclick = () => copyText(c.dataset.tag); });
  document.getElementById('btn-finish').onclick = () => {
    const firstMissing = QUESTIONS.findIndex((q) => !answerOf(q.id));
    state.index = firstMissing === -1 ? TOTAL - 1 : firstMissing;
    go('quiz');
  };
  document.getElementById('btn-quit').onclick = () => go('intro');
}

function renderResult() {
  const r = state.result;
  if (!r) { go('intro'); return; }
  if (!r.complete) { renderPartialResult(); return; }
  const strongest = r.axes.slice().sort((a, b) => b.share - a.share)[0];
  const clarityText = r.clarity > 0.82 ? '型别非常清晰' : r.clarity > 0.68 ? '型别清晰' : '你在两个极端之间，属于混合型';

  $app.innerHTML = `
  <div class="stack fade-in">
    <div class="card result-hero">
      <div id="avatar-slot">${renderAvatar(r.avatar)}</div>
      <div class="type-line"><b>${r.type}</b><span>${esc(r.info.nickname)}</span></div>
      <p class="oneliner">${esc(r.info.oneLiner)}</p>
      <span class="clarity">${clarityText} · ${Math.round(r.clarity * 100)}% · 档案号 ${r.fingerprint}</span>
      <p class="blurb">${esc(r.info.blurb)}</p>
    </div>

    <div class="card">
      <div class="sec-title">四个维度</div>
      ${axisRows(r)}
      <p class="tiny muted" style="margin:4px 0 0">你最明显的一维是<b style="color:#fff"> ${strongest.poleName} </b>，
      ${r.extremeCount ? `${r.extremeCount} 个维度答到了极端。` : '四个维度都没有走极端，说明你的可塑性比较强。'}</p>
    </div>

    <div class="card">
      <div class="sec-title">性格标签 · 点一下可复制</div>
      ${tagChips(r)}
    </div>

    <div class="card">
      <div class="sec-title">职业方向预测</div>
      ${r.careers.map((c, i) => `
        <div class="job">
          <div class="rank">0${i + 1}</div>
          <div>
            <h4>${esc(c.name)}</h4>
            <p>${esc(c.why)}</p>
            <div class="tag-src">${c.from === 'tag' ? '由你的标签额外触发' : '由型别主流方向给出'}</div>
          </div>
        </div>`).join('')}
      <p class="tiny muted" style="margin-top:6px">小提示：注意它给的不是"最赚钱的"，而是"你会主动做、且做完不空的那类"。</p>
    </div>

    <div class="card">
      <div class="sec-title">专属朋友圈文案</div>
      <div class="stack" id="copies">${renderCopies()}</div>
      <div class="btn-row" style="margin-top:14px">
        <button class="btn" id="btn-shuffle">换一批文案</button>
      </div>
    </div>

    <div class="card">
      <div class="sec-title">带走它</div>
      <div class="stack">
        <button class="btn btn-primary" id="btn-img">保存分享图（含虚拟形象）</button>
        <button class="btn" id="btn-all">复制完整档案文字</button>
        <button class="btn" id="btn-again">重新测一次</button>
      </div>
    </div>

    <p class="note">结果由题目规则计分生成，同一组答案永远得到同一份档案；换一批文案不影响型别。<br>
    它是聊天话题，不是诊断书。</p>
  </div>`;

  $app.querySelectorAll('.chip').forEach((c) => {
    c.onclick = () => copyText(c.dataset.tag);
  });
  bindCopies();
  document.getElementById('btn-shuffle').onclick = () => {
    const rng = mulberry32((Math.random() * 1e9) >>> 0);
    state.result.copies = buildCopies(state.result, rng);
    state.copyIndex = 0;
    document.getElementById('copies').innerHTML = renderCopies();
    bindCopies();
    toast('换了一批，风格已刷新');
  };
  document.getElementById('btn-img').onclick = async (e) => {
    e.target.disabled = true;
    e.target.textContent = '正在生成图片…';
    try {
      await downloadShareCard(state.result, state.copyIndex);
      toast('图片已保存');
    } catch (err) {
      toast('生成失败：' + err.message);
    }
    e.target.disabled = false;
    e.target.textContent = '保存分享图（含虚拟形象）';
  };
  document.getElementById('btn-all').onclick = () => copyText(buildArchiveText(state.result));
  document.getElementById('btn-again').onclick = () => {
    clearStore();
    state.answers = [];
    state.index = 0;
    state.result = null;
    go('intro');
  };
}

function renderCopies() {
  const r = state.result;
  return r.copies.map((c, i) => `
    <div class="copy-item">
      <div class="style">${esc(c.styleName)}</div>
      <p>${esc(c.text)}</p>
      <button class="btn" data-copy="${i}">${i === state.copyIndex ? '用这条做分享图 · 复制' : '复制这条'}</button>
    </div>`).join('');
}

function bindCopies() {
  $app.querySelectorAll('[data-copy]').forEach((b) => {
    b.onclick = () => {
      const i = Number(b.dataset.copy);
      state.copyIndex = i;
      $app.querySelectorAll('[data-copy]').forEach((x) => {
        const idx = Number(x.dataset.copy);
        x.textContent = idx === i ? '用这条做分享图 · 复制' : '复制这条';
      });
      copyText(state.result.copies[i].text);
    };
  });
}

function buildArchiveText(r) {
  return [
    `我的数字预测档案（${r.fingerprint}）`,
    `${r.type} · ${r.info.nickname} · ${TEMPERAMENT[r.info.temperament].name}`,
    r.info.oneLiner,
    '',
    `维度：${r.axes.map((a) => `${a.pole}${a.poleName} ${Math.round(a.share * 100)}%`).join(' / ')}`,
    `标签：${r.tags.map((t) => t.name).join('、')}`,
    `职业方向：${r.careers.map((c) => c.name).join('、')}`,
    '',
    r.copies[state.copyIndex].text,
  ].join('\n');
}

// ---------------- 路由 ----------------
function go(screen) {
  state.screen = screen;
  if (screen === 'result') renderResult();
  else if (screen === 'calc') renderCalc();
  else if (screen === 'quiz') renderQuiz();
  else renderIntro();
  window.scrollTo(0, 0);
}

window.addEventListener('keydown', (e) => {
  if (state.screen === 'quiz' && e.key === 'Escape') { go('intro'); return; }
  if (state.screen !== 'quiz') return;
  const q = QUESTIONS[state.index];
  if (e.key === 'ArrowLeft' && state.index > 0) { state.index--; go('quiz'); }
  if (e.key === 'ArrowRight' && answerOf(q.id)) next();
  const n = Number(e.key);
  if (n >= 1 && n <= q.options.length) {
    setAnswer(q.id, n - 1);
    go('quiz');
    setTimeout(next, 200);
  }
});

restore();
go('intro');
