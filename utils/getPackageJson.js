const { readdirSync } = require('fs-extra');
const { root } = require('./tArgs');

module.exports = function getPackageJson() {
  const existingFiles = readdirSync(root);
  let packageJson = {};
  if (existingFiles.includes('package.json')) {
    packageJson = require(`${root}/package.json`);
  }
  return { packageJson, existingFiles };
};
