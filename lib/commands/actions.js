

let commands = {}, helpers = {}, extensions = {};

commands.doSwipe = async function(swipeOpts) {
  return await this.uiautomator2.jwproxy.command(`/touch/perform`,'POST',{swipeOpts});
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
