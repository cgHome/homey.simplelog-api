'use strict';

const SimpleLogAPI = require('./simpleLogAPI');
const { SYSLOG_SEVERITY, SYSLOG_FACILITY } = require('./constants');

const SimpleLogMixin = (superclass) => class extends superclass {

  error(log) {
    this.logError(log);
  }

  log(log) {
    this.logInfo(log);
  }

  debug(log) {
    this.logDebug(log);
  }

  logEmergency(log, options = {}) {
    this.#addLog(log, {
      severity: SYSLOG_SEVERITY.EMERGENCY,
      ...options,
    });
    super.log(`[EMERGENCY] ${log}`);
  }

  logAlert(log, options = {}) {
    this.#addLog(log, {
      severity: SYSLOG_SEVERITY.ALERT,
      ...options,
    });
    super.log(`[ALERT] ${log}`);
  }

  logCritical(log, options = {}) {
    this.#addLog(log, {
      severity: SYSLOG_SEVERITY.CRITICAL,
      ...options,
    });
    super.log(`[CRITICAL] ${log}`);
  }

  logError(log, options = {}) {
    this.#addLog(log, {
      severity: SYSLOG_SEVERITY.ERROR,
      ...options,
    });
    super.error(`[ERROR] ${log}`);
  }

  logWarning(log, options = {}) {
    this.#addLog(log, {
      severity: SYSLOG_SEVERITY.WARNING,
      ...options,
    });
    super.log(`[WARNING] ${log}`);
  }

  logNotice(log, options = {}) {
    this.#addLog(log, {
      severity: SYSLOG_SEVERITY.NOTICE,
      ...options,
    });
    super.log(`[NOTICE] ${log}`);
  }

  logInfo(log, options = {}) {
    this.#addLog(log, {
      severity: SYSLOG_SEVERITY.INFORMATIONAL,
      ...options,
    });
    super.log(`[INFO] ${log}`);
  }

  logDebug(log, options = {}) {
    // TODO: Prefix this.constructor.name
    this.#addLog(log, {
      severity: SYSLOG_SEVERITY.DEBUG,
      ...options,
    });
    // Same as homey.__debug()
    if (process.env.DEBUG === '1') {
      super.log(`[DEBUG] ${log}`);
    }
  }

  #addLog(log, options = {}) {
    SimpleLogAPI.getInstance(this.homey)
      .addLog(log, {
        facility: SYSLOG_FACILITY.APP,
        group: this.homey.manifest.name.en || this.homey.manifest.name,
        ...options,
      });
  }

};

module.exports = SimpleLogMixin;
