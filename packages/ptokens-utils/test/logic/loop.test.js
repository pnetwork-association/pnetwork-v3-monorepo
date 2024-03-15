const assert = require('assert')
const R = require('ramda')
const { logic, errors } = require('../..')

describe('Loop tests', () => {
  const state = {
    value: 'hello',
    iteration: 0,
  }

  describe('loop', () => {
    it('Should loop over a function correctly', async () => {
      const fn = _state => Promise.resolve(R.assoc('iteration', _state.iteration + 1, _state))

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
            return resolve(R.assoc('iteration', _state.iteration + 1, _state))
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
            _err.message.includes(rejectionError) ? main(_err.lastLoopState) : Promise.reject(_err)
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
        Promise.resolve(R.assoc('iteration', _state.iteration + 1, _state)).then(
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

    it('Should test few edge cases', async () => {
      const initialArgs = [
        1, // constant
        [], // empty array
        {}, // empty object
        'hello', // literal
        undefined,
        null,
      ]

      const loopParams = [
        { rounds: 0 }, // No loops
        { rounds: 1 }, // single loop
        { rounds: 10 }, // finite loop
      ]

      const fn = _state => Promise.resolve(_state)

      for (let i = 0; i < initialArgs.length; ++i) {
        for (let j = 0; j < loopParams.length; ++j) {
          const result = await logic.loop(loopParams[j], fn, [initialArgs[i]])
          assert.deepStrictEqual(result, initialArgs[i])
        }
      }
    })

    it('Should fail when more than one arg is submitted', async () => {
      const fn = (_arg1, _arg2, _arg3) => Promise.resolve(_arg1 + _arg2 + _arg3)
      const loopParams = { rounds: 0 }

      const args = [1, 2, 3]
      try {
        await logic.loop(loopParams, fn, args)
      } catch (e) {
        assert(e.message.includes(errors.ERROR_WRONG_NUMBER_OF_ARGS))
      }
    })

    it('Should fail when the function is undefined', async () => {
      const fn = undefined
      const loopParams = { rounds: 10 }
      const args = [{}]
      try {
        await logic.loop(loopParams, fn, args)
      } catch (e) {
        assert(e.message.includes(errors.ERROR_INVALID_TYPE))
      }
    })
  })
  describe('loopAll', () => {
    it('Should loop over several promise function arguments correctly', async () => {
      const rounds = 10
      const loopParams = { rounds }

      const fn = _state => Promise.resolve(R.assoc('iteration', _state.iteration + 1, _state))

      // Relying on R.assoc shallow copy return in `fn`
      const states = [[state], [state], [state]]

      const expectedState = { value: 'hello', iteration: rounds }
      const expectedStates = [expectedState, expectedState, expectedState]

      const result = await logic.loopAll(loopParams, fn, states)

      assert.strictEqual(result.length, states.length)
      assert.deepStrictEqual(result, expectedStates)
    })

    it('Should run a infinite loop until one of the functions rejects', async () => {
      const loopParams = { rounds: logic.LOOP_MODE.INFINITE }

      const expectedError = 'Loop ends!'
      const fn = _state =>
        new Promise((resolve, reject) => {
          if (_state.isSucceeding) return resolve(_state)
          else if (_state.iteration === _state.counterMax) {
            return reject(new Error(expectedError))
          } else {
            return resolve(R.assoc('iteration', _state.iteration + 1, _state))
          }
        })

      const COUNTER_MAX = 400000
      const rejectingState = [R.assoc('counterMax', COUNTER_MAX, state)]
      const nonRejectingState = [R.assoc('isSucceeding', true, state)]
      const states = [rejectingState, nonRejectingState, nonRejectingState]

      const expectedLastRejectingState = {
        value: 'hello',
        iteration: COUNTER_MAX,
        counterMax: COUNTER_MAX,
      }
      const expectedLastNonRejectingState = { value: 'hello', iteration: 0, isSucceeding: true }

      try {
        await logic.loopAll(loopParams, fn, states)
        assert.fail('Should never reach here')
      } catch (e) {
        assert(e instanceof errors.LoopAllError)
        assert.strictEqual(e.lastLoopState.length, states.length)
        assert(e.lastLoopState[0] instanceof errors.LoopError)
        assert.deepStrictEqual(e.lastLoopState[0].lastLoopState, expectedLastRejectingState)
        assert(e.lastLoopState[0].message.includes(expectedError))
        assert.deepStrictEqual(e.lastLoopState.slice(1), [
          expectedLastNonRejectingState,
          expectedLastNonRejectingState,
        ])
      }
    })

    it('Should run an infinite loop continuosly rejecting', async () => {
      const loopParams = { rounds: logic.LOOP_MODE.INFINITE }

      const rejectionError = 'Loop rejects: '
      const expectedError = 'Loop ends'
      const fn = _state =>
        new Promise((resolve, reject) => {
          if (_state.isSucceeding) return resolve(_state)

          _state.iteration += 1
          if (_state.iteration !== _state.counterMax) {
            return reject(new Error(rejectionError + _state.iteration))
          } else {
            return reject(new Error(expectedError))
          }
        })

      const main = _states =>
        logic
          .loopAll(loopParams, fn, _states)
          .catch(_err =>
            _err.lastLoopState[0].message.includes(rejectionError)
              ? main([
                  [_err.lastLoopState[0].lastLoopState],
                  ..._err.lastLoopState.slice(1).map(state => [state]),
                ])
              : Promise.reject(_err)
          )

      const COUNTER_MAX = 4000
      const rejectingState = [R.assoc('counterMax', COUNTER_MAX, state)]
      const nonRejectingState = [R.assoc('isSucceeding', true, state)]
      const states = [rejectingState, nonRejectingState, nonRejectingState]

      const expectedLastRejectingState = {
        value: 'hello',
        iteration: COUNTER_MAX,
        counterMax: COUNTER_MAX,
      }
      const expectedLastNonRejectingState = { value: 'hello', iteration: 0, isSucceeding: true }

      try {
        await main(states)
        assert.fail('Should never reach here')
      } catch (e) {
        assert(e instanceof errors.LoopAllError)
        assert.strictEqual(e.lastLoopState.length, states.length)
        assert.deepStrictEqual(e.lastLoopState[0].lastLoopState, expectedLastRejectingState)
        assert(e.lastLoopState[0].message.includes('Loop ends'))
        assert.deepStrictEqual(e.lastLoopState.slice(1), [
          expectedLastNonRejectingState,
          expectedLastNonRejectingState,
        ])
      }
    })

    it('Should work with some sleep time', async () => {
      const rounds = 3
      const loopParams = { rounds: rounds }

      const sleepTime = 100
      const fn = _state =>
        Promise.resolve(R.assoc('iteration', _state.iteration + 1, _state)).then(
          logic.sleepThenReturnArg(sleepTime)
        )

      const states = [[state], [state], [state]]

      const expected = { value: 'hello', iteration: 3 }

      const timeBefore = new Date().getTime()
      const result = await logic.loopAll(loopParams, fn, states)
      const timeAfter = new Date().getTime()
      const diff = timeAfter - timeBefore

      assert(diff >= rounds * sleepTime)
      assert.deepStrictEqual(result, [expected, expected, expected])
    })

    it('Should test few edge cases', async () => {
      const loopParams = [
        { rounds: 0 }, // No loops
        { rounds: 1 }, // single loop
        { rounds: 10 }, // finite loop
      ]

      const fn = _state => Promise.resolve(_state)

      const initialArgs = [
        1, // constant
        [], // empty array
        {}, // empty object
        'hello', // literal
        undefined,
        null,
      ]

      for (let i = 0; i < initialArgs.length; ++i) {
        for (let j = 0; j < loopParams.length; ++j) {
          const result = await logic.loopAll(loopParams[j], fn, [
            [initialArgs[i]],
            [initialArgs[i]],
            [initialArgs[i]],
          ])
          assert.deepStrictEqual(result, [initialArgs[i], initialArgs[i], initialArgs[i]])
        }
      }
    })

    it('Should fail when more than one arg is submitted', async () => {
      const loopParams = { rounds: 0 }

      const fn = (_arg1, _arg2, _arg3) => Promise.resolve(_arg1 + _arg2 + _arg3)

      const args = [1, 2, 3]
      const states = [args, args, args]
      try {
        await logic.loopAll(loopParams, fn, states)
        assert.fail('Should never reach here')
      } catch (e) {
        assert(e instanceof errors.LoopAllError)
        assert(e.lastLoopState.every(ee => ee.message.includes(errors.ERROR_WRONG_NUMBER_OF_ARGS)))
      }
    })

    it('Should fail when the function is undefined', async () => {
      const loopParams = { rounds: 0 }

      const fn = undefined

      const args = [{}]
      const states = [args, args, args]
      try {
        await logic.loopAll(loopParams, fn, states)
        assert.fail('Should never reach here')
      } catch (e) {
        assert(e instanceof errors.LoopAllError)
        assert(e.lastLoopState.every(ee => ee.message.includes(errors.ERROR_INVALID_TYPE)))
      }
    })
  })
})
