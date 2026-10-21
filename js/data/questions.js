// 题库：16 道 MBTI 轴题（4 轴 × 4 题）+ 4 道风味题（不计入 MBTI，只影响标签与形象）
// 约定：
//   bg    背景介绍——你是谁、事情的前情
//   scene 场景介绍——此刻的时间地点正在发生什么
//   cast  人物介绍——在场的是谁、他们什么性格
//   场景图按 id 约定放在 assets/scenes/<id>.jpg，不用在题目里写路径
//   options[].pole 该选项偏向的轴端；每道题两个极各至少一个选项
//   axis 为 null 的题目走 flavor 分支

const AXES = {
  EI: { name: '精力来源', left: 'E', right: 'I', leftName: '外向', rightName: '内向' },
  SN: { name: '信息偏好', left: 'S', right: 'N', leftName: '实感', rightName: '直觉' },
  TF: { name: '决策方式', left: 'T', right: 'F', leftName: '思考', rightName: '情感' },
  JP: { name: '生活节奏', left: 'J', right: 'P', leftName: '判断', rightName: '知觉' },
};

const FLAVORS = {
  trust: '你对陌生世界的默认信任度',
  inner: '你独处时内心戏的类型',
  power: '你想要的"没用的超能力"暴露了你的欲望',
  fear: '你更怕哪一种存在感事故',
};

const QUESTIONS = [
  // ================= E / I =================
  {
    id: 'q_ei_1', axis: 'EI', kicker: '周六下午 · 宿舍',
    bg: '你大二，这周连轴转了四天课加两次社团值班，累但不是那种能睡着的累。',
    scene: '周六下午两点，宿舍只剩你一个人，空调外机在窗外响。群里突然跳出一条消息："三点，后街烧烤，谁来？"',
    cast: '发消息的是社长陈哥，组局永远第一个喊人；你上铺的床空着，她已经两天没在宿舍吃过饭。',
    text: '你的手指停在屏幕上，第一反应是？',
    options: [
      { label: '打"我来"，然后开始换衣服', pole: 'E', tags: ['crowd_charger'] },
      { label: '先问几个人、几点散，顺手把没来的两个也@上', pole: 'E', tags: ['party_host'] },
      { label: '已读，把手机扣过去，继续看那集没看完的剧', pole: 'I', tags: ['solo_recharge'] },
      { label: '回"你们玩，我有点累"，其实是不想解释为什么累', pole: 'I', tags: ['early_escape'] },
    ],
  },
  {
    id: 'q_ei_2', axis: 'EI', kicker: '十一点 · 火锅店',
    bg: '你加的辩论队这学期第一次全员聚餐，你本来只是想来看看人。',
    scene: '十一点，火锅店的灯调暗了，服务员在旁边擦桌子等收尾。桌上还剩一锅没动的菌汤。',
    cast: '队长刚喊了一句"下一局谁去"，全场安静了两秒；你对面的大一学妹一直看手机，明显想走又不好意思说。',
    text: '在这两秒的安静里，你在做什么？',
    options: [
      { label: '站起来喊"我订了桌，能去的跟我走"', pole: 'E', tags: ['party_host'] },
      { label: '跟着起哄，反正散场前你不想一个人走', pole: 'E', tags: ['crowd_charger'] },
      { label: '把学妹拉出去透气，然后一起打车回学校', pole: 'I', tags: ['early_escape'] },
      { label: '留下帮队长算还剩多少钱没 A，这种活没人干', pole: 'I', tags: ['backstage_power'] },
    ],
  },
  {
    id: 'q_ei_3', axis: 'EI', kicker: '周三晚 · 图书馆研讨间',
    bg: '期末，四人社组作业，老师要求每组上台讲 12 分钟，占分不低。',
    scene: '周三晚上图书馆三楼研讨间，白板上还留着上一组的字迹。你们只剩这一次碰头的机会。',
    cast: '组里有个从开学就没露过面的"挂名选手"；负责做 PPT 的男生已经熬了两个通宵，说话都有点飘了。',
    text: '分工的时候，你开口说的第一句是？',
    options: [
      { label: '"我来讲，你们把稿子喂给我就行"', pole: 'E', tags: ['stage_ready'] },
      { label: '"我讲前半段，顺便把没露面那位拽上来讲一分钟"', pole: 'E', tags: ['stage_ready'] },
      { label: '"我做逻辑和问答预案，保证上台的人不被问倒"', pole: 'I', tags: ['backstage_power'] },
      { label: '"我做完自己那部分就走了，会开越久越难受"', pole: 'I', tags: ['early_escape'] },
    ],
  },
  {
    id: 'q_ei_4', axis: 'EI', kicker: '周四早八 · 教室最后一排',
    bg: '你有个习惯：微信消息不急着回，但电话是另一回事。',
    scene: '早八的课上，手机在桌洞里连着震了三下，屏幕亮着，一个没存名字的本地号码。',
    cast: '三分钟前，你妈在家庭群里发了一张你爸体检报告的照片，没有人接话。',
    text: '你的手指已经在桌洞里了，接下来？',
    options: [
      { label: '直接接起来，先问是谁', pole: 'E', tags: ['instant_reply'] },
      { label: '先截图发到室友群里问"这号谁认识"', pole: 'E', tags: ['instant_reply'] },
      { label: '按掉，等下课，真有事对方会再打', pole: 'I', tags: ['ghost_reader'] },
      { label: '让它响完，心里已经想好三条不接的理由', pole: 'I', tags: ['solo_recharge'] },
    ],
  },

  // ================= S / N =================
  {
    id: 'q_sn_1', axis: 'SN', kicker: '晚八点 · 北门超市',
    bg: '这周轮到你给宿舍采购公共物资，钱大家已经转给你了。',
    scene: '晚上八点学校北门超市，推车第三辆轮子是歪的，货架前挤满了刚下课的人。',
    cast: '你手里攥着室友发来的 11 项清单，语音里她还补了一句"纸巾要三层的那种"。',
    text: '推着车往前走的第一分钟，你在看什么？',
    options: [
      { label: '按清单定位：纸巾、垃圾袋、洗衣液，一趟拿完', pole: 'S', tags: ['list_runner'] },
      { label: '先确认有没有三层纸巾，没有立刻回她换哪个牌子', pole: 'S', tags: ['reliable_one'] },
      { label: '在想为什么收银台非要把口香糖放在排队动线上', pole: 'N', tags: ['system_watcher'] },
      { label: '顺手记下三个能改进的点，回头发给做零售的同学', pole: 'N', tags: ['idea_well'] },
    ],
  },
  {
    id: 'q_sn_2', axis: 'SN', kicker: '周日中午 · 宿舍',
    bg: '你室友在用一款你没见过的软件剪视频，两分钟出了一条片子。',
    scene: '周日中午，你坐在自己床上，电脑开着，搜索框里是那个软件的名字。',
    cast: '能教你的是那个从不看教程、但作品最好看的同班同学；B 站教程第一集 47 分钟，up 主说"耐心看完"。',
    text: '接下来 20 分钟，你实际会做的事？',
    options: [
      { label: '把她的片子拖进来，一比一复刻一遍', pole: 'S', tags: ['hands_on'] },
      { label: '找一份"十分钟上手"的速成，跟着点一遍', pole: 'S', tags: ['list_runner'] },
      { label: '先搞明白它的轨道逻辑和她以前用的到底哪不一样', pole: 'N', tags: ['theory_digger'] },
      { label: '查它底层用什么渲染，然后跑题到两个小时前的别的软件', pole: 'N', tags: ['midnight_whatif'] },
    ],
  },
  {
    id: 'q_sn_3', axis: 'SN', kicker: '学院开放日 · 你的展位',
    bg: '你这学期偷偷做了个小东西，第一次摆出来给人看。',
    scene: '学院开放日，你的展位前站了三个人，其中一个是来招人的学长。',
    cast: '学长看完说了两句话；你导师正在跟别人聊天，没听见。',
    text: '哪一句你会记更久？',
    options: [
      { label: '"东西做得挺完整，交付没让人操心"', pole: 'S', tags: ['reliable_one'] },
      { label: '"连使用说明都写了？这细节很少有人做"', pole: 'S', tags: ['hands_on'] },
      { label: '"这个角度我没想过，你怎么想到的？"', pole: 'N', tags: ['idea_well'] },
      { label: '"你其实已经想清楚了它为什么成立"', pole: 'N', tags: ['theory_digger'] },
    ],
  },
  {
    id: 'q_sn_4', axis: 'SN', kicker: '零点四十 · 熄灯后的宿舍',
    bg: '你今天过得没什么波澜，这正是最容易想事情的时候。',
    scene: '凌晨零点四十，宿舍熄灯，隔壁床的呼吸声已经很均匀。手机在充电，你躺着没动。',
    cast: '明天第一节是可以不来的选修；后天有一个你还没开始动的大作业。',
    text: '关灯之后，你脑子里实际在放什么？',
    options: [
      { label: '把明天的顺序排一遍，包括先回哪条消息', pole: 'S', tags: ['tomorrow_plan'] },
      { label: '清点这周还有什么没做，然后为做完的两件满意一下', pole: 'S', tags: ['list_runner'] },
      { label: '一个跟明天完全无关的假设，越想越清醒', pole: 'N', tags: ['midnight_whatif'] },
      { label: '把三年前一件小事重新推演一遍，换个说法会怎样', pole: 'N', tags: ['system_watcher'] },
    ],
  },

  // ================= T / F =================
  {
    id: 'q_tf_1', axis: 'TF', kicker: '凌晨三点十分 · 枕头下',
    bg: '你在宿舍睡得正沉，这一天你还有四节课。',
    scene: '三点十分，手机在枕头下震。接起来，那头没有说话，只有呼吸声。',
    cast: '屏幕上写着"阿哲"——你们班最不爱麻烦别人的人，上次他半夜找你是他爸妈离婚那晚。',
    text: '你的第一句话是？',
    options: [
      { label: '"你先说，是钱、是家里、还是有人找你麻烦"', pole: 'T', tags: ['problem_solver'] },
      { label: '"你现在在哪，我去找你，路上你慢慢讲清楚"', pole: 'T', tags: ['problem_solver'] },
      { label: '"我不挂，你想说就说，不想说我就这么听着"', pole: 'F', tags: ['emotion_holder'] },
      { label: '先把他逗笑一次，确认他不会做傻事再说别的', pole: 'F', tags: ['vibe_keeper'] },
    ],
  },
  {
    id: 'q_tf_2', axis: 'TF', kicker: '交稿前三天 · 组会',
    bg: '大作业占这门课 40%，五个人一组，你是组长。',
    scene: '交稿前三天的组会上，那位"负责资料"的同学第三次说"我这两天有点忙"。',
    cast: '做 PPT 的女生已经把他那部分也做了，她没说话，只在桌子底下踢了踢你的鞋。',
    text: '你当场说出口的是？',
    options: [
      { label: '"那这块我们分了，你负责最后核对，行吗"', pole: 'T', tags: ['progress_guard'] },
      { label: '"我直接跟老师说明情况，别等交稿那天互相甩"', pole: 'T', tags: ['roi_calculator'] },
      { label: '先岔开话题，会后单独问他是不是出事了', pole: 'F', tags: ['emotion_holder'] },
      { label: '先替他把这块补上，他心里会记着这件事', pole: 'F', tags: ['vibe_keeper'] },
    ],
  },
  {
    id: 'q_tf_3', axis: 'TF', kicker: '寒假前三天 · 三条链接',
    bg: '寒假有 25 天，你可以用来做一件事，只能一件。',
    scene: '辅导员在群里发了三条链接：一段大厂实习内推、一门能换绩点的网课、一个你其实很想去但没钱的田野调查。',
    cast: '你妈刚打电话问寒假能不能回家，来回车票 620；你的余额是三位数。',
    text: '你最后点进去的是哪一个？',
    options: [
      { label: '实习内推，简历上下学期就能用上这一行', pole: 'T', tags: ['roi_calculator'] },
      { label: '网课，因为能换学分，成本最低、结果确定', pole: 'T', tags: ['problem_solver'] },
      { label: '田野调查，钱可以再挣，这个窗口只有这一次', pole: 'F', tags: ['heart_vote'] },
      { label: '回家，然后在老家附近找份兼职把路费挣出来', pole: 'F', tags: ['emotion_holder'] },
    ],
  },
  {
    id: 'q_tf_4', axis: 'TF', kicker: '结果公示 · 晚上十点',
    bg: '你第一次投了个比赛，准备了三周。',
    scene: '晚上十点出结果，你在名单里没找到自己，只在评语栏看到一行字："逻辑不清，建议重做。"',
    cast: '写评语的是你挺敬重的一位老师；同组的人已经截图发到群里，问"这谁写的"。',
    text: '十点半的时候，你在干什么？',
    options: [
      { label: '把那六个字逐句拆开，想好哪一句要当面问清楚', pole: 'T', tags: ['debate_lover'] },
      { label: '去查这届入围作品的共同点，改一版下次再投', pole: 'T', tags: ['roi_calculator'] },
      { label: '把"建议重做"抄进备忘录，然后告诉自己别多想', pole: 'F', tags: ['echo_three_days'] },
      { label: '先跟同组的人聊到十二点，气顺了再回头看那行字', pole: 'F', tags: ['emotion_holder'] },
    ],
  },

  // ================= J / P =================
  {
    id: 'q_jp_1', axis: 'JP', kicker: 'DDL 前七天 · 空桌面',
    bg: '一门课的大作业占分很重，要求写得明明白白。',
    scene: '距 DDL 还有七天，晚上你在宿舍，电脑桌面上只有一个新建文件夹。',
    cast: '你室友明天就要交她的初稿；你上学期靠"最后一晚"过了三门课，其中一门差点没过。',
    text: '你今晚真实会做的事？',
    options: [
      { label: '把七天拆成每天两小时，写进日历并设提醒', pole: 'J', tags: ['planner_god'] },
      { label: '今晚先把框架和参考文献搭完，剩下的按天推', pole: 'J', tags: ['itinerary_locked'] },
      { label: '收藏六个教程，告诉自己"明天一定开始"', pole: 'P', tags: ['ddl_fuel'] },
      { label: '打开文档，先写自己最有灵感的那一段', pole: 'P', tags: ['organized_chaos'] },
    ],
  },
  {
    id: 'q_jp_2', axis: 'JP', kicker: '周五晚 · 三天两夜',
    bg: '你和三个朋友要出去三天两夜，票是你抢的。',
    scene: '周五晚上，高铁票刚抢到，住宿还没订，群里在问"明天几点出发"。',
    cast: '提议去的人已经查好了必去的五个点，正等着别人配合；有个朋友晕车，从不参与这类讨论。',
    text: '你此刻的状态是？',
    options: [
      { label: '我做了张表，几点到哪、吃饭留多久都写了', pole: 'J', tags: ['itinerary_locked'] },
      { label: '现在就把住宿订了，明早七点半出发，迟到发红包', pole: 'J', tags: ['planner_god'] },
      { label: '票都有了还愁没地方睡？到了再说', pole: 'P', tags: ['go_with_flow'] },
      { label: '我在想哪天下雨，那天的安排到时候整个换掉', pole: 'P', tags: ['pivot_master'] },
    ],
  },
  {
    id: 'q_jp_3', axis: 'JP', kicker: '宿舍门口 · 给学弟发资料',
    bg: '你上学期那门课的笔记做得很全，学弟来借。',
    scene: '他站在你宿舍门口等你发给他，你说"我这就发"，然后打开电脑。',
    cast: '学弟要的是"那门课的笔记"；你的电脑里有一个叫"新建文件夹(3)"的东西，你已经三年没点开过它。',
    text: '三分钟后，他实际收到的是？',
    options: [
      { label: '一个 PDF，按章节命名，还带一页目录', pole: 'J', tags: ['folder_nine'] },
      { label: '"等我两分钟"——先重命名归档好再发出去', pole: 'J', tags: ['planner_god'] },
      { label: '十七个文件，顺序是乱的，但你标注了"第三个最重要"', pole: 'P', tags: ['organized_chaos'] },
      { label: '搜了八分钟没找到，最后说"我给你手敲一份重点吧"', pole: 'P', tags: ['ddl_fuel'] },
    ],
  },
  {
    id: 'q_jp_4', axis: 'JP', kicker: '展示前两小时 · 教室被占',
    bg: '你们为这次小组展示排练了三次，稿子刚好卡在 12 分钟。',
    scene: '展示前两小时，老师发消息：教室被占，改到阶梯教室，且每组时间从 12 分钟压到 7 分钟。',
    cast: '有人立刻开始抱怨；做 PPT 的人手在抖；你手上那份稿子一秒都没删。',
    text: '你放下手机后的第一个动作？',
    options: [
      { label: '先问能不能保留问答环节，我想按原顺序讲', pole: 'J', tags: ['plan_breaker_hater'] },
      { label: '坐下来把 7 分钟版本重新排一遍，不然心里不踏实', pole: 'J', tags: ['planner_god'] },
      { label: '正好，我一直觉得后半段啰嗦，现在能砍了', pole: 'P', tags: ['pivot_master'] },
      { label: '先跟大家说"能讲完"，然后现场一页一页删', pole: 'P', tags: ['go_with_flow'] },
    ],
  },

  // ================= 风味题 =================
  {
    id: 'q_trust', axis: null, flavor: 'trust', kicker: '高铁四小时 · 陌生人',
    bg: '你独自坐高铁去另一个城市，行程还有四个小时。',
    scene: '旁边座位的人刚坐下，翻了两遍包，发现自己的充电宝落在家里。他犹豫了半分钟，开口问你借。',
    cast: '一个完全陌生的乘客；你的充电宝还剩 60%，而你下车后还要导航两个小时。',
    text: '你递出去吗？',
    options: [
      { label: '"你用吧，我还有电"，说完自己都有点意外', tags: ['open_heart'], flavorValue: 2 },
      { label: '给，但把线也借过去，让他先用一半', tags: ['bounded_kindness'], flavorValue: 1 },
      { label: '给，然后心里悄悄记下他会不会主动还', tags: ['one_time_test'], flavorValue: 1 },
      { label: '不给，说"我下车后也要用"，说完觉得自己有点冷', tags: ['alert_shield'], flavorValue: 0 },
    ],
  },
  {
    id: 'q_inner', axis: null, flavor: 'inner', kicker: '周五夜 · 十一点半',
    bg: '难得一个没人找你的晚上，你连澡都还没洗。',
    scene: '周五夜里十一点半，你躺在床上，灯关了，手机屏幕亮着。',
    cast: '群里最后一条消息是二十分钟前，没有人 @ 你；明天没有安排。',
    text: '这一小时你实际在做什么？',
    options: [
      { label: '在备忘录里写今天那件小事，写完自己再看一遍', tags: ['night_diary'] },
      { label: '同一首歌循环到第七遍，直到某句歌词对上', tags: ['song_looper'] },
      { label: '把三个月前那场没发挥好的对话，在脑子里重演并赢回来', tags: ['inner_debate'] },
      { label: '什么都没想看，但一直刷到两点，因为不想今天就结束', tags: ['scroll_until_two'] },
    ],
  },
  {
    id: 'q_power', axis: null, flavor: 'power', kicker: '楼下 · 四选一',
    bg: '前提：这个超能力不能帮你赚钱、不能帮你考试、不能告诉别人。',
    scene: '一个穿风衣的人在你宿舍楼下摆了张桌子，让你四选一，签了就不能反悔。',
    cast: '排队的人里有你室友，他已经选完正在上楼，看起来什么变化都没有。',
    text: '你选哪个？',
    options: [
      { label: '能听见别人没说出口的那句话', tags: ['mind_reader'], accessory: 'ear' },
      { label: '随时让自己隐身五分钟', tags: ['vanish_mode'], accessory: 'veil' },
      { label: '时间暂停，先睡够再说', tags: ['time_freezer'], accessory: 'clock' },
      { label: '说过的话能一键撤回', tags: ['undo_tongue'], accessory: 'loop' },
    ],
  },
  {
    id: 'q_fear', axis: null, flavor: 'fear', kicker: '十年后 · 同学聚会',
    bg: '想象一个你不在场的聚会，话题自然滑到了你身上。',
    scene: '十年后的同学聚会，有人提起你，另一个人的反应决定这道题的答案。',
    cast: '提起你的是当年组里最话多的那位，他一向觉得你最有趣。',
    text: '哪种反应最让你难受？',
    options: [
      { label: '他沉默了三秒，然后问："哪个班的？"', tags: ['want_to_be_seen'], aura: 'star' },
      { label: '有人把你当年没说出口的原因，当众替你说完了', tags: ['keep_a_door_locked'], aura: 'moon' },
      { label: '他们把你描述成一个你完全不认识的人，而且都信了', tags: ['wrong_version'], aura: 'bloom' },
      { label: '他们说起你，只记得大一那年的你，之后再没有更新', tags: ['no_update'], aura: 'plain' },
    ],
  },
];
