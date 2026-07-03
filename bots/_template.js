module.exports = {
  name: '模板',
  prefix: [],
  profile: null,
  passive: false,
  model: 'deepseek',
  systemPrompt: '...',
  handler: async function(msg, cleanContent, ctx) {
    return 'Hello';
  }
};
