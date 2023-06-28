class StateManagerError extends Error {
  constructor(ethersErrorDescription) {
    super(`${ethersErrorDescription.name}(${ethersErrorDescription.args})`)
    this.name = 'StateManagerError'
  }
}

module.exports = {
  StateManagerError,
}
