const fs = require('fs-extra');
const root = process.cwd();

// Copy source files
module.exports = function copySourceFiles(sourcePath, distFolder) {
    console.log(root);
    fs.copySync(sourcePath, `${root}/${distFolder}`);
};