// 16 型人设：昵称、一句话、短解读、气质分组（决定配色与形象基调）
// temperament: NT 分析者 / NF 理想者 / SJ 守护者 / SP 探险者

const TEMPERAMENT = {
  NT: { name: '解构派', hue: 250, sat: 62, accentHue: 196 },
  NF: { name: '共情派', hue: 322, sat: 55, accentHue: 168 },
  SJ: { name: '秩序派', hue: 205, sat: 45, accentHue: 36 },
  SP: { name: '现场派', hue: 28, sat: 72, accentHue: 350 },
};

const TYPES = {
  INTJ: {
    nickname: '战略建筑师', temperament: 'NT',
    oneLiner: '表面在听课，脑子里已经在跑三年后的推演。',
    blurb: '你习惯先把全局想清楚再动手，讨厌低效和重复解释。别人觉得你冷淡，其实你只是把热情留给了真正值得的问题。',
    strengths: ['长期推演', '独立判断'],
    blind: ['偶尔忘了别人需要被听见'],
  },
  INTP: {
    nickname: '原理拆解员', temperament: 'NT',
    oneLiner: '一个东西没弄懂原理，你就没法安心地用它。',
    blurb: '你的兴趣来得快去得也快，但只要你钻进去的东西，能讲到别人头晕。你不在乎结论好不好听，只在乎它成不成立。',
    strengths: ['抽象建模', '质疑前提'],
    blind: ['容易在想明白之前放弃动手'],
  },
  ENTJ: {
    nickname: '推进引擎', temperament: 'NT',
    oneLiner: '小组里最不能忍受"再等等看"的那个人。',
    blurb: '你天生会接管进度，也习惯替别人做决定。你的效率是真的，你的"你别废话了"也是真的。',
    strengths: ['目标拆解', '决策果断'],
    blind: ['容易把别人也当成任务'],
  },
  ENTP: {
    nickname: '抬杠小太阳', temperament: 'NT',
    oneLiner: '你说 A，我必须先替 B 说三分钟。',
    blurb: '你喜欢把想法抛到空气里看它能不能活下来，吵架对你来说是娱乐。别人怕你抬杠，其实你只是在测试这个世界有没有意思。',
    strengths: ['多角度反转', '点子供给'],
    blind: ['开了七个头，收零个尾'],
  },
  INFJ: {
    nickname: '一眼看穿者', temperament: 'NF',
    oneLiner: '你还没说完，我已经知道你在怕什么。',
    blurb: '你对人的情绪有近乎雷达的精度，却很少把这份精度用在自己身上。你温和，但你内心有一条别人踩不到线的底线。',
    strengths: ['洞察动机', '深度共情'],
    blind: ['把别人的情绪背成自己的债'],
  },
  INFP: {
    nickname: '温柔理想国', temperament: 'NF',
    oneLiner: '看起来很好说话，只有价值观被碰了一下才知道。',
    blurb: '你心里有一座只对少数人开放的城市，靠喜欢的事情撑着。你会为一句歌词难过，也会为陌生人写三段话。',
    strengths: ['价值敏感', '共情表达'],
    blind: ['现实步骤会让你短暂瘫痪'],
  },
  ENFJ: {
    nickname: '带队大哥大', temperament: 'NF',
    oneLiner: '群里没人回复的时候，总是你接的那一句。',
    blurb: '你能准确地让每个人感到自己被照顾到，代价是你很少有时间问自己要不要。你的号召力来自真诚，不是技巧。',
    strengths: ['凝聚他人', '激励表达'],
    blind: ['容易把关系的好坏算在自己头上'],
  },
  ENFP: {
    nickname: '点子烟花', temperament: 'NF',
    oneLiner: '我三分钟前提了四个项目，都要今天开始。',
    blurb: '你对"新"这件事有无穷的体力，能跟保安聊二十分钟人生。你不是不专注，只是每个火花都真的亮过。',
    strengths: ['连接可能', '点燃气氛'],
    blind: ['热情退潮后的收尾环节'],
  },
  ISTJ: {
    nickname: '靠谱基石', temperament: 'SJ',
    oneLiner: '说过会做，就一定会做，包括你早忘了的那件。',
    blurb: '你是那种让所有人安心的人，因为你把承诺当成事实处理。你不喜欢临场应变，不是因为僵硬，是因为你已经算好了。',
    strengths: ['执行稳定', '细节负责'],
    blind: ['把规则当成唯一解'],
  },
  ISFJ: {
    nickname: '后台守护者', temperament: 'SJ',
    oneLiner: '你记得每个人的忌口，但没人记得问你爱吃啥。',
    blurb: '你的照顾藏在细节里：递过来的纸巾、悄悄带好的充电宝。你不擅长开口要，所以常常给得比要得多。',
    strengths: ['细心照护', '可靠记忆'],
    blind: ['需求长期排队在自己后面'],
  },
  ESTJ: {
    nickname: '秩序队长', temperament: 'SJ',
    oneLiner: '散会了但活还没分？那我来分。',
    blurb: '你相信事情该有该在的位置，也愿意为此当那个不好惹的人。你的强硬多半是为了让大家都别熬夜。',
    strengths: ['组织调度', '落地推进'],
    blind: ['快起来顾不上别人的节奏'],
  },
  ESFJ: {
    nickname: '人脉暖炉', temperament: 'SJ',
    oneLiner: '你和谁都能聊，且能让对方觉得聊得挺开心。',
    blurb: '你对氛围的变化极其敏感，擅长把陌生人变成"上次那个朋友"。你在乎被需要，也希望被明确地感谢一次。',
    strengths: ['关系经营', '氛围调度'],
    blind: ['太容易被评价牵动'],
  },
  ISTP: {
    nickname: '上手就修', temperament: 'SP',
    oneLiner: '别念说明书了，我拆开看看就懂了。',
    blurb: '你不爱说，但你手上功夫是真的。你对"当下能解决什么"有精准直觉，也讨厌被拉进没完的情绪讨论。',
    strengths: ['临场拆解', '动手解决'],
    blind: ['对长期承诺天然警惕'],
  },
  ISFP: {
    nickname: '安静审美家', temperament: 'SP',
    oneLiner: '我不评价，但我心里对每样东西都有颜色。',
    blurb: '你用感觉挑选世界：一件衣服、一首歌、一条路。你随和到有弹性，但在自己喜欢的东西上异常固执。',
    strengths: ['审美直觉', '当下沉浸'],
    blind: ['不喜欢就要冲突，于是先退'],
  },
  ESTP: {
    nickname: '现场玩家', temperament: 'SP',
    oneLiner: '计划表是死的，现在是活的，先冲。',
    blurb: '你在混乱里最清醒，越紧急你越来劲。你的行动力会让别人怀疑你是不是不看后果——其实你是看了，觉得无所谓。',
    strengths: ['快速反应', '现实博弈'],
    blind: ['无聊比失败更难忍受'],
  },
  ESFP: {
    nickname: '全场聚光灯', temperament: 'SP',
    oneLiner: '有我在的场合，没有人需要负责冷场。',
    blurb: '你能把一次普通聚餐变成值得发朋友圈的晚上。你的能量是真的，你对"被冷落"的敏感也是真的。',
    strengths: ['带动体验', '即时感染'],
    blind: ['安静下来的时候有点慌'],
  },
};
