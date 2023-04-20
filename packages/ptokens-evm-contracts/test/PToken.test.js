const { expect } = require('chai')
const { ethers } = require('hardhat')
const { time } = require('@nomicfoundation/hardhat-network-helpers')

const { QUEUE_TIME, PNETWORK_NETWORK_IDS } = require('./constants')
const { deployPToken } = require('./utils')

let token, owner, pToken, pRouter, pFactory, stateManager, pEpochsManager

describe('PToken', () => {
  for (const decimals of [6, 18]) {
    describe(`${decimals} decimals`, () => {
      beforeEach(async () => {
        const EpochsManager = await ethers.getContractFactory('EpochsManager')
        const StateManager = await ethers.getContractFactory('StateManager')
        const StandardToken = await ethers.getContractFactory('StandardToken')
        const PFactory = await ethers.getContractFactory('PFactory')
        const PRouter = await ethers.getContractFactory('PRouter')

        const signers = await ethers.getSigners()
        owner = signers[0]
        user = signers[1]

        // H A R D H A T
        pFactory = await PFactory.deploy()
        pRouter = await PRouter.deploy(pFactory.address)
        pEpochsManager = await EpochsManager.deploy()
        stateManager = await StateManager.deploy(
          pFactory.address,
          pEpochsManager.address,
          QUEUE_TIME
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

        await token.transfer(
          user.address,
          ethers.utils.parseUnits('100000', decimals)
        )
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
