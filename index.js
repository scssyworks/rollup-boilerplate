#!/usr/bin/env node
const fs = require('fs-extra');
const colors = require('colors');
const inquirer = require('inquirer');
const childProcess = require('child_process');
const Spinner = require('cli-spinner').Spinner;
const copySourceFiles = require('./utils/copySourceFiles');
const root = process.cwd();

const existingFiles = fs.readdirSync(root);
if (existingFiles.length) {
    console.log(colors.bold(colors.red('Workspace not empty!')));
    return;
}

// Copy source files
copySourceFiles(`${__dirname}/source/json`, 'json');
copySourceFiles(`${__dirname}/source/src`, 'src');
copySourceFiles(`${__dirname}/source/.eslintrc`, '.eslintrc');
copySourceFiles(`${__dirname}/source/.gitignore`, '.gitignore');
copySourceFiles(`${__dirname}/source/babel.config.js`, 'babel.config.js');
copySourceFiles(`${__dirname}/source/plugin.test.js`, 'plugin.test.js');

// Copy package.json file
inquirer.prompt([
    {
        message: 'Plugin name:',
        name: 'projectName',
        type: 'input'
    },
    {
        message: 'Output file name:',
        name: 'fileName',
        type: 'input'
    },
    {
        message: 'Author',
        name: 'author',
        type: 'input'
    }
]).then(({ projectName, fileName, author }) => {
    // Read current content of package.json and rollup.config.js files
    const packageJson = fs.readFileSync(`${__dirname}/source/package.json`).toString();
    try {
        const packageJsonParsed = JSON.parse(packageJson);
        packageJsonParsed.name = projectName;
        packageJsonParsed.author = author;
        packageJsonParsed.main = `dist/js/${fileName}`;
        // Write package.json file
        fs.writeFileSync(`${root}/package.json`, JSON.stringify(packageJsonParsed, null, 2));
    } catch (e) {
        console.log(colors.bold(colors.red('Package JSON file is not readable')));
    }
    try {
        let rollupConfig = fs.readFileSync(`${__dirname}/source/rollup.config.js`).toString();
        rollupConfig = rollupConfig.replace(/\{fileName\}/g, fileName);
        fs.writeFileSync(`${root}/rollup.config.js`, rollupConfig);
    } catch (e) {
        console.log(colors.bold(colors.red('Rollup config file is not readable')));
    }
    try {
        let htmlFile = fs.readFileSync(`${__dirname}/source/dist/index.html`).toString();
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
    const status = childProcess.spawn('npm', ['install']);

    status.on('close', () => {
        spinner.stop(true);
        console.log(colors.bold(colors.green('Dependencies installed!\n\n')));
        console.log(colors.bold(colors.green('======= Commands =======\n')));
        console.log(colors.green(`${colors.black('"npm run start"'.bold)} to start the server.\n`));
        console.log(colors.green(`${colors.black('"npm run build"'.bold)} to generate build files.\n`));
    });
});