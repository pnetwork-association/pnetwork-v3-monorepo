// const { isNil, memoizeWith } = require('ramda')
// const { utils, constants } = require('ptokens-utils')
// const {
//   pollForRequests: evmPollForRequests,
// } = require('../evm/evm-poll-for-requests')
// const {
//   maybeProcessFinalTxs: evmMaybeProcessFinalTxs,
// } = require('../evm/evm-process-final-txs')

// const MAP_EVM_METHODS = {
//   pollForRequests: evmPollForRequests,
//   maybeProcessFinalTransactions: evmMaybeProcessFinalTxs,
// }

// // Example
// // const MAP_ALGO_METHODS = {
// //   'pollForRequests': algoPollForRequests,
// //   'maybeProcessFinalTransactions': algoMaybeProcessFinalTxs,
// //   // others
// // }

// const methodHash = (_chainId, _methodName) => `${_chainId}${_methodName}`
// /**
//  * Selects the correct stub for the given chain ID and the method name.
//  * It uses a map defined into each function module which maps the
//  * given method name to the correct stub name (i.e buildTx => evmBuildTx)
//  *
//  * @param  {[type]} _chainId       metadata chain id
//  * @param  {[type]} _methodName    Name of the stub defined in the corresponding mapping
//  * @return {[type]}                The stub acceping just the state as a
//  *                                 parameter
//  *
//  * Example:
//  *
//  *   getDelegatedMethodFromChainId('0x005fe7f9', 'maybeBuildProposalsTxsAndPutInState')(_state)
//  */
// const getDelegatedMethodFromChainId = memoizeWith(
//   methodHash,
//   (_chainId, _methodName) =>
//     utils.getBlockchainTypeFromChainId(_chainId).then(_blockchainType => {
//       let delegatedStub = null
//       logger.info(
//         `Selecting a stub for ('${_blockchainType}','${_methodName}')`
//       )
//       switch (_blockchainType) {
//         case constants.blockchainType.EVM:
//           delegatedStub = MAP_EVM_METHODS[_methodName]
//           break
//         // Add more chains here
//         // case constants.blockchainType.ALGORAND:
//         //   delegatedStub = MAP_ALGO_METHODS[_methodName]
//         //   break
//         default:
//           return Promise.reject(new Error(`${_blockchainType} not supported!`))
//       }

//       return isNil(delegatedStub)
//         ? Promise.reject(
//             new Error(
//               `Unable to find a stub for '${_methodName}' and chain id '${_chainId}', define the required mapping or change values.`
//             )
//           )
//         : delegatedStub
//     })
// )

// module.exports = {
//   getDelegatedMethodFromChainId,
// }
