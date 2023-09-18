import { verifyMessage } from 'viem'
import _ from 'lodash'

const deepSortObjectByKeys = _obj => {
  if (!_.isObject(_obj) || _.isArray(_obj)) {
    return _obj
  }
  const sortedKeys = _.orderBy(Object.keys(_obj))
  return _.fromPairs(sortedKeys.map(key => [key, deepSortObjectByKeys(_obj[key])]))
}

const verifySignature = async _message => {
  const signature = _message.signature
  delete _message.signature
  return await verifyMessage({
    address: _message.signerAddress,
    message: JSON.stringify(deepSortObjectByKeys(_message)),
    signature,
  })
}

export default verifySignature
