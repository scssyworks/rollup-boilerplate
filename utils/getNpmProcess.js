const { isSubDirectory, argv } = require('./tArgs');

module.exports = function getNpmProcess() {
  let npmProcess = `npm${/^win/.test(process.platform) ? '.cmd' : ''}`;

  if (isSubDirectory) {
    npmProcess += ` --prefix ./${argv.name}`;
  }
  return npmProcess;
};
