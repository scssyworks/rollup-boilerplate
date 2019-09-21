const toArray = require('./toArray');

module.exports = function (files = []) {
    const filesArray = toArray(files);
    return (
        [0, 1, 2, 3, 4].includes(filesArray.length)
        && (
            filesArray.includes('.git')
            || filesArray.includes('node_modules')
            || filesArray.includes('package.json')
            || filesArray.includes('package-lock.json')
        )
    );
}