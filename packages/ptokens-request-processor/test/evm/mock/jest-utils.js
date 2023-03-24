const jestMockEthers = () => {
  jest.mock('ethers', () => ({
    __esModule: true,
    ...jest.requireActual('ethers'),
  }))

  return require('ethers')
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
  jestMockEthers,
  jestMockContractConstructor,
}
