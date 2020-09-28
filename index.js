#!/usr/bin/env node
const fs = require('fs-extra');
const EventEmitter = require('events');
const colors = require('colors');
const inquirer = require('inquirer');
const os = require('os');
const {
    extractName,
    camelize,
    hasAllowedItems,
    sanitizeUrl,
    arrayMerge,
    defaultAllowedFiles
} = require('./utils');
const handleError = require('./utils/handleError');
const resolveGit = require('./utils/gitResolver');
const { projectTypes, extensions } = require('./utils/constants');
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
const argv = require('yargs')
    .option('version', {
        alias: 'v',
        type: 'boolean',
        description: 'Current build version'
    })
    .option('name', {
        alias: 'n',
        type: 'string',
        description: 'Name of library project'
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


const installEvent = new EventEmitter();
installEvent.on('inst', (projectType) => {
    console.log(colors.green(`[Install]: Dependencies and dev-dependencies for "${projectType}"`));
    try {
        installDeps(projectType);
    } catch (e) {
        if (argv.logs) {
            console.log(e);
        }
    }
});

handleError(async () => {
    // If version is asked, then do nothing and return the current version
    if (argv.version) {
        console.log(require('./package.json').version);
        return;
    }
    if (argv['no-install']) {
        console.log(colors.yellow('[Info]: Skip npm install feature will be available in upcoming version.'));
    }
    const root = sanitizeUrl(process.cwd());
    const existingFiles = fs.readdirSync(root);
    // read existing package.json file
    let packageJson = {};
    if (existingFiles.includes('package.json')) {
        packageJson = require(`${root}/package.json`);
    }
    // Get allowed files
    const allowedFiles = arrayMerge(defaultAllowedFiles, packageJson.allowedFiles);
    if (!hasAllowedItems(existingFiles, allowedFiles)) {
        console.log(colors.bold(colors.red('Please make sure your current workspace is empty!')));
        return;
    }
    // Initialize git
    const projectName = (typeof argv.name === 'string'
        ? argv.name
        : extractName(root)).toLowerCase();
    let gitURL = '';
    try {
        gitURL = await resolveGit();
    } catch (e) { }
    // Get input choices
    const choices = [...Object.keys(projectTypes)];
    const { projectType, fileName, projectDescription: description, author, keywords, buildPackage } = await inquirer.prompt([
        {
            type: 'list',
            message: 'Select a project',
            choices: choices.map(key => projectTypes[key]),
            name: 'projectType',
            default: projectTypes.TS
        },
        {
            message: 'Library file name',
            name: 'fileName',
            type: 'input',
            default: camelize(projectName)
        },
        {
            message: 'Project description',
            name: 'projectDescription',
            type: 'input',
            default: `Library project`
        },
        {
            message: 'Name of the author',
            name: 'author',
            type: 'input',
            default: (packageJson.author || os.userInfo().username)
        },
        {
            message: 'Keywords (comma separated values)',
            name: 'keywords',
            type: 'input',
            default: ((packageJson.keywords && packageJson.keywords.join(', ')) || 'library')
        },
        {
            message: 'Build package before publishing?',
            name: 'buildPackage',
            type: 'confirm',
            default: false
        }
    ]);
    // Create package JSON
    const testFile = `plugin.test.${extensions[choices.find(choice => projectTypes[choice] === projectType)]}`;
    const config = {
        name: projectName,
        description,
        scripts: {
            start: 'rollup -c --watch --environment SERVE:true',
            build: 'npm run test && rollup -c',
            test: `jest ${testFile}`
        },
        author,
        keywords: keywords.split(',').map(kw => kw.trim()),
        main: `${fileName}.js`,
        module: `${fileName}.mjs`
    };
    if (gitURL) {
        config.repository = {
            type: 'git',
            url: `git+${gitURL}`
        };
        config.bugs = {
            url: `${gitURL.replace(/\.git$/, '')}/issues`
        };
        config.homepage = `${gitURL.replace(/\.git$/, '')}#readme`;
    }
    if (projectType === projectTypes.TS) {
        config.scripts.build = 'npm run typegen && npm run test && rollup -c';
        config.scripts.typegen = 'tsc --declaration --noEmit false --outDir dist/typings/ --emitDeclarationOnly --declarationMap';
    }
    packageJson = packageJsonGenerator(packageJson, config);
    if (buildPackage) {
        packageJson.scripts.prepublish = `${config.scripts.build} --silent`;
    } else {
        console.log(colors.yellow(`[Warn]: Make sure to build the package before publish or add a ${colors.bold('prepublish')} script.`));
    }
    // Write gitingore, npmignore and eslintignore files
    writeFile('file', `${root}/.gitignore`, 'node_modules\n.vscode\ndist\nbackup');
    writeFile('file', `${root}/.eslintignore`, 'node_modules\n.vscode\ndist\nbackup');
    writeFile('file', `${root}/.npmignore`, 'node_modules\n.vscode\ndist\nbackup');
    // Write package JSON in current directory
    console.log(colors.blue(`[Write]: package.json`));
    fs.writeFileSync(`${root}/package.json`, JSON.stringify(packageJson, null, 2));
    // Write source file
    // 1. Check if source file already exists
    const sourceFileName = `index.${extensions[choices.find(choice => projectTypes[choice] === projectType)]}`;
    writeFile('folder', `${root}/src`);
    writeFile('file', `${root}/src/${sourceFileName}`, getSourceCode(projectType));
    // Write start file
    const startFileName = sourceFileName;
    writeFile('folder', `${root}/render`);
    writeFile('file', `${root}/render/${startFileName}`, `import { render } from '../src';\n\nrender();`);
    // Write tsconfig.json for typescript projects
    if (projectType === projectTypes.TS) {
        writeFile('file', `${root}/tsconfig.json`, generateTsConfig());
    }
    // Write babel config
    // 1. Create a backup folder for existing configuration files
    writeFile('folder', `${root}/backup`);
    // 2. backup existing config files
    backupExistingFiles(existingFiles);
    // 3. Create babel.config.js
    writeFile('file', `${root}/babel.config.js`, generateBabelConfig(projectType));
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
    installEvent.emit('inst', projectType);
}, argv.logs);