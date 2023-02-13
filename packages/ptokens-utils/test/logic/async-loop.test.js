const { assoc } = require('ramda')
const assert = require('assert')
const { logic } = require('../..')

describe('Async loop tests', () => {
  describe('asyncLoop', () => {
    it('Optimized version should not exceed the stack limit size', async () => {
      // Proposed recursive function to
      // show the stack limit exceeded
      const sumBelow = (number, sum = 0) =>
        number === 0 ? Promise.resolve(sum) : sumBelow(number - 1, sum + number)

      const optimizedSumBelow = _num => {
        const _sumBelow = (number, sum = 0) =>
          number === 0
            ? logic.stopLoop(sum)
            : Promise.resolve([number - 1, sum + number]) // We return the new args here

        return logic.asyncLoop(_sumBelow, [_num])
      }

      const number = 10000
      try {
        await sumBelow(number)
        assert.fail('Should never reach here')
      } catch (err) {
        assert(err.message.includes('Maximum call stack size exceeded'))
      }

      const result = await optimizedSumBelow(number)
      assert.equal(result, 50005000)
    })

    it('Should raise an error correctly', async () => {
      const optimizedRecursiveLoop = (_counter = 0) => {
        const _recursiveRejectingLoop = _iterations =>
          _iterations < 10
            ? Promise.resolve([_iterations + 1])
            : Promise.reject(new Error('Failure!'))

        return logic.asyncLoop(_recursiveRejectingLoop, [_counter])
      }

      try {
        await optimizedRecursiveLoop()
        assert.fail('Should never reach here!')
      } catch (err) {
        assert.equal(err.message, 'Failure!')
      }
    })

    it('Should work also with object as paramers', async () => {
      const optimizedRecursiveLoop = _object => {
        const _recursiveRejectingLoop = _param =>
          _param.counter < 10
            ? Promise.resolve([{ counter: _param.counter + 1 }])
            : logic.stopLoop('yesssss!')

        return logic.asyncLoop(_recursiveRejectingLoop, [_object])
      }

      const result = await optimizedRecursiveLoop({ counter: 5 })

      assert.equal(result, 'yesssss!')
    })

    it('Should work on ideally infinite loops', async function () {
      this.timeout(5000)

      let counter = 0
      const threshold = 30000
      const optimizedInfiniteLoop = _state => {
        const _inifiniteLoop = _stateArg =>
          counter === threshold
            ? logic.stopLoop(assoc('result', 'The End.', _stateArg))
            : Promise.resolve([assoc('hello', counter++, _stateArg)])

        return logic.asyncLoop(_inifiniteLoop, [_state])
      }

      const finalState = await optimizedInfiniteLoop({ initial: 'field' })

      assert.deepStrictEqual(finalState, {
        initial: 'field',
        hello: threshold - 1,
        result: 'The End.',
      })
    })
  })
})
