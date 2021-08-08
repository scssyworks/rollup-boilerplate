const { existsSync, writeFileSync, mkdirSync } = require('fs-extra');
const { root } = require('./tArgs');
const { logMessage } = require('./logger');

module.exports = function writeFile(type, paths, content, replace = false) {
  paths = Array.isArray(paths) ? paths : [paths];
  switch (type) {
    case 'folder':
      paths.forEach((path) => {
        if (!existsSync(path) || replace) {
          logMessage(
            `${replace ? 'replace ==> ' : ''}folder ==> ${path.replace(
              `${root}/`,
              ''
            )}`,
            true,
            'CR'
          );
          mkdirSync(path);
        }
      });
      break;
    default:
      paths.forEach((path) => {
        if (!existsSync(path) || replace) {
          logMessage(
            `${replace ? 'replace ==> ' : ''}file ==> ${path.replace(
              `${root}/`,
              ''
            )}`,
            true,
            'WR'
          );
          writeFileSync(path, content);
        }
      });
  }
};
