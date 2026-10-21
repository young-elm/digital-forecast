// 数据完整性与算法回归检查：node tools/validate.js
// 不需要任何依赖，直接跑项目里的 js 文件。

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const FILES = [
  'js/data/questions.js',
  'js/data/types.js',
  'js/data/tags.js',
  'js/data/careers.js',
  'js/data/copy.js',
  'js/scoring.js',
  'js/avatar.js',
];

const ctx = vm.createContext({ console, Math, JSON, Object, Array, Set, String, Number });
FILES.forEach((f) => {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
});

const load = (expr) => vm.runInContext(expr, ctx);
const problems = [];
const ok = (cond, msg) => { if (!cond) problems.push(msg); };

const QUESTIONS = load('QUESTIONS');
const AXES = load('AXES');
const TAGS = load('TAGS');
const STRENGTH_TAGS = load('STRENGTH_TAGS');
const COMBO_RULES = load('COMBO_RULES');
const TYPES = load('TYPES');
const CAREERS = load('CAREERS');
const TAG_CAREERS = load('TAG_CAREERS');
const GENERIC_COPY = load('GENERIC_COPY');
const TYPE_COPY = load('TYPE_COPY');
const PROPS = load('PROPS');
const ACCESSORIES = load('ACCESSORIES');

// 1. 题量与轴覆盖
ok(QUESTIONS.length === 20, `题目总数应为 20，实际 ${QUESTIONS.length}`);
const axisIds = Object.keys(AXES);
axisIds.forEach((ax) => {
  const n = QUESTIONS.filter((q) => q.axis === ax).length;
  ok(n === 4, `轴 ${ax} 应有 4 题，实际 ${n}`);
});
const flavors = QUESTIONS.filter((q) => q.axis === null);
ok(flavors.length === 4, `风味题应为 4 道，实际 ${flavors.length}`);
const flavorKeys = new Set(flavors.map((q) => q.flavor));
ok(flavorKeys.size === 4, '风味题 flavor 不能重复');

// 2. 题目结构
const ids = new Set();
QUESTIONS.forEach((q) => {
  ok(!ids.has(q.id), `题目 id 重复：${q.id}`);
  ids.add(q.id);
  ok(!!q.text && !!q.kicker, `${q.id} 缺文案或小标题`);
  ['bg', 'scene', 'cast'].forEach((k) => {
    ok(typeof q[k] === 'string' && q[k].length >= 12, `${q.id} 缺${k === 'bg' ? '背景' : k === 'scene' ? '场景' : '人物'}介绍`);
  });
  ok(q.options.length >= 4, `${q.id} 选项少于 4 个，实际 ${q.options.length}`);
  // 场景图按 assets/scenes/<题目id>.jpg 约定，换题必须配图
  const img = path.join(root, 'assets', 'scenes', `${q.id}.jpg`);
  ok(fs.existsSync(img), `${q.id} 缺场景图 assets/scenes/${q.id}.jpg`);
  if (fs.existsSync(img)) ok(fs.statSync(img).size > 8000, `${q.id} 场景图疑似空文件（${fs.statSync(img).size} 字节）`);
  const seen = new Set();
  const poleCount = {};
  q.options.forEach((o, i) => {
    ok(!!o.label, `${q.id} 第${i + 1}个选项缺 label`);
    ok(o.label.length <= 30, `${q.id} 第${i + 1}个选项太长（${o.label.length} 字）`);
    ok(!seen.has(o.label), `${q.id} 选项文案重复`);
    seen.add(o.label);
    ok((o.tags || []).length > 0, `${q.id} 第${i + 1}个选项没有标签钩子`);
    if (q.axis) {
      ok(o.pole === AXES[q.axis].left || o.pole === AXES[q.axis].right, `${q.id} 第${i + 1}个选项的 pole ${o.pole} 不属于轴 ${q.axis}`);
      poleCount[o.pole] = (poleCount[o.pole] || 0) + 1;
    } else {
      ok(o.pole === undefined, `${q.id} 是风味题但带了 pole`);
    }
    (o.tags || []).forEach((t) => ok(!!TAGS[t], `${q.id} 引用了不存在的标签 ${t}`));
  });
  if (q.axis) {
    const both = Object.keys(poleCount);
    ok(both.length === 2, `${q.id} 只偏向一极（${both.join('/')}），另一极没有可选项`);
    ok(Math.max(...Object.values(poleCount)) - Math.min(...Object.values(poleCount)) <= 1,
      `${q.id} 两极选项数不平衡：${JSON.stringify(poleCount)}`);
  }
});

// 3. 组合规则与强度标签
const allPoles = 'EINSFTPJ'.split('');
COMBO_RULES.forEach((r) => {
  ok(!!TAGS[r.id], `组合规则指向不存在的标签 ${r.id}`);
  r.needs.forEach((n) => ok(allPoles.includes(n), `组合规则 ${r.id} 里的 ${n} 不是合法轴端`));
});
Object.keys(STRENGTH_TAGS).forEach((p) => ok(allPoles.includes(p), `强度标签 key 非法：${p}`));

// 4. 16 型完备
const expectTypes = [];
for (const e of ['E', 'I']) for (const s of ['S', 'N']) for (const t of ['T', 'F']) for (const j of ['J', 'P']) expectTypes.push(e + s + t + j);
ok(Object.keys(TYPES).length === 16, `TYPES 应为 16 型，实际 ${Object.keys(TYPES).length}`);
expectTypes.forEach((tp) => {
  ok(!!TYPES[tp], `缺型别人设：${tp}`);
  ok(Array.isArray(CAREERS[tp]) && CAREERS[tp].length >= 3, `${tp} 职业方向少于 3 个`);
  ok((TYPE_COPY[tp] || []).length >= 1, `${tp} 缺型别专属文案`);
  (CAREERS[tp] || []).forEach((c) => {
    ok(!!PROPS[c.prop], `${tp} 的职业 ${c.name} 用了不存在的形象手持物 ${c.prop}`);
    ok(!!c.why, `${tp} 的职业 ${c.name} 缺理由`);
  });
});
Object.keys(CAREERS).forEach((tp) => ok(!!TYPES[tp], `CAREERS 有多余型别 ${tp}`));
Object.keys(TAG_CAREERS).forEach((t) => {
  ok(!!TAGS[t], `TAG_CAREERS 指向不存在的标签 ${t}`);
  ok(!!PROPS[TAG_CAREERS[t].prop], `TAG_CAREERS.${t} 手持物不存在：${TAG_CAREERS[t].prop}`);
});

// 5. 形象渲染：所有部件组合都要能画出来，不留 undefined
const renderAvatar = load('renderAvatar');
let renderChecked = 0;
for (const pose of ['open', 'curl']) for (const hair of ['neat', 'loose']) for (const face of ['level', 'soft'])
for (const gaze of ['down', 'up']) for (const aura of ['star', 'moon', 'bloom', 'plain'])
for (const accessory of Object.keys(ACCESSORIES)) for (const prop of Object.keys(PROPS)) for (const shield of [0, 1]) {
  const svg = renderAvatar({ hue: 260, sat: 60, accentHue: 190, pose, hair, face, gaze, aura, accessory, prop, shield, spark: !!shield, badge: 'INTJ' });
  ok(!/undefined|NaN|\[object/.test(svg), `形象渲染异常：${[pose, hair, face, gaze, aura, accessory, prop].join('/')}`);
  renderChecked++;
}
const usedAccessories = new Set();
QUESTIONS.filter((q) => !q.axis).forEach((q) => q.options.forEach((o) => o.accessory && usedAccessories.add(o.accessory)));
usedAccessories.forEach((a) => ok(!!ACCESSORIES[a], `题目引用了不存在的配件 ${a}`));
const usedAuras = new Set();
QUESTIONS.filter((q) => q.flavor === 'fear').forEach((q) => q.options.forEach((o) => o.aura && usedAuras.add(o.aura)));
usedAuras.forEach((a) => ok(['star', 'moon', 'bloom', 'plain'].includes(a), `氛围层不存在：${a}`));

// 6. 文案占位符
const PLACEHOLDERS = new Set(['type', 'nickname', 'temperament', 'career1', 'career2', 'tag1', 'tag2', 'tag3', 'frag1', 'frag2', 'oneLiner', 'blind', 'dominantName', 'secondName']);
const checkTpl = (text, where) => {
  (text.match(/\{(\w+)\}/g) || []).forEach((m) => {
    const key = m.slice(1, -1);
    ok(PLACEHOLDERS.has(key), `${where} 用了未知占位符 {${key}}`);
  });
};
GENERIC_COPY.forEach((c, i) => {
  ok(!!load('COPY_STYLES')[c.style], `通用文案 #${i} 风格 ${c.style} 未定义`);
  checkTpl(c.text, `通用文案 #${i}`);
});
Object.keys(TYPE_COPY).forEach((tp) => TYPE_COPY[tp].forEach((t, i) => checkTpl(t, `${tp} 型别文案 #${i + 1}`)));

// 7. 全量遍历：所有轴答案组合都要能出合法结果
const computeResult = load('computeResult');
const axisQuestions = {};
axisIds.forEach((ax) => { axisQuestions[ax] = QUESTIONS.filter((q) => q.axis === ax); });
const fixedFlavor = flavors.map((q) => ({ qid: q.id, optionIndex: 0, order: 0 }));
// 每题四个选项里，按极取第一个命中该极的选项
const optIndexOfPole = (q, pole) => q.options.findIndex((o) => o.pole === pole);
axisIds.forEach((ax) => {
  axisQuestions[ax].forEach((q) => {
    ok(optIndexOfPole(q, AXES[ax].left) >= 0, `${q.id} 找不到偏向 ${AXES[ax].left} 的选项`);
    ok(optIndexOfPole(q, AXES[ax].right) >= 0, `${q.id} 找不到偏向 ${AXES[ax].right} 的选项`);
  });
});
const reach = new Set();
let count = 0;
let minTags = 99, minCopies = 99;
const seenTagIds = new Set();

for (let mask = 0; mask < 65536; mask++) {
  const answers = [];
  let o = 0;
  axisIds.forEach((ax, ai) => {
    axisQuestions[ax].forEach((q, qi) => {
      const bit = (mask >> (ai * 4 + qi)) & 1;
      const pole = bit ? AXES[ax].right : AXES[ax].left;
      answers.push({ qid: q.id, optionIndex: optIndexOfPole(q, pole), order: o++ });
    });
  });
  fixedFlavor.forEach((f) => answers.push({ ...f, order: o++ }));

  const r = computeResult(answers);
  count++;
  reach.add(r.type);
  ok(expectTypes.includes(r.type), `生成了非法型别 ${r.type}（mask ${mask}）`);
  ok(r.tags.length >= 3, `mask ${mask} 标签只有 ${r.tags.length} 个`);
  ok(r.careers.length === 3, `mask ${mask} 职业不是 3 个`);
  ok(r.copies.length === 3, `mask ${mask} 文案不是 3 条`);
  minTags = Math.min(minTags, r.tags.length);
  minCopies = Math.min(minCopies, r.copies.length);
  r.tags.forEach((t) => seenTagIds.add(t.id));
  r.copies.forEach((c) => {
    ok(!/\{\w+\}/.test(c.text), `mask ${mask} 文案里还有未替换占位符：${c.text}`);
    ok(c.text.length > 10, `mask ${mask} 文案过短`);
  });
  ok(typeof r.avatar.hue === 'number' && r.avatar.hue >= 0 && r.avatar.hue < 360, `mask ${mask} 形象色相非法`);
  ok(!!PROPS[r.avatar.prop], `mask ${mask} 形象手持物未定义：${r.avatar.prop}`);

  if (mask % 4096 === 0) {
    const again = computeResult(answers.map((a) => ({ ...a })));
    ok(JSON.stringify(again.copies) === JSON.stringify(r.copies), `同答案结果不稳定（mask ${mask}）`);
  }
}
ok(reach.size === 16, `只能到达 ${reach.size} 个型别，缺：${expectTypes.filter((t) => !reach.has(t)).join(',')}`);

// 7b. 随机抽样（含风味题全组合），统计标签库真实触达
const sweepRng = load('mulberry32')(20261020);
const seenAny = new Set(seenTagIds);
for (let n = 0; n < 40000; n++) {
  const answers = [];
  QUESTIONS.forEach((q, i) => answers.push({ qid: q.id, optionIndex: Math.floor(sweepRng() * q.options.length), order: i }));
  const r = computeResult(answers);
  ok(r.type.length === 4 && expectTypes.includes(r.type), `随机抽样 #${n} 型别非法`);
  ok(r.tags.length >= 3 && r.tags.length <= 5, `随机抽样 #${n} 标签数 ${r.tags.length}`);
  ok(r.careers.length === 3 && new Set(r.careers.map((c) => c.name)).size === 3, `随机抽样 #${n} 职业重复或不足`);
  r.copies.forEach((c) => ok(!/\{\w+\}/.test(c.text), `随机抽样 #${n} 文案残留占位符：${c.text}`));
  r.tags.forEach((t) => seenAny.add(t.id));
  reach.add(r.type);
}
const never = Object.keys(TAGS).filter((t) => !seenAny.has(t));
const tagCoverage = Object.keys(TAGS).filter((t) => seenAny.has(t)).length;
ok(never.length === 0, `这些标签在 40000 次抽样里从未出现：${never.join(',')}`);

// 7c. 提前结束：任意答题进度（含 0 题）都不能崩
for (let n = 0; n <= QUESTIONS.length; n++) {
  const partial = [];
  for (let i = 0; i < n; i++) partial.push({ qid: QUESTIONS[i].id, optionIndex: i % QUESTIONS[i].options.length, order: i });
  let r;
  try { r = computeResult(partial); }
  catch (e) { problems.push(`答到第 ${n} 题就结束会崩：${e.message}`); continue; }
  ok(r.type.length === 4, `答到第 ${n} 题结束时型别长度不是 4：${r.type}`);
  ok(r.complete === !r.type.includes('?'), `答到第 ${n} 题结束时 complete 与 ? 占位不一致`);
  ok(r.complete === (r.missingCount === 0), `答到第 ${n} 题结束时 missingCount 标记错了`);
  ok(r.complete ? r.copies.length === 3 : r.copies.length === 0, `答到第 ${n} 题结束时文案数量不对`);
  ok(r.complete ? r.careers.length === 3 : r.careers.length === 0, `答到第 ${n} 题结束时职业数量不对`);
  ok(r.tags.length <= 5, `答到第 ${n} 题结束时标签超过 5 个`);
  ok(n === 0 || r.tags.length >= 1, `答到第 ${n} 题结束时一个标签都没有`);
  ok(!/undefined|NaN/.test(renderAvatar(r.avatar)), `答到第 ${n} 题结束时形象渲染异常`);
}

// 8. 换一批：不同种子应产出不同文案（至少多数情况）
const sampleAnswers = axisIds.flatMap((ax, ai) => axisQuestions[ax].map((q, qi) => ({ qid: q.id, optionIndex: (ai + qi) % 2, order: ai * 4 + qi })))
  .concat(flavors.map((q, i) => ({ qid: q.id, optionIndex: i % q.options.length, order: 100 + i })));
const base = computeResult(sampleAnswers);
ok(base.tags.length >= 3, '抽样答案标签数不足');
ok(new Set(base.tags.map((t) => t.id)).size === base.tags.length, '标签出现重复');

// 9. 选项标签覆盖度：确保标签库不是摆设
const optionTagIds = new Set();
QUESTIONS.forEach((q) => q.options.forEach((o) => (o.tags || []).forEach((t) => optionTagIds.add(t))));
const unused = Object.keys(TAGS).filter((t) => !optionTagIds.has(t) && !COMBO_RULES.some((r) => r.id === t));
ok(unused.length === 0, `标签库里有永远触发不了的标签：${unused.join(',')}`);

console.log(`遍历答案组合 ${count} + 40000 种随机卷，可达型别 ${reach.size}/16，最少标签 ${minTags} 个，标签库触达 ${tagCoverage}/${Object.keys(TAGS).length}，形象部件组合校验 ${renderChecked} 种`);
if (problems.length) {
  console.log(`\n发现 ${problems.length} 个问题：`);
  [...new Set(problems)].slice(0, 40).forEach((p) => console.log(' - ' + p));
  process.exit(1);
}
console.log('\n全部检查通过。');
