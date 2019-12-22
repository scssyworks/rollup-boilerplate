#!/usr/bin/env node
const fs = require('fs-extra');
const colors = require('colors');
const inquirer = require('inquirer');
const childProcess = require('child_process');
const os = require('os');
const copySourceFiles = require('./utils/copySourceFiles');
const extractName = require('./utils/extractName');
const camelize = require('./utils/camelize');
const root = process.cwd().replace(/[\\]/g, '/');
const currentDir = __dirname.replace(/[\\]/g, '/');
const npmProcess = `npm${/^win/.test(process.platform) ? '.cmd' : ''}`;
const argv = require('yargs').argv;
const hasAllowedItems = require('./utils/hasAllowedItems');
const hasGitFolder = require('./utils/hasGitFolder');

const existingFiles = fs.readdirSync(root);
let allowedFilesImportText = '';
let allowedFiles = [];
if (
    existingFiles.includes(allowedFilesImportText = 'allowedFiles.json')
    || existingFiles.includes(allowedFilesImportText = 'allowedFiles.js')
) {
    allowedFiles = require(`${root}/${allowedFilesImportText}`);
    if (!Array.isArray(allowedFiles)) {
        allowedFiles = [];
    }
}
if (!hasAllowedItems(existingFiles, allowedFiles)) {
    console.log(colors.bold(colors.red('Please make sure your current workspace is empty!')));
    return;
}

// Get GIT parameters
childProcess.exec('git remote get-url origin', (err, stdout) => {
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

    inquirer.prompt([{
        type: 'list',
        choices: [
            'CoreJS',
            'React'
        ],
        name: 'projectType',
        default: 'CoreJS'
    }]).then(({ projectType }) => {
        // Copy source files
        const copyFolder = projectType === 'React' ? 'react-source' : 'source';
        copySourceFiles(`${currentDir}/${copyFolder}/src`, 'src');
        copySourceFiles(`${currentDir}/${copyFolder}/render`, 'render');
        if (!existingFiles.includes('.eslintrc')) {
            copySourceFiles(`${currentDir}/${copyFolder}/.eslintrc`, '.eslintrc');
        }
        if (!existingFiles.includes('babel.config.js')) {
            copySourceFiles(`${currentDir}/${copyFolder}/babel.config.js`, 'babel.config.js');
        }
        copySourceFiles(`${currentDir}/${copyFolder}/plugin.test.js`, 'plugin.test.js');

        // Generate gitignore file
        if (!existingFiles.includes('.gitignore')) {
            fs.writeFileSync(`${root}/.gitignore`, 'node_modules\n.vscode\n');
        }

        // Generate travis file
        if (!existingFiles.includes('.travis.yml')) {
            fs.writeFileSync(`${root}/.travis.yml`, `language: node_js\nnode_js:\n- "stable"\n`);
        }

        let projectName = argv.name;
        if (!projectName) {
            projectName = extractName(root);
        }

        projectName = `${projectName}`.toLowerCase(); // Name of project in NPM should be a lower case

        console.log(colors.bold(colors.green(`Writing source files for project "${projectName}"...`)));

        let existingPkgJson = {};
        if (existingFiles.includes('package.json')) {
            existingPkgJson = require(`${root}/package.json`);
        }

        // Copy package.json file
        inquirer.prompt([
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
                default: 'Rollup project'
            },
            {
                message: 'Name of the author (to be used in package.json and LICENSE)',
                name: 'author',
                type: 'input',
                default: (existingPkgJson.author || os.userInfo().username)
            },
            {
                message: 'Keywords (separated by comma)',
                name: 'keywords',
                type: 'input',
                default: ((existingPkgJson.keywords && existingPkgJson.keywords.join(',')) || camelize(projectName))
            }
        ]).then(({ fileName, projectDescription, author, keywords }) => {
            // Read current content of package.json and rollup.config.js files
            const packageJson = fs.readFileSync(`${currentDir}/${copyFolder}/package.json`).toString();
            if (!keywords) {
                keywords = projectName
            }
            try {
                const packageJsonParsed = JSON.parse(packageJson);
                packageJsonParsed.name = existingPkgJson.name || projectName;
                packageJsonParsed.version = existingPkgJson.version || packageJsonParsed.version;
                packageJsonParsed.description = projectDescription;
                packageJsonParsed.author = author;
                packageJsonParsed.keywords = keywords.split(',').map(keyword => keyword.trim());
                packageJsonParsed.main = `dist/umd/${fileName}.js`;
                packageJsonParsed.module = `dist/esm/${fileName}.esm.js`;
                packageJsonParsed.files = ['dist/umd/', 'dist/esm/'];
                existingPkgJson.license = packageJsonParsed.license = existingPkgJson.license || packageJsonParsed.license;
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
                if (existingPkgJson.dependencies) {
                    packageJsonParsed.dependencies = Object.assign(
                        {},
                        existingPkgJson.dependencies,
                        (packageJsonParsed.dependencies || {})
                    );
                }
                if (existingPkgJson.devDependencies) {
                    packageJsonParsed.devDependencies = Object.assign(
                        {},
                        existingPkgJson.devDependencies,
                        (packageJsonParsed.devDependencies || {})
                    );
                }
                if (existingPkgJson.peerDependencies) {
                    packageJsonParsed.peerDependencies = Object.assign(
                        {},
                        existingPkgJson.peerDependencies,
                        (packageJsonParsed.peerDependencies || {})
                    );
                }
                // Write package.json file
                fs.writeFileSync(`${root}/package.json`, JSON.stringify(packageJsonParsed, null, 2));
            } catch (e) {
                console.log(colors.bold(colors.red('Package JSON file is not readable')));
            }
            try {
                let rollupConfig = fs.readFileSync(`${currentDir}/${copyFolder}/rollup.config.js`, 'utf8').toString();
                rollupConfig = rollupConfig.replace(/\{fileName\}/g, fileName);
                fs.writeFileSync(`${root}/rollup.config.js`, rollupConfig);
            } catch (e) {
                console.log(colors.bold(colors.red('Rollup config file is not readable')));
            }
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
                    existingPkgJson.license === 'MIT'
                    && !existingFiles.includes('LICENSE')
                ) {
                    let licenseFile = fs.readFileSync(`${currentDir}/${copyFolder}/LICENSE`, 'utf8').toString();
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
    });
});