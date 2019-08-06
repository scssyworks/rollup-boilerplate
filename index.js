#!/usr/bin/env node
const fs = require('fs-extra');
const root = process.cwd();
const inquirer = require('inquirer');
const copySourceFiles = require('./utils/copySourceFiles');

// Copy source files
copySourceFiles(`${__dirname}/source/src`, 'src');
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
    const packageJson = fs.readFileSync(`${__dirname}/source/package.json`);
    try {
        const packageJsonParsed = JSON.parse(packageJson);
        packageJsonParsed.name = projectName;
        packageJsonParsed.author = author;
        packageJsonParsed.main = `dist/js/${fileName}`;
        // Write package.json file
        fs.writeFileSync(`${root}/package.json`, JSON.stringify(packageJsonParsed, null, 2));
    } catch (e) {
        console.log('Package JSON file is not readable');
    }
    try {
        let rollupConfig = fs.readFileSync(`${__dirname}/source/rollup.config.js`).toString();
        rollupConfig = rollupConfig.replace(/\{fileName\}/g, fileName);
        fs.writeFileSync(`${root}/rollup.config.js`, rollupConfig);
    } catch (e) {
        console.log('Rollup config file is not readable');
        console.log(e);
    }
});