const jestMockModule = mockModuleName => {
  jest.mock(mockModuleName, () => ({
    __esModule: true,
    ...jest.requireActual(mockModuleName),
  }))

  return require(mockModuleName)
}

const jestMockContractConstructor = (_fxnName, _jestFn) => {
  // No arrow function here: doesn't work with
  // constructors
  return function () {
    return {
      [_fxnName]: _jestFn,
    }
  }
}

module.exports = {
  jestMockModule,
  jestMockContractConstructor,
}
