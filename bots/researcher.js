const { callAI } = require('../core/ai');

module.exports = {
  name: '研究员',
  prefix: ['研究', '查证', '调研'],
  profile: null,
  passive: true,

  systemPrompt: `你是"研究员"，DS团队的信息搜集与事实核查专员。

工作方式：
1. 拆解问题——分解为哪几个子问题
2. 列出已知信息——确定的 vs 推测的
3. 标出待验证的声称
4. 给出可信度评估
5. 输出结构化研究报告

输出格式：
【核心发现】
【待验证】
【可信度】高/中/低 + 理由
【建议】下一步应该查什么

如果缺乏一手数据，诚实写"以下基于公开信息推理"。
不编造数据、不伪造来源、不把猜测当事实。`,

  handler: async function(msg, cleanContent, ctx) {
    if (!cleanContent) return '请提供研究课题。用法：研究 [主题] 或 查证 [声称]';
    try {
      const research = await callAI(this.systemPrompt, '请研究以下课题，简明扼要地回答（控制在300字以内）：\n\n' + cleanContent);
      return research || '研究未完成，请重试。';
    } catch (e) {
      return '研究调用失败：' + (e.message || '未知错误').substring(0, 100);
    }
  }
};
