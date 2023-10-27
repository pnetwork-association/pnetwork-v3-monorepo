const R = require('ramda')
const assert = require('assert')
const logic = require('../../lib/logic')

describe('Map all overall testing', () => {
  describe('mapAll', () => {
    it('Should get all the promise resolved', async () => {
      const add = R.curry((a, b) => Promise.resolve(a + b))
      const list = [1, 2, 3]

      const result = await logic.mapAll(add(1), list)
      const expected = [2, 3, 4]
      assert.deepEqual(result, expected)
    })

    it('Should reject as expected', async () => {
      const expectedMsg = 'Failed w/ 1 + '
      const rejection = R.curry((a, b) => Promise.reject(new Error(`Failed w/ ${a} + ${b}`)))
      const list = [4, 5, 6]
      try {
        await logic.mapAll(rejection(1), list)
      } catch (e) {
        assert(e.message.includes(expectedMsg))
      }
    })
  })
})
