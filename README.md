# SimpleLogApp API for Homey-Developers

**Do not use, the API is still in an alpha status**

Minimal lightweight logging for Homey Apps

This module can be used in a Homey App to send logs to the [SimpleLogApp](https://homey.app/de-ch/app/nl.nielsdeklerk.log/Simple-LOG)

---

## Setting it up

### Install:

````
npm install -S homey-simplelog-api

````

### Add permission:  

```json
 "permissions": ["homey:app:nl.nielsdeklerk.log"]
```

### Import package:

```js
const { SimpleLogMixin } = require('simplelog-api');
```

### Define SimpleLog mixim:

```js
module.exports = class MyApp extends SimpleLogMixin(App)
```

### Use it:

```js
this.logDebug('So easy it goes');
```

---

## API

**Error:** error conditions
```js
this.logError('logError-Message');
```

**Warning:** warning conditions
```js
this.logWarning('logWarning-Message');
```

**Notice:** normal but significant condition
```js
this.logNotice('logNotice-Message');
```

**Informational:** informational messages
```js
this.logInfo('logInfo-Message');
```

**Debug:** debug-level messages
```js
this.logDebug('logDebug-Message');
```

---

## Code examples

### Homey app

```js
'use strict';

const { App } = require('homey');

const { SimpleLogMixin } = require('simplelog-api');

// Development
if (process.env.DEBUG === '1') {
  try {
    // eslint-disable-next-line global-require
    require('node:inspector').waitForDebugger();
  } catch (err) {
    // eslint-disable-next-line global-require
    require('node:inspector').open(9229, '0.0.0.0', true);
  }
}

module.exports = class MyApp extends SimpleLogMixin(App) {

  onInit() {
    this.logDebug('onInit()');

    // ...

    this.logInfo(`${this.homey.manifest.name.en} - v${this.homey.manifest.version} is started`);
  }
}
```

### Homey driver

```js
'use strict';

const { Device } = require('homey');

const { SimpleLogMixin } = require('simplelog-api');

module.exports = class MyDevice extends SimpleLogMixin(Device) {

  onInit(options = {}) {
    this.logDebug('onInit()');

    // ...

  }
}
```

### Homey device

```js
const { Driver } = require('homey');

const { SimpleLogMixin } = require('simplelog-api');

module.exports = class MyDriver extends SimpleLogMixin(Driver) {

  onInit() {
    this.logDebug('onInit()');

    // ...

  }
}

```

### Homey SimpleClass or Object

```js
// ToDo
```

---

## Migrations guide

### Preferred

Rename the methods, it's fast (global search & replace), the code is more readable and the method calls the console message at the end anyway.

- this.log() [rename-to] this.logInfo()
- this.error() [rename-to] this.logError()
- this.debug() [rename-to] this.logDebug()

---

## Useful Links

### Logging

- [11 Best Practices for Logging in Node.js](https://betterstack.com/community/guides/logging/nodejs-logging-best-practices/)

### Mixin

- [Mixins and Javascript: The Good, the Bad, and the Ugly.](https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes)
- [How to Create Mixins in JavaScript](https://blog.bitsrc.io/mixin-in-javascript-7a7eaa6d4920)

---

## ToDo

- TypeScript integration
- Add uncaughtException or unhandledRejection to log [see](https://betterstack.com/community/guides/logging/nodejs-logging-best-practices/).

---

## Thanks

....

---

## Disclaimer

Use at your own risk. I accept no responsibility for any damages caused by using this app.

---

## Copyright

© Chris Gross / [cflat-inc.org](cflat-inc.org), 2023
