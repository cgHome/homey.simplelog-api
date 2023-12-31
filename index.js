'use strict';

const SimpleLogMixin = require('./lib/simpleLogMixin');
const { SYSLOG_SEVERITY, SYSLOG_FACILITY } = require('./lib/constants');

module.exports = { SimpleLogMixin, SYSLOG_SEVERITY, SYSLOG_FACILITY };
