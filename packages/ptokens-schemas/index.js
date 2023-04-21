const constants = require('./lib/constants')
const eventReportSchema = require('./lib/schema-event-report')
const configDbSchema = require('./lib/schema-config-db')
const configListenerSchema = require('./lib/schema-config-listener')
const configRequestProcessorSchema = require('./lib/schema-config-request-processor')

module.exports = {
  db: {
    collections: {
      events: eventReportSchema,
    },
    enums: {
      txStatus: enumTxStatus,
      eventNames: enumEventNames,
    },
  },
  constants: constants,
  configurations: {
    db: configDbSchema,
    listener: configListenerSchema,
    requestProcessor: configRequestProcessorSchema,
  },
}
