let extensions = {}, commands = {};

/**
 *  Gets system and installed applications info
 *  The information consists of :-
 *   - packageName
 *   - appName
 *   - packageActivty
 * */

commands.mobileGetAppsInfo = async function () {
  return await this.uiautomator2.jwproxy.command('/appium/device/apps', 'GET', {});
};

Object.assign(extensions, commands);
export { commands };
export default extensions;