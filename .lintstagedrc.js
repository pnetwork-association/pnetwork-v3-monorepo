module.exports = {
  '*.md': 'nx format:write --files',
  '*.+(js|jsx)': 'eslint --cache',
  '*.+(js|jsx|yml|json)': 'nx format:write --files',
  '*': 'secretlint',
}
