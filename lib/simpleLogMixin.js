'use strict';

const SimpleLogAPI = require('./simpleLogAPI');
const { SYSLOG_SEVERITY, SYSLOG_FACILITY } = require('./constants');

const SimpleLogMixin = (superclass) => class extends superclass {

  // Homey API

  // error(log) {
  //   this.logError(log);
  // }

  // log(log) {
  //   this.logInfo(log);
  // }

  // debug(log) {
  //   this.logDebug(log);
  // }

  // SimpleLogApp API

  logEmergency(log, options = {}) {
    this.error(`[EMERGENCY] ${log}`);

    this.#addLog(log, {
      severity: SYSLOG_SEVERITY.EMERGENCY,
      ...options,
    });
  }

  logAlert(log, options = {}) {
    this.error(`[ALERT] ${log}`);

    this.#addLog(log, {
      severity: SYSLOG_SEVERITY.ALERT,
      ...options,
    });
  }

  logCritical(log, options = {}) {
    this.error(`[CRITICAL] ${log}`);

    this.#addLog(log, {
      severity: SYSLOG_SEVERITY.CRITICAL,
      ...options,
    });
  }

  logError(log, options = {}) {
    // Only on debug-mode
    if (process.env.DEBUG === '1') {
      this.error(`[ERROR] ${log}`);
    } else {
      this.error(log);
    }

    this.#addLog(log, {
      severity: SYSLOG_SEVERITY.ERROR,
      ...options,
    });
  }

  logWarning(log, options = {}) {
    this.log(`[WARNING] ${log}`);

    this.#addLog(log, {
      severity: SYSLOG_SEVERITY.WARNING,
      ...options,
    });
  }

  logNotice(log, options = {}) {
    this.log(`[NOTICE] ${log}`);

    this.#addLog(log, {
      severity: SYSLOG_SEVERITY.NOTICE,
      ...options,
    });
  }

  logInfo(log, options = {}) {
    this.log(`[INFO] ${log}`);

    this.#addLog(log, {
      severity: SYSLOG_SEVERITY.INFORMATIONAL,
      ...options,
    });
  }

  logDebug(log, options = {}) {
    if (this.#isDevice()) {
      log = `${this.getName()} > ${log}`;
    }

    this.log(`[DEBUG] ${log}`);

    this.#addLog(log, {
      severity: SYSLOG_SEVERITY.DEBUG,
      ...options,
    });
  }

  #addLog(log, options = {}) {
    if (this.#isDevice()) {
      options['deviceId'] = this.getData().id;
    }

    SimpleLogAPI.getInstance(this.homey)
      .addLog(log, {
        facility: this.#isDevice() ? SYSLOG_FACILITY.DEVICE : SYSLOG_FACILITY.APP,
        appId: this.homey.manifest.id,
        appName: this.homey.manifest.name.en || this.homey.manifest.name,
        className: this.constructor.name,
        ...options,
      });
  }

  #isDevice() {
    // Trick77 - Test if the method "this.getName()" exists, then it is a Device !!
    return 'getName' in this;
  }

};

module.exports = SimpleLogMixin;
