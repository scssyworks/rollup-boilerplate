const toArray = require('./toArray');

module.export = function (files = []) {
    const filesArray = toArray(files);
    return (
        [0, 1, 2].includes(filesArray.length)
        && (
            filesArray.includes('.git')
            || filesArray.includes('node_modules')
        )
    );
}