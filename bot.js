const { loadEnv } = require('./core/ai');
const { loadBots, resolveAgent } = require('./core/dispatch');

loadEnv();

const POLL_SEC = parseInt(process.env.POLL_INTERVAL || '5');

const bots = {};
loadBots(bots);

function makeCtx(msg, agentName) {
  return {
    reply: (text) => console.log(`[${agentName}] → ${text.substring(0, 80)}`),
    send: (text) => console.log(`[${agentName}] → 群: ${text.substring(0, 80)}`),
    bots,
    callAgent: async (name, input) => {
      const target = bots[name];
      if (!target) return `${name} 不存在`;
      try {
        return await target.handler(msg, input, makeCtx(msg, name));
      } catch (e) { return `${name} 执行异常: ${e.message}`; }
    }
  };
}

function findMentionedAgent(msg, content) {
  for (const m of (msg.mentions || [])) {
    if (bots[m.name]) return m.name;
    for (const r of require('./core/dispatch').routeMap) {
      if (r.prefix && m.name === r.prefix) return r.bot.name;
    }
  }
  const textAt = (content || '').match(/^@(\S+)/);
  if (textAt && bots[textAt[1]]) return textAt[1];
  return null;
}

function resolveTarget(content, msg) {
  let clean = content.replace(/^@\S+\s*/, '').trim();
  for (const m of (msg.mentions || [])) {
    clean = clean.replace(new RegExp(`@${m.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'), '');
  }

  const mentioned = findMentionedAgent(msg, content);
  if (mentioned) return { agentName: mentioned, cleanContent: clean };

  const names = Object.keys(bots).sort((a, b) => b.length - a.length);
  for (const name of names) {
    if (clean.startsWith(name)) return { agentName: name, cleanContent: clean.substring(name.length).trim() };
    const bracketed = `【${name}】`;
    if (clean.startsWith(bracketed)) return { agentName: name, cleanContent: clean.substring(bracketed.length).trim() };
  }

  const resolved = resolveAgent(clean, bots);
  return { agentName: resolved.agentName, cleanContent: resolved.cleanContent };
}

async function processMessage(msg) {
  const content = msg.content || '';
  if (!content.trim()) return;

  const { agentName, cleanContent } = resolveTarget(content, msg);
  const agent = bots[agentName];
  if (!agent) return;

  console.log(`[${new Date().toLocaleTimeString()}] ${msg.sender?.name || '?'} → ${agentName}: ${cleanContent.substring(0, 50)}`);

  const ctx = makeCtx(msg, agentName);
  try {
    const result = await agent.handler(msg, cleanContent, ctx);
    if (result) ctx.send(`【${agentName}】\n${result}`);
  } catch (e) {
    console.error(`  ${agentName} error:`, e.message);
    ctx.send(`【${agentName}】处理异常，请稍后重试。`);
  }
}

async function poll() {
  const messages = fetchMessages();
  for (const msg of messages.reverse()) {
    await processMessage(msg);
  }
  setTimeout(poll, POLL_SEC * 1000);
}

function fetchMessages() {
  // 生产环境: 通过飞书 API / lark-cli 拉取新消息
  // 开发环境: 返回 mock 数据
  if (process.env.NODE_ENV === 'development') {
    return [
      { content: '总结 人工智能正在改变软件开发的方式', sender: { name: '用户A' }, mentions: [] },
      { content: '研究 多Agent系统的最佳实践', sender: { name: '用户B' }, mentions: [] },
    ];
  }
  return [];
}

require('./dashboard');

console.log('═══ DS Agent Team ═══');
console.log('轮询间隔: ' + POLL_SEC + 's');
console.log('看板: http://localhost:3458');
console.log('Agent 数: ' + Object.keys(bots).length + '\n');

poll();
