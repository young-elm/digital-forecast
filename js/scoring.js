// 计分：答案 -> { 型别, 各轴倾向, 标签, 职业, 文案, 形象参数 }
// 同一组答案永远得到同一份结果（用答案指纹做随机种子），方便同学互相对拍

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

// pickWeighted：按 rng 抽一个不重复的
function takeFrom(pool, rng, used) {
  const avail = pool.filter((x) => !used.has(x));
  if (!avail.length) return null;
  return avail[Math.floor(rng() * avail.length)];
}

function scoreAxis(axis, answered) {
  // 提前结束测试时该轴可能一题没答，返回 missing 让上层降级处理
  if (!answered.length) {
    return {
      axis, pole: null, missing: true, share: 0, left: 0, right: 0,
      leftLetter: AXES[axis].left, rightLetter: AXES[axis].right,
      leftName: AXES[axis].leftName, rightName: AXES[axis].rightName,
      markerAt: 0.5, name: AXES[axis].name,
      poleName: '未测出', otherPole: null, otherName: '', extreme: false,
    };
  }
  const counts = { [AXES[axis].left]: 0, [AXES[axis].right]: 0 };
  answered.forEach((a) => { counts[a.pole]++; });
  const left = counts[AXES[axis].left];
  const right = counts[AXES[axis].right];
  let pole;
  if (left !== right) pole = left > right ? AXES[axis].left : AXES[axis].right;
  // 2:2 时按"最后作答的那一题"倾向判，避免抛硬币式随机
  else pole = answered[answered.length - 1].pole;
  const share = Math.max(left, right) / answered.length;
  return {
    axis,
    pole,
    share,
    left,
    right,
    leftLetter: AXES[axis].left,
    rightLetter: AXES[axis].right,
    leftName: AXES[axis].leftName,
    rightName: AXES[axis].rightName,
    // 从轴的左端算起的偏移，供进度条定位
    markerAt: right / answered.length,
    name: AXES[axis].name,
    poleName: pole === AXES[axis].left ? AXES[axis].leftName : AXES[axis].rightName,
    otherPole: pole === AXES[axis].left ? AXES[axis].right : AXES[axis].left,
    otherName: pole === AXES[axis].left ? AXES[axis].rightName : AXES[axis].leftName,
    // 只答 1 题不算"答到极端"
    extreme: Math.max(left, right) === answered.length && answered.length >= 2,
  };
}

function collectTags(axisResults, answered, flavorTags, rng) {
  const picked = [];
  const seen = new Set();
  const push = (id, source) => {
    if (!id || seen.has(id)) return false;
    const def = source === 'strength' ? STRENGTH_TAGS[id] : TAGS[id];
    if (!def) return false;
    seen.add(id);
    picked.push({ id, source, ...def });
    return true;
  };
  const pickFrom = (pool) => (pool.length ? pool[Math.floor(rng() * pool.length)] : null);

  // 每个轴只保留"与你最终型别一致的那些选项"的标签，这就是你的答题签名
  const axisPools = axisResults.map((a) => {
    const list = answered.filter((x) => x.q.axis === a.axis);
    const aligned = list.filter((x) => x.pole === a.pole);
    return {
      pole: a.pole,
      extreme: a.extreme,
      share: a.share,
      pool: (aligned.length ? aligned : list).flatMap((x) => x.tags || []),
      tie: rng(),
    };
  });
  // 答得越极端的轴越能代表你，优先出它的签名标签
  axisPools.sort((x, y) => (Number(y.extreme) - Number(x.extreme)) || (y.share - x.share) || (x.tie - y.tie));

  // 1) 两个最清晰轴的签名标签
  axisPools.slice(0, 2).forEach((p) => push(pickFrom(p.pool), 'option'));

  // 2) 满轴强度标签 / 组合标签（这两个才像"预测"）
  const strengths = axisResults.filter((a) => a.extreme).map((a) => a.pole);
  if (strengths.length) push(pickFrom(strengths), 'strength');
  const letters = axisResults.map((a) => a.pole);
  const combos = COMBO_RULES.filter((r) => r.needs.every((n) => letters.includes(n))).map((r) => r.id);
  if (combos.length) push(pickFrom(combos), 'combo');

  // 3) 一个风味题标签
  push(pickFrom(flavorTags), 'flavor');

  // 4) 用剩下两个轴的签名补到 5 个
  axisPools.slice(2).forEach((p) => { if (picked.length < 5) push(pickFrom(p.pool), 'option'); });
  axisPools.forEach((p) => { if (picked.length < 5) push(pickFrom(p.pool), 'option'); });
  flavorTags.forEach((t) => { if (picked.length < 5) push(t, 'flavor'); });
  combos.forEach((c) => { if (picked.length < 5) push(c, 'combo'); });
  strengths.forEach((s) => { if (picked.length < 5) push(s, 'strength'); });

  return picked.slice(0, 5);
}

function rankCareers(type, tagIds) {
  const base = (CAREERS[type] || []).map((c, i) => ({ ...c, score: 100 - i * 5, from: 'type' }));
  const extra = [];
  tagIds.forEach((id) => {
    const c = TAG_CAREERS[id];
    if (!c) return;
    if (base.some((b) => b.name === c.name) || extra.some((b) => b.name === c.name)) return;
    extra.push({ ...c, score: 92, from: 'tag' });
  });
  return base.concat(extra).sort((a, b) => b.score - a.score).slice(0, 3);
}

function buildAvatarParams(axisResults, type, flavors, careersTop) {
  const by = {};
  axisResults.forEach((a) => { by[a.axis] = a; });
  const t = TYPES[type];
  // 型别不完整时用中性配色，不套用任何一个气质分组
  const temper = t ? TEMPERAMENT[t.temperament] : { hue: 252, sat: 40, accentHue: 190 };
  const hueShift = { E: 14, I: -14, S: -8, N: 22, T: -20, F: 18, J: -6, P: 10 };
  let hue = temper.hue;
  axisResults.forEach((a) => { hue += hueShift[a.pole] || 0; });
  hue = ((hue % 360) + 360) % 360;

  const trust = flavors.trust;
  return {
    hue,
    sat: temper.sat,
    accentHue: temper.accentHue,
    temperament: t ? t.temperament : null,
    pose: by.EI.pole === 'E' ? 'open' : 'curl',
    hair: by.JP.pole === 'J' ? 'neat' : 'loose',
    face: by.TF.pole === 'T' ? 'level' : 'soft',
    gaze: by.SN.pole === 'S' ? 'down' : 'up',
    aura: flavors.fear || (trust >= 2 ? 'bloom' : 'plain'),
    shield: trust === 0 ? true : false,
    spark: trust >= 2 ? true : false,
    accessory: flavors.accessory || 'none',
    prop: (careersTop[0] && careersTop[0].prop) || 'book',
    badge: type,
  };
}

function fillCopy(text, r) {
  const map = {
    type: r.type,
    nickname: r.info.nickname,
    temperament: TEMPERAMENT[r.info.temperament].name,
    career1: r.careers[0] ? r.careers[0].name : '还没定',
    career2: r.careers[1] ? r.careers[1].name : r.careers[0].name,
    tag1: r.tags[0] ? r.tags[0].name : '神秘',
    tag2: r.tags[1] ? r.tags[1].name : '难说',
    tag3: r.tags[2] ? r.tags[2].name : '不好讲',
    frag1: r.tags[0] ? r.tags[0].fragment : '没人总结过',
    frag2: r.tags[1] ? r.tags[1].fragment : '没人总结过',
    oneLiner: r.info.oneLiner,
    blind: r.info.blind[0],
    dominantName: r.strongestAxis.poleName,
    secondName: r.axes.find((a) => a.pole !== r.strongestAxis.pole).poleName,
  };
  return text.replace(/\{(\w+)\}/g, (m, k) => (map[k] != null ? map[k] : m));
}

function buildCopies(r, rng) {
  const out = [];
  const usedStyles = new Set();
  const typePool = (TYPE_COPY[r.type] || []).slice();

  // 第一条优先用型别专属模板，保证"一眼像本人"
  if (typePool.length) {
    const t = typePool[Math.floor(rng() * typePool.length)];
    out.push({ style: 'type', text: fillCopy(t, r) });
  }

  const usedText = new Set();
  const order = Object.keys(COPY_STYLES);
  let guard = 0;
  while (out.length < 3 && guard++ < 60) {
    const style = order[Math.floor(rng() * order.length)];
    if (usedStyles.has(style) && out.length < 3) continue;
    const pool = GENERIC_COPY.filter((c) => c.style === style);
    const cand = pool[Math.floor(rng() * pool.length)];
    if (!cand || usedText.has(cand.text)) continue;
    usedText.add(cand.text);
    usedStyles.add(style);
    out.push({ style, text: fillCopy(cand.text, r) });
  }

  return out.map((c, i) => {
    const emojiSet = c.style === 'type' ? COPY_STYLES.dry.emoji : COPY_STYLES[c.style].emoji;
    return {
      style: c.style,
      styleName: c.style === 'type' ? '型别限定' : COPY_STYLES[c.style].name,
      text: `${emojiSet[i % emojiSet.length]} ${c.text}`,
    };
  });
}

// answers: [{ qid, optionIndex }] 按作答先后顺序
function computeResult(answers) {
  const byQid = {};
  QUESTIONS.forEach((q) => { byQid[q.id] = q; });

  const answered = answers.map((a) => {
    const q = byQid[a.qid];
    const opt = q.options[a.optionIndex];
    return { q, opt, pole: opt.pole, tags: opt.tags || [], order: a.order == null ? 0 : a.order };
  });

  const axisResults = Object.keys(AXES).map((axis) => {
    const list = answered.filter((a) => a.q.axis === axis).sort((x, y) => x.order - y.order);
    return scoreAxis(axis, list);
  });

  const flavorTags = [];
  const flavors = { trust: null, fear: null, accessory: null };
  answered.filter((a) => a.q.axis === null).forEach((a) => {
    flavorTags.push(...(a.opt.tags || []));
    if (a.q.flavor === 'trust') flavors.trust = a.opt.flavorValue;
    if (a.q.flavor === 'fear') flavors.fear = a.opt.aura;
    if (a.opt.accessory) flavors.accessory = a.opt.accessory;
  });

  const missingAxes = axisResults.filter((a) => a.missing);
  const complete = missingAxes.length === 0;
  // 缺题的维度用 ? 占位，不猜一个字母冒充测出来了
  const type = axisResults.map((a) => a.pole || '?').join('');
  const info = complete ? TYPES[type] : null;

  const seedSrc = answers.slice()
    .sort((a, b) => (a.qid < b.qid ? -1 : 1))
    .map((a) => `${a.qid}:${a.optionIndex}`)
    .join('|');
  const rng = mulberry32(hashString(seedSrc));

  const tags = collectTags(axisResults, answered, flavorTags, rng);
  const careers = complete ? rankCareers(type, tags.map((t) => t.id)) : [];
  const strongestAxis = axisResults.slice().sort((a, b) => b.share - a.share)[0];

  const result = {
    type,
    info,
    complete,
    missingCount: missingAxes.length,
    answeredCount: answers.length,
    axes: axisResults,
    strongestAxis,
    clarity: axisResults.reduce((s, a) => s + a.share, 0) / axisResults.length,
    extremeCount: axisResults.filter((a) => a.extreme).length,
    tags,
    careers,
    avatar: buildAvatarParams(axisResults, type, flavors, careers),
    answers: answers.slice(),
    fingerprint: hashString(seedSrc).toString(36),
  };

  // 型别不完整时不出职业和文案，它们全都依赖一个真实的四字母型别
  result.copies = complete ? buildCopies(result, rng) : [];
  return result;
}
