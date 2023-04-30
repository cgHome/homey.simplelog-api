'use strict';

const merge = require('lodash.merge');

const SimpleLogAPI = require('./simpleLogAPI');
const { SYSLOG_SEVERITY, SYSLOG_FACILITY } = require('./constants');

const SimpleLogMixin = (superclass) => class extends superclass {

  // SimpleLogApp API

  logEmergency(msg, options = {}) {
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.EMERGENCY, ...options });
    this.error(`[EMERGENCY] ${!this.#isDevice() ? msg : `${this.getName()} > ${msg}`}`);
  }

  logAlert(msg, options = {}) {
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.ALERT, ...options });
    this.error(`[ALERT] ${!this.#isDevice() ? msg : `${this.getName()} > ${msg}`}`);
  }

  logCritical(msg, options = {}) {
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.CRITICAL, ...options });
    this.error(`[CRITICAL] ${!this.#isDevice() ? msg : `${this.getName()} > ${msg}`}`);
  }

  logError(msg, options = {}) {
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.ERROR, ...options });
    if (process.env.DEBUG === '1') {
      this.error(`[ERROR] ${!this.#isDevice() ? msg : `${this.getName()} > ${msg}`}`);
    } else {
      this.error(msg);
    }
  }

  logWarning(msg, options = {}) {
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.WARNING, ...options });
    this.log(`[WARNING] ${!this.#isDevice() ? msg : `${this.getName()} > ${msg}`}`);
  }

  logNotice(msg, options = {}) {
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.NOTICE, ...options });
    this.log(`[NOTICE] ${!this.#isDevice() ? msg : `${this.getName()} > ${msg}`}`);
  }

  logInfo(msg, options = {}) {
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.INFORMATIONAL, ...options });
    this.log(`[INFO] ${!this.#isDevice() ? msg : `${this.getName()} > ${msg}`}`);
  }

  logDebug(msg, options = {}) {
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.DEBUG, ...options });
    if (process.env.DEBUG === '1') {
      this.log(`[DEBUG] ${!this.#isDevice() ? msg : `${this.getName()} > ${msg}`}`);
    }
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
