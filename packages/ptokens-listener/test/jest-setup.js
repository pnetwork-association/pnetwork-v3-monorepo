/* eslint-disable */
global.console = {
  log: console.log,
  info: jest.fn(),
  warn: console.warn,
  debug: console.debug,
  error: console.error,
}
/* eslint-enable */
