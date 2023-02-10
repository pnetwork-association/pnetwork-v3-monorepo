const assert = require('assert')
const { errors, validation } = require('../..')

describe('Validation tests', () => {
  describe('getValidationFunction', () => {
    it('Memoization and validation should work for different schemas', () => {
      const schema1 = require('./resources/01-schema-sample.js')
      const schema2 = require('./resources/02-schema-sample.js')

      const val1 = validation.getValidationFunction(schema1)
      const val2 = validation.getValidationFunction(schema1)
      const val3 = validation.getValidationFunction(schema2)
      
      assert(val1 === val2)
      assert(val2 !== val3)

      const result1 = val1({foo: 1, bar: 'abc'})
      const result2 = val2({foo: 1, bar: 'abc'})
      const result3 = val3({foo: 1, bar: 'abc'})
      const result4 = val3({sleepTime: 1000, maxAttempts: 20, successMessage: 'hello'})

      assert.equal(result1, true)
      assert.equal(result2, true)
      assert.equal(result3, false)
      assert.equal(result4, true)
    })
  })

  describe('validateJson', () => {
    it('Should resolve', async () => {
      const schema = require('./resources/01-schema-sample.js')
      const json = { foo: 1, bar: 'abc' }
      await validation.validateJson(schema, json)
    })

    it('Should reject', async () => {
      const schema = require('./resources/01-schema-sample.js')
      const json = { foo: 1, bar: 10 }

      try {
        await validation.validateJson(schema, json)
        assert.fail('Should never reach here')
      } catch (err) {
        assert(err.message.includes(errors.ERROR_SCHEMA_VALIDATION_FAILED))
      }
    })
  })
})