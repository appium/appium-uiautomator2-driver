let extensions = {}, commands = {};

/**
 * @typedef {Object} PackagesInfo
 *
 * @property {string} packageName
 * @property {string} appName
 * @property {string} packageActivty
 */

/**
 * Gets system and installed applications info.
 * Packages without launchable activity is filtered out from the list.
 *
 * @returns {PackagesInfo}
 * */

commands.mobileGetAppsInfo = async function () {
  return await this.uiautomator2.jwproxy.command('/appium/device/apps', 'GET', {});
};

Object.assign(extensions, commands);
export { commands };
export default extensions;