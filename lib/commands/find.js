import _ from 'lodash';
import { errors } from 'appium-base-driver';


let commands = {}, helpers = {}, extensions = {};

// stategy: locator strategy
// selector: the actual selector for finding an element
// mult: multiple elements or just one?
// context: finding an element from the root context? or starting from another element
helpers.findElOrEls = async function (strategy, selector, mult, context = '') {
  // throws error if not valid, uses this.locatorStrategies
  this.validateLocatorStrategy(strategy);

  if (!selector) {
    throw new Error("Must provide a selector when finding elements");
  }

  let params = {
    "using": strategy,
    "value": selector,
    "context" : context,
    "multiple" : mult
  };

  let element;
  let doFind = async () => {
    try {
      if (mult) {
        element = await this.uiautomator2.jwproxy.command(`/elements`, 'POST', params);
      } else {
        element = await this.uiautomator2.jwproxy.command(`/element`, 'POST', params);
      }
    } catch (err) {
      if (err.message && err.message.match(/An element could not be located/)) {
        // we are fine with this, just indicate a retry
        return false;
      }
      throw err;
    }

    // we want to return false if we want to potentially try again
    if (mult) {
      return element && element.length !== 0;
    } else {
      return !_.isNull(element);
    }
  };

  try {
    await this.implicitWaitForCondition(doFind);
  } catch (err) {
    if (err.message && err.message.match(/Condition unmet/)) {
      // only get here if we are looking for multiple elements
      // condition was not met setting res to empty array
      element = [];
    } else {
      throw err;
    }
  }

  if (mult) {
    return element;
  } else {
    if (!element || _.size(element) === 0) {
      throw new errors.NoSuchElementError();
    }
    return element;
  }
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
