#!/usr/bin/env node
const colors = require('colors');
const inquirer = require('inquirer');
const os = require('os');
const {
  extractName,
  camelize,
  hasAllowedItems,
  arrayMerge,
  defaultAllowedFiles,
} = require('./utils');
const handleError = require('./utils/handleError');
const resolveGit = require('./utils/gitResolver');
const {
  projectTypes,
  extensions,
  events,
  getChoices,
  getExtension,
} = require('./utils/constants');
const installDeps = require('./utils/installDeps');
const packageJsonGenerator = require('./utils/packageJsonGenerator');
const getSourceCode = require('./utils/getSourceCode');
const writeFile = require('./utils/writeFile');
const generateTsConfig = require('./utils/generateTsConfig');
const generateBabelConfig = require('./utils/generateBabelConfig');
const generateLicense = require('./utils/generateLicense');
const getIndexHtml = require('./utils/getIndexHtml');
const copyRollupConfig = require('./utils/copyRollupConfig');
const backupExistingFiles = require('./utils/backupExistingFiles');
const generateEslintrc = require('./utils/generateEslintrc');
const { argv, root, ensureRoot } = require('./utils/tArgs');
const getInstallEvent = require('./utils/getInstallEvent');
const getPackageJson = require('./utils/getPackageJson');
const { logError, logWarning } = require('./utils/logger');

const installEvent = getInstallEvent(installDeps);

handleError(async () => {
  const createSubfolder = typeof argv.name === 'string';
  // check if root folder exists. If not then create the directory and sub-directory
  ensureRoot();
  // read existing package.json file
  let { packageJson, existingFiles } = getPackageJson();
  // Get allowed files
  const allowedFiles = arrayMerge(
    defaultAllowedFiles,
    packageJson.allowedFiles
  );
  if (!hasAllowedItems(existingFiles, allowedFiles)) {
    return logError(
      `Current working directory should be clean or contain following allowed files: ${colors.bold(
        allowedFiles.join(', ')
      )}. To allow more files add ${colors.bold(
        '"allowedFiles"'
      )} list in package.json.`,
      true
    );
  }
  // Initialize git
  const projectName = (
    createSubfolder ? argv.name : extractName(root)
  ).toLowerCase();
  let gitURL = await resolveGit();
  // Get input choices
  const choices = getChoices();
  const {
    projectType,
    fileName,
    projectDescription: description,
    author,
    keywords,
    buildPackage,
  } = await inquirer.prompt([
    {
      type: 'list',
      message: 'Select a project',
      choices: choices.map((key) => projectTypes[key]),
      name: 'projectType',
      default: projectTypes.TS,
    },
    {
      message: 'Library file name',
      name: 'fileName',
      type: 'input',
      default: camelize(projectName),
    },
    {
      message: 'Project description',
      name: 'projectDescription',
      type: 'input',
      default: `Library project`,
    },
    {
      message: 'Name of the author',
      name: 'author',
      type: 'input',
      default: packageJson.author || os.userInfo().username,
    },
    {
      message: 'Keywords (comma separated values)',
      name: 'keywords',
      type: 'input',
      default:
        (packageJson.keywords && packageJson.keywords.join(', ')) || 'library',
    },
    {
      message: 'Build package before publishing?',
      name: 'buildPackage',
      type: 'confirm',
      default: true,
    },
  ]);
  // Create package JSON
  const fileExtension = extensions[getExtension(projectType)];
  const testFile = `plugin.test.${fileExtension}`;
  const config = {
    name: projectName,
    description,
    scripts: {
      start: 'rollup -c --watch --environment SERVE:true',
      build: 'npm run test && rollup -c',
      test: `jest ${testFile}`,
    },
    author,
    keywords: keywords.split(',').map((kw) => kw.trim()),
    main: `${fileName}.js`,
    module: `${fileName}.mjs`,
  };
  if (gitURL) {
    config.repository = {
      type: 'git',
      url: `git+${gitURL}`,
    };
    config.bugs = {
      url: `${gitURL.replace(/\.git$/, '')}/issues`,
    };
    config.homepage = `${gitURL.replace(/\.git$/, '')}#readme`;
  }
  if (projectType === projectTypes.TS.value) {
    config.scripts.build = 'npm run typegen && npm run test && rollup -c';
    config.scripts.typegen =
      'tsc --declaration --noEmit false --outDir dist/typings/ --emitDeclarationOnly --declarationMap';
  }
  packageJson = packageJsonGenerator(packageJson, config);
  if (buildPackage) {
    packageJson.scripts.prepublish = `${config.scripts.build} --silent`;
  } else {
    logWarning(
      `Make sure to build the package before publish or add a ${colors.bold(
        'prepublish'
      )} script.`,
      true
    );
  }
  // Write gitingore, npmignore and eslintignore files
  writeFile(
    'file',
    [`${root}/.gitignore`, `${root}/.eslintignore`, `${root}/.npmignore`],
    'node_modules\n.vscode\ndist\nbackup'
  );
  // Write package JSON in current directory
  writeFile(
    'file',
    `${root}/package.json`,
    JSON.stringify(packageJson, null, 2),
    true
  );
  // Write source file
  // 1. Check if source file already exists
  const sourceFileName = `index.${fileExtension}`;
  writeFile('folder', [`${root}/src`, `${root}/render`]);
  writeFile(
    'file',
    `${root}/src/${sourceFileName}`,
    getSourceCode(projectType)
  );
  // Write start file
  const startFileName = sourceFileName;
  writeFile(
    'file',
    `${root}/render/${startFileName}`,
    `import { render } from '../src';\n\nrender();`
  );
  // Write tsconfig.json for typescript projects
  if (projectType === projectTypes.TS.value) {
    writeFile('file', `${root}/tsconfig.json`, generateTsConfig());
  }
  // Backup existing config files
  backupExistingFiles(existingFiles);
  // Create babel.config.js
  writeFile(
    'file',
    `${root}/babel.config.js`,
    generateBabelConfig(projectType)
  );
  // Write test file
  writeFile('file', `${root}/${testFile}`, `test.todo('Write a test!');`);
  // Create license file
  writeFile('file', `${root}/LICENSE`, generateLicense(author));
  // Create HTML file
  writeFile('folder', `${root}/dist`);
  writeFile('file', `${root}/dist/index.html`, getIndexHtml(fileName));
  // Copy rollup configuration
  copyRollupConfig(projectType, fileName);
  // Create eslintrc file
  writeFile('file', `${root}/.eslintrc`, generateEslintrc(projectType));
  // Create README file
  writeFile('field', `${root}/README.md`, `# ${fileName}\n${description}`);
  // Install dependencies
  installEvent.emit(events.INSTALL, projectType);
}, argv.logs);
