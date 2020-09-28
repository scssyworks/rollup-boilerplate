const fs = require('fs-extra');
const colors = require('colors');

module.exports = function (existingFiles = []) {
    let targetFiles = [];
    if (existingFiles.includes('.babelrc')) {
        targetFiles.push('.babelrc');
    }
    if (existingFiles.includes('.babelrc.json')) {
        targetFiles.push('.babelrc.json');
    }
    if (existingFiles.includes('babel.config.js')) {
        targetFiles.push('babel.config.js');
    }
    if (existingFiles.includes('.eslintrc')) {
        targetFiles.push('.eslintrc');
    }
    if (existingFiles.includes('.eslintrc.json')) {
        targetFiles.push('.eslintrc.json');
    }
    if (existingFiles.includes('eslint.config.js')) {
        targetFiles.push('eslint.config.js');
    }
    if (targetFiles.length) {
        targetFiles.forEach(targetFile => {
            fs.renameSync(`${root}/${targetFile}`, `${root}/backup/${targetFile}`);
            console.log(colors.yellow(`[Moved]: ${targetFile} to /backup`));
        });
    }
};