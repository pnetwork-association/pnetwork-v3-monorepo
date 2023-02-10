const assert = require('assert')
const { errors, validation } = require('../..')

describe('Check value type testing', () => {
  describe('checkType', () => {
    it('Should reject when the value type is not the expected one', async () => {
      try {
        await validation.checkType('Object', 1)
        assert.fail('Should never reach here')
      } catch (err) {
        assert(err.message.includes(errors.ERROR_INVALID_TYPE))
      }
    })

    it('Should resolve w/ the value given as argument when it is the expected type', async () => {
      const object = { 'hello': 'world' }
      const result = await validation.checkType('Object', object)

      assert.equal(result, object)
    })
  })
})