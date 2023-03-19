'use strict';

const SEVERITY = {
  EMERGENCY: 0,
  ALERT: 1,
  CRITICAL: 2,
  ERROR: 3,
  WARNING: 4,
  NOTICE: 5,
  INFORMATIONAL: 6,
  DEBUG: 7,
};

const FACILITY = {
  KERNEL: 0,
  USER: 1,
  MAIL: 2,
  SYSTEM: 3,
  AUTHORIZATION: 4,
  SYSLOG: 5,
  LPR: 6,
  NEWS: 7,
  UUCP: 8,
  CRON: 9,
  DEAMON: 10,
  FTP: 11,
  NTP: 12,
  SECURITY: 13,
  CONSOLE: 14,
  CLOCK: 15,
  LOCAL0: 16,
  FLOW: 16, // SimpleLog-Definition
  LOCAL1: 17,
  DEVICE: 17, // SimpleLog-Definition
  LOCAL2: 18,
  APP: 18, // SimpleLog-Definition
  LOCAL3: 19,
  LOCAL4: 20,
  LOCAL5: 21,
  LOCAL6: 22,
  LOCAL7: 23,
};

module.exports = { SEVERITY, FACILITY };
