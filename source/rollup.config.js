import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import json from "rollup-plugin-json";
import { eslint } from 'rollup-plugin-eslint';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const defaultConfig = {
    input: 'src/index.js',
    output: {
        file: 'dist/js/{fileName}.js',
        format: 'umd',
        name: '{fileName}',
        sourcemap: true
    },
    plugins: [
        json({
            namedExports: false,
            exclude: "node_modules/**"
        }),
        resolve({
            customResolveOptions: {
                moduleDirectory: "node_modules"
            }
        }),
        commonjs(),
        babel({
            exclude: "node_modules/**"
        })
    ]
};

if (process.env.SERVE) {
    defaultConfig.plugins.push(
        serve('dist'),
        livereload({
            watch: 'dist',
            verbose: false
        })
    );
}

const productionConfig = Object.assign({}, defaultConfig);
productionConfig.output = Object.assign({}, productionConfig.output, {
    file: 'dist/js/{fileName}.min.js',
    sourcemap: false
});
productionConfig.plugins = [...defaultConfig.plugins, terser()];
defaultConfig.plugins = [
    eslint({
        exclude: [
            'node_modules/**',
            'json/**'
        ],
        throwOnError: true
    }),
    ...defaultConfig.plugins
];

export default [
    defaultConfig,
    productionConfig
]