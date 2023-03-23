const assert = require('assert')
const jsonrpc = require('jsonrpc-lite')
const { createServer, MOCK_SERVER_REQUEST_FAILED } = require('../http/server')
const { logic, errors, http, utils } = require('../..')

describe('Logic tests', () => {
  describe('sleepForXMilliseconds', () => {
    it('Should sleep for x milliseconds', async () => {
      const time = 200
      const timeBefore = new Date().getTime()
      await logic.sleepForXMilliseconds(time)
      const timeAfter = new Date().getTime()
      const delta = timeAfter - timeBefore

      // eslint-disable-next-line no-console
      console.log('timeBefore: ', timeBefore)
      // eslint-disable-next-line no-console
      console.log('timeAfter: ', timeAfter)
      // eslint-disable-next-line no-console
      console.log('delta ', delta)
      assert(delta >= time)
    })
  })

  describe('rejectAfterXMilliseconds', () => {
    it('Should reject because time has expired', async function () {
      this.timeout(1500)
      try {
        await Promise.race([
          logic.rejectAfterXMilliseconds(400),
          logic.sleepForXMilliseconds(500).then(() => assert.fail()),
        ])
      } catch (err) {
        assert(err.message === errors.ERROR_TIMEOUT)
      }
    })

    it('Should reject because time has expired (race in promise)', async function () {
      this.timeout(1500)
      const dummyRace = () =>
        Promise.race([
          logic.rejectAfterXMilliseconds(200),
          logic.sleepForXMilliseconds(400).then(() => assert.fail('Inside')),
        ])

      try {
        await dummyRace()
        assert.fail('Outside')
      } catch (err) {
        assert(err.message === errors.ERROR_TIMEOUT)
      }
    })

    it('Should reject after a throw', async function () {
      this.timeout(1500)
      const errorThrown = 'Error thrown'
      const functionThatThrows = () =>
        new Promise((resolve, reject) => {
          return reject(new Error(errorThrown))
        })
      try {
        await Promise.race([
          functionThatThrows(),
          logic.rejectAfterXMilliseconds(1000),
        ])
        assert.fail()
      } catch (err) {
        assert(err.message === errorThrown)
      }
    })

    it('Should not reject after a function resolves', async function () {
      this.timeout(1500)
      const functionThatResolves = _value => Promise.resolve(_value)
      try {
        const expected = 'success'
        const result = await Promise.race([
          functionThatResolves(expected),
          logic.rejectAfterXMilliseconds(1000),
        ])
        assert(result === expected)
      } catch (err) {
        assert.fail(err)
      }
    })
  })

  describe('executePromiseWithRetries + http request', () => {
    let server
    const port = 3000
    const serverUrl = `http://localhost:${port}`

    before(async () => {
      server = await createServer()

      /* eslint-disable no-empty-function */
      await server.listen(3000, '127.0.0.1', () => {})
    })

    after(() => {
      server.close()
    })

    it('Should reject after three attempts with the error of the request', async () => {
      const retries = 3
      const sleepTime = 200
      const promiseError = 'Failure'

      const retryOpts = {
        sleepTime: sleepTime,
        maxAttempts: retries,
        errorMessage: promiseError,
        successMessage: 'Succeed',
      }

      const request = jsonrpc.request('123', 'sendrawtransaction', ['payload'])
      const endpoint = `${serverUrl}/json-rpc-fail`

      const promiseToRetry = () => http.jsonRpcFetch(endpoint, request)

      try {
        await logic.executePromiseWithRetries(retryOpts, promiseToRetry)
        assert.fail('Should never reach here')
      } catch (e) {
        const resp = await e.response.json()
        const expected = utils.objectifySync(
          jsonrpc.success(1, MOCK_SERVER_REQUEST_FAILED)
        )
        assert(e.message.includes(errors.ERROR_UNEXPECTED_HTTP_STATUS))
        assert.deepStrictEqual(resp, expected)
      }
    })
  })

  describe('executePromiseWithRetries', () => {
    it('Should reject after retrying the promise three times', async () => {
      const retries = 3
      const sleepTime = 200
      const promiseArg = 1337
      const promiseError = 'Failure'

      let timeBefore,
        timeAfter,
        counter = 0

      const promiseToRetry = _arg =>
        new Promise((_, reject) => {
          counter++
          assert(_arg === promiseArg)
          return reject(new Error(promiseError))
        })

      try {
        const options = {
          successMessage: '',
          maxAttempts: retries,
          sleepTime: sleepTime,
          errorMessage: 'promiseToRetry failed!',
        }

        timeBefore = new Date().getTime()
        await logic.executePromiseWithRetries(options, promiseToRetry, [
          promiseArg,
        ])
        assert.fail('Should never reach here')
      } catch (_err) {
        timeAfter = new Date().getTime()
        const totalTime = timeAfter - timeBefore
        assert(counter === retries)
        assert(_err.message.includes(promiseError))
        assert(totalTime >= sleepTime * (retries - 1))
      }
    })

    it('Should not reject after retrying two times', async () => {
      const retries = 1
      const maxRetries = 3
      const sleepTime = 200
      const promiseError = 'Failure'
      const promiseSuccess = 'Success'

      let counter = 0

      const promiseToRetry = () =>
        new Promise((resolve, reject) => {
          counter++
          return counter >= retries
            ? resolve(promiseSuccess)
            : reject(new Error(promiseError))
        })

      try {
        const options = {
          errorMessage: '',
          successMessage: '',
          maxAttempts: maxRetries,
          sleepTime: sleepTime,
        }

        const result = await logic.executePromiseWithRetries(
          options,
          promiseToRetry
        )

        assert(counter === retries)
        assert(result === promiseSuccess)
      } catch (_err) {
        assert.fail()
      }
    })

    it('Should reject after the max cap for attempts is reached', async () => {
      const sleepTime = 1
      const promiseArg = 1337
      const promiseError = 'Failure'
      const retries = logic.MAX_ATTEMPTS_CAP * 10

      let counter = 0

      const promiseToRetry = () =>
        new Promise((_, reject) => {
          counter++
          return reject(new Error(promiseError))
        })

      try {
        const options = {
          errorMessage: '',
          successMessage: '',
          maxAttempts: retries,
          sleepTime: sleepTime,
        }

        await logic.executePromiseWithRetries(options, promiseToRetry, [
          promiseArg,
        ])
        assert.fail()
      } catch (_err) {
        assert.equal(counter, logic.MAX_ATTEMPTS_CAP)
        assert(_err.message.includes(promiseError))
      }
    })

    it('Should reject because the options given are invalid', async () => {
      const invalidOptions = {}
      const promiseToRetry = () => Promise.resolve()

      try {
        await logic.executePromiseWithRetries(
          invalidOptions,
          promiseToRetry,
          []
        )
        assert.fail()
      } catch (err) {
        assert(err.message.includes(errors.ERROR_SCHEMA_VALIDATION_FAILED))
      }
    })

    it('Should reject if the error matches one in the list', async () => {
      const sleepTime = 1
      const promiseArg = 1337
      const promiseError = 'Error: no parent error'
      const retries = logic.MAX_ATTEMPTS_CAP * 10

      let counter = 0

      const promiseToRetry = () =>
        new Promise((_, reject) => {
          counter++
          return reject(new Error(promiseError))
        })

      try {
        const options = {
          errorMessage: '',
          successMessage: '',
          maxAttempts: retries,
          sleepTime: sleepTime,
          errorsToNotRetryOn: ['no parent error'],
        }

        await logic.executePromiseWithRetries(options, promiseToRetry, [
          promiseArg,
        ])

        assert.fail('Should never reach here')
      } catch (_err) {
        assert.equal(counter, 1)
        assert(_err.message.includes(promiseError))
      }
    })

    it('Should retry three times and then succeed when a known error is raised', async () => {
      const sleepTime = 1
      const promiseArg = 1337
      const promiseError = 'Database lock error'
      const promiseSuccess = 'Success'
      const retries = logic.MAX_ATTEMPTS_CAP * 10

      let counter = 0

      const promiseToRetry = () =>
        new Promise((resolve, reject) => {
          counter++
          if (counter < 3) return reject(new Error(promiseError))
          else return resolve(promiseSuccess)
        })

      const options = {
        errorMessage: '',
        successMessage: '',
        maxAttempts: retries,
        sleepTime: sleepTime,
        errorsToNotRetryOn: ['no parent error', 'another error'],
      }

      const result = await logic.executePromiseWithRetries(
        options,
        promiseToRetry,
        [promiseArg]
      )

      assert.equal(counter, 3)
      assert.deepStrictEqual(result, promiseSuccess)
    })

    it('Should reject with the correct error (also for AggregateError types)', async () => {
      const retries = 3
      const sleepTime = 1
      const ERROR_1 = 'error 1'
      const ERROR_2 = 'error 2'
      const options = {
        errorMessage: '',
        successMessage: '',
        maxAttempts: retries,
        sleepTime: sleepTime,
      }

      const promiseToRetry = () =>
        Promise.any([
          Promise.reject(new Error(ERROR_1)),
          Promise.reject(new Error(ERROR_2)),
        ])

      try {
        await logic.executePromiseWithRetries(options, promiseToRetry, [])
        assert.fail('Should never reach here')
      } catch (err) {
        assert(err.errors[0].message.includes(ERROR_1))
        assert(err.errors[1].message.includes(ERROR_2))
      }
    })

    it('Should retry only when a single error happens', async () => {
      let counter = 0
      const retries = 4
      const sleepTime = 1
      const ERROR_3 = 'An error to reject'
      const ERROR_1 = 'Rocksdb lock error'
      const ERROR_2 = 'Another error to retry'
      const options = {
        errorMessage: '',
        successMessage: '',
        maxAttempts: retries,
        sleepTime: sleepTime,
        retryingExceptions: ['lock', 'retry'],
        retryingMode: logic.retryingMode.NEVER_RETRY,
      }

      const promiseToRetry = () =>
        new Promise((resolve, reject) => {
          if (counter === 0) {
            counter++
            return reject(new Error(ERROR_1))
          } else if (counter === 1) {
            counter++
            return reject(new Error(ERROR_2))
          } else if (counter === 2) {
            counter++
            return reject(new Error(ERROR_3))
          } else {
            assert.fail('Should never resolve')
            return resolve()
          }
        })

      try {
        await logic.executePromiseWithRetries(options, promiseToRetry, [])
        assert.fail('Should never reach here')
      } catch (err) {
        assert(err.message.includes(ERROR_3))
        assert.equal(counter, 3)
      }
    })
  })

  describe('racePromise', () => {
    const resolveAndReturnThingAfterXMilliseconds = (
      _milliseconds,
      _thingToReturn
    ) =>
      new Promise(resolve =>
        setTimeout(() => resolve(_thingToReturn), _milliseconds)
      )

    it('Should resolve and return thing if faster to resolve than passed in ms', async () => {
      const thingToReturn = 'woo!'
      const promiseTimeToResolve = 100
      const timeToRacePromiseAgainst = promiseTimeToResolve * 2
      assert(timeToRacePromiseAgainst > promiseTimeToResolve)
      const promiseFxn = resolveAndReturnThingAfterXMilliseconds
      const promiseArgs = [promiseTimeToResolve, thingToReturn]
      const result = await logic.racePromise(
        timeToRacePromiseAgainst,
        promiseFxn,
        promiseArgs
      )
      assert.strictEqual(result, thingToReturn)
    })

    it('Should reject if slower to resolve than ms', async () => {
      const promiseTimeToResolve = 100
      const timeToRacePromiseAgainst = promiseTimeToResolve / 2
      assert(timeToRacePromiseAgainst < promiseTimeToResolve)
      const promiseFxn = resolveAndReturnThingAfterXMilliseconds
      const promiseArgs = [promiseTimeToResolve]
      try {
        await logic.racePromise(
          timeToRacePromiseAgainst,
          promiseFxn,
          promiseArgs
        )
        assert.fail('Should not have resolved!')
      } catch (_err) {
        assert(_err.message.includes(errors.ERROR_TIMEOUT))
      }
    })

    it('Should reject with correct error if promise passed to it errors', async () => {
      const promiseTimeToResolve = 100
      const timeToRacePromiseAgainst = promiseTimeToResolve * 2
      assert(timeToRacePromiseAgainst > promiseTimeToResolve)
      const errorMsg = 'An error'
      const promiseFxn = () => Promise.reject(new Error(errorMsg))
      const promiseArgs = [promiseTimeToResolve]
      try {
        await logic.racePromise(
          timeToRacePromiseAgainst,
          promiseFxn,
          promiseArgs
        )
        assert.fail('Should not have resolved!')
      } catch (_err) {
        assert(_err.message.includes(errorMsg))
      }
    })
  })

  describe('sleepThenReturnArg', () => {
    it('Should sleep and resolve with the specified value', async () => {
      const time = 200
      const expected = { value: 10 }
      const timeBefore = new Date().getTime()
      const result = await logic.sleepThenReturnArg(time, expected)
      const timeAfter = new Date().getTime()
      const delta = timeAfter - timeBefore

      assert(delta >= time)
      assert.deepStrictEqual(result, expected)
    })

    it('Should reject when the given arg is Nil', async () => {
      try {
        await logic.sleepThenReturnArg(200, undefined)
      } catch (e) {
        assert(e.message.includes(errors.ERROR_SLEEP_UNDEFINED_ARG))
      }
    })
  })
})
