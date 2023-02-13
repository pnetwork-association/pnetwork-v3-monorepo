const assert = require('assert')
const { all } = require('ramda')
const { utils } = require('../..')

describe('RegeExp utils overall tests', () => {
  describe('applyRegExpToListOfStrings', () => {
    it('Should pick the correct files matching the regular expression', () => {
      const list = [
        'private-key.gpg',
        'private-key-hello.gpg',
        'should-not-pick-this.txt',
        'should-not-pick-this.gpg',
      ]

      const regexp = new RegExp('private-key.*.gpg')
      const result = utils.applyRegExpToListOfStrings(regexp, list)

      const expected = [list[0], list[1]]

      assert.deepStrictEqual(result, expected)
    })
  })

  describe('matchStringInsideListSync', () => {
    const errorMessages = [
      'error 1',
      'error error',
      'db lock error',
      'it does not work!1!!!',
    ]

    it('Should match every error message', async () => {
      const list = ['.*']
      const results = await Promise.all(
        errorMessages.map(utils.matchStringInsideListSync(list))
      )

      assert(all(results))
    })

    it('Should find the right match', async () => {
      const list = ['db lock']

      const results = await Promise.all(
        errorMessages.map(utils.matchStringInsideListSync(list))
      )

      assert(!results[0])
      assert(!results[1])
      assert(results[2])
      assert(!results[3])
    })
  })
})
