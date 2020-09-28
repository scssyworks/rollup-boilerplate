const { projectTypes } = require('./constants');

function format(stringParts, config) {
    const returnParts = [...stringParts];
    config.presets = config.presets.map(preset => `'${preset}'`);
    config.plugins = config.plugins.map(plugin => `'${plugin}'`);
    const stringConfig = `{\n\t\tpresets: [\n\t\t\t${config.presets.join(',\n\t\t\t')}\n\t\t],\n\t\tplugins: [\n\t\t\t${config.plugins.join(',\n\t\t\t')}\n\t\t]\n\t};`;
    returnParts.splice(1, 0, stringConfig);
    return returnParts.join('');
}

module.exports = function generateBabelConfig(projectType) {
    const config = {
        presets: [
            '@babel/preset-env'
        ],
        plugins: [
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-private-methods',
            '@babel/plugin-transform-runtime',
            '@babel/plugin-transform-regenerator',
            '@babel/plugin-transform-async-to-generator'
        ]
    };
    switch (projectType) {
        case projectTypes.TS:
            config.presets.push(
                '@babel/preset-typescript'
            );
            break;
        case projectTypes.RJ:
            config.presets.push(
                '@babel/preset-react'
            );
            break;
        default:
            break;
    }
    return format`module.exports = function (api) {\n\tapi.cache(true);\n\treturn ${config}\n};`;
};