describe('Tests for schemas utilities', () => {
  describe('getEventId', () => {
    it('Should return the correct ID', () => {
      const utils = require('../lib/utils')
      const ret = utils.getEventId(
        '0x2ae90e5210168c42fa196059a99e26de46df8e49ad4aa482df4d7d657b6a8a22'
      )
      expect(ret).toStrictEqual(
        '0x2ae90e5210168c42fa196059a99e26de46df8e49ad4aa482df4d7d657b6a8a22'
      )
    })
  })
})
