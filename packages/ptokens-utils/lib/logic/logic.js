const { logger } = require('../logger')
const { isNil, curry } = require('ramda')
const { validateJson } = require('../validation')
const { matchStringInsideListSync } = require('../utils')
const {
  ERROR_TIMEOUT,
  ERROR_SLEEP_UNDEFINED_ARG,
  ERROR_INVALID_RETRYING_MODE,
} = require('../errors')

const MAX_ATTEMPTS_CAP = 100

const rejectAfterXMilliseconds = _milliseconds =>
  new Promise((resolve, reject) =>
    setTimeout(reject, _milliseconds, new Error(ERROR_TIMEOUT))
  )

const sleepForXMilliseconds = _milliseconds =>
  new Promise(resolve => {
    logger.info(`Sleeping for ${_milliseconds}ms...`)
    let id = null

    const clearingFunction = () =>
      Promise.resolve(clearTimeout(id)).then(resolve)

    id = setTimeout(clearingFunction, _milliseconds)
  })

const sleepThenReturnArg = curry((_milliseconds, _resolvedValue) =>
  isNil(_resolvedValue)
    ? Promise.reject(
        new Error(
          `${ERROR_SLEEP_UNDEFINED_ARG}(${_resolvedValue}) - Check your logic or use sleepForXMilliseconds`
        )
      )
    : sleepForXMilliseconds(_milliseconds).then(_ => _resolvedValue)
)

const retryingMode = {
  NEVER_RETRY: 'neverRetry',
  ALWAYS_RETRY: 'alwaysRetry',
}

const executePromiseWithRetries = curry((_options, _promiseFxn, _args = []) => {
  const FIELD_SLEEP_TIME = 'sleepTime'
  const FIELD_LOG_MSG = 'logMessage'
  const FIELD_ERROR_MSG = 'errorMessage'
  const FIELD_MAX_ATTEMPTS = 'maxAttempts'
  const FIELD_RETRYING_MODE = 'retryingMode'
  const FIELD_RETRYING_EXCEPTIONS = 'retryingExceptions'
  const FIELD_REJECT_NOW_LIST = 'errorsToNotRetryOn' // deprecated

  // Note: Ajv does not allow the use of the
  // constants above in the schema, so keep
  // the properties spec as strings
  const schema = {
    type: 'object',
    required: ['sleepTime', 'maxAttempts', 'errorMessage', 'successMessage'],
    properties: {
      sleepTime: { type: 'integer' },
      logMessage: { type: 'string' },
      errorMessage: { type: 'string' },
      maxAttempts: { type: 'integer' },
      successMessage: { type: 'string' },
      retryingMode: { enum: ['retryAlways', 'neverRetry'] },
      retryingExceptions: { type: 'array', items: { type: 'string' } },
      errorsToNotRetryOn: { type: 'array', items: { type: 'string' } }, // deprecated
    },
    additionalProperties: false,
  }

  const errorsToNotRetryOn = _options[FIELD_REJECT_NOW_LIST] || []
  let retryingExceptions = _options[FIELD_RETRYING_EXCEPTIONS] || []
  const mode = _options[FIELD_RETRYING_MODE] || retryingMode.ALWAYS_RETRY
  if (errorsToNotRetryOn && mode === retryingMode.ALWAYS_RETRY) {
    retryingExceptions = retryingExceptions.concat(errorsToNotRetryOn)
  } else if (errorsToNotRetryOn && mode === retryingMode.NEVER_RETRY) {
    logger.warn(
      `Mode ${retryingMode.NEVER_RETRY} incompatible with ${FIELD_REJECT_NOW_LIST}. List will be ignored, use '${FIELD_RETRYING_EXCEPTIONS}' instead...`
    )
  }

  const promiseFxnName = _promiseFxn.name

  const attemptsExhausted = _attemptNum =>
    _attemptNum >= _options[FIELD_MAX_ATTEMPTS] ||
    _attemptNum >= MAX_ATTEMPTS_CAP

  const rejectWithAttemptsExhaustedError = _err =>
    logger.error(_options[FIELD_ERROR_MSG]) || Promise.reject(_err)

  const rejectImmediately = _err =>
    logger.error(`'${promiseFxnName}' failed!`) || Promise.reject(_err)

  const retry = (_mainFlowHandler, _attemptNum) =>
    logger.trace(`'${promiseFxnName}' failed, retrying...`) ||
    sleepForXMilliseconds(_options[FIELD_SLEEP_TIME]).then(() =>
      _mainFlowHandler(_attemptNum + 1)
    )

  const mainFlowNeverRetry = (_mainFlowHandler, _attemptNum, _err) => {
    if (attemptsExhausted(_attemptNum))
      return rejectWithAttemptsExhaustedError(_err)
    else if (matchStringInsideListSync(retryingExceptions, _err.message))
      return retry(_mainFlowHandler, _attemptNum)
    else return rejectImmediately(_err)
  }

  const mainFlowAlwaysRetry = (_mainFlowHandler, _attemptNum, _err) => {
    if (matchStringInsideListSync(retryingExceptions, _err.message))
      return rejectImmediately(_err)
    else if (attemptsExhausted(_attemptNum))
      return rejectWithAttemptsExhaustedError(_err)
    else return retry(_mainFlowHandler, _attemptNum)
  }

  const mainFlowErrorHandler = curry(
    (_mainFlowHandler, _attemptNum, _mode, _err) => {
      if (_mode === retryingMode.ALWAYS_RETRY)
        return mainFlowAlwaysRetry(_mainFlowHandler, _attemptNum, _err)
      else if (_mode === retryingMode.NEVER_RETRY)
        return mainFlowNeverRetry(_mainFlowHandler, _attemptNum, _err)
      // Should never get here, validation should see it first
      else
        return Promise.reject(
          new Error(`${ERROR_INVALID_RETRYING_MODE} (${_mode})`)
        )
    }
  )

  const mainFlow = (_attemptNum = 1) => {
    if (_attemptNum > 2)
      logger.info(`Trying ${promiseFxnName} attempt #${_attemptNum}...`)
    else logger.trace(`Trying ${promiseFxnName} attempt #${_attemptNum}...`)

    return _promiseFxn(..._args).catch(
      mainFlowErrorHandler(mainFlow, _attemptNum, mode)
    )
  }

  const getMessageOrDefault = _object =>
    isNil(_object[FIELD_LOG_MSG])
      ? `Calling '${promiseFxnName}' with retries...`
      : _object[FIELD_LOG_MSG]

  return validateJson(schema, _options)
    .then(_ => logger.trace(getMessageOrDefault(_options)) || mainFlow())
    .then(_result => logger.trace(_options.successMessage) || _result)
})

const racePromise = (_milliseconds, _promiseFxn, _promiseFxnArgs = []) => {
  let timeoutReference

  // NOTE: We use this instead of the existing one because we need to get a reference to the timeout.
  const _rejectAfterX = _x =>
    new Promise(
      (_, reject) =>
        (timeoutReference = setTimeout(reject, _x, new Error(ERROR_TIMEOUT)))
    )

  return Promise.race([
    _promiseFxn(..._promiseFxnArgs),
    _rejectAfterX(_milliseconds),
  ]).finally(() => {
    // NOTE: The reference to the promise rejection's timeout will remain for as long as is passed to it,
    // regardless of how quickly the other passed in promise resolves or rejects. So the rejection's timer
    // handle will outlive the passed in function in these cases. The reference held by this timeout
    // will then stop a process existing until it is dropped. As such, we need to clear it up here.
    clearTimeout(timeoutReference)
  })
}

module.exports = {
  racePromise,
  retryingMode,
  sleepThenReturnArg,
  MAX_ATTEMPTS_CAP,
  sleepForXMilliseconds,
  rejectAfterXMilliseconds,
  executePromiseWithRetries,
}
