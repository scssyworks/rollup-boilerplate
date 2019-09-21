module.exports = function (arrayLike) {
    if (arrayLike && typeof arrayLike === 'object') {
        if ('length' in arrayLike) {
            return Array.prototype.slice.call(arrayLike);
        }
    }
    return [];
}