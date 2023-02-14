const assert = require('assert')
const { greet } = require('../lib/example')

describe('Example tests', () => {
  describe('greet', () => {
    it('Should return hello world', async () => {
      const text = await greet()
      const expected = 'Hello World!'
      assert.deepStrictEqual(text, expected)
    })
  })
})
