const crypto = require('crypto')
const assert = require('assert')
const { writeFile, rm } = require('fs/promises')

describe('Tests for readIdentityFile', () => {
  describe('readIdentityFile', () => {
    const TEST_FILE_PATH = './test-file'
    const str = crypto.randomBytes(20).toString('hex')

    before(async () => {
      await writeFile(TEST_FILE_PATH, str + '\n')
    })

    after(async () => {
      await rm(TEST_FILE_PATH)
    })

    it('Should read and strip', async () => {
      const { utils } = require('../..')
      const ret = await utils.readIdentityFile(TEST_FILE_PATH)
      assert.deepStrictEqual(ret, str)
    })
  })
})
