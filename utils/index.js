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
    '.eslintrc.json',
    '.eslint.config.js',
    '.eslintignore',
    '.babelrc',
    '.babelrc.json',
    'babel.config.js',
    'allowedFiles.json',
    'allowedFiles.js',
    '.vscode',
    '.travis.yml',
    'LICENSE',
    'LICENSE.txt',
    'README.md'
];

function arrayMerge(targetArray, newArray) {
    if (!Array.isArray(targetArray)) {
        targetArray = [];
    } else {
        targetArray = [...targetArray];
    }
    if (Array.isArray(newArray)) {
        for (const item of newArray) {
            if (!targetArray.includes(item)) {
                targetArray.push(item);
            }
        }
    }
    return targetArray;
}

function sanitizeUrl(url = '') {
    return url.replace(/[\\]/g, '/');
}

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

function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

module.exports = {
    hasAllowedItems,
    camelize,
    extractName,
    sanitizeUrl,
    arrayMerge,
    hasOwn,
    defaultAllowedFiles: allowedFiles
};