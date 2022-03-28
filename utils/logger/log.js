const colors = require('chalk').default;
const { argv } = require('../tArgs');

module.exports = function logMessage(message, important = argv.logs, prefix) {
  if (important) {
    console.log(colors.blue(prefix ? `[${prefix}]: ${message}` : message));
  }
};
