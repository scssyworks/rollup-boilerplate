const toArray = require('./toArray');
const allowedFiles = [
    '.git',
    'node_modules',
    'package.json',
    'package-lock.json',
    '.gitignore',
    '.gitadd',
    '.eslintrc',
    '.eslintignore',
    '.babelrc',
    'babel.config.js',
    'allowedFiles.json',
    'allowedFiles.js',
    '.vscode',
    '.travis.yml',
    'LICENSE',
    'LICENSE.txt'
];

module.exports = function (files = [], allowedFilesList = []) {
    const filesArray = toArray(files);
    allowedFilesList = [...allowedFiles, ...allowedFilesList];
    let result = true;
    filesArray.forEach(file => {
        result = result && allowedFilesList.includes(file);
    });
    return (
        (
            filesArray.length >= 0
            && filesArray.length <= allowedFilesList.length
        )
        && result
    );
}