const EventEmitter = require('events')
const ethers = require('ethers')
const { logs } = require('./mock/evm-logs')

describe('EVM listener', () => {
  describe('listenForEvmEvent', () => {
    it('Should call callback with the standardized event', done => {
      const state = {
        'chain-id': '0x005fe7f9',
        'provider-url': 'provider-url',
      }
      const fakeProvider = new EventEmitter()
      fakeProvider._on = fakeProvider.on

      const scheduleEvent = (_address, _log, _ms) =>
        setTimeout(
          _ =>
            fakeProvider.emit(
              JSON.stringify({
                address: _address,
                topics: [_log.topics.at(0)],
              }),
              _log
            ),
          _ms
        )

      scheduleEvent('0xdac17f958d2ee523a2206206994597c13d831ec7', logs[0], 100)
      scheduleEvent('0xe396757ec7e6ac7c8e5abe7285dde47b98f22db8', logs[1], 200)
      scheduleEvent('0x45bc7Bc558FcCaA7674310254798A968D9190fd7', logs[1], 300) // malicious attempt
      scheduleEvent('0x62199b909fb8b8cf870f97bef2ce6783493c4908', logs[2], 400)
      scheduleEvent('0x45bc7Bc558FcCaA7674310254798A968D9190fd7', logs[2], 500) // malicious attempt

      const onListenerSpy = jest
        .spyOn(fakeProvider, 'on')
        .mockImplementation((_filter, _func) =>
          fakeProvider._on(JSON.stringify(_filter), _func)
        )
      const getDefaultProviderSpy = jest
        .spyOn(ethers, 'getDefaultProvider')
        .mockImplementation(_ => fakeProvider)
      const { listenForEvmEvent } = require('../lib/evm/listener-evm')
      const callback = jest.fn()

      listenForEvmEvent(
        state,
        'Transfer(address indexed from,address indexed to,uint256 value)',
        '0xdac17f958d2ee523a2206206994597c13d831ec7',
        callback
      )
      listenForEvmEvent(
        state,
        'PegIn(address _tokenAddress, address _tokenSender, uint256 _tokenAmount, string _destinationAddress, bytes _userData, bytes4 _originChainId, bytes4 _destinationChainId)',
        '0xe396757ec7e6ac7c8e5abe7285dde47b98f22db8',
        callback
      )
      listenForEvmEvent(
        state,
        'Redeem(address indexed redeemer, uint256 value, string underlyingAssetRecipient, bytes userData, bytes4 originChainId, bytes4 destinationChainId)',
        '0x62199b909fb8b8cf870f97bef2ce6783493c4908',
        callback
      )

      setTimeout(() => {
        expect(getDefaultProviderSpy).toHaveBeenNthCalledWith(1, 'provider-url')
        expect(onListenerSpy).toHaveBeenNthCalledWith(
          1,
          {
            address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            topics: [
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            ],
          },
          expect.anything()
        )
        expect(onListenerSpy).toHaveBeenNthCalledWith(
          2,
          {
            address: '0xe396757ec7e6ac7c8e5abe7285dde47b98f22db8',
            topics: [
              '0xc03be660a5421fb17c93895da9db564bd4485d475f0d8b3175f7d55ed421bebb',
            ],
          },
          expect.anything()
        )
        expect(onListenerSpy).toHaveBeenNthCalledWith(
          3,
          {
            address: '0x62199b909fb8b8cf870f97bef2ce6783493c4908',
            topics: [
              '0xdd56da0e6e7b301867b3632876d707f60c7cbf4b06f9ae191c67ea016cc5bf31',
            ],
          },
          expect.anything()
        )
        expect(callback).toHaveBeenCalledTimes(3)
        expect(callback).toHaveBeenNthCalledWith(1, {
          amount: ethers.BigNumber.from('0x0bebc200'),
          originatingChainId: '0x005fe7f9',
          originatingTxHash:
            '0x37eeb55eab329c73aeac6a172faa6c77e7013cd0cda0fc472274c5faf0df7003',
          eventName: 'Transfer',
          status: 'detected',
        })
        expect(callback).toHaveBeenNthCalledWith(2, {
          amount: ethers.BigNumber.from('0x3baa0c40'),
          tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          destinationAddress: '770102986',
          destinationChainId: '0x03c38e67',
          originatingChainId: '0x005fe7f9',
          originatingTxHash:
            '0x0f53438f23bd61bcee616d4f4d0f70a80dcd1d10dc8b0796774cb4afa6340305',
          eventName: 'PegIn',
          status: 'detected',
        })
        expect(callback).toHaveBeenNthCalledWith(3, {
          amount: ethers.BigNumber.from('0x1cab4f5986196800'),
          destinationAddress: '35eXzETyUxiQPXwU2udtVFQFrFjgRhhvPj',
          destinationChainId: '0x01ec97de',
          originatingChainId: '0x005fe7f9',
          originatingTxHash:
            '0x9488dee8cb5c6b2f6299e45e48bba580f46dbd496cfaa70a182060fd5dc81cb4',
          eventName: 'Redeem',
          status: 'detected',
        })
        done()
      }, 600)
    })
  })
})
