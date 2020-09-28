module.exports = function generateTsConfig(additionalConfig = {}) {
    return JSON.stringify(Object.assign({
        compilerOptions: {
            target: 'es6',
            module: 'ES2020',
            lib: [
                'dom',
                'dom.iterable',
                'esnext'
            ],
            allowJs: true,
            declaration: true,
            removeComments: true,
            noEmit: true,
            strict: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            noImplicitReturns: true,
            noImplicitThis: false,
            noFallthroughCasesInSwitch: true,
            moduleResolution: 'node',
            allowSyntheticDefaultImports: true,
            esModuleInterop: true,
            experimentalDecorators: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true
        },
        include: [
            'src/',
            'render/',
            'plugin.test.ts'
        ]
    }, additionalConfig), null, 2);
}