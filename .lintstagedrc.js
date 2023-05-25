module.exports = {
  '*.+(js|jsx)': 'eslint --cache',
  '*.+(js|jsx|yml)': 'nx format:write --files',
}
