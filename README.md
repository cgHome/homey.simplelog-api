# SimpleLogApp API for Homey-Developers

Temporary doku for arie....

## Install

````
npm install cghome/homey.simplelog-api
````

## Getting started

Only for testing, mixins are still being implemented 

````
const { App } = require('homey');

const { SimpleLogAPI } = require('simplelog-api');

module.exports = class MyApp extends App {

  async onInit() {
    // Only for test
    SimpleLogAPI.getInstance(this.homey)
      .logInfo({ log: 'Info SimpleLogAPI test' });
    SimpleLogAPI.getInstance(this.homey)
      .logDebug({ log: 'Debug SimpleLogAPI test' });

    // Will be replaced by a mixin
    // Example:
    // this.logInfo('Info SimpleLogAPI test')
    // this.logDebug('Debug SimpleLogAPI test')   
````

## Usefull Links (Temp)

- https://blog.bitsrc.io/mixin-in-javascript-7a7eaa6d4920