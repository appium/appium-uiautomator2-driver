import log from '../logger';
import _ from 'lodash';
import androidHelpers from '../android-helpers';
import { asyncmap } from 'asyncbox';
import B from 'bluebird';
import { errors, isErrorType } from 'appium-base-driver';

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

commands.doTouchAction = async function (action, opts) {
  switch (action) {
    case 'tap':
      return await this.tap(opts.element, opts.x, opts.y, opts.count);
    case 'press':
      return await this.touchDown(opts.element, opts.x, opts.y);
    case 'release':
      return await this.touchUp(opts.element, opts.x, opts.y);
    case 'moveTo':
      return await this.touchMove(opts.element, opts.x, opts.y);
    case 'wait':
      return await B.delay(opts.ms);
    case 'longPress':
      if (typeof opts.duration === 'undefined' || !opts.duration) {
        opts.duration = 1000;
      }
      return await this.touchLongClick(opts.element, opts.x, opts.y, opts.duration);
    case 'cancel':
      // TODO: clarify behavior of 'cancel' action and fix this
      log.warn("Cancel action currently has no effect");
      break;
    default:
      log.errorAndThrow(`unknown action ${action}`);
  }
};

// Perform one gesture
helpers.performGesture = async function (gesture) {
  try {
    return await this.doTouchAction(gesture.action, gesture.options || {});
  } catch (e) {
    // sometime the element is not available when releasing, retry without it
    if (isErrorType(e, errors.NoSuchElementError) && gesture.action === 'release' &&
        gesture.options.element) {
      delete gesture.options.element;
      log.debug(`retrying release without element opts: ${gesture.options}.`);
      return await this.doTouchAction(gesture.action, gesture.options || {});
    }
    throw e;
  }
};

commands.performTouch = async function (gestures) {
  /*if (this.isWebContext()) {
    throw new errors.NotYetImplementedError();
  }*/

  // press-wait-moveTo-release is `swipe`, so use native method
  if (gestures.length === 4 &&
      gestures[0].action === 'press' &&
      gestures[1].action === 'wait' &&
      gestures[2].action === 'moveTo' &&
      gestures[3].action === 'release') {

    let swipeOpts = await this.getSwipeOptions(gestures);
    return await this.swipe(swipeOpts.startX, swipeOpts.startY, swipeOpts.endX,
                            swipeOpts.endY, swipeOpts.duration, swipeOpts.touchCount,
                            swipeOpts.element);
  }
  let actions = _.pluck(gestures, "action");

  if (actions[0] === 'longPress' && actions[1] === 'moveTo' && actions[2] === 'release') {
    // some things are special
    return await this.doTouchDrag(gestures);
  } else {
    if (actions.length === 2) {
      // `press` without a wait is too slow and gets interpretted as a `longPress`
      if (_.first(actions) === 'press' && _.last(actions) === 'release') {
        actions[0] = 'tap';
        gestures[0].action = 'tap';
      }

      // the `longPress` and `tap` methods release on their own
      if ((_.first(actions) === 'tap' || _.first(actions) === 'longPress') && _.last(actions) === 'release') {
        gestures.pop();
        actions.pop();
      }
    } else {
      // longpress followed by anything other than release should become a press and wait
      if (actions[0] === 'longPress') {
        actions = ['press', 'wait', ...actions];

        let press = gestures.shift();
        press.action = 'press';
        let wait = {
          action: 'wait',
          options: {ms: press.options.duration || 1000}
        };
        delete press.options.duration;
        gestures = [press, wait, ...gestures];
      }
    }

    // fix release action then perform all actions
    if (actions[actions.length - 1] === 'release') {
      actions[actions.length - 1] = await this.fixRelease(gestures);
    }

    let fixedGestures = await this.parseTouch(gestures, false);
    for (let g of fixedGestures) {
      await this.performGesture(g);
    }
  }
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
