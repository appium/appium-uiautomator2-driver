import androidHelpers from '../android-helpers';
import log from '../logger';

const swipeStepsPerSec = 28;

let commands = {}, helpers = {}, extensions = {};

commands.swipe = async function (startX, startY, endX, endY, duration, touchCount, elId) {
  if (startX === 'null') {
    startX = 0.5;
  }
  if (startY === 'null') {
    startY = 0.5;
  }
  let swipeOpts = {startX, startY, endX, endY,
                   steps: Math.round(duration * swipeStepsPerSec)};

  if (typeof elId !== "undefined" && elId !== null) {
    swipeOpts.elementId = elId;
    return await this.uiautomator2.jwproxy.command(`/touch/perform`,'POST',{swipeOpts});
  } else {
    return await this.uiautomator2.jwproxy.command(`/touch/perform`,'POST',{swipeOpts});
  }
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
