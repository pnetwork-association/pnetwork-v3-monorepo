const loki = require('lokijs')
const { logger } = require('../get-logger')

class Memory {
  static memory = new loki('memory')
  static actors = this.memory.addCollection('actors', { indices: ['epoch', 'actor', 'networkId'] })
  static challenges = this.memory.addCollection('challenges', { indices: ['actor', 'networkId'] })

  static {
    logger.info('Memory initialized!')
  }
}

module.exports = Memory
