const assert = require('assert')
const path = require('path')
const { errors, enclave } = require('../..')

describe('Enclave tests', () => {
  describe('call', () => {
    it('Should timeout', async () => {
      try {
        const cwd = path.join(__dirname, './res')
        const args = []
        const timeout = 200
        const exec = './long-running-script.sh'

        await enclave.call(cwd, exec, args, timeout)
        assert.fail('Should never reach here')
      } catch (err) {
        assert(err.message.includes(errors.ERROR_ENCLAVE_CALL_TIMEOUT))
      }
    })

    it('Should reject when output contains "✘"', async () => {
      try {
        const cwd = path.join(__dirname, './res')
        const args = []
        const timeout = 200
        const exec = './error-script.sh'

        await enclave.call(cwd, exec, args, timeout)
        assert.fail('Should never reach here')
      } catch (err) {
        assert(err.message.includes(errors.ERROR_ENCLAVE_CALL_FAILED))
      }
    })

    it('Should not reject when output is on stderr but not an error message', async () => {
      // Note: this simulates the strongbox script where some output logs are
      // printed to stderr, in that case the syncer must not fail
      const cwd = path.join(__dirname, './res')
      const output = '{"hello":"world"}'
      const args = [output]
      const timeout = 200
      const exec = './stderr-logs.sh'

      const result = await enclave.call(cwd, exec, args, timeout)

      assert.deepStrictEqual(result, output)
    })

    it('Should reject because the script has not been found', async () => {
      const cwd = path.join(__dirname, './res')
      const args = []
      const timeout = 200
      const exec = './not-existing.sh'

      try {
        await enclave.call(cwd, exec, args, timeout)
        assert.fail('Should never reach here')
      } catch (err) {
        assert(err.message.includes(errors.ERROR_ENCLAVE_CALL_FAILED))
        assert(err.message.includes(`Executable '${exec}' not found`))
      }
    })

    it('Should resolve with the given output', async () => {
      const cwd = path.join(__dirname, './res')
      const output = 'DEBUG_OUTPUT_MARKER_[{"_id":"pbtc-on-int-int-6","broadcast":false,"int_tx_hash":"0xa817591fb4bbf1c11f377e166c1bab82bda4f97f9a8296ad468a0fb6ecfca594","int_signed_tx":"f9036b0685174876e8008306ddd09445a2c83a0b02ae11c1b0e6573e0abf1704e9752180b90304dcdc7dd000000000000000000000000048d013a79ce2005f11bf940444bbe699cd3e5e220000000000000000000000000000000000000000000000000011c37937e08000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000002e0000000000000000000000000000000000000000000000000000000000000024003000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100018afeb200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014000e4b1700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002200000000000000000000000000000000000000000000000000000000000000004dec4ffee000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000023324d77426e62624b613445574561644164513448724d64346452446f6d7678317365330000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a307832313631626130343933623032623565323037633338633031336666383264663030366430643534000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002aa0ae71d62561dedd243a121673d3d455f447a1aa5107ebaa35fae0d20f9bce75cca04859dce81bf2942852f2a2e25d769ad401e6e4e35daa2425526c42cf02c79b79","int_tx_amount":"5000000000000000","int_account_nonce":6,"int_tx_recipient":"0x48d013a79ce2005f11bf940444bbe699cd3e5e22","witnessed_timestamp":1645725691,"host_token_address":"0x45a2c83a0b02ae11c1b0e6573e0abf1704e97521","originating_tx_hash":"288b2b7a7526b3dade37c36554ef7a5c4ceff3d947892cea85532872ff11360d","originating_address":"2MwBnbbKa4EWEadAdQ4HrMd4dRDomvx1se3","destination_address":"0x2161ba0493b02b5e207c38c013ff82df006d0d54","int_latest_block_number":12012129,"broadcast_tx_hash":null,"broadcast_timestamp":null}]'
      const args = [output]
      const timeout = 200
      const exec = './mock-vanilla.sh'

      const result = await enclave.call(cwd, exec, args, timeout)

      assert.deepStrictEqual(result, output)
    })
  })
})