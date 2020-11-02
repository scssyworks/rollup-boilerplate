const { sanitizeUrl } = require('.');

const argv = require('yargs')
    .option('version', {
        alias: 'v',
        type: 'boolean',
        description: 'Current build version'
    })
    .option('name', {
        alias: 'n',
        type: 'string',
        description: 'Name of library project (If this option is provided, a sub-folder is created and library files are placed there instead)'
    })
    .option('logs', {
        alias: 'l',
        type: 'boolean',
        description: 'Generate error logs'
    })
    .option('no-install', {
        alias: 'x',
        type: 'boolean',
        description: 'Skip "npm install" [upcoming feature]'
    }).argv;

const isSubDirectory = Boolean(typeof argv.name === 'string' && argv.name.length);
const root = sanitizeUrl(process.cwd() + (isSubDirectory ? `/${argv.name}` : ''));

module.exports = { argv, root, isSubDirectory };