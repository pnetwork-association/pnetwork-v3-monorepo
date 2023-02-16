const assert = require('assert')
const { assoc } = require('ramda')
const { logic, errors } = require('../..')

describe('Loop tests', () => {
  describe('loop', () => {
    const state = {
      value: 'hello',
      iteration: 0,
    }

    it('Should loop over a function correctly', async () => {
      const fn = _state =>
        Promise.resolve(assoc('iteration', _state.iteration + 1, _state))

      let result = await fn(state).then(fn)

      let expected = { value: 'hello', iteration: 2 }

      assert.deepStrictEqual(result, expected)

      const loopParams = { rounds: 3 }
      result = await logic.loop(loopParams, fn, [result])

      expected = { value: 'hello', iteration: 5 }

      assert.deepStrictEqual(result, expected)
    })

    it('Should run a infinite loop until the function rejects', async () => {
      const loopParams = { rounds: logic.LOOP_MODE.INFINITE }

      let counter = 0
      const COUNTER_MAX = 400000

      const expectedError = 'Loop ends!'
      const fn = _state =>
        new Promise((resolve, reject) => {
          if (counter === COUNTER_MAX) {
            return reject(new Error(expectedError))
          } else {
            counter++
            return resolve(assoc('iteration', _state.iteration + 1, _state))
          }
        })

      const expectedLastState = { iteration: COUNTER_MAX, value: 'hello' }

      try {
        await logic.loop(loopParams, fn, [state])
        assert.fail('Should never reach here')
      } catch (e) {
        assert.equal(counter, COUNTER_MAX)
        assert(e instanceof errors.LoopError)
        assert.deepStrictEqual(e.lastLoopState, expectedLastState)
        assert(e.message.includes(expectedError))
      }
    })

    it('Should run an infinite loop continuosly rejecting', async () => {
      const loopParams = { rounds: logic.LOOP_MODE.INFINITE }

      let counter = 0
      const COUNTER_MAX = 4000

      const rejectionError = 'Loop rejects: '
      const expectedError = 'Loop ends'

      const fn = _state =>
        new Promise((resolve, reject) => {
          if (counter !== COUNTER_MAX) {
            counter++
            return reject(new Error(rejectionError + counter))
          } else {
            counter++
            return reject(new Error(expectedError))
          }
        })

      const main = _state =>
        logic
          .loop(loopParams, fn, [_state])
          .catch(_err =>
            _err.message.includes(rejectionError)
              ? main(_err.lastLoopState)
              : Promise.reject(_err)
          )

      const expectedLastState = { value: 'hello', iteration: 0 }

      try {
        await main(state)
        assert.fail('Should never reach here')
      } catch (e) {
        assert(e.message.includes('Loop ends'))
        assert.deepStrictEqual(e.lastLoopState, expectedLastState)
      }
    })

    it('Should work with some sleep time', async () => {
      const rounds = 3
      const sleepTime = 100
      const loopParams = { rounds: rounds }
      const fn = _state =>
        Promise.resolve(assoc('iteration', _state.iteration + 1, _state)).then(
          logic.sleepThenReturnArg(sleepTime)
        )

      const timeBefore = new Date().getTime()
      const result = await logic.loop(loopParams, fn, [state])
      const timeAfter = new Date().getTime()
      const diff = timeAfter - timeBefore

      const expected = {
        value: 'hello',
        iteration: 3,
      }
      assert(diff >= rounds * sleepTime)
      assert.deepStrictEqual(result, expected)
    })
  })
})
