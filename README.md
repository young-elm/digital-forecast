# 数字预测 · 给大学生的一份专属人格档案

回答 20 个大学生活场景里的问题，生成一份属于你的人格档案：MBTI 四维倾向、5 个性格标签、3 个职业方向、一个可拼装的虚拟形象，以及 3 条能直接发出去的朋友圈文案。

零依赖、零构建、无后端：所有逻辑都跑在浏览器里，所有数据都是可读的 JS 文件。

## 怎么跑起来

**方式一（推荐，能在手机上看）**

```bash
node serve.js            # 或 ELECTRON_RUN_AS_NODE=1 "Qoder.exe" serve.js
```

打开终端里打印的 `http://localhost:5173`；连同一个 WiFi 的手机打开局域网地址即可实测手机手感。

**方式二（最快）**

直接双击 `index.html`。功能可用，但部分浏览器在 `file://` 下会禁用 localStorage，"继续答题/查看档案"会失效。

## 改东西改哪个文件

```
index.html              入口，只负责按顺序加载脚本
styles/app.css          全部样式（移动端优先，460px 宽）
js/data/questions.js    题库：16 道轴题 + 4 道风味题      <- 想加题改这里
js/data/types.js        16 型昵称、一句话、短解读、气质分组
js/data/tags.js         57 个性格标签 + 组合规则 + 极端强度标签
js/data/careers.js      每型的职业方向池 + 标签触发的职业
js/data/copy.js         朋友圈文案库（型别专属 + 5 种风格的通用模板）
js/scoring.js           计分、标签分配、职业排序、文案填充
js/avatar.js            虚拟形象：SVG 分层部件（发型/姿态/表情/配件/手持物/氛围）
js/sharecard.js         分享图：canvas 手绘 1000x1500 竖版图
js/ui.js                页面状态机：首屏 -> 答题 -> 计算 -> 结果
assets/scenes/          20 张题目场景图（1120x640 jpg，共约 1.2MB），按题目 id 命名
tools/validate.js       数据完整性 + 算法回归检查
deploy/                 上云用的 nginx 配置和发布脚本
```

常见改法：

- **加一道题**：每题四段文字——`bg` 背景、`scene` 场景、`cast` 在场人物、`text` 提问，配 4 个选项。`axis` 填 `EI/SN/TF/JP` 之一（或 `null` + `flavor`），每个选项给一个 `pole` 和 `tags`。**再放一张 `assets/scenes/<题目id>.jpg`**——路径按 id 自动推导，题目里不用写。检查脚本会强制：四个选项必须两极都有覆盖且数量不超过 1 的差距、单个选项文案不超过 30 字、标签 id 必须在 `tags.js` 里存在、场景图必须存在且不是空文件。

- **加一个标签**：在 `tags.js` 的 `TAGS` 里加 `{ name, desc, fragment }`，`fragment` 是能被塞进文案里的那句话。
- **改文案风格**：`copy.js` 的 `GENERIC_COPY` 加一条，占位符只能用 `{type} {nickname} {temperament} {career1} {career2} {tag1..3} {frag1} {frag2} {oneLiner} {blind} {dominantName} {secondName}`。
- **给形象加部件**：`avatar.js` 里往 `PROPS`（手持物）或 `ACCESSORIES`（配件）加一段 SVG，然后在 `careers.js` 的 `prop` 字段引用。
- **换场景图**：`assets/scenes/` 里同名覆盖即可，代码不用动。现在的图是 1120x640 的 jpg（单张 35–80KB，20 张共 1.2MB），风格统一为"暗调蓝紫 + 暖黄点光源"的夜景插画，和深色主题一致。图找不到时页体会自动把图块删掉，只留文字，不影响答题。
  - `vibe_images/` 是生成时的原始大图（50MB），**不属于站点**，部署时不用带上，随时可删。
  - 场景图只出现在答题页，不会被画进分享图。分享图走 canvas，一旦把外链图片画进去就会污染画布、`toDataURL` 直接失败，所以卡片里继续只用内联 SVG。

## 跑检查

```bash
node tools/validate.js
```

它会遍历 **65536 种轴答案组合 + 40000 组随机作答**，检查：

- 题库结构（每轴 4 题、选项不重复、pole 合法、标签 id 都存在、每题都有 bg/scene/cast 三段介绍和一张场景图）
- 16 型全部可达，每型都有人设、职业池、型别专属文案
- 每条文案的占位符都能被真实数据填满，不留 `{xxx}`
- 标签库 57 个标签在随机作答中都能被触达（防止写了永远不出现的标签）
- 8960 种形象部件组合渲染不产生 `undefined`/`NaN`
- 同一组答案的结果稳定可复现

改完数据或算法记得再跑一次。

## 计分模型（一句话版）

- 4 个轴各 4 题，取多数极；**2:2 平票时按你最后作答的那一题判**，不抛随机硬币。注意这条顺序依赖：现在可以从题号导航任意跳题作答，同一批答案用不同顺序答完，平票的轴可能判到另一极。
- 偏向度 = 该轴多数题数 / 4，结果页显示为百分比；4:0 记作"答到极端"。
- 标签 5 个名额：2 个来自你答得最极端的两个轴（答题签名）+ 1 个极端强度标签 + 1 个轴组合标签 + 1 个风味题标签，不足时按优先级补齐。
- 职业 = 型别主流池（按内置顺序）+ 标签额外触发的方向，取前 3。
- 随机种子来自答案指纹（`hashString` 按 qid + 选项拼接，不含作答顺序），所以**同样答案永远同样结果**，跳着答、答完再改，只要最终答案一样结果就一样。唯一例外是上面那条 2:2 平票的顺序依赖。

### 跳题作答
进度条下面是 20 个题号（固定两行，每行 10 个）：青色实心 = 当前题，淡青描边 = 已答，灰 = 未答。点任意题号直接跳过去；重复作答只覆盖该题的选项，不影响别的题。

### 中途退出与提前结束

答题页顶部有两个出口：

- **← 退出**：回到首屏，进度存在 localStorage，首屏变成「继续答题 (n/20)」。键盘 `Esc` 同样退出。
- **结束测试，看已答部分**：用已经答过的题当场生成降级档案。某个维度一题都没答时，型别里该位用 `?` 占位（如 `E??J`），并明确标注"未测出"；职业方向和朋友圈文案依赖完整型别，此时整块不显示，而不是硬猜一个。降级页上有「继续补完（还剩 N 题）」直接跳到第一道未答题。


## 部署到阿里云 ECS（Linux）

站点是自包含的纯静态文件（`index.html` + `styles` + `js` + `assets`，约 1.35MB，没有任何外部 CDN 依赖），所以"部署"= 打包上传 + 一个 nginx 配置，不需要构建、不需要 Node 运行时。

### 一次性准备

1. **安全组**：阿里云控制台 → ECS → 安全组 → 入方向放行 `80`（和 `443`）。这一步在机器里做不了，`firewalld`/`ufw` 只管系统层。
2. **装 nginx 并挂配置**（root 执行，会自动识别 apt / dnf / yum）：

   ```powershell
   # Windows 上：把 deploy 目录传上去（发布包里没有它，白名单只有站点文件）
   scp -r deploy root@47.xx.xx.xx:/tmp/
   ```

   ```bash
   # 服务器上（脚本会按自身位置找同目录的 nginx.conf，在哪个目录执行都行）
   bash /tmp/deploy/setup-server.sh
   ```

   它把 `deploy/nginx.conf` 装到 `/etc/nginx/conf.d/digital-forecast.conf`，站点根目录是 `/var/www/digital-forecast`（首次访问会是 403/404，跑一遍 `deploy.ps1` 才有内容）。

### 日常发布（在 Windows 上执行）

```powershell
.\deploy\deploy.ps1 -Server 47.xx.xx.xx -User root
# 有域名后： .\deploy\deploy.ps1 -Server yourdomain.com -User deploy
```

脚本只做四件事：`tar` 打包白名单目录 → `scp` 上传 → `scp` 上传 `publish.sh` → `ssh` 执行发布。远端 `publish.sh` 先解到临时目录、校验 `index.html` 存在，才替换线上目录，旧版留在 `/var/www/digital-forecast.old`。

回滚：

```bash
rm -rf /var/www/digital-forecast && mv /var/www/digital-forecast.old /var/www/digital-forecast
```

### 三个会咬人的坑

- **`deploy/deploy.ps1` 必须存成「UTF-8 with BOM」**。Windows PowerShell 5.1 读不到 BOM 就按 GBK 解码，中文注释会碎成非法 token，报"字符串缺少终止符"。用 VS Code 保存时右下角选 `UTF-8 with BOM`。
- **`deploy/publish.sh` 必须是 LF 行尾**。`deploy.ps1` 上传前会本地清洗掉 `\r`，但如果你在服务器上直接编辑它，别用 Windows 剪贴板来回拷。
- **别把 `vibe_images/`（50MB 生成原图）传上去**，站点用的是 `assets/scenes/` 里压好的 1.2MB jpg。脚本的白名单已经排除了它。

### 域名与 HTTPS

- 走**中国内地** region + 域名解析：域名必须先完成 ICP 备案，否则 nginx 收不到请求（阿里云会拦 80/443）。备案期间可以先用公网 IP 直接访问自测。
- 走**香港/海外** region：不需要备案，但国内访问延迟高，且微信里对未备案域名的 H5 分享更容易弹"非官方链接"。
- 证书：`certbot --nginx -d 你的域名` 最省事，或在阿里云数字证书管理服务领免费 DV 证书，然后按 `deploy/nginx.conf` 末尾注释里的模板改成 80 跳转 + 443。
- 上线后记得在页脚挂 ICP 备案号，并在 30 天内补公安备案。

### 缓存

`nginx.conf` 里入口 HTML 是 `no-cache`（改完刷新即生效），`js/css/jpg` 是 7 天。文件名没有内容 hash，改图后想立刻全网生效就改文件名（如 `q_ei_1.jpg` → `q_ei_1_v2.jpg` 并同步 `js/ui.js` 的 `SCENE_IMG`），或临时把 `expires` 调成 `-1` 刷一次。

## 边界

- 这是社交话题产品，不是心理测量工具。题库是自编的，没有做信效度检验，页面上也明确写了免责。
- 型别只有 16 种，但标签 × 职业 × 形象 × 文案的组合空间大得多——"专属感"主要来自后三层，别把 MBTI 当卖点的全部。
- 没有后端：答过的题、生成过的档案都不上传，换设备就没了。

## 可以做的下一步

1. **埋点**：记录每题选了哪边、在哪一题流失，用真实数据调题（现在 20 题里哪道题最"没区分度"是看不出来的）。
2. **分享闭环**：结果页生成带参数链接，别人点进来能看到你的档案 + "我也测一次"，这是这类产品最主要的传播路径。
3. **题库扩充**：每轴从 4 题加到 6~8 题，随机抽 4 题作答，能显著降低"被猜中"的感觉，也让重测更有意思。
4. **小程序化**：内容层（`js/data/*` + `scoring.js`）是纯 JS、无 DOM 依赖，可以直接搬进小程序，只有 `ui.js`/`avatar.js`/`sharecard.js` 要重写。
