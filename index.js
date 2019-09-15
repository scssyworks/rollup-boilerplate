#!/usr/bin/env node
const fs = require('fs-extra');
const colors = require('colors');
const inquirer = require('inquirer');
const childProcess = require('child_process');
const os = require('os');
const argv = require('yargs').argv;
const copySourceFiles = require('./utils/copySourceFiles');
const extractName = require('./utils/extractName');
const camelize = require('./utils/camelize');
const root = process.cwd().replace(/[\\]/g, '/');
const currentDir = __dirname.replace(/[\\]/g, '/');
const npmProcess = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';

// Help
if (argv.help) {
    console.log(colors.bold(`\nUsage:\n${colors.green('create-library --name="libraryName"')}\n\nCreate library command opens up a wizard. Just enter the details and you are good to go!`));
    return;
}

const existingFiles = fs.readdirSync(root);
if (existingFiles.length > 1 && existingFiles[0] !== '.git') {
    console.log(colors.bold(colors.red('Please make sure that your workspace is empty!')));
    return;
}

// Get GIT parameters
childProcess.exec('git remote get-url origin', (err, stdout) => {
    let gitUrl = '';
    if (err) {
        if (existingFiles.length === 1 && existingFiles[0] === '.git') {
            console.log(colors.bold(colors.yellow('Git remote URL not found!')));
        } else {
            console.log(colors.bold(colors.yellow('No git repository found in workspace!')));
        }
    } else {
        gitUrl = stdout.toString().trim();
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
    fs.writeFileSync(`${root}/.travis.yml`, `language: node_js\nnode_js:\n- "stable"\n`);

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
            message: 'Name of the author',
            name: 'author',
            type: 'input',
            default: os.userInfo().username
        },
        {
            message: 'Keywords (comma separated)',
            name: 'keywords',
            type: 'input'
        }
    ]).then(({ fileName, author, keywords }) => {
        // Read current content of package.json and rollup.config.js files
        const packageJson = fs.readFileSync(`${currentDir}/source/package.json`).toString();
        if (!keywords) {
            keywords = projectName
        }
        try {
            const packageJsonParsed = JSON.parse(packageJson);
            packageJsonParsed.name = projectName;
            packageJsonParsed.author = author;
            packageJsonParsed.keywords = keywords.split(',').map(keyword => keyword.trim());
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
            let rollupConfig = fs.readFileSync(`${currentDir}/source/rollup.config.js`, 'utf8').toString();
            rollupConfig = rollupConfig.replace(/\{fileName\}/g, fileName);
            fs.writeFileSync(`${root}/rollup.config.js`, rollupConfig);
        } catch (e) {
            console.log(colors.bold(colors.red('Rollup config file is not readable')));
        }
        try {
            let htmlFile = fs.readFileSync(`${currentDir}/source/dist/index.html`, 'utf8').toString();
            htmlFile = htmlFile.replace(/\{fileName\}/g, fileName);
            fs.mkdirSync(`${root}/dist`);
            fs.writeFileSync(`${root}/dist/index.html`, htmlFile);
        } catch (e) {
            console.log(colors.bold(colors.red('HTML test file is not readable')));
        }
        try {
            let licenseFile = fs.readFileSync(`${currentDir}/source/LICENSE`, 'utf8').toString();
            licenseFile = licenseFile.replace('#currentYear#', (new Date()).getFullYear()).replace('#user#', author);
            fs.writeFileSync(`${root}/LICENSE`, licenseFile);
        } catch (e) {
            console.log(colors.bold(colors.red('LICENSE file is not readable')));
        }
        // Run npm install
        childProcess.execSync(`${npmProcess} install`, { stdio: [0, 1, 2] });
    });
});