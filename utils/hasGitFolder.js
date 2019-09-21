const toArray = require('./toArray');

module.exports = function (files) {
    const filesArray = toArray(files);
    return filesArray.includes('.git');
}