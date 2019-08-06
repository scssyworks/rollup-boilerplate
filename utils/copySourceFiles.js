const fs = require('fs-extra');
const root = process.cwd().replace(/[\\]/g, '/');

// Copy source files
module.exports = function copySourceFiles(sourcePath, distFolder = '') {
    fs.copySync(sourcePath, `${root}/${distFolder}`);
};