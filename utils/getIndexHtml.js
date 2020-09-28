const fs = require('fs-extra');
const { sanitizeUrl } = require('.');
const currDir = sanitizeUrl(`${__dirname}`);

module.exports = function getIndexHtml(fileName) {
    const replaceVariable = '$$script';
    const replacePath = `render/${fileName}.iife.js`;
    return fs.readFileSync(`${currDir}/index.html`, 'utf8').replace(replaceVariable, replacePath);
}