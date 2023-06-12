'use strict';

const { SimpleClass } = require('homey');

const { SYSLOG_FACILITY } = require('./constants');

const QUEUE_MAX = 100;

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
  #getQueue = [];
  #putQueue = [];

  constructor(homey) {
    super(homey);

    this.homey = homey;

    // Homey events
    this.homey
      .on('unload', this.#disconnect.bind(this));

    // SimpleLogAPI
    this.#simpleLogAPI = this.homey.api.getApiApp('nl.nielsdeklerk.log');
    this.#simpleLogAPI
      .on('install', this.#onInstall.bind(this))
      .on('uninstall', this.#onUninstall.bind(this))
      .on('realtime', this.#onRealtime.bind(this));

    this.#connect();
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
    this.emit(event, data);
  }

  // myLog

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

  addLog(log = 'log (Mandatory)', options = {}) {
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

  async #connect() {
    if (this.isConnected()) return;

    this.logDebug('connect()');
    if (await this.#simpleLogAPI.getInstalled()) {
      this.#connected = true;
    } else {
      this.homey.notifications.createNotification({
        excerpt: `The ${this.homey.manifest.name.en} App is **Simple(Sys)Log ready**. \n (If you install the App, the log messages will be displayed there.)`,
      });
    }
  }

  async #disconnect() {
    if (!this.isConnected()) return;

    this.logDebug('disconnect()');
    // await this.#simpleLogAPI.unregisterApi(this.#simpleLogAPI)
    await this.#simpleLogAPI.unregister(this.#simpleLogAPI)
      .then(() => {
        this.#connected = false;
      })
      .catch((error) => this.logError(`unregister() > ${error}`));
  }

  // SimpleLogApp API

  async #get(uri) {
    if (this.#getQueue.length < QUEUE_MAX) {
      await this.#getQueue.push(uri);
      // handle getQueue
      await this.#runGets();
    }
  }

  async #runGets() {
    while (this.isConnected() && this.#getQueue.length > 0) {
      const uri = this.#getQueue.shift();
      this.logDebug(`get() > uri: "${uri}"`);
      await this.#simpleLogAPI.get(uri)
        .catch((error) => this.logError(`get() > ${error}`));
    }
  }

  async #put(uri, body) {
    if (this.#putQueue.length < QUEUE_MAX) {
      await this.#putQueue.push({ uri, body });
      // handle putQueue
      await this.#runPuts();
    }
  }

  async #runPuts() {
    while (this.isConnected() && this.#putQueue.length > 0) {
      const item = this.#putQueue.shift();
      this.logDebug(`put() > uri: "${item.uri}", body: ${JSON.stringify(item.body)}`);
      await this.#simpleLogAPI.put(item.uri, item.body)
        .catch((error) => this.logError(`put() > ${error}`));
    }
  }

};
