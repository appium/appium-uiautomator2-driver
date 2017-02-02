
let extensions = {}, commands = {};

commands.getStatusBarHeight = async function () {
    return await this.uiautomator2.jwproxy.command(`/statBarHeight`, 'GET', {});
};

Object.assign(extensions, commands);
export { commands };
export default extensions;