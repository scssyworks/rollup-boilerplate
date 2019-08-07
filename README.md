![GitHub package.json version](https://img.shields.io/github/package-json/v/scssyworks/rollup-boilerplate) ![GitHub](https://img.shields.io/github/license/scssyworks/rollup-boilerplate) [![Build Status](https://travis-ci.org/scssyworks/rollup-boilerplate.svg?branch=master)](https://travis-ci.org/scssyworks/rollup-boilerplate)

# Rollup boilerplate
Rollup boilerplate is a project generator for UMD libraries

# Install

```sh
npm install -g rollup-boilerplate
```

# How does it work?
Rollup boilerplate generates a project for writing UMD libraries in few simple steps:<br>

Step 1: <b>Create library</b>

```sh
create-library --name testlibrary
```

This initiates a step by step wizard where you can enter details for the library.

Step 2: <b>There is no step 2! </b><br>

<b>Rollup boilerplate</b> generates a boilerplate based on rollup. It integrates Eslint and JEST for code quality checks. It also integrates a development server with livereload.<br>

Use ``npm run start`` to start development server with livereload, and ``npm run build`` to generate production build files.

<b>Note:</b> This is not a major release. Hence, feel free to provide suggestions or raise PRs for further improvements.