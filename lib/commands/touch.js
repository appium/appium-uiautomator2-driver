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
  // This is mandatory, since Selenium API uses MOUSE as the default pointer type
  const preprocessedActions = actions
    .map((action) => Object.assign({}, action, action.type === 'pointer' ? {
      parameters: {
        pointerType: 'touch'
      }
    } : {}));
  log.debug(`Preprocessed actions: ${JSON.stringify(preprocessedActions, null, '  ')}`);
  return await this.uiautomator2.jwproxy.command('/actions', 'POST', {actions});
};

Object.assign(extensions, commands);
export default extensions;
