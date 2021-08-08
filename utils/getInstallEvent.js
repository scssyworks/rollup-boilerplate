const EventEmitter = require('events');
const { events } = require('./constants');
const { logMessage } = require('./logger');

module.exports = function getInstallEvent(installDeps) {
  const installEvent = new EventEmitter();
  installEvent.on(events.INSTALL, (projectType) => {
    logMessage(
      `Installing dependencies and dev-dependencies for "${projectType}"`,
      true
    );
    try {
      installDeps(projectType);
    } catch (e) {
      logMessage(e);
    }
  });
  return installEvent;
};
