const assert = require('assert')
const { errors, validation } = require('../..')

describe('Validation tests', () => {
  describe('getValidationFunction', () => {
    it('Memoization and validation should work for different schemas', async () => {
      const schema1 = require('./resources/01-schema-sample.js')
      const schema2 = require('./resources/02-schema-sample.js')

      const val1 = await validation.getValidationFunction(schema1)
      const val2 = await validation.getValidationFunction(schema1)
      const val3 = await validation.getValidationFunction(schema2)

      assert(val1 === val2)
      assert(val2 !== val3)

      const result1 = val1({ foo: 1, bar: 'abc' })
      const result2 = val2({ foo: 1, bar: 'abc' })
      const result3 = val3({ foo: 1, bar: 'abc' })
      const result4 = val3({
        sleepTime: 1000,
        maxAttempts: 20,
        successMessage: 'hello',
      })

      assert.equal(result1, true)
      assert.equal(result2, true)
      assert.equal(result3, false)
      assert.equal(result4, true)
    })
  })

  describe('validateJson', () => {
    it('Should resolve w/ the given object', async () => {
      const schema = require('./resources/01-schema-sample.js')
      const json = { foo: 1, bar: 'abc' }
      const result = await validation.validateJson(schema, json)

      assert.deepStrictEqual(result, json)
    })

    it('Should resolve when the schema is async', async () => {
      const schema = require('./resources/03-schema-sample.js')
      const json = { a: 'a', b: 'b', c: 1 }
      const result = await validation.validateJson(schema, json)

      assert.deepStrictEqual(result, json)
    })

    it('Should reject with an error', async () => {
      const schema = require('./resources/01-schema-sample.js')
      const json = { foo: 1, bar: 10 }

      try {
        await validation.validateJson(schema, json)
        assert.fail('Should never reach here')
      } catch (err) {
        assert(err.message.includes(errors.ERROR_SCHEMA_VALIDATION_FAILED))
      }
    })

    it('Should reject w/ async schemas', async () => {
      const schema = require('./resources/03-schema-sample.js')
      const json = { a: 1, b: 's', c: null }

      try {
        await validation.validateJson(schema, json)
        assert.fail('Should never reach here')
      } catch (err) {
        assert.equal(err.message, errors.ERROR_SCHEMA_VALIDATION_FAILED)
      }
    })

    it('Should validate also date-formatted strings', async () => {
      const schema = {
        type: 'object',
        required: ['property'],
        properties: {
          property: {
            type: 'string',
            format: 'date-time',
          },
        },
      }

      await validation.validateJson(schema, {
        property: '2023-03-07T16:11:38.835Z',
      })

      try {
        await validation.validateJson(schema, { property: 'hello world' })
        assert.fail('Should never reach here')
      } catch (e) {
        assert(e.message.includes(errors.ERROR_SCHEMA_VALIDATION_FAILED))
      }
    })
  })
})
