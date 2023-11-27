#!/usr/bin/env node
const R = require('ramda')
const ethers = require('ethers')
const config = require('../config')
const constants = require('ptokens-constants')
const PNetworkHubAbi = require('../lib/chains/evm/abi/PNetworkHub.json')

const { db } = require('ptokens-utils')
const { Command } = require('commander')
const { Challenge } = require('ptokens-constants/lib/hub')
const { MEM_CHALLENGES } = require('../lib/constants')
const { insertChallengePending } = require('../lib/insert-challenge')

const COMMAND_NAME = 'getChallengePending'
const COMMAND_DESC = 'Get the event ChallengePending from a given transaction hash'
const ARG_NAME_HASH = 'hash'
const ARG_DESC_HASH = 'Transaction hash'
const ARG_NAME_CHAIN_NAME = 'chainName'
const ARG_DESC_CHAIN_NAME = 'Chain name (i.e. bsc)'
const OPT_NAME_SAVE = '-s, --save'
const OPT_DESC_SAVE = 'Save the report in the db'
const HELP = ''

const getChallengePending = async (_hash, _chainName, _opts) => {
  const supportedChains = config[constants.config.KEY_SUPPORTED_CHAINS]
  const supportedChain = R.find(
    R.propEq(_chainName, constants.config.KEY_CHAIN_NAME),
    supportedChains
  )

  if (R.isNil(supportedChain)) throw new Error('Chain name nod found')

  const url = supportedChain[constants.config.KEY_PROVIDER_URL]
  const hubAddress = supportedChain[constants.config.KEY_HUB_ADDRESS]
  const provider = new ethers.JsonRpcProvider(url)
  const contract = new ethers.Contract(hubAddress, PNetworkHubAbi, provider)
  const receipt = await provider.getTransactionReceipt(_hash)

  const events = receipt.logs
    .map(x => contract.interface.parseLog(x))
    .filter(R.identity)
    .filter(R.propEq(constants.db.eventNames.CHALLENGE_PENDING, 'name'))

  if (events.length > 1) throw new Error('Found more than one challenge pending event', events)

  if (events.length === 0) throw new Error('No challenge pending event found', events)

  const challenge = Challenge.fromArgs(events[0])

  // eslint-disable-next-line
  console.info(challenge)

  if (_opts.save) {
    const dbName = config[constants.config.KEY_DB][constants.config.KEY_NAME]
    const dbUrl = config[constants.config.KEY_DB][constants.config.KEY_URL]
    const collection = await db.getCollection(dbUrl, dbName, MEM_CHALLENGES)
    await insertChallengePending(collection, challenge)
  }
}

const addCommand = R.invoker(1, 'command')
const addDescription = R.invoker(1, 'description')
const addArg = R.invoker(2, 'argument')
const addOption = R.invoker(2, 'option')
const addAction = R.invoker(1, 'action')
const addHelp = R.invoker(2, 'addHelpText')
const parseAsync = R.invoker(1, 'parseAsync')

const main = () =>
  Promise.resolve(new Command())
    .then(addCommand(COMMAND_NAME))
    .then(addDescription(COMMAND_DESC))
    .then(addArg(ARG_NAME_HASH, ARG_DESC_HASH))
    .then(addArg(ARG_NAME_CHAIN_NAME, ARG_DESC_CHAIN_NAME))
    .then(addOption(OPT_NAME_SAVE, OPT_DESC_SAVE))
    .then(addHelp('after', HELP))
    .then(addAction(getChallengePending))
    .then(parseAsync(process.argv))
    .then(_ => process.exit(0))

main()
