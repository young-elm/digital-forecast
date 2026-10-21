// 职业预测：每个型别给 4 个方向（大学生能听懂的岗位名 + 为什么是你）
// prop 用于决定虚拟形象手里拿的东西
// TAG_CAREERS 用于按标签微调排序（比如"无差别善意"会把公益方向提前）

const CAREERS = {
  INTJ: [
    { name: '产品 / 策略分析', why: '你受不了没有全局的方案，也受不了有全局却没人推进。', prop: 'chart' },
    { name: '算法 / 数据研究员', why: '把一个乱问题抽象成能算的模型，这件事你有耐心。', prop: 'code' },
    { name: '法学（偏研究与诉讼策略）', why: '你享受用规则打赢，而且不被情绪带偏。', prop: 'gavel' },
    { name: '独立开发 / 一人公司', why: '你需要一个不用向别人反复解释前提的位置。', prop: 'laptop' },
  ],
  INTP: [
    { name: '研发 / 系统架构', why: '你会为"它凭什么是这样"熬夜，这正是这行需要的。', prop: 'code' },
    { name: '学术科研 / 读博', why: '你适合没人给你标准答案的长问题。', prop: 'book' },
    { name: '策略咨询 / 行业研究', why: '拆解陌生领域是你的娱乐项目。', prop: 'chart' },
    { name: '技术写作 / 科普内容', why: '你把复杂讲清楚的时候，自己也很爽。', prop: 'laptop' },
  ],
  ENTJ: [
    { name: '项目管理 / PMO', why: '你天生会接管进度，而且接管得让别人服。', prop: 'chart' },
    { name: '创业 / 早期业务负责人', why: '混乱对你不是风险，是可以被组织的机会。', prop: 'laptop' },
    { name: '管理咨询', why: '你既能算清账，也敢当面说不好听的那句。', prop: 'gavel' },
    { name: '投行 / 商业分析', why: '高强度 + 明确胜负，你的续航在这里是优势。', prop: 'chart' },
  ],
  ENTP: [
    { name: '产品经理 / 创新业务', why: '你需要同时试五个方向，还得有人听你讲。', prop: 'laptop' },
    { name: '市场 / 品牌策划', why: '你擅长把一个新角度讲得让人想转发动。', prop: 'mic' },
    { name: '投资 / 早期项目尽调', why: '你很快能看出一个故事哪里站不住。', prop: 'chart' },
    { name: '内容创作者 / 播主', why: '被反驳不会消耗你，只会让你更想开口。', prop: 'mic' },
  ],
  INFJ: [
    { name: '心理咨询 / 临床方向', why: '你能听见对方没说出口的那一层，且不会被打碎。', prop: 'book' },
    { name: '用户研究 / 深度访谈', why: '你天生会追问动机，而不满足于回答表面。', prop: 'mic' },
    { name: '编辑 / 长内容写作', why: '你写东西是为了把那层意思准确地说出来。', prop: 'brush' },
    { name: '教育 / 生涯规划', why: '你真心在意一个人后来变成了什么样。', prop: 'plant' },
  ],
  INFP: [
    { name: '内容 / 写作 / 编剧', why: '你心里那座城，需要一个出口。', prop: 'brush' },
    { name: '设计 / 视觉传达', why: '你用感觉挑选世界，这套直觉能变成作品。', prop: 'brush' },
    { name: '公益 / 社会组织', why: '你会为一件"没用但对的事"投入到底。', prop: 'plant' },
    { name: '心理 / 社工方向', why: '你对别人的处境有非常具体的想象力。', prop: 'book' },
  ],
  ENFJ: [
    { name: '人力资源 / 组织发展', why: '你能让每个人觉得自己被照顾到，还能带出结果。', prop: 'people' },
    { name: '教育 / 培训讲师', why: '激励别人对你不是表演，是本能。', prop: 'mic' },
    { name: '市场 / 品牌公关', why: '你对"人和组织的关系"特别敏感。', prop: 'stage' },
    { name: '创业者 / 团队一号位', why: '你招人、留人、推事，是一条龙。', prop: 'laptop' },
  ],
  ENFP: [
    { name: '品牌 / 活动策划', why: '你能把一个普通的晚上变成值得发圈的体验。', prop: 'stage' },
    { name: '用户增长 / 社群运营', why: '你跟陌生人破冰的速度是天赋。', prop: 'people' },
    { name: '自媒体 / 视频创作', why: '你的表达欲和新意能持续供内容。', prop: 'camera' },
    { name: '跨界研究员 / 咨询新人', why: '你需要不断接触新的领域，不然会褪色。', prop: 'book' },
  ],
  ISTJ: [
    { name: '财务 / 审计', why: '你的细致 + 不妥协，在这行是稀缺品。', prop: 'chart' },
    { name: '质量管理 / 合规', why: '规则该在哪里，你比谁都清楚。', prop: 'gavel' },
    { name: '公务员 / 事业单位', why: '稳定的流程和明确的责任边界让你安心。', prop: 'book' },
    { name: '后端 / 运维工程', why: '系统不出事这件事，你愿意负责到底。', prop: 'code' },
  ],
  ISFJ: [
    { name: '临床医学 / 护理', why: '你记得细节，而且不会让人觉得被催促。', prop: 'stethoscope' },
    { name: '教育 / 行政支持', why: '你把别人的不便提前处理掉了。', prop: 'plant' },
    { name: '用户服务 / 客户成功', why: '你能长期维持一段让对方放心的关系。', prop: 'people' },
    { name: '图书馆 / 档案 / 数据管理', why: '有序地保管东西，对你是一种安慰。', prop: 'book' },
  ],
  ESTJ: [
    { name: '运营管理', why: '你看见没分下去的活就会自动接手。', prop: 'chart' },
    { name: '供应链 / 物流', why: '你对流程和时效的耐心是实打实的。', prop: 'people' },
    { name: '法务 / 合规执行', why: '你敢当那个不好惹的人，且理由充分。', prop: 'gavel' },
    { name: '公务员 / 基层管理', why: '你需要一个能让事情落地的位置。', prop: 'book' },
  ],
  ESFJ: [
    { name: '市场营销 / 公关', why: '你能把陌生人变成"上次那个朋友"。', prop: 'people' },
    { name: '人力资源 / 招聘', why: '你判断人的速度快，还让人觉得舒服。', prop: 'stage' },
    { name: '教师 / 教务', why: '你记得住每个学生的事。', prop: 'plant' },
    { name: '活动策划 / 客户维护', why: '氛围变冷的时候，你总是先动的那个。', prop: 'mic' },
  ],
  ISTP: [
    { name: '后端 / 安全工程', why: '出了问题你拆开就修，还不太需要开会。', prop: 'code' },
    { name: '机械 / 电子 / 车辆工程', why: '你的手比你的嘴更快也更准。', prop: 'wrench' },
    { name: '数据 / 测试工程', why: '你擅长找出现在到底哪里坏了。', prop: 'chart' },
    { name: '技术型自由职业', why: '按件交付、不用维系关系，很适合你。', prop: 'laptop' },
  ],
  ISFP: [
    { name: '平面 / 产品设计', why: '你对颜色和比例有不需要理由的判断。', prop: 'brush' },
    { name: '摄影 / 影像创作', why: '你按下快门的时机比谁都诚实。', prop: 'camera' },
    { name: '手作 / 空间设计', why: '你适合做能被人拿在手里、走进去的东西。', prop: 'wrench' },
    { name: '动植 / 环保 / 园艺', why: '你不想说服任何人，只想把眼前的照顾好。', prop: 'plant' },
  ],
  ESTP: [
    { name: '销售 / 商务拓展', why: '你在临场博弈里最清醒，而且不怕被拒绝。', prop: 'stage' },
    { name: '创业 / 线下业务', why: '计划是死的，你会直接跟现实交手。', prop: 'laptop' },
    { name: '体育 / 活动执行', why: '越紧急你越来劲，现场需要你。', prop: 'wrench' },
    { name: '交易 / 市场方向', why: '你能在别人还在讨论时先做决定。', prop: 'chart' },
  ],
  ESFP: [
    { name: '主持 / 演艺 / 现场表演', why: '有你在，没人需要负责冷场。', prop: 'stage' },
    { name: '短视频 / 直播内容', why: '你的感染力在镜头前会翻倍。', prop: 'camera' },
    { name: '活动 / 体验设计', why: '你天生知道一个瞬间怎么才能让人记住。', prop: 'mic' },
    { name: '旅游 / 服务管理', why: '让别人玩得开心这件事你顺手就来。', prop: 'people' },
  ],
};

// 标签 → 强插/提前的职业方向（命中就加进候选，并附来源标签）
const TAG_CAREERS = {
  open_heart: { name: '公益 / 社会企业', why: '你对陌生人的默认信任，是这行最贵asset。', prop: 'plant' },
  night_diary: { name: '非虚构写作 / 记录者', why: '你写下来不需要观众，这正是长期产出需要的能力。', prop: 'brush' },
  theory_digger: { name: '基础学科研究', why: '你愿意为一个没人催你的问题花时间。', prop: 'book' },
  stage_ready: { name: '公众表达类（讲师 / 主持 / 路演）', why: '被盯着看对你来说是加分项而不是消耗。', prop: 'mic' },
  hands_on: { name: '工程实践 / 实验技术岗', why: '你需要手上真的有东西在动。', prop: 'wrench' },
  system_watcher: { name: '交互 / 体验设计', why: '你会本能地注意一个人被安排成什么样。', prop: 'brush' },
  emotion_holder: { name: '心理支持 / 危机干预', why: '紧急时你能先稳住人，再谈办法。', prop: 'book' },
  ddl_fuel: { name: '创意类（截稿驱动型）', why: '你的产能本来就集中在最后一段。', prop: 'camera' },
  planner_god: { name: '项目排期 / 运营策划', why: '你的排期表本身就是交付物。', prop: 'chart' },
};
