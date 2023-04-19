const crypto = require('crypto')
const { writeFile, rm } = require('fs/promises')

describe('Tests for readIdentityFile', () => {
  describe('readIdentityFile', () => {
    const TEST_FILE_PATH = './test-file'
    const str = crypto.randomBytes(20).toString('hex')

    beforeAll(async () => {
      await writeFile(TEST_FILE_PATH, str + '\n')
    })

    afterAll(async () => {
      await rm(TEST_FILE_PATH)
    })

    it('Should read and strip', async () => {
      const { readIdentityFile } = require('../lib/read-identity-file')
      const ret = await readIdentityFile(TEST_FILE_PATH)
      expect(ret).toStrictEqual(str)
    })
  })
})
