const childProcess = require('child_process');
const colors = require('colors');
const fs = require('fs');
const { sanitizeUrl } = require('.');

module.exports = function resolveGit() {
    return new Promise((resolve, reject) => {
        childProcess.exec('git remote get-url origin', (err, stdout) => {
            try {
                if (err) {
                    if (fs.readdirSync(
                        sanitizeUrl(process.cwd())
                    ).includes('.git')) {
                        console.log(colors.bold(colors.blue('[This project has a local GIT repository!]\n')));
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
}