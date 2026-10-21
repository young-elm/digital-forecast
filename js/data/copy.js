// 朋友圈文案库：按风格分组，占位符由计分结果填充
// 可用占位符：
// {type} {nickname} {temperament} {career1} {career2} {tag1} {tag2} {tag3}
// {frag1} {frag2} {oneLiner} {blind} {dominantName} {secondName}

const COPY_STYLES = {
  dry: { name: '自嘲型', emoji: ['🫠', '🙂‍↔️', '🥲'] },
  artsy: { name: '文艺型', emoji: ['🌙', '🪐', '🫧'] },
  short: { name: '短句型', emoji: ['▪️', '✦', '—'] },
  snark: { name: '阴阳怪气型', emoji: ['💅', '🤡', '😇'] },
  straight: { name: '直球型', emoji: ['🎯', '📌', '🔖'] },
};

// 型别专属模板：命中型别时优先使用
const TYPE_COPY = {
  INTJ: [
    '测出来是 {type}。我确实已经在想三年后的事了，包括这篇朋友圈为什么要发。',
    '{nickname}，认证完毕。我不反对你的方案，我只是已经知道它哪里会崩。',
  ],
  INTP: [
    '花了一晚上做性格测试，因为我想先搞懂它是怎么计分的。结果是 {type}。',
    '我的兴趣列表和 {type} 一样长，完成度也一样低。',
  ],
  ENTJ: [
    '测出 {type}。看到这个结果我第一反应是：所以这对我下一步有什么用。',
    '{nickname}。我承认，小组里说"那我来分吧"的人一直是我。',
  ],
  ENTP: [
    '{type}。这个测试的题出得不严谨，但我还是做完了，别问为什么。',
    '被官方认证为抬杠选手：{nickname}。以后吵架请自带论据。',
  ],
  INFJ: [
    '{type}。我在做这套题的时候，已经在替出卷人考虑别人的感受了。',
    '一眼看穿者上线，今天只想被一个人看穿。',
  ],
  INFP: [
    '{nickname}。我表面说好，心里已经写完三篇关于这个结果的文章。',
    '{type}。我需要的不是建议，是一个不催我把感觉说明白的人。',
  ],
  ENFJ: [
    '{type}。我第一眼先看了别人的结果，然后才轮到我自己。',
    '被认证成带队的那一个。行吧，群里的活我一直都在干。',
  ],
  ENFP: [
    '{type}！我已经在计划把这个结果做成三件事：发圈、截图、发给所有人看。',
    '我的注意力在这套题上维持了八分钟，创了个人纪录。',
  ],
  ISTJ: [
    '{type}。我认真答完了每一题，包括看起来没用的那几道。',
    '结果和我预期一致，因为我早就知道。{nickname}，收工。',
  ],
  ISFJ: [
    '{type}。我记得每个人的忌口，今天终于有人问了我一句你喜欢什么。',
    '一直站在后面的人被点名了：{nickname}。',
  ],
  ESTJ: [
    '{type}。这个测试流程本该由我来出，题量偏少。',
    '官方认证秩序队长。以后迟到别再找我商量。',
  ],
  ESFJ: [
    '{type}。我把结果发到了四个群里，这样大家都开心了。',
    '暖炉认证完成。你记得我，我也记得你，这就是全部生意。',
  ],
  ISTP: [
    '{type}。我没看完说明就开始做了，反正也不影响。',
    '话不多，手很稳。{nickname}，需要修东西找我。',
  ],
  ISFP: [
    '{type}。我不评价这个测试，但我心里给它配了个颜色。',
    '安静的那一个今天被说中了。我不争，我只是有审美。',
  ],
  ESTP: [
    '{type}。做这个测试用了五分钟，剩下的时间我拿去干别的了。',
    '现场玩家认证。计划表发我一次就好，我不会看。',
  ],
  ESFP: [
    '{type}。有我在的场合需要有人负责热场，现在有官方文件了。',
    '聚光灯本人，认证完成。今晚值得发一条。',
  ],
};

const GENERIC_COPY = [
  // 自嘲
  { style: 'dry', text: '测出来是 {type}，{tag1}、{tag2}。最准的是 {frag1}，这句我被看见了。' },
  { style: 'dry', text: '我的 {type} 里最突出的部分是{dominantName}，翻译一下就是：{frag2}。' },
  { style: 'dry', text: '官方认证：{nickname}。缺陷也写得很清楚——{blind}。谢谢，很痛。' },
  { style: 'dry', text: '{tag1} + {tag2} + {tag3}。三个标签里有两个是我死活不认、但同学都说准的。' },

  // 文艺
  { style: 'artsy', text: '{type}。心里留了一间不给任何人看的房，{frag1}。' },
  { style: 'artsy', text: '我是{temperament}的人，习惯把{secondName}放在台面上，把{dominantName}留给自己。' },
  { style: 'artsy', text: '{career1}大概是为我准备的方向：{frag2}，其余的以后再说。' },

  // 短句
  { style: 'short', text: '{type}。{tag1}。就这样。' },
  { style: 'short', text: '{nickname}，已确认。' },
  { style: 'short', text: '一句话总结我：{frag1}。' },

  // 阴阳怪气
  { style: 'snark', text: '测出 {type} 了，{tag1}。行，都别道歉了，我知道你们早就这么觉得。' },
  { style: 'snark', text: '{nickname}。建议我转行{career1}的人很多，愿意帮我改简历的一个没有。' },
  { style: 'snark', text: '{frag1}，这是官方写的，不是我说的。' },

  // 直球
  { style: 'straight', text: '做完了一个给大学生算数字预测的小测试：{type} / {nickname}，职业方向给的是{career1}和{career2}。' },
  { style: 'straight', text: '我的三个标签：{tag1}、{tag2}、{tag3}。准不准你们说了算，我先认。' },
  { style: 'straight', text: '结论是我最强的一维是{dominantName}，所以{frag1}这件事实锤了。' },
];
