'use strict';

const { SimpleClass } = require('homey');

const { SYSLOG_FACILITY } = require('./constants');

module.exports = class SimpleLogAPI extends SimpleClass {

  // Singleton
  static getInstance(...args) {
    if (!this.instance) {
      this.instance = new this(...args);
      this.instance.logDebug('Singleton created');
    }
    return this.instance;
  }

  static isConnected() {
    return this.instance && this.instance.isConnected();
  }

  #connected = false;
  #simpleLogAPI = null;

  constructor(homey) {
    super(homey);

    this.homey = homey;

    // SimpleLogAPI
    this.#simpleLogAPI = this.homey.api.getApiApp('nl.nielsdeklerk.log');
    this.#simpleLogAPI
      .on('install', this.#onInstall.bind(this))
      .on('uninstall', this.#onUninstall.bind(this))
      .on('realtime', this.#onRealtime.bind(this));

    this.#connect();
  }

  logError(msg) {
    // Only for internal test
    // console.error(`[ERROR] ${msg}`);
  }

  logDebug(msg) {
    // Only for internal test
    // console.log(`[DEBUG] ${msg}`);
  }

  // myApi

  isConnected() {
    return this.#connected;
  }

  addLog(log = 'msg (Mandatory)', options = {}) {
    const body = {
      log,
      facility: SYSLOG_FACILITY.SYSLOG,
      group: this.homey.manifest.name.en || this.homey.manifest.name,
      timestamp: new Date(),
      ...options,
    };

    this.logDebug(`addLog() > ${JSON.stringify(body)}`);
    return this.#put('addlog', body);
  }

  getLogs() {
    this.logDebug('getLogs()');
    return this.#get('/');
  }

  clearLog() {
    this.logDebug('clearLog()');
    return this.#get('clearlog');
  }

  // SimpleLogApp

  #onInstall(result) {
    this.logDebug('onInstall()');

    this.homey.setTimeout(() => {
      this.#connect();
    }, 1000); // Wait 1 sec. until app is ready
  }

  #onUninstall() {
    this.logDebug('onUninstall()');
    this.#disconnect();
  }

  #onRealtime(event, data) {
    // this.logDebug(`onRealtime() > event: ${event} data: ${Array.isArray(data) ? JSON.stringify(data) : data}`);
    this.emit('data', event, data);
  }

  async #connect() {
    if (this.isConnected()) return;

    this.logDebug('connect()');
    if (await this.#simpleLogAPI.getInstalled()) {
      this.#connected = true;
      this.#put('appConnected', { id: this.homey.manifest.id, name: this.homey.manifest.name.en });
    } else {
      const msg = 'If you install the Simple(Sys)Log App for a better overview, the log messages will be displayed there.';
      this.homey.notifications.createNotification({
        excerpt: `The **${this.homey.manifest.name.en} App** is Simple(Sys)Log ready. - ${msg}`,
      });
    }
  }

  async #disconnect() {
    if (!this.isConnected()) return;

    this.logDebug('disconnect()');
    this.#put('appDisconnected', { id: this.homey.manifest.id, name: this.homey.manifest.name.en });
    // TODO: TypeError: unregisterApi is not a function
    // await this.#simpleLogAPI.unregisterApi(this.#simpleLogAPI)
    //   .then(this.#connected = false);
    this.#connected = false;
  }

  // SimpleLogApp API

  async #get(uri) {
    this.logDebug(`get() > uri: "${uri}"`);
    await this.#simpleLogAPI.get(uri)
      .catch((error) => this.logError(`get() > ${error}`));
  }

  async #put(uri, body) {
    this.logDebug(`put() > uri: "${uri}", body: ${JSON.stringify(body)}`);
    await this.#simpleLogAPI.put(uri, body)
      .catch((error) => this.logError(`put() > ${error}`));
  }

};
