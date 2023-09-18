import { createHash } from 'crypto'
import { encodeAbiParameters, parseAbiParameters } from 'viem'

const getNetworkIdByChain = _chain =>
  '0x' +
  createHash('sha256')
    .update(
      Buffer.from(
        encodeAbiParameters(parseAbiParameters('bytes1, bytes1, uint256, bytes1'), [
          '0x01',
          '0x01',
          _chain.id,
          '0x00',
        ]).slice(2),
        'hex'
      )
    )
    .digest()
    .toString('hex')
    .slice(0, 8)

export { getNetworkIdByChain }
