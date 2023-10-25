const assert = require('assert')
const ethers = require('ethers')
const constants = require('ptokens-constants')

const { utils } = require('ptokens-utils')
const stateObject = require('./samples/state-object')
const { signStatusObject } = require('../lib/interfaces/sign-state-object')
const mockGuardianIdentity = require('./samples/mock-guardian-identity')

describe('Signature tests', () => {
  it('Should sign the state object successfully', async () => {
    const wallet = new ethers.Wallet(mockGuardianIdentity.privateKey)
    const result = await signStatusObject(stateObject, wallet)

    const expectedSignature =
      '0xee4b9501c71d5a4e3a3ce7462ba595f74ace879b9be2992aadee11cbebff6b615223a34c33e3fcde159424e32f5a95d796e3ba1b2dd71109ebe6ad48ecad2d951b' // secretlint-disable-line

    assert.deepStrictEqual(result[constants.config.KEY_SIGNATURE], expectedSignature)

    const stateObjectSorted = utils.sortKeysAlphabetically(stateObject)
    const expectedMessage = JSON.stringify(stateObjectSorted)

    const signerAddress = await ethers.verifyMessage(
      expectedMessage,
      result[constants.config.KEY_SIGNATURE]
    )

    assert.deepStrictEqual(signerAddress, stateObject[constants.config.KEY_SIGNER_ADDRESS])
  })
})
