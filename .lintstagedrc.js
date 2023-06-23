module.exports = {
  '*.md': 'nx format:write --files',
  '*.+(js|jsx)': 'eslint --cache',
  '*.+(js|jsx|yml)': 'nx format:write --files',
}
