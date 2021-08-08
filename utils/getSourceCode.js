const { projectTypes } = require('./constants');

const commonCode = `
/**
 * This file is entry file for your library
 */
`.trim();

const typescriptTemplate = `
${commonCode}

export function render(): void {
    const root = document.querySelector('app-root');
    if (root) {
        root.innerHTML = '<div>Hello World</div>';
    }
}`.trim();

const javascriptTemplate = `
${commonCode}

export function render() {
    const root = document.querySelector('app-root');
    if (root) {
        root.innerHTML = '<div>Hello World</div>';
    }
}`.trim();

const reactTemplate = `
import React from 'react';
import ReactDOM from 'react-dom';

${commonCode}

export function render() {
    ReactDOM.render(
        <div>Hello World</div>,
        document.querySelector('app-root')
    );    
}`.trim();

module.exports = function getSourceCode(projectType) {
  switch (projectType) {
    case projectTypes.TS.value:
      return typescriptTemplate;
    case projectTypes.JS.value:
      return javascriptTemplate;
    case projectTypes.RJ.value:
      return reactTemplate;
    default:
      return `${commonCode}`;
  }
};
