const colors = require('colors');
const { argv } = require('../tArgs');

module.exports = function logWarning(message, important = argv.logs, prefix) {
  if (important) {
    console.log(colors.yellow(prefix ? `[${prefix}]: ${message}` : message));
  }
};
