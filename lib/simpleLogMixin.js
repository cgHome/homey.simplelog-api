'use strict';

const merge = require('lodash.merge');

const SimpleLogAPI = require('./simpleLogAPI');
const { SYSLOG_SEVERITY, SYSLOG_FACILITY } = require('./constants');

const SimpleLogMixin = (superclass) => class extends superclass {

  // SimpleLogApp API

  logEmergency(msg, options = {}) {
    this.error(`[EMERGENCY] ${!this.#isDevice() ? msg : `${this.getName()} > ${msg}`}`);
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.EMERGENCY, ...options });
  }

  logAlert(msg, options = {}) {
    this.error(`[ALERT] ${!this.#isDevice() ? msg : `${this.getName()} > ${msg}`}`);
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.ALERT, ...options });
  }

  logCritical(msg, options = {}) {
    this.error(`[CRITICAL] ${!this.#isDevice() ? msg : `${this.getName()} > ${msg}`}`);
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.CRITICAL, ...options });
  }

  logError(msg, options = {}) {
    // Only on debug-mode
    if (process.env.DEBUG === '1') {
      this.error(`[ERROR] ${!this.#isDevice() ? msg : `${this.getName()} > ${msg}`}`); // Only on debug-mode
    } else {
      this.error(msg);
    }
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.ERROR, ...options });
  }

  logWarning(msg, options = {}) {
    this.log(`[WARNING] ${!this.#isDevice() ? msg : `${this.getName()} > ${msg}`}`);
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.WARNING, ...options });
  }

  logNotice(msg, options = {}) {
    this.log(`[NOTICE] ${!this.#isDevice() ? msg : `${this.getName()} > ${msg}`}`);
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.NOTICE, ...options });
  }

  logInfo(msg, options = {}) {
    this.log(`[INFO] ${!this.#isDevice() ? msg : `${this.getName()} > ${msg}`}`);
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.INFORMATIONAL, ...options });
  }

  logDebug(msg, options = {}) {
    this.log(`[DEBUG] ${!this.#isDevice() ? msg : `${this.getName()} > ${msg}`}`);
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.DEBUG, ...options });
  }

  #addLog(msg, options = {}) {
    msg = this.#isDevice() ? `[${this.getName()}] > ${msg}` : ` > ${msg}`;
    msg = `${this.homey.app.constructor.name} > ${this.constructor.name} ${msg}`;

    let deviceOptions = {};
    if (this.#isDevice()) {
      deviceOptions = {
        facility: SYSLOG_FACILITY.DEVICE,
        structuredData: {
          deviceId: this.getData().id,
          deviceName: this.getName(),
        },
      };
    }

    SimpleLogAPI.getInstance(this.homey)
      .addLog(msg, merge({
        facility: SYSLOG_FACILITY.APP,
        structuredData: {
          appId: this.homey.manifest.id,
          appName: this.homey.manifest.name.en || this.homey.manifest.name,
          className: this.constructor.name,
        },
      }, deviceOptions, options));
  }

  #isDevice() {
    // Trick77 - Test if the method "this.getName()" exists, then it is a Device !!
    return 'getName' in this;
  }

};

module.exports = SimpleLogMixin;
