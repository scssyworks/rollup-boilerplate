const colors = require('colors');
const { argv } = require('../tArgs');

module.exports = function logSuccess(message, important = argv.logs, prefix) {
  if (important) {
    console.log(colors.green(prefix ? `[${prefix}]: ${message}` : message));
  }
};
