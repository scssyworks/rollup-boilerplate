const { projectTypes } = require('./constants');

module.exports = function generateEslintrc(projectType) {
    const eslintRc = {
        env: {
            browser: true,
            node: true,
            jquery: true,
            es6: true
        },
        parserOptions: {
            sourceType: 'module',
            allowImportExportEverywhere: true
        },
        extends: ['eslint:recommended']
    };

    switch (projectType) {
        case projectTypes.RJ:
            eslintRc.parser = 'babel-eslint';
            eslintRc.extends.push('plugin:react/recommended');
            eslintRc.settings = {
                react: {
                    createClass: 'createReactClass',
                    pragma: 'React',
                    version: 'detect',
                    flowVersion: '0.53'
                },
                propWrapperFunctions: [
                    'forbidExtraProps',
                    {
                        property: 'freeze',
                        object: 'Object'
                    },
                    {
                        property: 'myFavoriteWrapper'
                    }
                ],
                linkComponents: [
                    'Hyperlink',
                    {
                        name: 'Link',
                        linkAttribute: 'to'
                    }
                ]
            };
            break;
        case projectTypes.JS:
            eslintRc.parser = 'babel-eslint';
            break;
        case projectTypes.TS:
            eslintRc.parser = '@typescript-eslint/parser';
            eslintRc.plugins = ['@typescript-eslint'];
            eslintRc.extends.push('plugin:@typescript-eslint/recommended');
            eslintRc.rules = {
                '@typescript-eslint/no-explicit-any': 0,
                '@typescript-eslint/no-this-alias': 0
            };
            break;
        default:
            break;
    }
    return JSON.stringify(eslintRc, null, 2);
};