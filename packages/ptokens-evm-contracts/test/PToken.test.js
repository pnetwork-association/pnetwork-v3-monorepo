const { expect } = require('chai')
const { ethers } = require('hardhat')

const { QUEUE_TIME, PNETWORK_NETWORK_IDS, TELEPATHY_ROUTER_ADDRESS } = require('./constants')
const { deployPToken } = require('./utils')

let user,
  token,
  pToken,
  pRouter,
  pFactory,
  stateManager,
  epochsManager,
  fakeGovernanceMessageVerifier

describe('PToken', () => {
  for (const decimals of [6, 18]) {
    describe(`${decimals} decimals`, () => {
      beforeEach(async () => {
        const StateManager = await ethers.getContractFactory('StateManager')
        const StandardToken = await ethers.getContractFactory('StandardToken')
        const PFactory = await ethers.getContractFactory('PFactory')
        const PRouter = await ethers.getContractFactory('PRouter')
        const EpochsManager = await ethers.getContractFactory('EpochsManager')

        const signers = await ethers.getSigners()
        user = signers[1]
        fakeGovernanceMessageVerifier = signers[2]

        // H A R D H A T
        pFactory = await PFactory.deploy()
        pRouter = await PRouter.deploy(pFactory.address)
        epochsManager = await EpochsManager.deploy()
        stateManager = await StateManager.deploy(
          pFactory.address,
          QUEUE_TIME,
          epochsManager.address,
          TELEPATHY_ROUTER_ADDRESS,
          fakeGovernanceMessageVerifier.address,
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

        await pFactory.setRouter(pRouter.address)
        await pFactory.setStateManager(stateManager.address)
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