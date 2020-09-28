const path = require('path');
const fs = require('fs-extra');
const colors = require('colors');
const { projectTypes } = require('./constants');
const { sanitizeUrl } = require('.');
const currDir = path.resolve(sanitizeUrl(`${__dirname}`), '../configs');
const currWorkingDir = sanitizeUrl(process.cwd());

function writeConfig(readPath, fileName) {
    fs.writeFileSync(`${currWorkingDir}/rollup.config.js`, fs.readFileSync(readPath, 'utf8').replace(/\{fileName\}/g, fileName), 'utf8');
}

module.exports = function copyRollupConfig(projectType, fileName) {
    switch (projectType) {
        case projectTypes.TS:
            writeConfig(`${currDir}/rollup.config.typescript.js`, fileName);
            break;
        case projectTypes.RJ:
            writeConfig(`${currDir}/rollup.config.react.js`, fileName);
            break;
        default:
            writeConfig(`${currDir}/rollup.config.js`, fileName);
            break;
    }
    console.log(colors.blue('[Create]: Rollup configuration'));
}