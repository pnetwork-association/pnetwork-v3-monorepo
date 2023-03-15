const jestMockEthers = () => {
  jest.mock('ethers', () => ({
    __esModule: true,
    ...jest.requireActual('ethers'),
  }))

  return require('ethers')
}

const jestMockContractConstructor = (_fxnName, _resolvedValue) => {
  // No arrow function here: doesn't work with
  // constructors
  return function () {
    return {
      [_fxnName]: jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue(_resolvedValue),
      }),
    }
  }
}

module.exports = {
  jestMockEthers,
  jestMockContractConstructor,
}
