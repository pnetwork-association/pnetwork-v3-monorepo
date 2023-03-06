const fs = require('fs')
const assert = require('assert')
const { utils, errors } = require('../..')

describe('File system utilities', () => {
  const path = require('path')
  const tmpFolder = path.join(__dirname, '.tmp')

  before(() => {
    try {
      fs.mkdirSync(tmpFolder)
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
    }
  })

  after(() => {
    fs.rmSync(tmpFolder, { recursive: true })
  })

  describe('listFilesInFolder', () => {
    it('Should successfully list all the files and folders into an array', async () => {
      const listOfFiles = ['hello.txt', 'world.txt']

      listOfFiles.map(_file =>
        fs.writeFileSync(path.join(tmpFolder, _file), '')
      )

      const result = await utils.listFilesInFolder(tmpFolder)

      assert.deepStrictEqual(result, listOfFiles)
    })
  })

  describe('writeThingToDisk', () => {
    it('Should write the object to disk and the return the full path', async () => {
      const tmpFile = path.join(tmpFolder, 'afile.json')
      const object = { hello: 'world' }

      const result = await utils.writeThingToDisk(tmpFile, object)
      const content = JSON.parse(fs.readFileSync(tmpFile))

      assert(fs.existsSync(tmpFile))
      assert.deepStrictEqual(result, tmpFile)
      assert.deepStrictEqual(content, object)
    })

    it('Should fail to write the object to disk since it is undefined', async () => {
      const tmpFile = path.join(tmpFolder, 'afile.json')
      const object = undefined

      try {
        await utils.writeThingToDisk(tmpFile, object)
        assert.fail('Should never reach here')
      } catch (err) {
        assert(err.message.includes(errors.ERROR_INVALID_OBJECT))
      }
    })

    it('Should fail to write the object to disk since because the path does not exist', async () => {
      const tmpFile = path.join(tmpFolder, 'hello/afile.json')
      const object = { hello: 'world' }

      try {
        await utils.writeThingToDisk(tmpFile, object)
        assert.fail('Should never reach here')
      } catch (err) {
        assert(err.message.includes('no such file or directory'))
        assert.deepStrictEqual(err.code, 'ENOENT')
      }
    })
  })

  describe('readGpgEncryptedFile', () => {
    // Skipped because setup for this test requires time & effort, use
    // locally only
    it.skip('Should read the GPG encrypted file successfully', async () => {
      const gpgEncryptedFile = `${__dirname}/../res/encrypted.gpg`
      const expected = 'Hello World!'

      const result = await utils.readGpgEncryptedFile(gpgEncryptedFile)

      assert.deepStrictEqual(result, expected)
    })
  })
})
