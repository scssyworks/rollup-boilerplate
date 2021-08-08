const projectTypes = {
  TS: { name: 'TypeScript', value: 'typescript' },
  JS: { name: 'JavaScript', value: 'javascript' },
  RJ: { name: 'React', value: 'react-js' },
  // Add more types here
};

const extensions = {
  TS: 'ts',
  JS: 'js',
  RJ: 'js',
  // Add more extensions here
};

function getChoices() {
  return [...Object.keys(projectTypes)];
}

function getExtension(projectType) {
  return getChoices().find(
    (choice) => projectTypes[choice].value === projectType
  );
}

module.exports = {
  projectTypes,
  extensions,
  events: {
    INSTALL: 'inst',
  },
  getChoices,
  getExtension,
};
