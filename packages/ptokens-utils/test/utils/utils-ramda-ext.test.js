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

  describe('sortKeysAlphabetically', () => {
    it('Should sort the keys alphabetically of an object', async () => {
      const expected = {
        a: 1,
        b: [1, 2, 3],
        c: {
          d: 1,
          e: {
            f: [7, 8, 9],
            g: [4, 5, 6],
          },
          h: {
            i: {
              l: 1,
              m: 2,
              o: 3,
            },
          },
        },
      }

      const permutedObject = {
        c: {
          e: {
            g: [4, 5, 6],
            f: [7, 8, 9],
          },
          h: {
            i: {
              o: 3,
              l: 1,
              m: 2,
            },
          },
          d: 1,
        },
        b: [1, 2, 3],
        a: 1,
      }

      const result = utils.sortKeysAlphabetically(permutedObject)

      assert.deepStrictEqual(result, expected)
    })
  })
})
