import log from '../logger';

let commands = {}, extensions = {};

commands.doPerformMultiAction = async function (elementId, states) {
  let opts;
  if (elementId) {
    opts = {
      elementId,
      actions: states
    };

    return await this.uiautomator2.jwproxy.command('/touch/multi/perform', 'POST', opts);
  } else {
    opts = {
      actions: states
    };
    return await this.uiautomator2.jwproxy.command('/touch/multi/perform', 'POST', opts);
  }
};

commands.performActions = async function (actions) {
  log.debug(`Received the following W3C actions: ${JSON.stringify(actions, null, '  ')}`);
  return await this.uiautomator2.jwproxy.command('/actions', 'POST', {actions});
};

Object.assign(extensions, commands);
export default extensions;
