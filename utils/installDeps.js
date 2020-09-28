const childProcess = require('child_process');
const colors = require('colors');
const { projectTypes } = require('./constants');
const { sanitizeUrl } = require('.');
const { writeFileSync } = require('fs');

const npmProcess = `npm${/^win/.test(process.platform) ? '.cmd' : ''}`;
const workingDir = sanitizeUrl(process.cwd());

const commonDeps = [
    '@babel/core@7',
    '@babel/preset-env@7',
    '@babel/plugin-proposal-class-properties@7',
    '@babel/plugin-proposal-private-methods@7',
    '@babel/plugin-transform-async-to-generator@7',
    '@babel/plugin-transform-regenerator',
    '@babel/plugin-transform-runtime',
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
];

const reactDeps = [
    '@babel/preset-react@7',
    '@rollup/plugin-replace@2',
    'eslint-plugin-react@7'
];

const typescriptDeps = [
    '@babel/preset-typescript@7',
    '@typescript-eslint/eslint-plugin@3',
    '@typescript-eslint/parser@3',
    'typescript@3'
];

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
            command += ` && ${npmProcess} i react react-dom`;
        }
        childProcess.execSync(command, { stdio: [0, 1, 2] });
        if (projectType === projectTypes.RJ) {
            console.log(colors.blue('[Rename]: dependencies to peerDependencies'));
            const packageJson = require(`${workingDir}/package.json`);
            const peerDependencies = packageJson.dependencies;
            if (peerDependencies) {
                packageJson.peerDependencies = peerDependencies;
                delete packageJson.dependencies;
            }
            writeFileSync(`${workingDir}/package.json`, JSON.stringify(packageJson, null, 2), 'utf8');
        }
        console.clear();
        console.log(colors.blue(`Use ${colors.bold('"npm run start"')} to start the dev server and ${colors.bold('"npm run build"')} to generate build files for production.`));
        console.log(colors.green(colors.bold('Happy Coding!')));
    });
}