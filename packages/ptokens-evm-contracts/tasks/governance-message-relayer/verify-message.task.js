const { Trie } = require('@ethereumjs/trie')
const { RLP } = require('@ethereumjs/rlp')
const { bufferToHex } = require('@ethereumjs/util')

const MerkleTree = require('./utils/MerkleTree')
const { ROOT_CHAIN_CONTRACT_ABI, getBytesBlockHash, getBytesEncodedReceipt } = require('./utils')

const TOPIC = '0x85aab78efe4e39fd3b313a465f645990e6a1b923f5f5b979957c176e632c5a07' // keccak256(GovernanceMessage(bytes))

/* eslint-disable no-console */
const main = async (
  {
    transactionHash,
    rootChainAddress,
    governanceMessageEmitterAddress,
    governanceMessageVerifierAddress,
    stateManagerAddress,
    destinationChainId,
  },
  _hre
) => {
  const { ethers } = _hre

  try {
    await _hre.changeNetwork('mumbai')

    // check if in the corresponding tx there is an event that we want to verify on Ethereum
    console.log(`Checking if ${transactionHash} exists ...`)
    const transaction = await ethers.provider.getTransactionReceipt(transactionHash)
    if (!transaction) {
      console.log('Transaction not found. Closing ...')
      return
    }

    const {
      transactionIndex: expectedTransactionIndex,
      logs,
      blockNumber: blockNumberWhereEventHappened,
    } = transaction
    if (
      !logs.find(
        ({ address, topics }) =>
          address.toLowerCase() === governanceMessageEmitterAddress.toLowerCase() &&
          topics[0] === TOPIC
      )
    ) {
      console.log('Event not present within the transaction. Closing ...')
      return
    }

    await _hre.changeNetwork('goerli')
    const rootChain = new ethers.Contract(
      rootChainAddress,
      ROOT_CHAIN_CONTRACT_ABI,
      ethers.provider
    )
    const currentHeaderBlock = 879110000 //(await rootChain.currentHeaderBlock()).toNumber()
    const { start, end } = await rootChain.headerBlocks(currentHeaderBlock)
    if (blockNumberWhereEventHappened > end.toNumber()) {
      console.log('Checkpoint not submitted yet. Closing ...')
      return
    }

    console.log('Fetching blocks ...')
    await _hre.changeNetwork('mumbai')
    const blocks = []
    // NOTE: Promise.all causes in many cases a timeout error
    for (let blockNumber = start.toNumber(); blockNumber <= end.toNumber(); blockNumber++) {
      blocks.push(await ethers.provider.send('eth_getBlockByNumber', [blockNumber, false]))
    }

    const block = blocks.find(
      ({ number }) => ethers.BigNumber.from(number).toNumber() === blockNumberWhereEventHappened
    )
    const leaves = blocks.map(_block => getBytesBlockHash(_block))

    const blockHashTree = new MerkleTree(leaves)
    const { leaf, index } = leaves
      .map((_leaf, _index) => ({
        leaf: _leaf,
        index: _index,
      }))
      .find(
        ({ index }) =>
          ethers.BigNumber.from(blocks[index].number).toNumber() === blockNumberWhereEventHappened
      )

    // build the receipts patricia tree in order to generate the proof to verify the log inclusion
    const { transactions, receiptsRoot } = blocks.find(
      ({ number }) => ethers.BigNumber.from(number).toNumber() === blockNumberWhereEventHappened
    )

    console.log('Fetching transaction receipts ...')
    const receipts = []
    // NOTE: Promise.all causes in many cases a timeout error
    for (const transaction of transactions) {
      const receipt = await ethers.provider.getTransactionReceipt(transaction)
      receipts.push({
        ...receipt,
        cumulativeGasUsed: receipt.cumulativeGasUsed.toHexString(),
        effectiveGasPrice: receipt.effectiveGasPrice.toHexString(),
        gasUsed: receipt.gasUsed.toHexString(),
      })
    }

    const receipt = receipts.find(
      ({ transactionIndex }) => transactionIndex === expectedTransactionIndex
    )
    const logIndex = receipt.logs.findIndex(
      ({ address, topics }) =>
        address.toLowerCase() === governanceMessageEmitterAddress.toLowerCase() &&
        topics[0] === TOPIC
    )

    const encodedReceipts = receipts.map(_receipt => getBytesEncodedReceipt(_receipt))
    const rlpEncodedKeys = receipts.map(({ transactionIndex }) => RLP.encode(transactionIndex))
    const receiptsRootTree = new Trie()
    await Promise.all(
      encodedReceipts.map((_receipt, _index) =>
        receiptsRootTree.put(rlpEncodedKeys[_index], _receipt)
      )
    )

    const key = rlpEncodedKeys[expectedTransactionIndex]
    const receiptsRootPath = await receiptsRootTree.findPath(key, true)
    const receiptsRootProof = {
      parentNodes: receiptsRootPath.stack.map(_el => _el.raw()),
      path: key,
    }

    await _hre.changeNetwork('goerli')
    const proof = [
      '0x' + Buffer.concat(blockHashTree.getProof(leaf)).toString('hex'),
      index,
      receiptsRoot,
      block.number,
      block.timestamp,
      block.transactionsRoot,
      bufferToHex(Buffer.concat([Buffer.from('00', 'hex'), receiptsRootProof.path])),
      bufferToHex(RLP.encode(receiptsRootProof.parentNodes)),
      '0x' + encodedReceipts[expectedTransactionIndex].toString('hex'),
      logIndex,
      receipt.type,
      currentHeaderBlock,
    ]

    console.log('Veriying and propagating message ...')
    console.log(proof)

    const GovernanceMessageVerifier = await ethers.getContractFactory('GovernanceMessageVerifier')
    const governanceMessageVerifier = await GovernanceMessageVerifier.attach(
      governanceMessageVerifierAddress
    )
    const tx = await governanceMessageVerifier.verifyAndPropagateMessage(
      proof,
      [destinationChainId],
      [stateManagerAddress]
    )
    console.log('Transaction hash', tx.hash)
  } catch (_err) {
    console.error(_err)
  }
}

task(
  'governance-message-relayer:verify-message',
  'Verify a Polygon event on ethereum and propagate it on another chain using telepathy protocol'
)
  .addPositionalParam('transactionHash')
  .addPositionalParam('rootChainAddress')
  .addPositionalParam('governanceMessageEmitterAddress')
  .addPositionalParam('governanceMessageVerifierAddress')
  .addPositionalParam('stateManagerAddress')
  .addPositionalParam('destinationChainId')
  .setAction(main)
