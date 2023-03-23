const assert = require('assert')
const { utils, errors } = require('../..')

describe('Overall tests for Date object manipulation', () => {
  describe('addMinutesToDate', () => {
    it('Should add 20 minutes to the given date', async () => {
      const date = new Date('2023-03-20T19:10:48.865Z')
      const expected = new Date('2023-03-20T19:30:48.865Z')
      const minutes = 20

      const result = await utils.date.addMinutesToDate(minutes, date)

      assert.deepStrictEqual(result, expected)
    })

    it('Should abort when an invalid Date objec is given', async () => {
      const date = '2023-03-20T19:10:48.865Z'
      const minutes = 20

      try {
        await utils.date.addMinutesToDate(minutes, date)
        assert.fail('Should never reach here')
      } catch (e) {
        assert(e.message.includes(errors.ERROR_INVALID_TYPE))
      }
    })
  })
})
