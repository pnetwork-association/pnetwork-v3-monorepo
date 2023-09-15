class HubError extends Error {
  constructor(ethersErrorDescription) {
    super(`${ethersErrorDescription.name}(${ethersErrorDescription.args})`)
    this.name = 'HubError'
  }
}

module.exports = {
  HubError,
}
