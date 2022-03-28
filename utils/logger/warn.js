const colors = require('chalk').default;
const { argv } = require('../tArgs');

module.exports = function logWarning(message, important = argv.logs, prefix) {
  if (important) {
    console.log(colors.yellow(prefix ? `[${prefix}]: ${message}` : message));
  }
};
