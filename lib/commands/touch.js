const commands = {};

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
  this.log.debug(`Received the following W3C actions: ${JSON.stringify(actions, null, '  ')}`);
  // This is mandatory, since Selenium API uses MOUSE as the default pointer type
  const preprocessedActions = actions
    .map((action) => Object.assign({}, action, action.type === 'pointer' ? {
      parameters: {
        pointerType: 'touch'
      }
    } : {}));
  this.log.debug(`Preprocessed actions: ${JSON.stringify(preprocessedActions, null, '  ')}`);
  return await this.uiautomator2.jwproxy.command('/actions', 'POST', {actions: preprocessedActions});
};

// eslint-disable-next-line require-await
commands.releaseActions = async function releaseActions () {
  this.log.info('On this platform, releaseActions is a no-op');
};

export default commands;
