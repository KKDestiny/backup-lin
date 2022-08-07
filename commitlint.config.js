module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['chore', 'docs', 'feature', 'fixed', 'refactor', 'revert', 'perf', 'test']],
  },
};
