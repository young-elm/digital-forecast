// 性格标签库：每个标签 = 展示名 + 一句话解释 + 可用于文案的短语片段
// source: option(答某题触发) / combo(多个轴同时偏向触发)

const TAGS = {
  // ---- E / I ----
  solo_recharge: { name: '独处充电', desc: '你的电量只在自己一个人的时候涨。', fragment: '一个人待着才回血' },
  crowd_charger: { name: '人堆发电', desc: '越热闹你越像本人。', fragment: '越热闹越像本人' },
  party_host: { name: '组局小能手', desc: '散场不是结束，是你下一局的开始。', fragment: '散场后顺手组下一局' },
  early_escape: { name: '提前离场选手', desc: '你有一个永远用得上的借口：明天早八。', fragment: '借口明天早八先撤' },
  stage_ready: { name: '上台不怯场', desc: '被盯着看这件事，对你来说是加分项。', fragment: '敢站上台也享受上台' },
  backstage_power: { name: '幕后实力派', desc: '你把事情想通了，只是不想讲。', fragment: '负责想清楚，不负责讲出来' },
  instant_reply: { name: '秒回型选手', desc: '消息响三声你不接，会难受。', fragment: '消息响三声就必须接' },
  ghost_reader: { name: '意念回复大师', desc: '你回过了，只是在脑子里。', fragment: '在脑子里已经回复过了' },

  // ---- S / N ----
  list_runner: { name: '清单执行者', desc: '你的快乐来自把勾打上。', fragment: '清单划到最后一项才爽' },
  system_watcher: { name: '规则观察员', desc: '你会顺手研究一下它凭什么这么设计。', fragment: '顺手研究规则怎么设计的' },
  hands_on: { name: '上手就会', desc: '说明书是给你验证用的，不是学习用的。', fragment: '不读说明书，拆开就懂' },
  theory_digger: { name: '原理挖掘', desc: '不懂原理，你连用都用不安稳。', fragment: '非要搞懂它凭什么成立' },
  reliable_one: { name: '靠谱认证', desc: '"你做事真靠谱"是你最爱听的一句夸。', fragment: '一句"你真靠谱"能开心一天' },
  idea_well: { name: '脑洞供给', desc: '你的想法多到需要人帮你删。', fragment: '脑子里同时开着八个想法' },
  tomorrow_plan: { name: '睡前排程', desc: '关灯以后你在给明天排序。', fragment: '关灯后还在给明天排序' },
  midnight_whatif: { name: '深夜假设', desc: '你晚上想的不是明天，是一个没人问过的假设。', fragment: '睡前跑一个没人问过的假设' },

  // ---- T / F ----
  problem_solver: { name: '先解决问题', desc: '你的安慰方式就是给出方案。', fragment: '凌晨三点还在帮你理问题' },
  emotion_holder: { name: '先接住情绪', desc: '道理你懂，但你选择先陪着。', fragment: '先陪着聊，道理明天再讲' },
  progress_guard: { name: '进度条卫兵', desc: '拖进度这件事你真的是忍不了。', fragment: '见不得进度被谁拖住' },
  vibe_keeper: { name: '氛围维护者', desc: '气氛一变你先察觉，然后动手修。', fragment: '气氛一尴尬你就先开口' },
  roi_calculator: { name: '投入产出脑', desc: '你心里有一张所有选择的性价比表。', fragment: '做选择前先算一遍性价比' },
  heart_vote: { name: '心动投票', desc: '你最终都会投给"我喜欢"。', fragment: '最后一票永远投给喜欢' },
  debate_lover: { name: '越辩越清楚', desc: '被反驳不会让你难过，会让你来劲。', fragment: '被反驳只会越辩越来劲' },
  echo_three_days: { name: '一句话记三天', desc: '你嘴上说没事，心里在回放。', fragment: '一句话能在心里放三天' },

  // ---- J / P ----
  planner_god: { name: '计划表战神', desc: '你的 DDL 提前一周就不是 DDL 了。', fragment: 'DDL 提前七天就排好了' },
  ddl_fuel: { name: 'DDL 驱动', desc: '你的生产力最后三小时才到货。', fragment: '全靠最后三小时的自己' },
  itinerary_locked: { name: '行程精确到小时', desc: '跟着你出门，你连排队时间都算过。', fragment: '把行程排到几点几分' },
  go_with_flow: { name: '说走就走', desc: '订了票就等于做完了攻略。', fragment: '买了票就敢出发' },
  folder_nine: { name: '九层文件夹', desc: '你的文件命名规范到可以交给下一个人。', fragment: '文件夹分到你自己都佩服' },
  organized_chaos: { name: '乱但找得到', desc: '看起来是乱的，其实是一套你私有坐标系。', fragment: '桌面很乱但闭眼能翻到' },
  plan_breaker_hater: { name: '计划不可动', desc: '改计划比加计划更让你疲惫。', fragment: '临时改计划会让你原地重启' },
  pivot_master: { name: '随机应变', desc: '计划崩了的时候，你是最松弛的那个。', fragment: '计划崩了反而更来劲' },

  // ---- 风味：信任 / 内心戏 / 超能力 / 存在感 ----
  open_heart: { name: '无差别善意', desc: '你对陌生人的默认设置是相信。', fragment: '敢对没见过的陌生人松手' },
  bounded_kindness: { name: '有边界的善意', desc: '你想给，但你会留一手。', fragment: '给，但只给一半' },
  one_time_test: { name: '一次性考验', desc: '你愿意给，但你想知道对方会不会还。', fragment: '给出去之后开始默默记分' },
  alert_shield: { name: '边界感盔甲', desc: '你的东西和你的时间，同一条规则管理。', fragment: '东西和人都分得很清' },
  night_diary: { name: '深夜自记', desc: '你写下来不是为了被看，是为了不倒出来。', fragment: '没人看也坚持写给自己' },
  song_looper: { name: '单曲循环二十遍', desc: '你要听到懂为止才肯换歌。', fragment: '一首歌要循环到听懂为止' },
  inner_debate: { name: '脑内吵架冠军', desc: '你当时没接上的话，晚上全赢了回来。', fragment: '在脑子里吵架从没输过' },
  scroll_until_two: { name: '刷到两点', desc: '你不是有想看的，你是不想让今天结束。', fragment: '没什么想看的但就是不想睡' },
  mind_reader: { name: '听见没说出口的', desc: '你最想知道的是别人没说的那句。', fragment: '想听见别人没说的那一句' },
  vanish_mode: { name: '随时隐身五分钟', desc: '你需要的不是消失，是暂停被找。', fragment: '只要能隐身五分钟就活过来了' },
  time_freezer: { name: '时间暂停先睡', desc: '你对世界的要求不高，睡够就行。', fragment: '时间停下只为先睡够' },
  undo_tongue: { name: '话能撤回', desc: '你最锋利的部分，是你自己说过的话。', fragment: '最想撤回的还是自己那句' },
  want_to_be_seen: { name: '想被记得', desc: '你怕的不是失败，是没人想起你。', fragment: '宁可变凶也要被记住' },
  keep_a_door_locked: { name: '留一间不给人看', desc: '你有一块谁都不许进的自留地。', fragment: '心里有一间不上锁也不开门的房' },
  wrong_version: { name: '被记错的那个版本', desc: '比起被忘记，你更怕被传成一个不认识的人。', fragment: '宁可没人记得，也别记成别人那样' },
  no_update: { name: '停在旧版本', desc: '你后来变了，但没人知道。', fragment: '别人眼里的你还停在几年前' },

  // ---- 组合标签 ----
  spark_talker: { name: '表达型点子王', desc: '想法在你嘴里才真正成型。', fragment: '想法要当面讲完才算成立' },
  deep_diver: { name: '深度潜水员', desc: '你一个人能钻得很深。', fragment: '一个人也能钻到很深' },
  warm_operator: { name: '温柔执行', desc: '你把照顾做成了流程。', fragment: '把照顾别人做成了流程' },
  cool_craft: { name: '冷静手感', desc: '你手稳，且不带情绪。', fragment: '手上很稳，情绪很少' },
  freelance_seed: { name: '野生职业预备', desc: '你不适合被格子间装起来。', fragment: '天生不吃朝九晚五这一套' },
  glue_person: { name: '团队粘合剂', desc: '人在你手里会自动变得能合作。', fragment: '一群人因为你才叫团队' },
  solid_desk: { name: '硬核靠谱', desc: '给你的事就当成了已承诺。', fragment: '交给你的事就等于已承诺' },
  stubborn_logic: { name: '反骨逻辑', desc: '你的随性只针对流程，不针对道理。', fragment: '不守流程，但死守道理' },
  quiet_empathy: { name: '安静共情', desc: '你不用说话也知道别人怎么了。', fragment: '不说话也知道你不对劲' },
};

// 组合规则：needs 全部命中（同一轴的某个极）时触发
const COMBO_RULES = [
  { id: 'spark_talker', needs: ['E', 'N'] },
  { id: 'deep_diver', needs: ['I', 'N'] },
  { id: 'warm_operator', needs: ['F', 'J'] },
  { id: 'cool_craft', needs: ['T', 'S'] },
  { id: 'freelance_seed', needs: ['P', 'N'] },
  { id: 'glue_person', needs: ['E', 'F'] },
  { id: 'solid_desk', needs: ['S', 'J'] },
  { id: 'stubborn_logic', needs: ['T', 'P'] },
  { id: 'quiet_empathy', needs: ['I', 'F'] },
];

// 标签额外触发：极端置信度时补的"强度标签"
const STRENGTH_TAGS = {
  E: { name: '社交永动机', desc: '你的外向已经不属于性格，属于体能。', fragment: '社交对你来说是体力活还是快乐' },
  I: { name: '低耗电模式', desc: '你把自己维护成本做得很低。', fragment: '把自己维护成本压到最低' },
  S: { name: '现实锚点', desc: '你踩在地上，所以你能把别人也拽回来。', fragment: '永远能把话题拽回地面' },
  N: { name: '平行宇宙常驻', desc: '你的注意力有一半在还没发生的事上。', fragment: '一半注意力放在还没发生的事上' },
  T: { name: '情绪隔离舱', desc: '紧急时刻你最可用。', fragment: '越紧急你越冷静' },
  F: { name: '高敏接收器', desc: '细节你记得比谁都全。', fragment: '别人没说出口的你都听见了' },
  J: { name: '掌控欲（褒义）', desc: '你需要知道接下来会发生什么。', fragment: '必须提前知道接下来发生什么' },
  P: { name: '弹性人类', desc: '你给意外留了很大一间房。', fragment: '给意外预留了很大的空间' },
};
