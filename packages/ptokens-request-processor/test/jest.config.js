module.exports = {
  bail: 1,
  verbose: true,
  preset: '@shelf/jest-mongodb',
  setupFilesAfterEnv: ['./jest-setup.js'],
}
