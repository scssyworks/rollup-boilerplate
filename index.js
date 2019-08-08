#!/usr/bin/env node
const fs = require('fs-extra');
const colors = require('colors');
const inquirer = require('inquirer');
const childProcess = require('child_process');
const os = require('os');
const argv = require('yargs').argv;
const Spinner = require('cli-spinner').Spinner;
const copySourceFiles = require('./utils/copySourceFiles');
const extractName = require('./utils/extractName');
const camelize = require('./utils/camelize');
const root = process.cwd().replace(/[\\]/g, '/');
const currentDir = __dirname.replace(/[\\]/g, '/');
const npmProcess = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';

const existingFiles = fs.readdirSync(root);
if (existingFiles.length > 1 && existingFiles[0] !== '.git') {
    console.log(colors.bold(colors.red('Workspace not empty!')));
    return;
}

// Get GIT parameters
let gitUrl = '';
try {
    gitUrl = childProcess.execSync('git remote get-url origin').toString().trim();
} catch (e) {
    if (existingFiles.length === 1 && existingFiles[0] === '.git') {
        console.log(colors.bold(colors.yellow('Git remote URL not found!')));
    } else {
        console.log(colors.bold(colors.yellow('No git repository found in workspace!')));
    }
    gitUrl = '';
}

// Copy source files
copySourceFiles(`${currentDir}/source/json`, 'json');
copySourceFiles(`${currentDir}/source/src`, 'src');
copySourceFiles(`${currentDir}/source/.eslintrc`, '.eslintrc');
copySourceFiles(`${currentDir}/source/babel.config.js`, 'babel.config.js');
copySourceFiles(`${currentDir}/source/plugin.test.js`, 'plugin.test.js');

// Generate gitignore file
fs.writeFileSync(`${root}/.gitignore`, 'node_modules\n');

// Generate travis file
fs.writeFileSync(`${root}/.travis.yml`, `language: node_js\nnode_js:\n- "stable"\nscript:\n- npm run test`);

let projectName = argv.name;
if (!projectName) {
    projectName = extractName(root);
}

console.log(colors.bold(colors.green(`Creating project "${projectName}"...`)));

// Copy package.json file
inquirer.prompt([
    {
        message: 'Name of UMD output file',
        name: 'fileName',
        type: 'input',
        default: camelize(projectName)
    },
    {
        message: 'Author of library',
        name: 'author',
        type: 'input',
        default: os.userInfo().username
    }
]).then(({ fileName, author }) => {
    // Read current content of package.json and rollup.config.js files
    const packageJson = fs.readFileSync(`${currentDir}/source/package.json`).toString();
    try {
        const packageJsonParsed = JSON.parse(packageJson);
        packageJsonParsed.name = projectName;
        packageJsonParsed.author = author;
        packageJsonParsed.main = `dist/js/${fileName}`;
        // Set git parameters
        if (gitUrl) {
            packageJsonParsed.repository = {
                type: 'git',
                url: `git+${gitUrl}`
            };
            packageJsonParsed.bugs = {
                url: `${gitUrl.replace(/\.git$/, '')}/issues`
            };
            packageJsonParsed.homepage = `${gitUrl.replace(/\.git$/, '')}#readme`;
        }
        // Write package.json file
        fs.writeFileSync(`${root}/package.json`, JSON.stringify(packageJsonParsed, null, 2));
    } catch (e) {
        console.log(colors.bold(colors.red('Package JSON file is not readable')));
    }
    try {
        let rollupConfig = fs.readFileSync(`${currentDir}/source/rollup.config.js`).toString();
        rollupConfig = rollupConfig.replace(/\{fileName\}/g, fileName);
        fs.writeFileSync(`${root}/rollup.config.js`, rollupConfig);
    } catch (e) {
        console.log(colors.bold(colors.red('Rollup config file is not readable')));
    }
    try {
        let htmlFile = fs.readFileSync(`${currentDir}/source/dist/index.html`).toString();
        htmlFile = htmlFile.replace(/\{fileName\}/g, fileName);
        fs.mkdirSync(`${root}/dist`);
        fs.writeFileSync(`${root}/dist/index.html`, htmlFile);
    } catch (e) {
        console.log(colors.bold(colors.red('HTML test file is not readable')));
    }
    // Run npm install
    const spinner = new Spinner('Installing dependencies... (%s)');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    const status = childProcess.spawn(npmProcess, ['install']);

    status.stdout.on('data', (data) => {
        spinner.stop(true);
        console.log(`\n${data.toString()}`);
    });

    status.on('close', () => {
        console.log(colors.bold(colors.green('\nDependencies installed!\n\n')));
        console.log(colors.green(`Run ${colors.black('"npm run start"'.bold)} to start development server\n`));
        console.log(colors.green(`and ${colors.black('"npm run build"'.bold)} to generate production build\n`));
    });
});