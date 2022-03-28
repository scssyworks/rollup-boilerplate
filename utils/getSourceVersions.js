const { readFileSync } = require('fs');
const colors = require('chalk').default;
const { logWarning, logMessage } = require('./logger');

module.exports = function getSourceVersions() {
  let versions = {};
  try {
    versions = JSON.parse(
      readFileSync(`${process.cwd()}/versions.json`, {
        encoding: 'utf8'
      }).toString()
    );
  } catch (e) {
    logWarning(
      `A valid ${colors.bold(
        '"versions.json"'
      )} file was NOT found. Default versions will be used.`,
      false,
      'Version Check'
    );
    logMessage('Create a "versions.json" file like the example shown below:');
    logMessage(
      JSON.stringify(
        {
          '@babel/core': '^7.0.0',
          '@babel/preset-env': '~7.0.0'
        },
        null,
        2
      )
    );
    versions = {};
  }
  return versions;
};
