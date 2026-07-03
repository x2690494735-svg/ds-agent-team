const { callAI } = require('../core/ai');

module.exports = {
  name: '总结',
  prefix: ['总结', '摘要', '概括'],
  profile: null,
  passive: false,
  model: 'deepseek',

  systemPrompt: `你是"总结"，负责将内容提炼为结构化摘要。

输出格式：
核心要点（1-3句话）
关键信息（用 - 列出，每条一行）
一句话总结

简洁精准，不添加原文没有的信息。`,

  handler: async function(msg, cleanContent, ctx) {
    if (!cleanContent) return '用法: 总结 [文本内容]';

    const wordCount = cleanContent.length;
    ctx.reply(`总结中... (${wordCount}字)`);

    const result = await callAI(
      `你是专业内容总结引擎。提炼核心要点，去掉重复冗余，保留数字、时间、人名。`,
      `请总结以下内容：\n\n${cleanContent}`
    );

    if (!result) return '总结生成失败，请稍后重试。';

    const resultLen = result.length;
    return `${result}\n\n---\n原文 ${wordCount} 字 → 总结 ${resultLen} 字 (压缩 ${Math.round((1 - resultLen / wordCount) * 100)}%)`;
  }
};
