const { expect } = require('chai')
const { ethers } = require('hardhat')

const {
  BASE_CHALLENGE_PERIOD_DURATION,
  K_CHALLENGE_PERIOD,
  LOCKED_AMOUNT_CHALLENGE_PERIOD,
  LOCKED_AMOUNT_START_CHALLENGE,
  CHALLENGE_DURATION,
  MAX_OPERATIONS_IN_QUEUE,
  PNETWORK_NETWORK_IDS,
  TELEPATHY_ROUTER_ADDRESS,
} = require('./constants')
const { deployPToken } = require('./utils')

let user,
  token,
  pToken,
  pFactory,
  hub,
  epochsManager,
  fakeGovernanceMessageVerifier,
  slasher,
  feesManager

describe('PToken', () => {
  for (const decimals of [6, 18]) {
    describe(`${decimals} decimals`, () => {
      beforeEach(async () => {
        const PNetworkHub = await ethers.getContractFactory('PNetworkHub')
        const StandardToken = await ethers.getContractFactory('StandardToken')
        const PFactory = await ethers.getContractFactory('PFactory')
        const EpochsManager = await ethers.getContractFactory('EpochsManager')
        const FeesManager = await ethers.getContractFactory('MockFeesManager')

        const signers = await ethers.getSigners()
        user = signers[1]
        fakeGovernanceMessageVerifier = signers[2]
        slasher = signers[3]
        feesManager = await FeesManager.deploy()

        // H A R D H A T
        pFactory = await PFactory.deploy()
        epochsManager = await EpochsManager.deploy()
        hub = await PNetworkHub.deploy(
          pFactory.address,
          BASE_CHALLENGE_PERIOD_DURATION,
          epochsManager.address,
          feesManager.address,
          TELEPATHY_ROUTER_ADDRESS,
          fakeGovernanceMessageVerifier.address,
          slasher.address,
          LOCKED_AMOUNT_CHALLENGE_PERIOD,
          K_CHALLENGE_PERIOD,
          MAX_OPERATIONS_IN_QUEUE,
          PNETWORK_NETWORK_IDS.ethereumMainnet,
          LOCKED_AMOUNT_START_CHALLENGE,
          CHALLENGE_DURATION,
          (
            await ethers.provider.getNetwork()
          ).chainId
        )

        token = await StandardToken.deploy(
          'Token',
          'TKN',
          decimals,
          ethers.utils.parseUnits('100000000', decimals)
        )

        await pFactory.setHub(hub.address)
        await pFactory.renounceOwnership()

        pToken = await deployPToken(
          await token.name(),
          await token.symbol(),
          await token.decimals(),
          token.address,
          PNETWORK_NETWORK_IDS.hardhat,
          {
            pFactory,
          }
        )

        await token.transfer(user.address, ethers.utils.parseUnits('100000', decimals))
      })

      it('should be able to mint by depositing the collateral', async () => {
        const tokenAmount = ethers.utils.parseUnits('1000', decimals)
        const pTokenAmount = ethers.utils.parseUnits('1000', 18)
        const tokenBalancePre = await token.balanceOf(user.address)
        const pTokenBalancePre = await pToken.balanceOf(user.address)

        await token.connect(user).approve(pToken.address, tokenAmount)
        await pToken.connect(user).mint(tokenAmount)

        const tokenBalancePost = await token.balanceOf(user.address)
        const pTokenBalancePost = await pToken.balanceOf(user.address)

        expect(tokenBalancePost).to.be.eq(tokenBalancePre.sub(tokenAmount))
        expect(pTokenBalancePost).to.be.eq(pTokenBalancePre.add(pTokenAmount))
      })

      it('should be able to burn and release the collateral', async () => {
        const tokenAmount = ethers.utils.parseUnits('1000', decimals)
        const pTokenAmount = ethers.utils.parseUnits('1000', 18)
        await token.connect(user).approve(pToken.address, tokenAmount)
        await pToken.connect(user).mint(tokenAmount)

        const tokenBalancePre = await token.balanceOf(user.address)
        const pTokenBalancePre = await pToken.balanceOf(user.address)

        await pToken.connect(user).burn(pTokenAmount)

        const tokenBalancePost = await token.balanceOf(user.address)
        const pTokenBalancePost = await pToken.balanceOf(user.address)

        expect(tokenBalancePost).to.be.eq(tokenBalancePre.add(tokenAmount))
        expect(pTokenBalancePost).to.be.eq(pTokenBalancePre.sub(pTokenAmount))
      })
    })
  }
})
