# VideoForge — AI 视频创作工作流辅助平台

一个开源 Web 应用，帮助知识科普视频创作者按 **10 步标准化工作流** 完成视频制作，在每一步获得 AI 评估和建议，并在发布后通过数据复盘驱动持续迭代。

## 核心理念

> **视频制作的唯一目标：让观众愿意停留，并反复观看。**

VideoForge 把这个目标拆解为可操作的质量闸门和 AI 评估体系，让创作者在每个环节——从选题验证到发布复盘——都知道自己做得怎么样，下一步该改什么。

## 功能

- **10 步工作流向导**：选题验证 → 深度调研 → 脚本撰写 → 脚本质检 → 配音制作 → 视觉规划 → 素材制作 → 剪辑组装 → 最终审查 → 发布复盘
- **质量闸门系统**：每一步都有明确的通过标准，手动勾选 + AI 自动检测
- **AI 脚本分析**（Claude API）：钩子力度、信息节奏、金句密度、口语化程度、受欢迎评分
- **B 站数据拉取**：输入视频 BV 号，自动获取播放量、点赞、投币等数据
- **数据可视化**（Recharts）：播放量对比、互动分布、互动率等多维度图表
- **项目仪表盘**：多项目管理、进度追踪、状态总览

## 快速开始

### 前置要求

- Node.js 18+
- npm

### 安装

```bash
# 克隆仓库
git clone https://github.com/honghuihaohao-cpu/videoforge.git
cd videoforge

# 安装依赖
npm install

# 初始化数据库
npx prisma migrate dev --name init

# 配置 API Key（AI 分析功能需要）
cp .env.example .env
# 编辑 .env，填入你的 ANTHROPIC_API_KEY

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000 开始使用。

### 生产部署

```bash
npm run build
npm start
```

支持部署到 Vercel（一键部署）、Docker 或任何 Node.js 环境。

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| 数据库 | SQLite + Prisma ORM |
| AI | Claude API (Anthropic SDK) |
| 图表 | Recharts |
| 部署 | Vercel / Docker |

## 项目结构

```
videoforge/
├── app/
│   ├── layout.tsx          # 根布局（侧边栏导航）
│   ├── page.tsx            # 仪表盘首页
│   ├── workflow/           # 10 步工作流向导
│   ├── projects/           # 项目 CRUD
│   ├── analytics/          # 数据仪表盘
│   ├── settings/           # API Key 配置
│   └── api/                # API 路由
├── components/
│   ├── ui/                 # shadcn/ui 基础组件
│   ├── workflow/           # 工作流步骤组件
│   └── layout/             # 布局组件
├── lib/
│   ├── workflow-engine.ts  # 工作流定义（10 步完整配置）
│   ├── ai-analyzer.ts      # Claude API 封装
│   ├── db.ts               # Prisma 客户端单例
│   └── platform/           # 平台 API 封装
└── prisma/
    └── schema.prisma       # 数据模型
```

## 工作流 10 步详情

### 准备期
1. **选题验证** — 确认选题值得做
2. **深度调研** — 一手来源 + 交叉验证
3. **脚本撰写** — 口语化 + 钩子前置 + 节奏设计

### 制作期
4. **脚本质检** — 试读者反馈处理
5. **配音制作** — 语速 220-260 字/分钟
6. **视觉规划** — 分镜表 + 视觉策略
7. **素材制作** — 插画 + 图表 + AI 视频

### 后期期
8. **剪辑组装** — 音轨为骨 + 节奏控制
9. **最终审查** — 关声音看 + 手机测试
10. **发布复盘** — 留存曲线 + 改进清单

## 贡献

欢迎提交 Issue 和 PR。MIT 协议，任何人可以自由使用、修改和分发。

## 协议

MIT License - 详见 [LICENSE](LICENSE)
