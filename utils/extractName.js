/**
 * Extracts folder name as project name if project name is not provided
 * @private
 * @param {string} root Root path of current working directory
 */
module.exports = function extractName(root) {
    if (typeof root === 'string') {
        // Trim '/' from end
        root = root.replace(/([\/]+)$/g, '');
        // Get last folder name
        let folderName = root.substring(root.lastIndexOf('/'));
        // Trim special characters from beginning and end of folder name
        folderName = folderName.replace(/^([^a-zA-Z0-9]+)|([^a-zA-Z0-9]+)$/g, '');
        // Replace any other special character with a hiphen
        folderName = folderName.replace(/[^a-zA-Z0-9]+/g, '-');
        return folderName.toLowerCase();
    }
    return;
}