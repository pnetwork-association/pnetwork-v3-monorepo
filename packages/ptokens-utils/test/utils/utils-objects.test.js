const assert = require('assert')
const { utils, errors } = require('../..')

describe('Utils object testing', () => {
  describe('getKeyFromObj', () => {
    it('Should revolve with the key value', async () => {
      const key = 'key'
      const value = 'value'
      const obj = { [key]: value }
      const result = await utils.getKeyFromObj(key, obj)

      assert.deepStrictEqual(result, value)
    })

    it('Should reject if the value for key is not found', async () => {
      const obj = { key: 'value' }
      const nonExistingKey = 'hello'

      try {
        await utils.getKeyFromObj(nonExistingKey, obj)
        assert.fail('Should not reach here')
      } catch (err) {
        assert(err.message.includes(errors.ERROR_KEY_NOT_FOUND))
      }
    })
  })

  describe('getKeyFromObjThroughPath', () => {
    it('Should get the correct path from the given object', async () => {
      const value = 'value'
      const obj = { key1: { key2: { key3: value } } }

      const path = ['key1', 'key2', 'key3']

      const result = await utils.getKeyFromObjThroughPath(path, obj)
      assert.deepStrictEqual(result, value)
    })

    it('Should reject if the value for key is not found', async () => {
      const obj = { key1: { key2: { key3: 'value' } } }
      const nonExistingPath = ['key1', 'key2', 'key4']

      try {
        await utils.getKeyFromObjThroughPath(nonExistingPath, obj)
        assert.fail('Should not reach here')
      } catch (err) {
        assert(err.message.includes(errors.ERROR_KEY_NOT_FOUND))
      }
    })
  })

  describe('getKeyFromObjThroughPossiblePaths', () => {
    it('Should try the given paths finding the correct value', async () => {
      const value = 'value'
      const obj = { key1: { key2: { key3: value } } }

      const paths = [
        ['key1', 'key2', 'key1'],
        ['key1', 'key2', 'key5'],
        ['key1', 'key2', 'key3'],
        ['key1', 'key2', 'key3'],
      ]

      const result = await utils.getKeyFromObjThroughPossiblePaths(paths, obj)

      assert.deepStrictEqual(result, value)

      const nonExistingPaths = paths
      nonExistingPaths[0][0] = 'invalid_key1'
      nonExistingPaths[1][0] = 'invalid_key1'
      nonExistingPaths[2][0] = 'invalid_key1'
      nonExistingPaths[3][0] = 'invalid_key1'

      try {
        await utils.getKeyFromObjThroughPossiblePaths(nonExistingPaths, obj)
        assert.fail('Should not reach here')
      } catch (err) {
        assert(err.message.includes(errors.ERROR_UNABLE_TO_FIND_PATHS))
      }
    })
  })

  describe('parseJsonAsync', () => {
    it('Should catch the parsing error correctly', async () => {
      try {
        await utils.parseJsonAsync('not a json')
        assert.fail('Should never reach here')
      } catch (err) {
        assert(err instanceof SyntaxError)
        assert(err.message.includes('Unexpected token'))
      }
    })
    it('Should parse the json correctly', async () => {
      const expectedBlockNum = 500
      const expectedMessage = 'message'
      const jsonStr = `{"blockNum": ${expectedBlockNum}, "error": "${expectedMessage}"}`

      const result = await utils.parseJsonAsync(jsonStr)

      assert.deepStrictEqual(result.blockNum, expectedBlockNum)
      assert.deepStrictEqual(result.error, expectedMessage)
    })
  })
})
