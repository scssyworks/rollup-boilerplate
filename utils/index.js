const fs = require('fs-extra');
const allowedFiles = [
    '.git',
    '.vscode',
    '.github',
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
    'LICENSE.txt',
    'README.md'
];

function sanitizeUrl(url = '') {
    return url.replace(/[\\]/g, '/');
}

const root = sanitizeUrl(process.cwd());

function hasAllowedItems(files = [], allowedFilesList = []) {
    const filesArray = [...files];
    allowedFilesList = [...allowedFiles, ...allowedFilesList];
    let result = true;
    for (const file of filesArray) {
        result = result && allowedFilesList.includes(file);
    }
    return (
        (
            filesArray.length >= 0
            && filesArray.length <= allowedFilesList.length
        )
        && result
    );
}

function camelize(str) {
    if (typeof str === 'string') {
        const strParts = str.split('-').map((part, index) => {
            return (index > 0) ? `${part.charAt(0).toUpperCase()}${part.substring(1)}` : part;
        });
        return strParts.join('');
    }
    return;
}

function copySourceFiles(sourcePath, distFolder = '') {
    fs.copySync(sourcePath, `${root}/${distFolder}`);
}

function extractName(root) {
    if (typeof root === 'string') {
        // Trim '/' from end
        root = root.replace(/([\/]+)$/g, '');
        // Get last folder name
        let folderName = root.substring(root.lastIndexOf('/'));
        // Trim special characters from beginning and end of folder name
        folderName = folderName
            .replace(/^([^a-zA-Z0-9]+)|([^a-zA-Z0-9]+)$/g, '')
            .replace(/[^a-zA-Z0-9]+/g, '-');
        return folderName.toLowerCase();
    }
    return;
}

function hasGitFolder(files = []) {
    const filesArray = [...files];
    return filesArray.includes('.git');
}

module.exports = { hasAllowedItems, camelize, copySourceFiles, extractName, hasGitFolder, sanitizeUrl };