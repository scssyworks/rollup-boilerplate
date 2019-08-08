![GitHub package.json version](https://img.shields.io/github/package-json/v/scssyworks/rollup-boilerplate) ![GitHub](https://img.shields.io/github/license/scssyworks/rollup-boilerplate) [![Build Status](https://travis-ci.org/scssyworks/rollup-boilerplate.svg?branch=master)](https://travis-ci.org/scssyworks/rollup-boilerplate)

# Rollup boilerplate
"Rollup boilerplate" is a project generator for UMD libraries

# Install

```sh
npm install -g rollup-boilerplate
```

# How does it work?
"Rollup boilerplate" installs a ``create-library`` utility which can be used to generate project files. To run the utility type:

```sh
create-library --name testlibrary
```

The generated code uses rollup as a bundler with Eslint and JEST integrated by default. You simply need to type ``npm start`` to start the development server, or ``npm run build`` to run production build.

# Publishing library

"Rollup boilerplate" generates ready to publish library code. Make sure the project name you choose is available on NPM.

Run ``npm version <major|minor|patch>`` to update the library version, and ``npm publish`` to publish the library.

<b>Note:</b> This is not a major release. Feel free to provide suggestions or raise PRs for further improvements.