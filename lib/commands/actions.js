import androidHelpers from '../android-helpers';
import log from '../logger';
import { util } from 'appium-support';

const swipeStepsPerSec = 28;

let commands = {}, helpers = {}, extensions = {};

commands.swipe = async function (startX, startY, endX, endY, duration, touchCount, elId) {
 
 startX = util.hasValue(startX) ? startX : 0.5;
 startY = util.hasValue(startY) ? startY : 0.5;

  let swipeOpts = {startX, startY, endX, endY,
                   steps: Math.round(duration * swipeStepsPerSec)};

  if (util.hasValue(elId)) {
    swipeOpts.elementId = elId;
    return await this.uiautomator2.jwproxy.command(`/touch/perform`,'POST',{swipeOpts});
  } else {
    return await this.uiautomator2.jwproxy.command(`/touch/perform`,'POST',{swipeOpts});
  }
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
