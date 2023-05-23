# Rollup boilerplate
"rollup-boilerplate" is a UMD + MJS (ESM) project generator suitable for modern JavaScript libraries.

It creates a standalone set of library wich can be used in the browser, nodejs, or imported in an app much like create-react-app creates a frontend project for web development.

# Installation

```sh
npm install -g rollup-boilerplate
```

# Using rollup-boilerplate

1. Create a library folder

```sh
$ mkdir myLibrary
$ cd myLibrary
```

2. Run ``create-library`` command. (For more information run ``create-library --help``).

```sh
$ create-library
```

# Alternative Usage with npx
npx is a tool which comes with recent npm installations which allows the running of node console applications without installing them in the nodejs package tree directly.

```sh
npx rollup-boilerplate -n myLibraryName
```

This works the same as all the steps shown the Installation section.  There is no need to pre-install (npm install -g etc) the rollup-boilerplate library.  Instead npx will prompt you if any dependancies are missing.

After running the above command with npx, just cd to the created directory and begin building.

3. Provide the relevant details for you library and you're all set!

Rollup-boilerplate does everything for you: From setting up project files to installing dependencies.

# Using you library
Once you have rollup-boilerplate is finished, add your code (e.g. index.js) etc.  Then run the build command to build all the version of your library and run the tests.

If you are builing for a browser environment you may wish to install browser tooling such as js-dom, cypress etc.

```sh
npm run build
```
# Contribution

rollup-boilerplate is an open-source tool. Any ideas for improvements or new features are always welcome.