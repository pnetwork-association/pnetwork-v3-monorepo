const R = require('ramda')
const {
  KEY_PFACTORY_ADDRESS,
  CONTRACT_NAME_PFACTORY,
  TASK_NAME_DEPLOY_INIT,
  TASK_DESC_DEPLOY_PFACTORY,
  TASK_NAME_DEPLOY_PFACTORY,
} = require('../constants')
const { utils, errors } = require('ptokens-utils')
const {
  getConfiguration,
  updateConfiguration,
} = require('./lib/configuration-manager')

const savePFactoryAddress = R.curry((hre, _pFactory) =>
  getConfiguration()
    .then(_config => updateConfiguration(_config, hre.network.name, KEY_PFACTORY_ADDRESS, _pFactory.address))
    .then(_ => _pFactory)
)

const deployAndSavePFactory = hre =>
  hre.ethers
    .getContractFactory(CONTRACT_NAME_PFACTORY)
    .then(_pFactoryContract => _pFactoryContract.deploy())
    .then(savePFactoryAddress(hre))
    .then(
      _pFactory =>
        console.info('pFactory address:', _pFactory.address) || _pFactory
    )

const attachToPFactory = R.curry((hre, _address) =>
  hre.ethers
    .getContractFactory(CONTRACT_NAME_PFACTORY)
    .then(_pFactoryContract => _pFactoryContract.attach(_address))
    .then(
      _pFactory =>
        console.info('pFactory found @', _pFactory.address) || _pFactory
    )
)

const deployPFactoryErrorHandler = R.curry((hre, _err) =>
  _err.message.includes(errors.ERROR_KEY_NOT_FOUND)
    ? deployAndSavePFactory(hre)
    : console.error(_err)
)

const deployPFactory = (_, hre) =>
  hre
    .run(TASK_NAME_DEPLOY_INIT)
    .then(utils.getKeyFromObj(KEY_PFACTORY_ADDRESS))
    .then(attachToPFactory(hre))
    .catch(deployPFactoryErrorHandler(hre))


task(TASK_NAME_DEPLOY_PFACTORY, TASK_DESC_DEPLOY_PFACTORY, deployPFactory)
