const getLogs = async (_address, _topics, _fromBlock) =>
  ethers.provider
    .getLogs({
      address: _address,
      topics: _topics,
      fromBlock: _fromBlock,
    })
    .then(_logs =>
      _logs.sort((_a, _b) =>
        _a.blockNumber > _b.blockNumber ? 1 : _b.blockNumber < _a.blockNumber ? -1 : 0
      )
    )

module.exports = { getLogs }
