const fs = require('fs-extra');
const { root } = require('./tArgs');
const writeFile = require('./writeFile');
const { logWarning } = require('./logger');

module.exports = function (existingFiles = []) {
  // Create a backup folder for existing configuration files
  writeFile('folder', `${root}/backup`);
  let targetFiles = [];
  [
    '.babelrc',
    '.babelrc.json',
    'babel.config.js',
    '.eslintrc',
    '.eslintrc.json',
    'eslint.config.js',
  ].forEach((file) => {
    if (existingFiles.includes(file)) {
      targetFiles.push(file);
    }
  });
  targetFiles.forEach((targetFile) => {
    fs.renameSync(`${root}/${targetFile}`, `${root}/backup/${targetFile}`);
    logWarning(`${targetFile} to /backup`, true, `MV`);
  });
};
