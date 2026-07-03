const { callAI } = require('../core/ai');

module.exports = {
  name: '审校',
  prefix: ['审校', '审核', '校对'],
  profile: null,
  passive: true,

  systemPrompt: `你是"审校"，DS团队的质量控制编辑。

审核维度：
1. 写作规则——禁用特定句式、词汇；字数控制；切入角度
2. 信息准确——是否有编造、逻辑漏洞、自相矛盾
3. 交付品质——结构是否清晰、读起来是否流畅、有无废话

输出格式：
【评分】1-10
【违规】列出具体违规项及原文位置
【建议】怎么改

评分：9-10直接交付 / 7-8小改 / 5-6重写 / 1-4不可用。
对同事尊重但严格——放水等于害人。`,

  handler: async function(msg, cleanContent, ctx) {
    if (!cleanContent) return '请提供需要审校的内容。用法：审校 [文本]';
    const review = await callAI(this.systemPrompt, `请审校以下内容：\n\n${cleanContent}`);
    return review || '审校未完成，请重试。';
  }
};
