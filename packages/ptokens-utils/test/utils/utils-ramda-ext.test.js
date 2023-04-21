const assert = require('assert')
const { utils } = require('../..')

describe('General ramda extensions testing', () => {
  describe('removeNilsFromList', () => {
    it('Should remove all the nils values from the given list', async () => {
      const list = ['a', 1, null, 2, 'b', undefined, 0, { hello: 'world' }, ['alist']]

      const result = utils.removeNilsFromList(list)

      const expected = ['a', 1, 2, 'b', 0, { hello: 'world' }, ['alist']]

      assert.deepStrictEqual(result, expected)
    })
  })
})
