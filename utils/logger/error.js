const colors = require('chalk').default;
const { argv } = require('../tArgs');

module.exports = function logError(message, important = argv.logs, prefix) {
  if (important) {
    console.log(colors.red(prefix ? `[${prefix}]: ${message}` : message));
  }
};
