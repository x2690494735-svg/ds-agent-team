# DS Agent Team

一个跑在飞书群里的多 Agent 协作系统。十几个专职 Agent 共用一个群聊，通过前缀路由分发任务，Agent 之间可以互相调用。

## 架构

```
飞书群消息 → 轮询拉取 → 前缀/关键词路由 → 对应 Agent 处理 → 回复到群

Agent 之间通过 【Agent名】→ 【Agent名】 语法互相调用
```

## Agent 列表

| Agent | 触发词 | 职责 |
|-------|--------|------|
| PM | @PM 或默认 | 任务拆解、调度、Agent 编排 |
| 研究员 | 研究/查证 | 信息搜集、事实核查、可信度评估 |
| 总结 | 总结/摘要 | 长文提炼、结构化摘要 |
| 审校 | 审校/审核 | 内容质量审核、评分、修改建议 |
| 转写 | 转写/转录 | 语音消息转文字、文本整理 |
| 生图 | 生图/画 | AI 图像生成、含美术总监审核链路 |
| 美术总监 | 被动 | 生图时自动触发，多轮审核 prompt |
| 内容策划 | 策划/选题 | 内容选题、角度建议 |
| 分镜 | 分镜 | AI 视频分镜脚本生成 |
| 配音 | 配音 | TTS 语音合成 |

## 技术栈

Node.js + DeepSeek API + 飞书开放平台 (lark-cli)

## 运行

```bash
npm install
node bot.js
```

## 项目结构

```
bot.js              # 主循环：轮询→路由→处理→回复
core/
  dispatch.js       # Agent 加载、前缀路由、消息分发
bots/
  _template.js      # Agent 标准模板
  summary.js        # 总结 Agent
  transcribe.js     # 转写 Agent
  researcher.js     # 研究员 Agent
  review.js         # 审校 Agent
dashboard.html      # 实时活动看板
dashboard.js        # 看板 HTTP 服务
```

## 设计原则

- **每个 Agent 只做一件事**：职责边界清晰，system prompt 控制在 20 行内
- **前缀路由**：消息开头匹配触发词 → 精准分发，不靠 AI 猜意图
- **Agent 间可互调**：PM 拆解任务后分派给多个 Agent 收集结果再汇总
- **模板化**：新增 Agent 只需填 `_template.js` 的三个字段
