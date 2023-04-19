'use strict';

const { SimpleClass } = require('homey');

const { SYSLOG_FACILITY } = require('./constants');

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

  // Only for test

  error(msg) {
    // eslint-disable-next-line no-console
    // console.error(`[ERROR] ${msg}`);
  }

  debug(msg) {
    // eslint-disable-next-line no-console
    // console.log(`[DEBUG] ${msg}`);
  }

  // myApi

  isConnected() {
    return this.#connected;
  }

  addLog(log = 'log (Mandatory)', options = {}) {
    const body = {
      log,
      group: this.homey.app.constructor.name,
      facility: SYSLOG_FACILITY.SYSLOG,
      timestamp: new Date(),
      ...options,
    };

    this.debug(`addLog() > ${JSON.stringify(body)}`);
    return this.#put('addlog', body);
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
    }, 1000); // Wait 1 sec. until app is ready
  }

  #onUninstall() {
    this.debug('onUninstall()');
    this.#disconnect();
  }

  #onRealtime(event, data) {
    // this.debug(`onRealtime() > event: ${event} data: ${Array.isArray(data) ? JSON.stringify(data) : data}`);
    this.emit('data', event, data);
  }

  async #connect() {
    if (this.isConnected()) return;

    this.debug('connect()');
    // FIXME: Temp-Workaround > await
    if (await this.#simpleLogAPI.getInstalled()) {
      this.#connected = true;
    } else {
      const msg = 'If you install the Simple(Sys)Log App for a better overview, the log messages will be displayed there.';
      this.homey.notifications.createNotification({
        excerpt: `The **${this.homey.manifest.name.en} App** is Simple(Sys)Log ready. - ${msg}`,
      });
    }
  }

  async #disconnect() {
    if (!this.isConnected()) return;

    this.debug('disconnect()');
    // TODO: TypeError: unregisterApi is not a function
    // await this.#simpleLogAPI.unregisterApi(this.#simpleLogAPI)
    //   .then(this.#connected = false);
    this.#connected = false;
    this.#put('delapp', { id: this.homey.manifest.id, name: this.homey.manifest.name.en });
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
