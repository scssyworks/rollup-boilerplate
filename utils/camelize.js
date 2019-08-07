module.exports = function camelize(str) {
    if (typeof str === 'string') {
        const strParts = str.split('-').map((part, index) => {
            if (index > 0) {
                return `${part.charAt(0).toUpperCase()}${part.substring(1)}`;
            }
            return part;
        });
        return strParts.join('');
    }
    return;
}