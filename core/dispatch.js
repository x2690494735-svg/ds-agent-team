const fs = require('fs');
const path = require('path');

const routeMap = [];
let defaultBot = null;

function loadBots(targetBots) {
  const botsDir = path.join(__dirname, '..', 'bots');
  if (!fs.existsSync(botsDir)) { console.log('bots/ 目录不存在'); return; }

  const files = fs.readdirSync(botsDir).filter(f => f.endsWith('.js') && !f.startsWith('_'));
  for (const file of files) {
    try {
      const bot = require(path.join(botsDir, file));
      if (!bot.name || !bot.handler) {
        console.log(`  跳过 ${file}: 缺少 name 或 handler`);
        continue;
      }
      targetBots[bot.name] = bot;
      for (const prefix of (bot.prefix || [])) {
        routeMap.push({ prefix, bot });
      }
      const passiveLabel = bot.passive ? ' [passive]' : '';
      const modelLabel = bot.model && bot.model !== 'deepseek' ? ` [${bot.model}]` : '';
      console.log(`  ${bot.name}${passiveLabel}${modelLabel} (${(bot.prefix||[]).map(p=>p||'默认').join(', ')})`);
    } catch (e) {
      console.log(`  加载 ${file} 失败: ${e.message}`);
    }
  }

  routeMap.sort((a, b) => b.prefix.length - a.prefix.length);
  defaultBot = targetBots['PM'] || null;
  console.log(`${Object.keys(targetBots).length} 个 bot 已加载\n`);
}

function resolveAgent(content, bots) {
  for (const { prefix, bot } of routeMap) {
    if (prefix === '') continue;
    if (content.startsWith(prefix)) {
      const rest = content.substring(prefix.length).replace(/^[：:]\s*/, '').trim();
      return { agentName: bot.name, cleanContent: rest };
    }
  }
  const fallback = defaultBot || bots['PM'];
  if (fallback) return { agentName: fallback.name, cleanContent: content };
  return { agentName: 'PM', cleanContent: content };
}

function hasTrigger(content, bots) {
  for (const name of Object.keys(bots)) {
    if (content.startsWith(name)) return true;
  }
  for (const { prefix } of routeMap) {
    if (prefix !== '' && content.startsWith(prefix)) return true;
  }
  return defaultBot !== null;
}

module.exports = { routeMap, loadBots, resolveAgent, hasTrigger };
