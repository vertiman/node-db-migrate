var util = require('util');
var sqlite3 = require('sqlite3').verbose();
var Base = require('./base');
var type = require('../data_type');

var defaultMode = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;

var Sqlite3Driver = Base.extend({
  init: function(connection) {
    this._super();
    this.connection = connection;
  },

  createColumnConstraint: function(spec) {
    var constraint = [];
    if (spec.primaryKey) {
      constraint.push('PRIMARY KEY');
      if (spec.autoIncrement) {
        constraint.push('AUTOINCREMENT');
      }
    }

    if (spec.notNull) {
      constraint.push('NOT NULL');
    }

    if (spec.unique) {
      constraint.push('UNIQUE');
    }

    if (spec.defaultValue) {
      constraint.push('DEFAULT');
      constraint.push(spec.defaultValue);
    }

    if (spec.collate) {
      constraint.push('COLLATE');
      constraint.push(spec.collate);
    }

    return constraint.join(' ');
  },

  createColumnDef: function(name, spec) {
    return [name, this.mapDataType(spec.type), this.createColumnConstraint(spec)].join(' ');
  },

  renameTable: function(tableName, newTableName, callback) {
    var sql = util.format('ALTER TABLE %s RENAME TO %s', tableName, newTableName);
    this._runSql(sql, callback);
  },

  //removeColumn: function(tableName, columnName, callback) {
  //},

  //renameColumn: function(tableName, oldColumnName, newColumnName, callback) {
  //};

  //changeColumn: function(tableName, columnName, columnSpec, callback) {
  //},

  _runSql: function() {
    this.connection.run.apply(this.connection, arguments);
  },

  all: function() {
    this.connection.all.apply(this.connection, arguments);
  },

  close: function() {
    this.connection.close();
  }

});

exports.connect = function(config, callback) {
  var mode = config.mode || defaultMode;
  var db = new sqlite3.Database(config.filename, mode);
  db.on("error", callback);
  db.on("open", function() {
    callback(null, new Sqlite3Driver(db));
  });
};