const { logger } = require('../logger')
const { ERROR_DB_CLIENT, ERROR_NO_UPDATE_FOR_REPORT } = require('../errors')
const { MongoClient, MongoServerError } = require('mongodb')
const R = require('ramda')

const createConnection = R.memoizeWith(R.identity, _url =>
  MongoClient.connect(_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 500, // Timeout when connecting to the mongod server
  })
)

const getClient = _url =>
  createConnection(_url).catch(
    _err => logger.error(ERROR_DB_CLIENT) || Promise.reject(_err)
  )

const getDatabase = R.memoizeWith(
  (_url, _databaseName) => `${_url}/${_databaseName}`,
  (_url, _databaseName) =>
    getClient(_url).then(_client => _client.db(_databaseName))
)

const getCollection = R.memoizeWith(
  (_url, _databaseName, _collectionName) =>
    `${_url}/${_databaseName}/${_collectionName}`,
  (_url, _databaseName, _collectionName) =>
    getDatabase(_url, _databaseName)
      .then(_db => _db.collection(_collectionName))
      .then(_coll => logger.debug(`Connected to '${_collectionName}'`) || _coll)
)

const handleDatabaseError = _err =>
  new Promise((resolve, reject) => {
    if (_err instanceof MongoServerError) {
      switch (_err.code) {
        case 11000:
          return reject(new Error(_err.message))
        default:
          return reject(_err)
      }
    } else {
      return reject(_err)
    }
  })

const insertReport = R.curry((_collection, _report) =>
  _collection
    .insertOne(_report)
    .then(_ => _report)
    .catch(handleDatabaseError)
)

const insertReports = R.curry((_collection, _reports) =>
  _collection
    .insertMany(_reports)
    .then(_output =>
      logger.info(`Inserted ${_output.insertedIds.length} documents!`)
    )
    .catch(handleDatabaseError)
)

const deleteReportByQuery = R.curry((_collection, _query) => {
  _collection
    .deleteOne(_query)
    .then(_result =>
      logger.info(`Delete ${_result.deletedCount} reports successfully!`)
    )
    .catch(handleDatabaseError)
})

const deleteReport = R.curry((_collection, _reportId) =>
  _collection
    .deleteOne({ _id: _reportId })
    .then(_ => _reportId)
    .catch(handleDatabaseError)
)

const updateReportOrReject = R.curry((_collection, _operations, _query) =>
  updateReport(_collection, _operations, _query)
    .then(R.prop('modifiedCount'))
    .then(R.equals(0))
    .then(_equalsZero =>
      _equalsZero
        ? Promise.reject(
            new Error(
              `${ERROR_NO_UPDATE_FOR_REPORT}: ${JSON.stringify(_query)}`
            )
          )
        : Promise.resolve()
    )
)

const updateReport = R.curry(
  (_collection, _operations, _query) =>
    logger.debug(`Updating report with query ${_query}...`) ||
    _collection.updateOne(_query, _operations).catch(handleDatabaseError)
)

const updateReportById = R.curry((_collection, _operations, _id) =>
  updateReport(_collection, _operations, { _id: _id }).then(_ => _id)
)

const findReport = R.curry((_collection, _query, _options = {}) =>
  _collection.findOne(_query, _options)
)

const findReportById = R.curry((_collection, _id, _options = {}) =>
  findReport(_collection, { _id: _id }, _options)
)

const findReports = R.curry((_collection, _query, _options = {}) =>
  _collection.find(_query, _options).toArray()
)

const editReportField = R.curry((_collection, _field, _value, _id) =>
  updateReportById(_collection, { $set: { [_field]: _value } }, _id)
)

const copyFromField = R.curry((_collection, _fromField, _toField, _id) =>
  updateReportById(
    _collection,
    [{ $set: { [_fromField]: `$${_toField}` } }],
    _id
  )
)

const renameField = R.curry((_collection, _actualName, _newName, _id) =>
  _collection
    .updateOne({ _id: _id }, { $rename: { [_actualName]: _newName } })
    .then(_output => logger.info(`Updated ${_output.modifiedCount} documents!`))
)

const renameReportsField = R.curry(
  (_collection, _actualName, _newName, _idRegExp) =>
    _collection
      .updateMany({ _id: _idRegExp }, { $rename: { [_actualName]: _newName } })
      .then(_output =>
        logger.info(`Updated ${_output.modifiedCount} documents!`)
      )
)

const closeConnection = (
  _dbUrl // i.e. mongodb://127.0.0.1:27017
) =>
  getClient(_dbUrl)
    .then(_client => _client.close())
    .then(_ => logger.debug(`Connection to '${_dbUrl}' closed!`))
    .catch(handleDatabaseError)

module.exports = {
  getClient,
  getDatabase,
  findReport,
  findReports,
  deleteReport,
  deleteReportByQuery,
  insertReport,
  insertReports,
  updateReport,
  updateReportById,
  updateReportOrReject,
  getCollection,
  findReportById,
  closeConnection,
  editReportField,
  copyFromField,
  renameField,
  renameReportsField,
}
