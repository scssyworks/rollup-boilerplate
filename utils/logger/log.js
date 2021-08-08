const colors = require('colors');
const { argv } = require('../tArgs');

module.exports = function logMessage(message, important = argv.logs, prefix) {
  if (important) {
    console.log(colors.blue(prefix ? `[${prefix}]: ${message}` : message));
  }
};
