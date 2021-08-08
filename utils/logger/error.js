const colors = require('colors');
const { argv } = require('../tArgs');

module.exports = function logError(message, important = argv.logs, prefix) {
  if (important) {
    console.log(colors.red(prefix ? `[${prefix}]: ${message}` : message));
  }
};
