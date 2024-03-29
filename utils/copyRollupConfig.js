const path = require('path');
const fs = require('fs-extra');
const { projectTypes } = require('./constants');
const { sanitizeUrl } = require('.');
const { root } = require('./tArgs');
const { logMessage } = require('./logger');
const currDir = path.resolve(sanitizeUrl(`${__dirname}`), '../configs');

function writeConfig(readPath, fileName) {
  fs.writeFileSync(
    `${root}/rollup.config.js`,
    fs.readFileSync(readPath, 'utf8').replace(/\{fileName\}/g, fileName),
    'utf8'
  );
}

module.exports = function copyRollupConfig(projectType, fileName) {
  switch (projectType) {
    case projectTypes.TS.value:
      writeConfig(`${currDir}/rollup.config.typescript.js`, fileName);
      break;
    case projectTypes.RJ.value:
      writeConfig(`${currDir}/rollup.config.react.js`, fileName);
      break;
    default:
      writeConfig(`${currDir}/rollup.config.js`, fileName);
      break;
  }
  logMessage('Rollup configuration', true, 'CR');
};
