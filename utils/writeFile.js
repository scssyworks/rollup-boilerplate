const { existsSync, writeFileSync, mkdirSync } = require('fs-extra');
const colors = require('colors');
const { sanitizeUrl } = require('.');

const root = sanitizeUrl(process.cwd());

module.exports = function writeFile(type, path, content) {
    switch (type) {
        case 'folder':
            if (!existsSync(path)) {
                console.log(colors.blue(`[Create]: ${path.replace(`${root}/`, '')} folder`));
                mkdirSync(path);
                break;
            }
        default:
            if (!existsSync(path)) {
                console.log(colors.blue(`[Write]: ${path.replace(`${root}/`, '')}`));
                writeFileSync(path, content);
            }
    }
}