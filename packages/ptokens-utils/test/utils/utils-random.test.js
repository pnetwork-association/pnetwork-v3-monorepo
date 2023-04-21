const assert = require('assert')
const R = require('ramda')
const { utils } = require('../..')

describe('Overall utils random tests', () => {
  describe('pickRandomElementFromArray', () => {
    it('Should pick an element randomly', () => {
      const ROUNDS = 100000
      const frequencies = {}
      const array = ['a', 'b', 'c', 'd', 'e']
      const expectedAverage = 1 / array.length

      for (let i = 0; i <= ROUNDS; i++) {
        const elem = utils.pickRandomElementFromArray(array)

        frequencies[elem] = R.has(elem, frequencies) ? frequencies[elem] + 1 : 0
      }

      for (const elem in frequencies) {
        const variance = 0.1
        const elemAverage = frequencies[elem] / ROUNDS
        const isAverage =
          expectedAverage - variance < elemAverage && elemAverage < expectedAverage + variance

        assert(isAverage)
      }
    })
  })
})
