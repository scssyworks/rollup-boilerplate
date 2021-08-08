const colors = require('colors');
const { hasOwn } = require('.');
const { logWarning } = require('./logger');

function or(curr, nw) {
  const value = curr || nw || 'not-set';
  return value;
}

function ext(name) {
  if (/\.(js|mjs|jsx|ts|tsx)$/.test(name)) {
    return name;
  }
  return `${name}.js`;
}

module.exports = function packageJsonGenerator(existingConfig, options = {}) {
  let targetConfig = existingConfig || {};
  options = Object.assign(
    {
      version: '0.1.0',
    },
    options
  );
  if (targetConfig && typeof targetConfig === 'object') {
    // defaults
    targetConfig.name = or(targetConfig.name, options.name);
    targetConfig.version = or(targetConfig.version, options.version);
    targetConfig.description = or(
      targetConfig.description,
      options.description
    );
    // custom
    targetConfig.author = or(targetConfig.author, options.author);
    targetConfig.main = or(targetConfig.main, `dist/umd/${ext(options.main)}`);
    targetConfig.module = or(
      targetConfig.module,
      `dist/mjs/${ext(options.module)}`
    );
    targetConfig.files = or(targetConfig.files, [
      'dist/umd',
      'dist/mjs',
      'dist/typings/',
    ]);
    targetConfig.license = or(targetConfig.license, 'MIT');
    // merge scripts
    const existingScripts = targetConfig.scripts || {};
    if (hasOwn(existingScripts, 'start')) {
      logWarning(
        `Found an existing ${colors.bold(
          '"start"'
        )} script. Renamed to ==> ${colors.bold('"rn:start"')}`,
        true,
        'INFO'
      );
      existingScripts['rn:start'] = existingScripts.start;
    }
    if (hasOwn(existingScripts, 'build')) {
      logWarning(
        `Found an existing ${colors.bold(
          '"build"'
        )} script. Renamed to ==> ${colors.bold('"rn:build"')}`,
        true,
        'INFO'
      );
      existingScripts['rn:build'] = existingScripts.build;
    }
    if (hasOwn(existingScripts, 'test')) {
      logWarning(
        `Found an existing ${colors.bold(
          '"test"'
        )} script. Renamed to ==> ${colors.bold('"rn:test"')}`,
        true,
        'INFO'
      );
      existingScripts['rn:test'] = existingScripts.test;
    }
    targetConfig.scripts = Object.assign(existingScripts, options.scripts);
    // merge scripts end
    targetConfig.keywords = or(targetConfig.keywords, options.keywords);
    targetConfig.repository = or(targetConfig.repository, options.repository);
    targetConfig.bugs = or(targetConfig.bugs, options.bugs);
    targetConfig.homepage = or(targetConfig.homepage, options.homepage);
    // Remove fields which are not set
    const missingFields = [];
    Object.keys(targetConfig).forEach((field) => {
      if (targetConfig[field] === 'not-set') {
        missingFields.push(field);
        delete targetConfig[field];
      }
    });
    if (missingFields.length) {
      logWarning(
        `Field(s) "${colors.bold(
          missingFields.join(', ')
        )}" in "package.json" are missing. \nRun ${colors.bold(
          '"npm init"'
        )} to add missing field(s).`,
        true,
        'Warning'
      );
    }
    return targetConfig;
  }
};
