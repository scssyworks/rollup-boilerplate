const fs = require('fs-extra');
const { sanitizeUrl } = require('.');

const argv = require('yargs')
  .option('version', {
    alias: 'v',
    type: 'boolean',
    description: 'Current build version',
  })
  .option('name', {
    alias: 'n',
    type: 'string',
    description:
      'Name of library project (If this option is provided, a sub-folder is created and library files are placed there instead)',
  })
  .option('logs', {
    alias: 'l',
    type: 'boolean',
    description: 'Generate error logs',
  }).argv;

const isSubDirectory = Boolean(
  typeof argv.name === 'string' && argv.name.length
);
const root = sanitizeUrl(
  process.cwd() + (isSubDirectory ? `/${argv.name}` : '')
);

function ensureRoot() {
  if (!fs.existsSync(root)) {
    fs.mkdirsSync(root);
  }
}

module.exports = { argv, root, ensureRoot, isSubDirectory };
