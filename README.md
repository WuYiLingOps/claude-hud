# Claude HUD

一个 Claude Code 插件，实时显示会话状态 — 上下文用量、工具活动、Agent 状态和 Todo 进度。始终显示在输入区下方。

[![License](https://img.shields.io/github/license/jarrodwatts/claude-hud?v=2)](LICENSE)
[![Stars](https://img.shields.io/github/stars/jarrodwatts/claude-hud)](https://github.com/jarrodwatts/claude-hud/stargazers)

![Claude HUD 效果预览](claude-hud-preview-5-2.png)

## 安装

在 Claude Code 中依次执行以下命令：

**第一步：添加插件市场**
```
/plugin marketplace add jarrodwatts/claude-hud
```
或通过 Git URL 添加：

> 该仓库为个人魔改

```
/plugin marketplace add https://github.com/WuYiLingOps/claude-hud.git
```

**第二步：安装插件**

<details>
<summary><strong>⚠️ Linux 用户请先点击此处</strong></summary>

在 Linux 上，`/tmp` 通常是独立的文件系统（tmpfs），会导致插件安装失败并报错：
```
EXDEV: cross-device link not permitted
```

**解决方法**：安装前设置 TMPDIR：
```bash
mkdir -p ~/.cache/tmp && TMPDIR=~/.cache/tmp claude
```

然后在该会话中执行下方的安装命令。这是 [Claude Code 平台的已知限制](https://github.com/anthropics/claude-code/issues/14799)。

</details>

```
/plugin install claude-hud
```

**第三步：配置状态栏**
```
/claude-hud:setup
```

完成！HUD 立即生效，无需重启。

---

## 什么是 Claude HUD？

Claude HUD 让你更好地了解 Claude Code 会话中正在发生的事情。

| 显示内容 | 作用 |
|----------|------|
| **项目路径** | 知道当前在哪个项目中（可配置 1-3 级目录深度） |
| **上下文健康度** | 精确掌握上下文窗口的使用情况，避免溢出 |
| **工具活动** | 实时观察 Claude 正在读取、编辑、搜索哪些文件 |
| **Agent 追踪** | 查看哪些子 Agent 正在运行及其任务内容 |
| **Todo 进度** | 实时跟踪任务完成情况 |
| **费用估算** | 基于 transcript 累计 token 用量和统一定价显示当前会话的估算费用 |

## 显示效果

### 默认模式（2 行）
```
[Opus | Max] │ my-project git:(main*)
Context █████░░░░░ 45% │ Usage ██░░░░░░░░ 25% (1h 30m / 5h)
```
- **第 1 行** — 模型名称、订阅计划（或 `Bedrock`）、项目路径、Git 分支
- **第 2 行** — 上下文进度条（绿→黄→红）、用量速率限制和可选的费用估算

### 可选行（通过 `/claude-hud:configure` 启用）
```
◐ Edit: auth.ts | ✓ Read ×3 | ✓ Grep ×2        ← 工具活动
◐ explore [haiku]: Finding auth code (2m 15s)    ← Agent 状态
▸ Fix authentication bug (2/5)                   ← Todo 进度
```

### 费用估算（通过 `display.showCost` 启用）
```
Context █████░░░░░ 45% │ Usage ██░░░░░░░░ 25% │ Cost ~$0.12
```
带明细（`display.costBreakdown: true`）：
```
Context █████░░░░░ 45% │ Usage ██░░░░░░░░ 25% │ Cost ~$1.43 (in: 8.5M, out: 18.0k)
```
> **注意：** 费用从 transcript 累加每次 API 调用的 token 用量，按统一定价（提示 $5/M，补全 $25/M）估算，仅供参考。

---

## 工作原理

Claude HUD 使用 Claude Code 原生的 **statusline API** — 无需额外窗口，无需 tmux，适用于任何终端。

```
Claude Code → stdin JSON → claude-hud → stdout → 终端显示
           ↘ transcript JSONL（工具、Agent、Todo）
```

**核心特性：**
- 直接从 Claude Code 获取原生 token 数据（非估算值）
- 解析 transcript 文件获取工具/Agent 活动
- 约每 300ms 刷新一次

---

## 配置

随时自定义你的 HUD：

```
/claude-hud:configure
```

交互式引导流程，无需手动编辑配置文件：

- **首次设置**：选择预设方案（完整/精简/极简），然后微调各项元素
- **随时调整**：开关各项显示、调整 Git 显示样式、切换布局
- **保存前预览**：提交更改前查看 HUD 的实际效果

### 预设方案

| 预设 | 显示内容 |
|------|----------|
| **完整（Full）** | 全部启用 — 工具、Agent、Todo、Git、用量、时长 |
| **精简（Essential）** | 活动行 + Git 状态，信息精简 |
| **极简（Minimal）** | 仅核心内容 — 模型名称和上下文进度条 |

选择预设后，可以单独开关各项元素。

### 手动配置

也可以直接编辑配置文件：`~/.claude/plugins/claude-hud/config.json`

### 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `lineLayout` | string | `expanded` | 布局模式：`expanded`（多行）或 `compact`（单行） |
| `pathLevels` | 1-3 | 1 | 项目路径显示的目录层级数 |
| `gitStatus.enabled` | boolean | true | 在 HUD 中显示 Git 分支 |
| `gitStatus.showDirty` | boolean | true | 有未提交更改时显示 `*` |
| `gitStatus.showAheadBehind` | boolean | false | 显示领先/落后远程的提交数 `↑N ↓N` |
| `gitStatus.showFileStats` | boolean | false | 显示文件变更统计 `!M +A ✘D ?U` |
| `display.showModel` | boolean | true | 显示模型名称 `[Opus]` |
| `display.showContextBar` | boolean | true | 显示上下文可视化进度条 `████░░░░░░` |
| `display.contextValue` | `percent` \| `tokens` | `percent` | 上下文显示格式（`45%` 或 `45k/200k`） |
| `display.showConfigCounts` | boolean | false | 显示 CLAUDE.md、规则、MCP、Hooks 数量 |
| `display.showDuration` | boolean | false | 显示会话时长 `⏱️ 5m` |
| `display.showSpeed` | boolean | false | 显示输出 token 速度 `out: 42.1 tok/s` |
| `display.showUsage` | boolean | true | 显示用量限制（仅 Pro/Max/Team） |
| `display.usageBarEnabled` | boolean | true | 以可视化进度条显示用量（而非纯文本） |
| `display.sevenDayThreshold` | 0-100 | 80 | 7 天用量达到此阈值时显示（0 = 始终显示） |
| `display.showTokenBreakdown` | boolean | true | 高上下文（85%+）时显示 token 明细 |
| `display.showTools` | boolean | false | 显示工具活动行 |
| `display.showAgents` | boolean | false | 显示 Agent 活动行 |
| `display.showTodos` | boolean | false | 显示 Todo 进度行 |
| `display.showCost` | boolean | false | 显示会话累计费用估算（基于 transcript 累加 token） |
| `display.costBreakdown` | boolean | false | 显示费用明细（输入/输出 token 数量） |

### 用量限制（Pro/Max/Team）

用量显示对 Claude Pro、Max 和 Team 订阅用户**默认启用**。在第 2 行与上下文进度条并排显示速率限制消耗情况。

当 7 天用量超过 `display.sevenDayThreshold`（默认 80%）时会额外显示：

```
Context █████░░░░░ 45% │ Usage ██░░░░░░░░ 25% (1h 30m / 5h) | ██████████ 85% (2d / 7d)
```

如需关闭，将 `display.showUsage` 设为 `false`。

**前提条件：**
- Claude Pro、Max 或 Team 订阅（API 用户不可用）
- Claude Code 的 OAuth 凭证（登录时自动创建）

**故障排查：** 如果用量未显示：
- 确认使用 Pro/Max/Team 账户登录（非 API Key）
- 检查配置中 `display.showUsage` 是否被设为 `false`
- API 用户不会显示用量（按量计费，无速率限制）
- AWS Bedrock 模型显示 `Bedrock` 并隐藏用量限制（用量由 AWS 管理）

### 配置示例

```json
{
  "lineLayout": "expanded",
  "pathLevels": 2,
  "gitStatus": {
    "enabled": true,
    "showDirty": true,
    "showAheadBehind": true,
    "showFileStats": true
  },
  "display": {
    "showTools": true,
    "showAgents": true,
    "showTodos": true,
    "showConfigCounts": true,
    "showDuration": true,
    "showCost": true
  }
}
```

### 显示示例

**1 级目录（默认）：** `[Opus] │ my-project git:(main)`

**2 级目录：** `[Opus] │ apps/my-project git:(main)`

**3 级目录：** `[Opus] │ dev/apps/my-project git:(main)`

**带脏标记：** `[Opus] │ my-project git:(main*)`

**带领先/落后：** `[Opus] │ my-project git:(main ↑2 ↓1)`

**带文件统计：** `[Opus] │ my-project git:(main* !3 +1 ?2)`
- `!` = 已修改文件，`+` = 已暂存，`✘` = 已删除，`?` = 未跟踪
- 数量为 0 的项会省略，保持显示简洁

### 故障排查

**配置未生效？**
- 检查 JSON 语法错误：无效的 JSON 会静默回退到默认值
- 确认值有效：`pathLevels` 必须为 1、2 或 3；`lineLayout` 必须为 `expanded` 或 `compact`
- 删除配置文件并运行 `/claude-hud:configure` 重新生成

**Git 状态未显示？**
- 确认当前目录是 Git 仓库
- 检查配置中 `gitStatus.enabled` 是否被设为 `false`

**工具/Agent/Todo 行未显示？**
- 这些行默认隐藏 — 在配置中启用 `showTools`、`showAgents`、`showTodos`
- 仅在有活动时才会显示

---

## 系统要求

- Claude Code v1.0.80+
- Node.js 18+ 或 Bun

---

## 开发

```bash
git clone https://github.com/jarrodwatts/claude-hud
cd claude-hud
npm ci && npm run build
npm test
```

详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## 许可证

MIT — 详见 [LICENSE](LICENSE)

---

## Star 趋势

[![Star History Chart](https://api.star-history.com/svg?repos=jarrodwatts/claude-hud&type=Date)](https://star-history.com/#jarrodwatts/claude-hud&Date)
