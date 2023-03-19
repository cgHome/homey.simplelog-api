'use strict';

const { SimpleClass } = require('homey');

const { SEVERITY, FACILITY } = require('./constants');

module.exports = class SimpleLogAPI extends SimpleClass {

  // Singleton
  static getInstance(...args) {
    if (!this.instance) {
      this.instance = new this(...args);
    }
    return this.instance;
  }

  static isConnected() {
    return this.instance && this.instance.isConnected();
  }

  #connected = false;
  #appName = null;
  #simpleLogAPI = null;

  constructor(homey, appName = homey.app.constructor.name) {
    super(homey);

    this.homey = homey;
    this.#appName = appName;

    // SimpleLogAPI
    this.#simpleLogAPI = this.homey.api.getApiApp('nl.nielsdeklerk.log');
    this.#simpleLogAPI
      .on('install', this.#onInstall.bind(this))
      .on('uninstall', this.#onUninstall.bind(this))
      .on('realtime', this.#onRealtime.bind(this));

    this.#connect();
  }

  debug(msg) {
    this.__debug(`[DEBUG] ${msg}`);
  }

  // myApi

  isConnected() {
    return this.#connected;
  }

  addLog(data) {
    this.debug(`addLog() > ${JSON.stringify(data)}`);

    return this.#put('addlog', {
      log: 'log: >> mandatory',
      group: this.#appName,
      severity: SEVERITY.INFORMATIONAL,
      facility: FACILITY.SYSLOG,
      timestamp: new Date(),
      ...data,
    });
  }

  getLogs() {
    this.debug('getLogs()');
    return this.#get('/');
  }

  clearLog() {
    this.debug('clearLog()');
    return this.#get('clearlog');
  }

  // SimpleLogApp

  #onInstall(result) {
    this.debug('onInstall()');

    this.homey.setTimeout(() => {
      this.#connect();
      // TODO: this.notifyInfo('SimpleLogApp installed');
    }, 1000); // Wait 1 sec. until app is ready
  }

  #onUninstall() {
    this.debug('onUninstall()');
    this.#disconnect();
    // TODO: this.notifyInfo('SimpleLogApp uninstalled');
  }

  #onRealtime(event, data) {
    // this.debug(`onRealtime() > event: ${event} data: ${Array.isArray(data) ? JSON.stringify(data) : data}`);
    this.emit('data', event, data);
  }

  async #connect() {
    if (this.isConnected()) return;

    this.debug('connect()');
    await this.#simpleLogAPI.getInstalled()
      .then(this.#connected = true);
  }

  async #disconnect() {
    if (!this.isConnected()) return;

    this.debug('disconnect()');
    // TODO: TypeError: unregisterApi is not a function
    // await this.#simpleLogAPI.unregisterApi(this.#simpleLogAPI)
    //   .then(this.#connected = false);
    this.#connected = false;
  }

  // SimpleLogApp API

  async #get(uri) {
    this.debug(`get() > uri: "${uri}"`);
    await this.#simpleLogAPI.get(uri)
      .catch((error) => this.error(`get() > ${error}`));
  }

  async #put(uri, body) {
    this.debug(`put() > uri: "${uri}", body: ${JSON.stringify(body)}`);
    // TODO: Cache ??
    await this.#simpleLogAPI.put(uri, body)
      .catch((error) => this.error(`put() > ${error}`));
  }

};
