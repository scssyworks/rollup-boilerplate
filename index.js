#!/usr/bin/env node
const fs = require('fs-extra');
const colors = require('colors');
const inquirer = require('inquirer');
const childProcess = require('child_process');
const os = require('os');
const {
    copySourceFiles,
    extractName,
    camelize,
    hasAllowedItems,
    hasGitFolder,
    sanitizeUrl
} = require('./utils');
const root = sanitizeUrl(process.cwd());
const currentDir = sanitizeUrl(__dirname);
const npmProcess = `npm${/^win/.test(process.platform) ? '.cmd' : ''}`;
const argv = require('yargs').argv;

// If version is asked, then do nothing and return the current version
if (argv.version) {
    console.log(require('./package.json').version);
    return;
}

const existingFiles = fs.readdirSync(root);
let packJSON = {};
if (existingFiles.includes('package.json')) {
    packJSON = require(`${root}/package.json`);
}
let allowedFiles = [];
if (!Array.isArray(packJSON.allowedFiles)) {
    allowedFiles = [];
}
if (!hasAllowedItems(existingFiles, allowedFiles)) {
    console.log(colors.bold(colors.red('Please make sure your current workspace is empty!')));
    return;
}

const resourceFolders = {
    JavaScript: 'source',
    TypeScript: 'source',
    React: 'react-source',
    TSReact: 'react-source'
};

// Get GIT parameters
childProcess.exec('git remote get-url origin', async (err, stdout) => {
    let gitUrl = '';
    if (err) {
        if (hasGitFolder(existingFiles)) {
            console.log(colors.bold(colors.blue('[This project has a local GIT repository!]\n')));
        } else {
            childProcess.execSync('git init');
        }
    } else {
        gitUrl = stdout.toString().trim();
    }

    const { projectType } = await inquirer.prompt([{
        type: 'list',
        message: 'Select a project type',
        choices: Object.keys(resourceFolders),
        name: 'projectType',
        default: 'CoreJS'
    }]);

    // Copy source files
    const copyFolder = resourceFolders[projectType];
    // Copy src folder
    copySourceFiles(`${currentDir}/${copyFolder}/src`, 'src');
    // Copy render folder
    copySourceFiles(`${currentDir}/${copyFolder}/render`, 'render');
    // Copy eslint config file
    if (!existingFiles.includes('.eslintrc')) {
        copySourceFiles(`${currentDir}/${copyFolder}/.eslintrc`, '.eslintrc');
    }
    // Copy babel config file
    if (!existingFiles.includes('babel.config.js')) {
        copySourceFiles(`${currentDir}/templates/babel/${projectType}/babel.config.js`, 'babel.config.js');
    }
    // Copy test file
    copySourceFiles(`${currentDir}/${copyFolder}/plugin.test.js`, 'plugin.test.js');

    // Generate gitignore file
    if (!existingFiles.includes('.gitignore')) {
        fs.writeFileSync(`${root}/.gitignore`, 'node_modules\n.vscode\n');
    }

    let projectName = argv.name;
    if (!projectName) {
        projectName = extractName(root);
    }

    projectName = `${projectName}`.toLowerCase();
    console.clear();
    // Copy package.json file
    const { fileName, projectDescription, author, keywords } = await inquirer.prompt([
        {
            message: 'Output file name (default is folder name)',
            name: 'fileName',
            type: 'input',
            default: camelize(projectName)
        },
        {
            message: 'Project description',
            name: 'projectDescription',
            type: 'input',
            default: `Project ${projectName}`
        },
        {
            message: 'Name of the author (to be used in package.json and LICENSE)',
            name: 'author',
            type: 'input',
            default: (packJSON.author || os.userInfo().username)
        },
        {
            message: 'Keywords (specify comma separated values)',
            name: 'keywords',
            type: 'input',
            default: ((packJSON.keywords && packJSON.keywords.join(', ')) || camelize(projectName))
        }
    ])
    try {
        const currPackageJSON = JSON.parse(
            fs.readFileSync(`${currentDir}/templates/npm/${projectType}/package.json`).toString()
        );
        currPackageJSON.name = packJSON.name || projectName;
        currPackageJSON.version = packJSON.version || currPackageJSON.version;
        currPackageJSON.description = projectDescription;
        currPackageJSON.author = author;
        currPackageJSON.keywords = keywords.split(',').map(keyword => keyword.trim());
        currPackageJSON.main = `dist/umd/${fileName}.js`;
        currPackageJSON.module = `dist/esm/${fileName}.esm.js`;
        currPackageJSON.files = ['dist/umd/', 'dist/esm/'];
        packJSON.license = currPackageJSON.license = packJSON.license || currPackageJSON.license;
        // Set git parameters
        if (gitUrl) {
            currPackageJSON.repository = {
                type: 'git',
                url: `git+${gitUrl}`
            };
            currPackageJSON.bugs = {
                url: `${gitUrl.replace(/\.git$/, '')}/issues`
            };
            currPackageJSON.homepage = `${gitUrl.replace(/\.git$/, '')}#readme`;
        }
        if (packJSON.dependencies) {
            currPackageJSON.dependencies = Object.assign(
                {},
                packJSON.dependencies,
                currPackageJSON.dependencies
            );
        }
        if (packJSON.devDependencies) {
            currPackageJSON.devDependencies = Object.assign(
                {},
                packJSON.devDependencies,
                currPackageJSON.devDependencies
            );
        }
        if (packJSON.peerDependencies) {
            currPackageJSON.peerDependencies = Object.assign(
                {},
                packJSON.peerDependencies,
                currPackageJSON.peerDependencies
            );
        }
        // Write package.json file
        fs.writeFileSync(`${root}/package.json`, JSON.stringify(currPackageJSON, null, 2));
    } catch (e) {
        console.log(colors.bold(colors.red('An error occurred while reading "package.json" file')));
    }
    // Add rollup configuration
    try {
        let rollupConfig = fs.readFileSync(`${currentDir}/templates/npm/${projectType}/rollup.config.js`, 'utf8').toString();
        rollupConfig = rollupConfig.replace(/\{fileName\}/g, fileName);
        fs.writeFileSync(`${root}/rollup.config.js`, rollupConfig);
    } catch (e) {
        console.log(colors.bold(colors.red('Rollup config file is not readable')));
    }
    // Add HTML test file
    try {
        let htmlFile = fs.readFileSync(`${currentDir}/${copyFolder}/dist/index.html`, 'utf8').toString();
        htmlFile = htmlFile.replace(/\{fileName\}/g, fileName);
        fs.mkdirSync(`${root}/dist`);
        fs.writeFileSync(`${root}/dist/index.html`, htmlFile);
    } catch (e) {
        console.log(colors.bold(colors.red('HTML test file is not readable')));
    }
    try {
        if (
            packJSON.license === 'MIT'
            && !existingFiles.includes('LICENSE')
        ) {
            let licenseFile = fs.readFileSync(`${currentDir}/template/license/LICENSE`, 'utf8').toString();
            licenseFile = licenseFile.replace('#currentYear#', (new Date()).getFullYear()).replace('#user#', author);
            fs.writeFileSync(`${root}/LICENSE`, licenseFile);
        }
    } catch (e) {
        console.log(colors.bold(colors.red('LICENSE file is not readable')));
    }
    // Run npm install
    console.clear();
    console.log(colors.blue(colors.bold('Installing dependencies...')));
    childProcess.execSync(`${npmProcess} install`, { stdio: [0, 1, 2] });
    console.clear();
    console.log(colors.bold(colors.green('Your project has been created successfully!\n')));
    console.log(colors.bold('To start the DEV server type ' + colors.blue('"npm start"')));
    console.log(colors.bold('To generate a production build type ' + colors.blue('"npm run build"\n')));
});