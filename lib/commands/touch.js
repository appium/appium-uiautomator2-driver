import _ from 'lodash';
import androidHelpers from '../android-helpers';
import { asyncmap } from 'asyncbox';

let commands = {}, helpers = {}, extensions = {};

helpers.parseTouch = async function (gestures, multi) {
  // because multi-touch releases at the end by default
  if (multi && _.last(gestures).action === 'release') {
    gestures.pop();
  }

  let touchStateObjects = await asyncmap(gestures, async (gesture) => {
    let options = gesture.options;
    if (_.contains(['press', 'moveTo', 'tap', 'longPress'], gesture.action)) {
      options.offset = false;
      let elementId = gesture.options.element;
      if (elementId) {
        let pos = await this.getLocationInView(elementId);
        let size = await this.getSize(elementId);
        if (gesture.options.x || gesture.options.y) {
          options.x = pos.x + (gesture.options.x || 0);
          options.y = pos.y + (gesture.options.y || 0);
        } else {
          options.x = pos.x + (size.width / 2);
          options.y = pos.y + (size.height / 2);
        }
        let touchStateObject = {
          action: gesture.action,
          options,
          timeOffset: 0.005,
        };
        return touchStateObject;
      } else {
        // expects absolute coordinates, so we need to save these as offsets
        // and then translate when everything is done
        options.offset = true;
        options.x = (gesture.options.x || 0);
        options.y = (gesture.options.y || 0);

        let touchStateObject = {
          action: gesture.action,
          options,
          timeOffset: 0.005,
        };
        return touchStateObject;
      }
    } else {
      let offset = 0.005;
      if (gesture.action === 'wait') {
        options = gesture.options;
        offset = (parseInt(gesture.options.ms) / 1000);
      }
      let touchStateObject = {
        action: gesture.action,
        options,
        timeOffset: offset,
      };
      return touchStateObject;
    }
  }, false);
  // we need to change the time (which is now an offset)
  // and the position (which may be an offset)
  let prevPos = null,
      time = 0;
  for (let state of touchStateObjects) {
    if (_.isUndefined(state.options.x) && _.isUndefined(state.options.y)) {
      // this happens with wait
      state.options.x = prevPos.x;
      state.options.y = prevPos.y;
    }
    if (state.options.offset && prevPos) {
      // the current position is an offset
      state.options.x += prevPos.x;
      state.options.y += prevPos.y;
    }
    delete state.options.offset;
    prevPos = state.options;

    if (multi) {
      var timeOffset = state.timeOffset;
      time += timeOffset;
      state.time = androidHelpers.truncateDecimals(time, 3);

      // multi gestures require 'touch' rather than 'options'
      state.touch = state.options;
      delete state.options;
    }
    delete state.timeOffset;
  }
  return touchStateObjects;
};


commands.performMultiAction = async function (actions, elementId) {

  // Android needs at least two actions to be able to perform a multi pointer gesture
  if (actions.length === 1) {
    throw new Error("Multi Pointer Gestures need at least two actions. " +
        "Use Touch Actions for a single action.");
  }

  let states = await asyncmap(actions, async (action) => {
    return await this.parseTouch(action, true);
  }, false);

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

Object.assign(extensions, commands, helpers);
export default extensions;
