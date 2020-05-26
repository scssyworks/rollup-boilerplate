import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from '@rollup/plugin-replace';
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import { eslint } from 'rollup-plugin-eslint';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

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
        commonjs({
            include: /node_modules/,
            namedExports: {
                'node_modules/react/index.js': ['Children', 'Component', 'PureComponent', 'PropTypes', 'createElement'],
                'node_modules/react-dom/index.js': ['render']
            }
        })
    ]
};

// ESM config
const esmConfig = Object.assign({}, commonConfig);
esmConfig.output = Object.assign({}, commonConfig.output, {
    file: 'dist/esm/{fileName}.esm.js',
    format: 'esm'
});
esmConfig.plugins = [
    ...commonConfig.plugins,
    replace({
        'process.env.NODE_ENV': JSON.stringify('production')
    }),
    babel({
        exclude: 'node_modules/**',
        babelrc: false,
        presets: [
            '@babel/preset-react'
        ]
    })
];

// ESM prod config
const esmProdConfig = Object.assign({}, esmConfig);
esmProdConfig.output = Object.assign({}, esmConfig.output, {
    file: 'dist/esm/{fileName}.esm.min.js',
    sourcemap: false
});
esmProdConfig.plugins = [
    ...commonConfig.plugins,
    replace({
        'process.env.NODE_ENV': JSON.stringify('production')
    }),
    babel({
        exclude: 'node_modules/**',
        babelrc: false,
        presets: [
            '@babel/preset-react'
        ]
    }),
    terser()
];

// UMD config
const umdConfig = Object.assign({}, commonConfig);
umdConfig.output = Object.assign({}, commonConfig.output, {
    file: 'dist/umd/{fileName}.js',
    format: 'umd'
});
umdConfig.plugins = [
    ...commonConfig.plugins,
    replace({
        'process.env.NODE_ENV': JSON.stringify('production')
    }),
    babel({
        exclude: 'node_modules/**'
    })
];

// Production config
const umdProdConfig = Object.assign({}, umdConfig);
umdProdConfig.output = Object.assign({}, umdConfig.output, {
    file: 'dist/umd/{fileName}.min.js',
    sourcemap: false
});
umdProdConfig.plugins = [
    ...commonConfig.plugins,
    replace({
        'process.env.NODE_ENV': JSON.stringify('production')
    }),
    babel({
        exclude: 'node_modules/**'
    }),
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
        replace({
            'process.env.NODE_ENV': JSON.stringify('development')
        }),
        babel({
            exclude: 'node_modules/**'
        }),
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