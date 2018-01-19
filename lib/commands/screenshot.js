let commands = {};

commands.getScreenshot = async function () {
  return await this.uiautomator2.jwproxy.command('/screenshot', 'GET');
};

export default commands;
