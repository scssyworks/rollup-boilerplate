const childProcess = require('child_process');
const colors = require('colors');
const { projectTypes } = require('./constants');
const { writeFileSync } = require('fs');
const { root, isSubDirectory, argv } = require('./tArgs');
const semver = require('semver');

let npmProcess = `npm${/^win/.test(process.platform) ? '.cmd' : ''}`;

if (isSubDirectory) {
    npmProcess += ` --prefix ./${argv.name}`;
}


// Read versions file
const versions = {};

try {
    Object.assign(versions, JSON.parse(
        readFileSync(`${process.cwd()}/versions.json`, {
            encoding: 'utf8'
        }).toString()
    ));
} catch (e) {
    console.log('[Version Check]: A valid "versions.json" file was NOT found. Default versions will be used.');
    if (argv.logs) {
        console.log(colors.blue('Create a "versions.json" file like the example shown below:'));
        console.log(colors.blue(JSON.stringify({
            '@babel/core': '^7.0.0',
            '@babel/preset-env': '~7.0.0'
        }, null, 2)));
    }
}

function initializeVersions(deps) {
    return deps.map(dep => {
        const depName = dep.substring(0, dep.lastIndexOf('@'));
        const depVersion = semver.valid(versions[depsName]) ? versions[depName] : dep.substring(dep.lastIndexOf('@') + 1);
        return `${depName}@${depVersion}`;
    });
}

const commonDeps = initializeVersions([
    '@babel/core@7',
    '@babel/preset-env@7',
    '@babel/plugin-proposal-class-properties@7',
    '@babel/plugin-proposal-private-methods@7',
    '@babel/plugin-transform-async-to-generator@7',
    '@babel/plugin-transform-regenerator@7',
    '@babel/plugin-transform-runtime@7',
    '@rollup/plugin-babel@5',
    '@rollup/plugin-commonjs@15',
    '@rollup/plugin-node-resolve@9',
    '@types/jest@26',
    'jest@26',
    'babel-eslint@10',
    'rollup@2',
    'rollup-plugin-eslint@7',
    'rollup-plugin-livereload@2',
    'rollup-plugin-serve@1',
    'rollup-plugin-terser@7'
]);

const reactDeps = initializeVersions([
    '@babel/preset-react@7',
    '@rollup/plugin-replace@2',
    'eslint-plugin-react@7'
]);

const typescriptDeps = initializeVersions([
    '@babel/preset-typescript@7',
    '@typescript-eslint/eslint-plugin@4',
    '@typescript-eslint/parser@4',
    'typescript@4'
]);

module.exports = function installDeps(projectType) {
    setImmediate(() => {
        const deps = [...commonDeps];
        switch (projectType) {
            case projectTypes.RJ: deps.push(...reactDeps); break;
            case projectTypes.TS: deps.push(...typescriptDeps); break;
            default: break;
        }
        let command = `${npmProcess} i -D ${deps.join(' ')}`;
        if (projectType === projectTypes.RJ) {
            command += ` && ${npmProcess} i ${initializeVersions(['react@latest', 'react-dom@latest'].join(' '))}`;
        }
        childProcess.execSync(command, { stdio: [0, 1, 2] });
        if (projectType === projectTypes.RJ) {
            console.log(colors.blue('[Rename]: dependencies to peerDependencies'));
            const packageJson = require(`${root}/package.json`);
            const peerDependencies = packageJson.dependencies;
            if (peerDependencies) {
                packageJson.peerDependencies = peerDependencies;
                delete packageJson.dependencies;
            }
            writeFileSync(`${root}/package.json`, JSON.stringify(packageJson, null, 2), 'utf8');
        }
        console.clear();
        console.log(colors.blue(`Use ${colors.bold('"npm run start"')} to start the dev server and ${colors.bold('"npm run build"')} to generate build files for production.`));
        console.log(colors.green(colors.bold('Happy Coding!')));
    });
}