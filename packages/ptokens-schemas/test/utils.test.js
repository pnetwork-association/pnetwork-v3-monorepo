describe('Tests for schemas utilities', () => {
  describe('getEventId', () => {
    it('Should return the correct ID', async () => {
      const originBlockHash = '0x8c27616afe506eef2a3c47e8d094ab7d385b409fa7cf51a473ddaa189e5e3506'
      const originTransactionHash = '0xfcc12cfd71e53906be4c06c80d3eca6623afef863967cc2a6e66c7e0ead62e2c'
      const originNetworkId = '0x0030d6b5'
      const nonce = '6374'
      const destinationAccount = "0x3aEa738FDe85CF147746733bBf4D3a4f11A16bF4"
      const underlyingAssetName = "Token"
      const underlyingAssetSymbol = "TKN"
      const underlyingAssetDecimals = 18
      const underlyingAssetTokenAddress = null
      const underlyingAssetNetworkId = null
      const amount = null
      const userData = null


      // {
      //   "_id": "0xfcc12cfd71e53906be4c06c80d3eca6623afef863967cc2a6e66c7e0ead62e2c",
      //   "eventName": "UserOperation",
      //   "status": "proposed",
      //   "underlyingAssetChainId": "0xaa36a7",
      //   "underlyingAssetSymbol": "TKN",
      //   "underlyingAssetName": "Token",
      //   "underlyingAssetTokenAddress": "0x30Ce4A040d803F4FcF24CaF4fC81ba464bcD4853",
      //   "originatingTransactionHash": "0xfcc12cfd71e53906be4c06c80d3eca6623afef863967cc2a6e66c7e0ead62e2c",
      //   "amount": "100000000000000000000",
      //   "destinationAddress": "0x3aEa738FDe85CF147746733bBf4D3a4f11A16bF4",
      //   "destinationChainId": "0x0030d6b5",
      //   "userData": "0x",
      //   "tokenAddress": "0x30Ce4A040d803F4FcF24CaF4fC81ba464bcD4853",
      //   "originatingAddress": null,
      //   "finalTransactionHash": "0x",
      //   "proposedTransactionHash": "0x",
      //   "witnessedTimestamp": "2023-03-28T16:33:35.764Z",
      //   "proposedTransactionTimestamp": "2023-03-29T08:56:08.812Z",
      //   "finalTransactionTimestamp": "2023-03-29T09:45:24.295Z",
      //   "nonce": "6374",
      //   "optionsMask": "0x0000000000000000000000000000000000000000000000000000000000000000",
      //   "originatingNetworkId": "0x0030d6b5",
      //   "originatingBlockhash": "0x8c27616afe506eef2a3c47e8d094ab7d385b409fa7cf51a473ddaa189e5e3506"
      // }

      const utils = require('../lib/utils')
      const ret = utils.getEventId(
        originBlockHash,
        originTransactionHash,
        originNetworkId,
        nonce,
        destinationAccount,
        underlyingAssetName,
        underlyingAssetSymbol,
        underlyingAssetDecimals,
        underlyingAssetTokenAddress,
        underlyingAssetNetworkId,
        amount,
        userData,
      )

      expect(ret).toStrictEqual()
    })
  })
})
