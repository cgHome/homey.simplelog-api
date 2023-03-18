'use strict';

const { SimpleClass } = require('homey');

const { SEVERITY, FACILITY } = require('./constants');

module.exports = class SimpleLogApp extends SimpleClass {

  // Singleton

  static getInstance(...args) {
    if (!this.instance) {
      this.instance = new this(...args);
    }
    return this.instance;
  }

  #homey = null;
  #appName = null;
  #simpleLogApp = null;
  #connected = false;

  constructor(homey, appName = homey.app.constructor.name) {
    super(homey);

    if (typeof homey === 'undefined') {
      return this.error('Error: missing `homey` constructor parameter');
    }

    this.#homey = homey;
    this.#appName = appName;

    // SimpleLogApp API
    this.#simpleLogApp = this.#homey.api.getApiApp('nl.nielsdeklerk.log');
    this.#simpleLogApp
      .on('install', this.onInstall.bind(this))
      .on('uninstall', this.onUninstall.bind(this))
      .on('realtime', this.onRealtime.bind(this));
  }

  // myApi

  addLog(args) {
    const body = {
      log: 'none',
      group: this.#appName,
      severity: SEVERITY.INFORMATIONAL,
      facility: FACILITY.SYSLOG,
      timestamp: new Date(),
      ...args,
    };

    this.debug(`addLog() > ${JSON.stringify(body)}`);
    return this.put('addlog', body);
  }

  getLogs() {
    this.debug('getLogs()');
    return this.get('/');
  }

  clearLog() {
    this.debug('clearLog()');
    return this.get('clearlog');
  }

  // SimpleLogApp events

  onInstall(result) {
    this.debug(`onInstall() appDelay: ${this.appDeley} Sec.`);

    this.homey.setTimeout(() => {
      this.emit('connect');
      this.notifyInfo(`${this.constructor.name} installed`);
    }, this.appDeley * 1000);
  }

  onUninstall() {
    this.debug('onUninstall()');
    this.emit('disconnect');
  }

  onRealtime(event, data) {
    // this.debug(`onRealtime() > event: ${event} data: ${Array.isArray(data) ? JSON.stringify(data) : data}`);
    this.emit('message', event, data);
  }

  // SimpleLogApp API

  isConnected() {
    return this.#connected;
  }

  async connect() {
    this.debug('connect()');

    if (this.isConnected()) {
      this.debug(`connect() > ${this.constructor.name} is already connected`);
      return Promise.resolve(true);
    }

    return this.#simpleLogApp.getInstalled()
      .then(() => {
        this.#connected = true;
      })
      .catch((error) => {
        throw Error(`${this.constructor.name} not installed`);
      });
  }

  disconnect() {
    this.debug('disconnect()');

    if (!this.isConnected()) {
      this.debug('disconnect() > HomeyApp is already disconnected');
      return Promise.resolve(true);
    }

    this.#connected = false;
    // Error: TypeError: this[#simpleLogApp].unregisterApi is not a function
    // this.#simpleLogApp.unregisterApi();

    return Promise.resolve(true);
  }

  // HomeyApp API

  #get(uri) {
    if (!this.isConnected()) {
      return Promise.resolve(true);
    }

    this.debug(`get() > uri: "${uri}"`);
    return this.#simpleLogApp.get(uri)
      .catch((error) => {
        this.error(`get() > ${error}`);
        throw Error(error);
      });
  }

  #post(uri, body) {
    if (!this.isConnected()) {
      return Promise.resolve(true);
    }

    this.debug(`post() > uri: "${uri}", body: ${JSON.stringify(body)}`);
    return this.#simpleLogApp.post(uri, body)
      .catch((error) => {
        this.error(`post() > ${error}`);
        throw Error(error);
      });
  }

  #put(uri, body) {
    if (!this.isConnected()) {
      return Promise.resolve(true);
    }

    this.debug(`put() > uri: "${uri}", body: ${JSON.stringify(body)}`);
    return this.#simpleLogApp.put(uri, body)
      .catch((error) => {
        this.error(`put() > ${error}`);
        throw Error(error);
      });
  }

  #delete(uri) {
    if (!this.isConnected()) {
      return Promise.resolve(true);
    }

    this.debug(`delete() > uri: "${uri}"}`);
    return this.#simpleLogApp.post(uri)
      .catch((error) => {
        this.error(`delete() > ${error}`);
        throw Error(error);
      });
  }

};
