const { logic } = require('ptokens-utils')

const jestMockEthers = () => {
  jest.mock('ethers', () => ({
    __esModule: true,
    ...jest.requireActual('ethers'),
  }))

  return require('ethers')
}

const jestMockContractConstructor = (_fxnName, _resolvedValue, _responseTime = 0) => {
  // No arrow function here: doesn't work with
  // constructors
  return function () {
    return {
      [_fxnName]: jest.fn().mockResolvedValue({
        wait: jest.fn().mockImplementation(async () => {
                await logic.sleepForXMilliseconds(_responseTime)
                return Promise.resolve(_resolvedValue)
              }),
      }),
    }
  }
}

module.exports = {
  jestMockEthers,
  jestMockContractConstructor,
}
