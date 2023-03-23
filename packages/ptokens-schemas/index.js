const constants = require('./lib/constants')
const enumTxStatus = require('./lib/enum-tx-status')
const enumEventNames = require('./lib/enum-event-names')
const eventReportSchema = require('./lib/schema-event-report')
const configDbSchema = require('./lib/schema-config-db')
const configListenerSchema = require('./lib/schema-config-listener')
const configRequestProcessorSchema = require('./lib/schema-config-request-processor')
const utils = require('./lib/utils')

module.exports = {
  db: {
    collections: {
      events: eventReportSchema,
    },
    enums: {
      txStatus: enumTxStatus,
      eventNames: enumEventNames,
    },
    access: { getEventId: utils.getEventId },
  },
  constants: constants,
  configurations: {
    db: configDbSchema,
    listener: configListenerSchema,
    requestProcessor: configRequestProcessorSchema,
  },
}
