import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import _ from 'lodash';
import B from 'bluebird';
import { retryInterval } from 'asyncbox';
import { APIDEMOS_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';
import ADB from 'appium-adb';


chai.should();
chai.use(chaiAsPromised);

const BUTTON_CLASS = 'android.widget.Button';
const EDITTEXT_CLASS = 'android.widget.EditText';

const PACKAGE = 'io.appium.android.apis';
const TEXTFIELD_ACTIVITY = '.view.TextFields';
const KEYEVENT_ACTIVITY = '.text.KeyEventText';

let defaultAsciiCaps = Object.assign({}, APIDEMOS_CAPS, {
  newCommandTimeout: 90,
  appPackage: PACKAGE,
  appActivity: TEXTFIELD_ACTIVITY
});

let defaultUnicodeCaps = Object.assign({}, defaultAsciiCaps, {
  unicodeKeyboard: true,
  resetKeyboard: true
});

function deSamsungify (text) {
  // For samsung S5 text is appended with ". Editing."
  return text.replace(". Editing.", "");
}

async function getElement (driver, className) {
  return await retryInterval(process.env.TESTOBJECT_E2E_TESTS ? 100 : 10, 1000, async () => {
    return await driver.elementByClassName(className);
  });
}

async function waitForText (element, expectedText) {
  return await retryInterval(process.env.TESTOBJECT_E2E_TESTS ? 100 : 10, 1000, async () => {
    const text = await element.text();
    if (text !== expectedText) {
      throw new Error(`Unexpected element text. Actual: "${text}". Expected: "${expectedText}"`);
    }
  });
}

async function runTextEditTest (driver, testText, keys = false) {
  let el = await getElement(driver, EDITTEXT_CLASS);
  await el.clear();

  if (keys) {
    await driver.keys([testText]);
  } else {
    await el.sendKeys(testText);
  }

  await retryInterval(process.env.TESTOBJECT_E2E_TESTS ? 100 : 10, 1000, async () => {
    let text = await el.text();
    deSamsungify(text).should.be.equal(testText);
  });

  return el;
}

/*
 * The key event page needs to be cleared between runs, or else we get false
 * positives from previously run tests. The page has a single button that
 * removes all text from within the main TextView.
 */
async function clearKeyEvents (driver) {
  let el = await getElement(driver, BUTTON_CLASS);
  await el.click();

  // wait a moment for the clearing to occur, lest we too quickly try to enter more text
  await B.delay(500);
}

async function keyEventTest (driver, keyCode, metaState, expectedTextArray) {
  let runTest = async function () {
    await driver.pressKeycode(keyCode, metaState);
    let el = driver.elementById('io.appium.android.apis:id/text');
    return await el.text();
  };

  await clearKeyEvents(driver);

  let text = await runTest();
  if (!text) {
    // the test is flakey... try again
    text = await runTest();
  }
  for (let expectedText of expectedTextArray) {
    text.should.include(expectedText);
  }
}

async function runCombinationKeyEventTest (driver) {
  await keyEventTest(driver, 29, 193, ['keyCode=KEYCODE_A', 'metaState=META_SHIFT_ON']);
}

async function runKeyEventTest (driver) {
  await keyEventTest(driver, 82, undefined, ['[keycode=82]', 'keyCode=KEYCODE_MENU']);
}

let tests = [
  { label: 'editing a text field', text: 'Life, the Universe and Everything.' },
  { label: 'sending \'&-\'', text: '&-' },
  { label: 'sending \'&\' and \'-\' in other text', text: 'In the mid-1990s he ate fish & chips as mayor-elect.' },
  { label: 'sending \'-\' in text', text: 'Super-test.' },
  { label: 'sending numbers', text: '0123456789'},
];

let unicodeTests = [
  { label: 'should be able to send \'-\' in unicode text', text: 'परीक्षा-परीक्षण' },
  { label: 'should be able to send \'&\' in text', text: 'Fish & chips' },
  { label: 'should be able to send \'&\' in unicode text', text: 'Mīna & chips' },
  { label: 'should be able to send roman characters with diacritics', text: 'Áé Œ ù ḍ' },
  { label: 'should be able to send a \'u\' with an umlaut', text: 'ü' },
];

let languageTests = [
  { label: 'should be able to send Tamil', text: 'சோதனை' },
  { label: 'should be able to send Gujarati', text: 'પરીક્ષણ' },
  { label: 'should be able to send Chinese', text: '测试' },
  { label: 'should be able to send Russian', text: 'тестирование' },
  { label: 'should be able to send Arabic', text: 'تجريب' },
  { label: 'should be able to send Hebrew', text: 'בדיקות' },
];

describe('keyboard', function () {
  describe('ascii', function () {
    let driver;
    before(async function () {
      driver = await initDriver(defaultAsciiCaps);

      // sometimes the default ime is not what we are using
      let engines = await driver.availableIMEEngines();
      let selectedEngine = _.first(engines);
      for (let engine of engines) {
        // it seems that the latin ime has `android.inputmethod` in its package name
        if (engine.indexOf('android.inputmethod') !== -1) {
          selectedEngine = engine;
        }
      }
      await driver.activateIMEEngine(selectedEngine);
    });
    after(async function () {
      await driver.quit();
    });

    describe('editing a text field', function () {
      let els;
      beforeEach(async function () {
        els = await retryInterval(5, 1000, async function () {
          const els = await driver.elementsByClassName(EDITTEXT_CLASS);
          els.should.have.length.at.least(1);
          return els;
        });
      });
      for (let test of tests) {
        describe(test.label, function () {
          it('should work with setValue', async function () {
            await runTextEditTest(driver, test.text);
          });
          it('should work with keys', async function () {
            await runTextEditTest(driver, test.text, true);
          });
        });
      }

      it('should be able to clear a password field', async function () {
        // there is currently no way to directly assert anything about the contents
        // of a password field, since there is no way to access the contents
        const password = 'super-duper password';
        let passwordTextField = els[1];
        let passwordOutput = await driver.elementById('io.appium.android.apis:id/edit1Text');
        await passwordTextField.sendKeys(password);
        await waitForText(passwordOutput, password);
        await passwordTextField.clear();
        await waitForText(passwordOutput, '');
      });

      it('should be able to type in length-limited field', async function () {
        if (!process.env.TESTOBJECT_E2E_TESTS) {
          let adb = new ADB();
          if (parseInt(await adb.getApiLevel(), 10) < 24) {
            // below Android 7.0 (API level 24) typing too many characters in a
            // length-limited field will either throw a NullPointerException or
            // crash the app
            return this.skip();
          }
        }
        let el = els[3];
        await el.setImmediateValue('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

        // expect first 11 characters (limit of the field) to be in the field
        let text = await el.text();
        text.should.eql('0123456789a');
      });
    });

    describe('sending a key event', function () {
      before(async function () {
        await driver.startActivity({appPackage: PACKAGE, appActivity: KEYEVENT_ACTIVITY});
        await B.delay(500);
      });

      it('should be able to send combination keyevents', async function () {
        await runCombinationKeyEventTest(driver);
      });
      it('should be able to send keyevents', async function () {
        await runKeyEventTest(driver);
      });
    });
  });

  describe('unicode', function () {
    let adb;
    if (!process.env.TESTOBJECT_E2E_TESTS) {
      adb = new ADB();
    }
    let initialIME;
    let driver;
    before(async function () {
      // save the initial ime so we can make sure it is restored
      if (adb) {
        initialIME = await adb.defaultIME();
        initialIME.should.not.eql('io.appium.android.ime/.UnicodeIME');
      }

      driver = await initDriver(defaultUnicodeCaps);
    });
    after(async function () {
      await driver.quit();

      // make sure the IME has been restored
      if (adb) {
        let ime = await adb.defaultIME();
        ime.should.eql(initialIME);
        ime.should.not.eql('io.appium.android.ime/.UnicodeIME');
      }
    });

    describe('editing a text field', function () {
      for (let testSet of [tests, unicodeTests, languageTests]) {
        for (let test of testSet) {
          describe(test.label, function () {
            it('should work with setValue', async function () {
              await runTextEditTest(driver, test.text);
            });
            it('should work with keys', async function () {
              await runTextEditTest(driver, test.text, true);
            });
          });
        }
      }
    });

    describe('sending a key event', function () {
      before(async function () {
        await driver.startActivity({appPackage: PACKAGE, appActivity: KEYEVENT_ACTIVITY});
      });

      it('should be able to send combination keyevents', async function () {
        await runCombinationKeyEventTest(driver);
      });
      it('should be able to send keyevents', async function () {
        await runKeyEventTest(driver);
      });
    });
  });
});
