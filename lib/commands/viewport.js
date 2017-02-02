
let extensions = {}, commands = {};

commands.getStatusBarHeight = async function () {
    return await this.uiautomator2.jwproxy.command(`/stat_bar_height`, 'GET', {});
};

Object.assign(extensions, commands);
export { commands };
export default extensions;