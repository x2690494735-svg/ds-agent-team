const { callAI } = require('../core/ai');

module.exports = {
  name: '转写',
  prefix: ['转写', '转录'],
  profile: null,
  passive: false,

  systemPrompt: `你是"转写"，负责音频/语音转文字。支持两种模式：
1. 用户发语音消息 → 下载并转写
2. 用户发"转写 [文本]" → AI整理润色

输出格式：转写结果（纯文本）+ 字数统计`,

  handler: async function(msg, cleanContent, ctx) {
    const msgType = msg.msg_type || 'text';

    if (msgType === 'audio' || msgType === 'media') {
      return '收到语音消息。语音文件已保存，可通过平台转写服务处理。';
    }

    if (!cleanContent) return '用法:\n  转写 [文本内容] — 整理润色\n  发送语音消息 — 自动转写';

    ctx.reply(`转写中... (${cleanContent.length}字)`);
    const result = await callAI(
      '你是专业转写整理引擎。将输入文本整理为干净的口语转写稿：去除填充词、修正明显口误、统一标点、分段。保持原意和语气。',
      cleanContent
    );
    return result ? `[转写结果]\n${result}\n\n${cleanContent.length}字 → ${result.length}字` : '转写失败，请稍后重试。';
  }
};
