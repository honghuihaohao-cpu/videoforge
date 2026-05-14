export type StepStatus = "pending" | "in_progress" | "passed" | "failed";
export type InputType = "text" | "file" | "link" | "form" | "data-table";

export interface QualityGate {
  id: string;
  label: string;
  description: string;
  type: "checkbox" | "ai-check" | "manual-review";
  weight: number; // 0-1
}

export interface WorkflowStep {
  number: number;
  name: string;
  tagline: string;
  description: string;
  phase: "prepare" | "produce" | "post";
  inputType: InputType;
  inputLabel: string;
  inputPlaceholder: string;
  qualityGates: QualityGate[];
  aiEvaluationEnabled: boolean;
  aiPrompt: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  // ========== 准备期 ==========
  {
    number: 1,
    name: "选题验证",
    tagline: "在投入时间之前，确认这个选题值得做",
    phase: "prepare",
    description: `搜索目标平台同类内容，确认搜索量和竞争格局。核心问题：这个选题有没有人搜？已有的内容质量如何？你能不能在某个维度上碾压它们？选题本身有没有"认知缺口"——观众看完会说"原来如此"而不是"我早就知道"。`,
    inputType: "text",
    inputLabel: "选题描述",
    inputPlaceholder: "描述你的选题创意，例如：Harness Engineering 是什么？为什么它是 2026 年 AI 圈最热的概念？目标平台是 B 站...",
    qualityGates: [
      { id: "1-1", label: "同类内容前3名已分析，至少在一个维度上能超过它们", description: "在目标平台搜索关键词，看播放量最高的前几个视频", type: "checkbox", weight: 1.0 },
      { id: "1-2", label: "选题有认知缺口（不是常识，也不是太冷门）", description: "观众看完会说'原来如此'，而不是'我早就知道'或'这有什么用'", type: "checkbox", weight: 1.0 },
      { id: "1-3", label: "至少能想到3个可以被画面的关键概念", description: "全是抽象概念 = 极高的制作难度。有比喻 = 天然的视觉锚点", type: "checkbox", weight: 0.8 },
      { id: "1-4", label: "目标平台确认（B站/抖音/视频号）", description: "不同平台的内容基因不同，不要用同一把刀切三种肉", type: "checkbox", weight: 0.6 },
    ],
    aiEvaluationEnabled: true,
    aiPrompt: `你是资深视频内容策略师。评估以下选题描述的质量。
从以下维度打分（1-10）并给出简短理由：
1. 搜索需求度：有人会搜这个吗？
2. 竞争空间：现有内容质量不高/有空白吗？
3. 认知缺口：观众看完会有收获感吗？
4. 可视化潜力：能用画面讲清楚吗？
5. 平台适配：这个选题适合目标平台吗？

最后给出：综合评分（0-100），是否建议推进，如果推进需要注意什么。`,
  },
  {
    number: 2,
    name: "深度调研",
    tagline: "确保内容的准确性——一条错误会让信任归零",
    phase: "prepare",
    description: `收集一手来源（官方博客、论文原文、当事人发言），交叉验证关键事实，记录出处。同时刻意收集反对声音和批评——让你的内容更立体，也更难被攻击。`,
    inputType: "text",
    inputLabel: "调研笔记",
    inputPlaceholder: "粘贴你的调研笔记，包括：关键事实、数据来源、引用出处、反面观点...",
    qualityGates: [
      { id: "2-1", label: "核心概念定义有官方或学术来源", description: "不是二手报道，是一手来源", type: "checkbox", weight: 1.0 },
      { id: "2-2", label: "所有数据（百分比、金额、时间）都有出处", description: "每一个数字都能追溯到原文", type: "checkbox", weight: 1.0 },
      { id: "2-3", label: "至少阅读了3篇反对或批评该主题的资料", description: "不要只看支持你论点的资料", type: "checkbox", weight: 0.8 },
      { id: "2-4", label: "没有'我猜的'部分——要么有出处，要么不写", description: "不确定的内容不值得冒信任风险", type: "checkbox", weight: 0.6 },
    ],
    aiEvaluationEnabled: true,
    aiPrompt: `你是资深事实核查员。评估以下调研笔记的质量。
从以下维度打分：
1. 信息来源权威性
2. 数据可追溯性
3. 正反观点平衡度
4. 知识盲区（还有什么重要的你没提到？）

给出综合评分和改进建议。`,
  },
  {
    number: 3,
    name: "脚本撰写",
    tagline: "好的脚本 = 视频成功的一半。差的脚本，神仙剪辑都救不回来",
    phase: "prepare",
    description: `把调研成果转化成"让人停不下来"的视频文字。核心规则：口语化（写的时候大声念出来）、钩子前置（前3句话决定60%的人会不会划走）、节奏设计（每90-120秒需要一个转折/数据冲击/故事）、金句预埋、结尾留认知余味。`,
    inputType: "text",
    inputLabel: "视频脚本",
    inputPlaceholder: "粘贴你的完整脚本。确保是口语化的——这是'一个人将要说出来的话'，不是一篇论文...",
    qualityGates: [
      { id: "3-1", label: "大声读完脚本——没有一处读起来别扭", description: "书面语、长句、拗口词统统改掉", type: "checkbox", weight: 1.0 },
      { id: "3-2", label: "前5句话里有画面感（非'今天我们来科普...'）", description: "直接把人扔进一个画面里，不是在介绍一个话题", type: "ai-check", weight: 1.0 },
      { id: "3-3", label: "全片至少3个可被截图的画面在脚本里标注了", description: "这些是视频的传播锚点", type: "checkbox", weight: 0.8 },
      { id: "3-4", label: "结尾有一个开放问题或认知余味", description: "让观众在视频结束后脑子里还在想", type: "checkbox", weight: 0.8 },
      { id: "3-5", label: "每90秒内必有钩子、转折或数据冲击", description: "没有超过90秒的平铺直叙段落", type: "ai-check", weight: 0.6 },
    ],
    aiEvaluationEnabled: true,
    aiPrompt: `你是资深视频脚本评审。对以下脚本进行全面评估：

【评分维度（每项1-10分）】
1. 钩子力度：前5句话的吸引力——用户会在3秒内决定划不划走
2. 信息节奏：是否有超过90秒的平淡段落？干货和喘气间隙是否交替？
3. 金句密度：可截图传播、可做封面的句子有多少？
4. 口语化程度：是"一个人说出来的话"还是"一篇文章念出来"？
5. 结尾余味：有没有留下认知缺口让观众在视频结束后还在想？
6. 结构清晰度：逻辑链条是否合理，观众能不能跟上？

【综合评估】
- 综合评分（0-100）
- 最突出的3个优点
- 最需要改进的3个问题（按优先级排序）
- 如果这是B站30分钟长视频脚本，预计完播率范围
- 如果改成抖音3分钟短版，哪些内容应该保留/删掉？`,
  },
  // ========== 制作期 ==========
  {
    number: 4,
    name: "脚本质检",
    tagline: "让另一个'人'来验：观众真的有耐心看完吗？",
    phase: "produce",
    description: `把脚本发给至少一个没参与创作的人（或AI模拟），让他标记所有"想跳过去"的地方。凡是有标记的地方，要么删掉，要么把信息压缩一半。同时验证：看完之后他记住的一个东西，是不是你最想传达的那个？`,
    inputType: "text",
    inputLabel: "修改后的脚本 + 他人反馈",
    inputPlaceholder: "粘贴修改后的脚本，并附上试读者的反馈（在哪里想跳过、最后记住了什么）...",
    qualityGates: [
      { id: "4-1", label: "至少一个人（非你自己）完整读过并提供反馈", description: "如果没有其他人，让 AI 模拟一个'第一次看的观众'", type: "checkbox", weight: 1.0 },
      { id: "4-2", label: "所有'想跳过'的点已处理", description: "删掉或压缩", type: "checkbox", weight: 1.0 },
      { id: "4-3", label: "试读者记住的核心信息 = 你设计的最核心信息", description: "如果不是，脚本的信息优先级需要重新调整", type: "checkbox", weight: 0.6 },
    ],
    aiEvaluationEnabled: true,
    aiPrompt: `你是第一次接触这个内容的观众。读完以下脚本后回答：
1. 你在哪些地方"想跳过去"？（标记具体段落）
2. 看完后你记住的最主要的一个信息是什么？
3. 这个信息是否是作者最想传达的？如果不是，作者应该怎么调整信息优先级？
4. 脚本中有什么让你困惑或需要更多解释才能理解的地方？`,
  },
  {
    number: 5,
    name: "配音制作",
    tagline: "音轨是整个视频的时间轴骨架",
    phase: "produce",
    description: `生成一条自然人声的配音音轨。推荐使用剪映克隆音色（先录10句话做样本，后续AI生成）。语速控制在220-260字/分钟。关键概念处留0.5-1秒停顿给观众消化。`,
    inputType: "text",
    inputLabel: "配音备注",
    inputPlaceholder: "记录配音工具选择、语速设置、音轨时长、是否有需要重录的段落...",
    qualityGates: [
      { id: "5-1", label: "全程听完配音，无一处语速失控或断句诡异", description: "AI配音在某些标点处会断句不对，需要局部重生成", type: "checkbox", weight: 0.8 },
      { id: "5-2", label: "语速在220-260字/分钟", description: "过慢注意力涣散，过快用户跟不上", type: "checkbox", weight: 0.6 },
      { id: "5-3", label: "关键概念处有自然的0.5-1秒停顿", description: "给观众消化时间，不是在赶路", type: "checkbox", weight: 0.6 },
      { id: "5-4", label: "全片长度在目标范围内", description: "B站15-30分钟，抖音2-5分钟，视频号5-10分钟", type: "checkbox", weight: 0.8 },
    ],
    aiEvaluationEnabled: true,
    aiPrompt: `你是资深音频制作顾问。评估以下配音方案的合理性：

1. 语速分析：预估字数 ÷ 时长 = 字/分钟，是否在 220-260 区间？
2. 停顿设计：关键概念处是否预留了停顿？
3. 工具选择：是否选择了适配平台的配音工具？
4. 音质风险：AI 配音在专业术语处是否有断句错误风险？

给出综合评分和具体优化建议。`,
  },
  {
    number: 6,
    name: "视觉规划",
    tagline: "在开始做画面之前，先想清楚每个镜头要表达什么",
    phase: "produce",
    description: `把脚本按自然段落切分成镜头单元（每个15-45秒）。为每个单元确定视觉策略：概念插画、架构图/对比表、录屏、纯色+大字、素材拼贴、真人出镜、动态图表、留黑（制造悬念）。制作视觉分镜表。核心纪律：没有两个连续镜头用完全相同策略。`,
    inputType: "text",
    inputLabel: "视觉分镜表",
    inputPlaceholder: `粘贴你的分镜表，格式：
镜头01 | 0:00-0:15 | "你面前站着一匹烈马..." | 一匹机械马在黑暗中 | 概念插画(MJ生成)
镜头02 | 0:15-0:30 | "它力大无穷..." | 马在狂奔撞碎东西 | AI视频(可灵)
...`,
    qualityGates: [
      { id: "6-1", label: "每个镜头单元都有明确的视觉策略", description: "没有'到时候再说'的镜头", type: "checkbox", weight: 1.0 },
      { id: "6-2", label: "全片至少5-8张定制概念插画", description: "不是素材库拼凑，是原创视觉", type: "checkbox", weight: 0.8 },
      { id: "6-3", label: "开场30秒的视觉最丰富", description: "第一印象决定后续留存", type: "checkbox", weight: 0.8 },
      { id: "6-4", label: "没有两个连续镜头用完全相同的视觉策略", description: "防单调。策略类型：插画/图表/录屏/大字/拼贴/出镜/留黑", type: "checkbox", weight: 0.6 },
    ],
    aiEvaluationEnabled: true,
    aiPrompt: `你是资深视频视觉设计师。评估以下分镜表的视觉策略：

1. 视觉多样性：不同策略的分布是否合理？有没有连续重复？
2. 开场冲击力：前30秒的视觉是否足够抓住注意力？
3. 概念可视化：抽象概念是否有对应的视觉锚点？
4. 风格一致性：整体视觉风格是否统一？
5. 改进建议：哪些镜头的视觉策略可以更好？

给出综合评分和具体优化建议。`,
  },
  {
    number: 7,
    name: "素材制作",
    tagline: "风格统一 > 精美度。留白 > 塞满。静态图要动",
    phase: "produce",
    description: `按分镜表逐一制作素材。工具链：Midjourney/DALL-E 出概念插画，可灵/即梦/Runway 做AI动态短片，Figma/可画做信息图表，OBS录屏。核心原则：一致性 > 精美度，留白比塞满更高级，所有静态图必须加 Ken Burns 动画。`,
    inputType: "text",
    inputLabel: "素材制作备注",
    inputPlaceholder: "记录素材制作进度、使用的工具、MJ prompt模板、遇到的问题...",
    qualityGates: [
      { id: "7-1", label: "全片至少60%画面是原创素材", description: "不是素材库下载的通用画面", type: "checkbox", weight: 0.8 },
      { id: "7-2", label: "所有概念插画风格统一", description: "同一个MJ风格参考或prompt模板", type: "checkbox", weight: 0.6 },
      { id: "7-3", label: "每张静态图都有动画处理方案", description: "Ken Burns / 视差 / 逐要素出现", type: "checkbox", weight: 0.6 },
      { id: "7-4", label: "没有'随便找张网图凑合'的画面", description: "要么定制，要么用纯色+大字代替", type: "checkbox", weight: 0.4 },
    ],
    aiEvaluationEnabled: true,
    aiPrompt: `你是资深视觉设计师和素材管理专家。评估以下素材制作方案：

1. 原创度评估：定制素材 vs 素材库下载的比例是否健康？
2. 风格一致性：不同来源的素材放在一起，风格是否统一？
3. 动画方案：静态图的动画处理是否避免了"PPT感"？
4. 素材缺口：根据脚本叙述，还有哪些画面没有被覆盖？

给出综合评分和需要补做的素材清单。`,
  },
  // ========== 后期期 ==========
  {
    number: 8,
    name: "剪辑组装",
    tagline: "音轨是骨架，画面是血肉，节奏是灵魂",
    phase: "post",
    description: `按操作顺序：导入音轨 → 打节拍标记 → 拖入素材对齐标记 → 加Ken Burns动画 → 加转场（只用淡入淡出/推近/平滑过渡三种）→ 加BGM → 加音效 → 加字幕 → 加关键信息标注 → 加进度条。核心纪律：每5-8秒画面有变化，转场服务于内容逻辑，BGM不盖过人声，字幕是第二信息源，留黑是最被低估的技术。`,
    inputType: "text",
    inputLabel: "剪辑备注 / 导出视频链接",
    inputPlaceholder: "记录剪辑工具、遇到的难点、需要重剪的段落等。如已导出，可粘贴视频文件路径或链接...",
    qualityGates: [
      { id: "8-1", label: "全程没有超过8秒的完全静态画面", description: "不是切镜头，可以是同一个画面的动画推进", type: "checkbox", weight: 1.0 },
      { id: "8-2", label: "转场类型不超过3种，全部温和不跳戏", description: "花哨转场 = 廉价感", type: "checkbox", weight: 0.6 },
      { id: "8-3", label: "背景音乐全程音量稳定在人声之下", description: "关键时刻有节奏配合，不会分散注意力", type: "checkbox", weight: 0.6 },
      { id: "8-4", label: "字幕全文校对完毕，零错别字", description: "用剪映自动生成后手动过一遍", type: "checkbox", weight: 1.0 },
      { id: "8-5", label: "每一段关键信息都有对应视觉强化", description: "数字放大弹出、重要概念停留标注", type: "checkbox", weight: 0.6 },
      { id: "8-6", label: "长视频（>10分钟）有章节标记", description: "让观众知道讲到哪了、还剩多少", type: "checkbox", weight: 0.4 },
    ],
    aiEvaluationEnabled: true,
    aiPrompt: `你是资深剪辑师和视频节奏顾问。评估以下剪辑方案：

1. 节奏分析：画面变化频率是否在每 5-8 秒有变化？
2. 转场评估：转场类型是否克制（不超过 3 种）？
3. 字幕质量：字幕位置、大小、校对是否到位？
4. BGM 配合：背景音乐是否压过人声？关键处是否有情绪配合？
5. 章节标记：长视频是否有导航节点？

给出综合评分和需要重剪的具体段落。`,
  },
  {
    number: 9,
    name: "最终审查",
    tagline: "用'第一次看的观众'视角完整看一遍",
    phase: "post",
    description: `三个测试：坐远看（模拟手机观看距离）→ 关声音看一遍（确认画面自身在叙事）→ 找没参与制作的人标记"想划走"的时间点。标记超过2处 = 回去重剪。手机上的字幕是否看得清？全程没有技术错误？`,
    inputType: "text",
    inputLabel: "终审反馈",
    inputPlaceholder: "记录三项测试的结果：手机观看体验如何？关声音能看懂多少？试看者标记了几个想划走的点？",
    qualityGates: [
      { id: "9-1", label: "关声音能看懂80%", description: "画面自身在叙事——很多用户在地铁上不开声音刷视频", type: "checkbox", weight: 1.0 },
      { id: "9-2", label: "手机上看得清字幕和关键信息", description: "在27寸显示器上看着'还行'的，在手机上可能是蚂蚁", type: "checkbox", weight: 1.0 },
      { id: "9-3", label: "外部试看者标记'想划走'点不超过2处", description: "超过2处 = 回去重剪那几段", type: "checkbox", weight: 0.8 },
      { id: "9-4", label: "全程无技术错误", description: "字幕时间轴错位、音画不同步、黑帧、爆音", type: "checkbox", weight: 1.0 },
    ],
    aiEvaluationEnabled: true,
    aiPrompt: `你是资深视频质量控制专家。根据以下终审反馈评估视频质量：

1. 静音测试：用户提交的"关声音看"反馈，画面叙事是否独立完整？
2. 移动端体验：在手机上字幕和关键信息是否可读？
3. 试看反馈：试看者标记的"想划走"点，分析可能原因。
4. 技术检查清单：字幕时间轴、音画同步、黑帧是否有遗漏？

给出综合评分，并按紧急程度排出需要修改的优先清单。`,
  },
  {
    number: 10,
    name: "发布复盘",
    tagline: "视频做好了只完成50%。剩下50%是让用户点进来，以及从数据里学东西",
    phase: "post",
    description: `发布前：封面（一张图+不超过5个字，最高对比度色彩）+ 标题（制造好奇心缺口）。发布后：拉取平台数据，分析留存曲线，找流失陡降点，定位对应内容，形成改进清单。核心指标：完播率 > 互动率 > 关注转化 > 回看率。`,
    inputType: "data-table",
    inputLabel: "视频数据",
    inputPlaceholder: "录入视频发布后的数据：播放量、点赞、收藏、评论、分享...以及留存曲线关键节点",
    qualityGates: [
      { id: "10-1", label: "封面：一张图+不超过5个字+最高对比度色彩", description: "0.3秒传达'这个视频值得点'", type: "checkbox", weight: 0.8 },
      { id: "10-2", label: "标题制造了好奇心缺口（已知+反直觉转折+无法脑补的问题）", description: "不是'XX科普'，是让人看完标题就想点", type: "checkbox", weight: 0.8 },
      { id: "10-3", label: "已拉取/录入平台数据，找到留存陡降点", description: "最重要的数据不是播放量，是观众在哪一秒大量离开", type: "checkbox", weight: 1.0 },
      { id: "10-4", label: "已完成复盘，列出至少3条下期改进项", description: "复盘不只是看数据，是把数据翻译成行动", type: "checkbox", weight: 1.0 },
    ],
    aiEvaluationEnabled: true,
    aiPrompt: `你是资深视频数据复盘分析师。根据以下视频数据进行分析：

【分析维度】
1. 留存曲线分析：哪一秒大量流失？对应什么内容？为什么会流失？
2. 互动数据异常点：点赞率高但收藏率低？还是反过来？说明什么问题？
3. 观众画像匹配：观众年龄/性别/地区分布是否与预期一致？
4. 流量来源健康度：搜索/推荐/社交分发的比例是否健康？

【输出】
- 综合表现评分（0-100）
- 留存曲线诊断（流失点+可能原因+修改建议）
- 互动质量评估
- 下期最优先改进的3件事（按影响力排序）
- 一个你建议下次尝试的实验（A/B test idea）`,
  },
];

export function getStepByNumber(num: number): WorkflowStep | undefined {
  return WORKFLOW_STEPS.find((s) => s.number === num);
}

export function getPhaseName(phase: WorkflowStep["phase"]): string {
  switch (phase) {
    case "prepare": return "准备期";
    case "produce": return "制作期";
    case "post": return "后期期";
  }
}

export function calculateStepScore(gates: QualityGate[], passedGates: Set<string>): number {
  if (gates.length === 0) return 100;
  const totalWeight = gates.reduce((sum, g) => sum + g.weight, 0);
  const passedWeight = gates
    .filter((g) => passedGates.has(g.id))
    .reduce((sum, g) => sum + g.weight, 0);
  return Math.round((passedWeight / totalWeight) * 100);
}
