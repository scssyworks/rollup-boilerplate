const childProcess = require('child_process');
const colors = require('chalk').default;
const fs = require('fs');
const { sanitizeUrl } = require('.');
const { logMessage } = require('./logger');

module.exports = async function resolveGit() {
  let gitURL = '';
  try {
    gitURL = await new Promise((resolve, reject) => {
      childProcess.exec('git remote get-url origin', (err, stdout) => {
        try {
          if (err) {
            if (fs.readdirSync(sanitizeUrl(process.cwd())).includes('.git')) {
              logMessage(
                colors.bold('[This project has a local GIT repository!]\n'),
                true
              );
            } else {
              childProcess.execSync('git init');
            }
            reject('');
          } else {
            resolve(stdout.toString().trim());
          }
        } catch (e) {
          reject(e);
        }
      });
    });
  } catch (e) {
    gitURL = '';
  }
  return gitURL;
};
