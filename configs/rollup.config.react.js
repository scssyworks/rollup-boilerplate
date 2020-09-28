import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from '@rollup/plugin-replace';
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import { eslint } from 'rollup-plugin-eslint';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import { peerDependencies } from './package.json';

const external = Object.keys(peerDependencies);

const commonConfig = {
    input: 'src/index.js',
    output: {
        name: '{fileName}',
        sourcemap: true
    },
    plugins: [
        resolve({
            customResolveOptions: {
                moduleDirectory: 'node_modules'
            }
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        babel({
            exclude: 'node_modules/**',
            babelHelpers: 'runtime'
        }),
        commonjs({
            include: /node_modules/
        })
    ]
};

// ESM config
const esmConfig = Object.assign({
    external
}, commonConfig);
esmConfig.output = Object.assign({}, commonConfig.output, {
    file: 'dist/mjs/{fileName}.mjs',
    format: 'esm',
    globals: {
        react: 'React',
        'react-dom': 'ReactDOM'
    }
});
esmConfig.plugins = [
    ...commonConfig.plugins
];

// ESM prod config
const esmProdConfig = Object.assign({}, esmConfig);
esmProdConfig.output = Object.assign({}, esmConfig.output, {
    file: 'dist/mjs/{fileName}.min.mjs',
    sourcemap: false
});
esmProdConfig.plugins = [
    ...commonConfig.plugins,
    terser()
];

// UMD config
const umdConfig = Object.assign({
    external
}, commonConfig);
umdConfig.output = Object.assign({}, commonConfig.output, {
    file: 'dist/umd/{fileName}.js',
    format: 'umd',
    globals: {
        react: 'React',
        'react-dom': 'ReactDOM'
    }
});
umdConfig.plugins = [
    ...commonConfig.plugins
];

// Production config
const umdProdConfig = Object.assign({}, umdConfig);
umdProdConfig.output = Object.assign({}, umdConfig.output, {
    file: 'dist/umd/{fileName}.min.js',
    sourcemap: false
});
umdProdConfig.plugins = [
    ...commonConfig.plugins,
    terser()
];

let configurations = [];
if (process.env.SERVE) {
    const serveConfig = Object.assign({}, commonConfig);
    serveConfig.input = 'render/index.js';
    serveConfig.output = Object.assign({}, commonConfig.output, {
        file: 'dist/render/{fileName}.iife.js',
        format: 'iife'
    });
    serveConfig.plugins = [
        eslint({
            exclude: [
                'node_modules/**',
                'json/**'
            ],
            throwOnError: true
        }),
        ...commonConfig.plugins
    ];
    serveConfig.plugins.push(
        serve({
            open: true,
            contentBase: ['dist'],
            host: 'localhost',
            port: '3030'
        }),
        livereload({
            watch: 'dist',
            verbose: false
        })
    );
    configurations.push(serveConfig);
} else {
    configurations.push(
        esmConfig,
        esmProdConfig,
        umdConfig,
        umdProdConfig
    )
}

export default configurations;