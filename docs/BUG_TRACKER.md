# Bug Tracker — VideoForge v0.1.0

## 修复计划（2026-05-14 晚间执行）

预计耗时：**25-35 分钟**

---

### 🔴 高优先级（3 个）

| # | 文件 | 问题 | 修复方案 |
|---|------|------|---------|
| 1 | `.gitignore` + `dev.db` | dev.db 被 Git 追踪，根目录 `*.db` 未在 .gitignore 中排除 | .gitignore 已改 `*.db`，需 `git rm --cached dev.db` 后提交 |
| 2 | `app/api/analyze/script/route.ts:15` | `process.env.ANTHROPIC_API_KEY = apiKey` 直接覆盖环境变量，并发请求不安全 | 改为把 key 作为参数传入 `analyzeScript()` 函数，不修改 process.env |
| 3 | `lib/ai-analyzer.ts` | `analyzeScript()` 不接受外部传入的 apiKey，只读 process.env | 添加可选参数 `apiKeyOverride?: string` |

### 🟡 中优先级（3 个）

| # | 文件 | 问题 | 修复方案 |
|---|------|------|---------|
| 4 | `app/api/analyze/script/route.ts` | 缺少输入校验，body 字段未经 schema 验证 | 添加 zod schema 校验 content/prompt 字段 |
| 5 | `app/api/projects/route.ts` | POST/DELETE 缺少输入校验 | 添加 zod schema |
| 6 | `app/api/projects/steps/route.ts` | POST 缺少输入校验 | 添加 zod schema |

### 🟢 低优先级（4 个）

| # | 文件 | 问题 | 修复方案 |
|---|------|------|---------|
| 7 | `.github/ISSUE_TEMPLATE/` | 新文件未加入 Git | `git add .github/` |
| 8 | `app/projects/[id]/page.tsx` | 删除按钮未实现 | 添加删除按钮 + 确认弹窗 + fetch DELETE |
| 9 | `lib/db.ts` | 无数据库连接失败时的优雅降级 | try-catch createPrismaClient，失败时输出明确错误信息 |
| 10 | `prisma.config.ts` | 依赖 `import "dotenv/config"`，dotenv 为间接依赖 | 检查 dotenv 是否独立安装，若无则安装 |

---

## 执行顺序

```
Phase 1（5 分钟）: 输入校验加固
  → Zod 校验添加到 3 个 API routes
  → ai-analyzer.ts 支持 apiKeyOverride 参数

Phase 2（5 分钟）: 安全修复
  → 移除 process.env 直接赋值
  → db.ts 添加错误处理
  → dotenv 依赖确认

Phase 3（5 分钟）: 功能补全
  → 项目删除按钮 UI
  → .github 目录追踪

Phase 4（5 分钟）: Git 清理
  → git rm --cached dev.db
  → git add 所有改动
  → git commit
  → git push（含之前未推送的 b34b0ef）

Phase 5（5 分钟）: 验证
  → npm run build 确认零错误
  → 检查 GitHub 页面显示正常
```

---

## 修复后应达到的状态

- [ ] `npm run build` 零错误
- [ ] `git ls-files` 不含 `dev.db`
- [ ] 所有 API routes 有 zod 输入校验
- [ ] 环境变量不在运行时被覆盖
- [ ] 项目有删除功能
- [ ] GitHub 仓库页面 README、文件结构整洁
