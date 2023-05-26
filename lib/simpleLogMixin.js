'use strict';

const merge = require('lodash.merge');

const SimpleLogAPI = require('./simpleLogAPI');
const { SYSLOG_SEVERITY, SYSLOG_FACILITY } = require('./constants');

const SimpleLogMixin = (superclass) => class extends superclass {

  // SimpleLogApp API

  logEmergency(msg, options = {}) {
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.EMERGENCY, ...options });
    if (process.env.DEBUG === '1') {
      this.error(`[EMERGENCY] ${this.#isDevice() ? `${this.getName()} > ${msg}` : msg}`);
    }
  }

  logAlert(msg, options = {}) {
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.ALERT, ...options });
    if (process.env.DEBUG === '1') {
      this.error(`[ALERT] ${this.#isDevice() ? `${this.getName()} > ${msg}` : msg}`);
    }
  }

  logCritical(msg, options = {}) {
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.CRITICAL, ...options });
    if (process.env.DEBUG === '1') {
      this.error(`[CRITICAL] ${this.#isDevice() ? `${this.getName()} > ${msg}` : msg}`);
    }
  }

  logError(msg, options = {}) {
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.ERROR, ...options });
    if (process.env.DEBUG === '1') {
      this.error(`[ERROR] ${this.#isDevice() ? `${this.getName()} > ${msg}` : msg}`);
    } else {
      this.error(msg);
    }
  }

  logWarning(msg, options = {}) {
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.WARNING, ...options });
    if (process.env.DEBUG === '1') {
      this.log(`[WARNING] ${this.#isDevice() ? `${this.getName()} > ${msg}` : msg}`);
    }
  }

  logNotice(msg, options = {}) {
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.NOTICE, ...options });
    if (process.env.DEBUG === '1') {
      this.log(`[NOTICE] ${this.#isDevice() ? `${this.getName()} > ${msg}` : msg}`);
    }
  }

  logInfo(msg, options = {}) {
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.INFORMATIONAL, ...options });
    if (process.env.DEBUG === '1') {
      this.log(`[INFO] ${this.#isDevice() ? `${this.getName()} > ${msg}` : msg}`);
    } else {
      this.log(msg);
    }
  }

  logDebug(msg, options = {}) {
    this.#addLog(msg, { severity: SYSLOG_SEVERITY.DEBUG, ...options });
    if (process.env.DEBUG === '1') {
      this.log(`[DEBUG] ${this.#isDevice() ? `${this.getName()} > ${msg}` : msg}`);
    }
  }

  async #addLog(msg, options = {}) {
    if (options.severity === SYSLOG_SEVERITY.DEBUG) {
      msg = `${this.constructor.name}${this.#isDevice() ? `::${this.getName()} > ${msg}` : ` > ${msg}`}`;
    } else {
      msg = this.#isDevice() ? `${this.getName()} > ${msg}` : msg;
    }

    let deviceOptions = {};
    if (this.#isDevice()) {
      deviceOptions = {
        facility: SYSLOG_FACILITY.DEVICE,
        structuredData: {
          DeviceId: this.getData().id,
          DeviceName: this.getName(),
        },
      };
    }

    await SimpleLogAPI.getInstance(this.homey)
      .addLog(msg, merge({
        facility: SYSLOG_FACILITY.APP,
        structuredData: {
          AppId: this.homey.manifest.id,
          AppName: this.homey.manifest.name.en || this.homey.manifest.name,
          ClassName: this.constructor.name,
        },
      }, deviceOptions, options));
  }

  #isDevice() {
    // Trick77 - Test if the method "this.getName()" exists, then it is a Device !!
    return 'getName' in this;
  }

};

module.exports = SimpleLogMixin;
