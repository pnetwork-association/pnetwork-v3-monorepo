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
  jestMockContractConstructor,
}
