import type {Browser} from 'webdriverio';
import B from 'bluebird';
import {retryInterval} from 'asyncbox';
import {APIDEMOS_CAPS} from '../../desired';
import {initSession, deleteSession} from '../../helpers/session';
import {ADB} from 'appium-adb';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

const BUTTON_CLASS = 'android.widget.Button';
const EDITTEXT_CLASS = 'android.widget.EditText';

const PACKAGE = 'io.appium.android.apis';
const TEXTFIELD_ACTIVITY = '.view.TextFields';
const KEYEVENT_ACTIVITY = '.text.KeyEventText';

const defaultAsciiCaps = Object.assign({}, APIDEMOS_CAPS, {
  newCommandTimeout: 90,
  appPackage: PACKAGE,
  appActivity: TEXTFIELD_ACTIVITY,
});

const defaultUnicodeCaps = defaultAsciiCaps;

async function ensureUnlocked(driver: Browser): Promise<void> {
  // on Travis the device is sometimes not unlocked
  await retryInterval(10, 1000, async function () {
    if (!await driver.isLocked()) {
      return;
    }
    console.log(`\n\nDevice locked. Attempting to unlock`); // eslint-disable-line
    await driver.unlock();
    // trigger another iteration
    throw new Error(`The device is locked.`);
  });
}

function deSamsungify(text: string): string {
  // For samsung S5 text is appended with ". Editing."
  return text.replace('. Editing.', '');
}

async function getElement(driver: Browser, className: string): Promise<Awaited<ReturnType<Browser['$']>>> {
  const result = await retryInterval(10, 1000, async () => {
    const el = await driver.$(className);
    if (!el) {
      throw new Error('Element not found');
    }
    return el;
  });
  if (!result) {
    throw new Error('Element not found after retries');
  }
  return result;
}

async function waitForText(element: any, expectedText: string): Promise<void> {
  const result = await retryInterval(10, 1000, async () => {
    const text = await element.getText();
    if (text !== expectedText) {
      throw new Error(`Unexpected element text. Actual: "${text}". Expected: "${expectedText}"`);
    }
  });
  if (result === null) {
    throw new Error('Text did not match after retries');
  }
}

async function runTextEditTest(driver: Browser, testText: string, keys = false): Promise<Awaited<ReturnType<Browser['$']>>> {
  const el = await getElement(driver, EDITTEXT_CLASS);
  await el.clearValue();
  await el.click();

  if (keys) {
    await driver.sendKeys([testText]);
  } else {
    // await el.sendKeys(testText);
    const elementId = await el.elementId;
    await driver.elementSendKeys(elementId, testText);
  }

  await retryInterval(10, 1000, async () => {
    const text = await el.getText();
    const textStr = text as string;
    expect(deSamsungify(textStr)).to.be.equal(testText);
  });

  return el;
}

/*
 * The key event page needs to be cleared between runs, or else we get false
 * positives from previously run tests. The page has a single button that
 * removes all text from within the main TextView.
 */
async function clearKeyEvents(driver: Browser): Promise<void> {
  const el = await getElement(driver, BUTTON_CLASS);
  await el.click();

  // wait a moment for the clearing to occur, lest we too quickly try to enter more text
  await B.delay(500);
}

async function keyEventTest(driver: Browser, keyCode: number, metaState: number | undefined, expectedTextArray: string[]): Promise<void> {
  const runTest = async function () {
    await driver.pressKeyCode(keyCode, metaState);
    const el = driver.$('id=io.appium.android.apis:id/text');
    return await el.getText();
  };

  await clearKeyEvents(driver);

  let text = await runTest();
  if (!text) {
    // the test is flakey... try again
    text = await runTest();
  }
  for (const expectedText of expectedTextArray) {
    expect(text).to.include(expectedText);
  }
}

async function runCombinationKeyEventTest(driver: Browser): Promise<void> {
  await keyEventTest(driver, 29, 193, ['keyCode=KEYCODE_A', 'metaState=META_SHIFT_ON']);
}

async function runKeyEventTest(driver: Browser): Promise<void> {
  await keyEventTest(driver, 82, undefined, ['[keycode=82]', 'keyCode=KEYCODE_MENU']);
}

const tests = [
  {label: 'editing a text field', text: 'Life, the Universe and Everything.'},
  {label: 'sending \'&-\'', text: '&-'},
  {label: 'sending \'&\' and \'-\' in other text', text: 'In the mid-1990s he ate fish & chips as mayor-elect.'},
  {label: 'sending \'-\' in text', text: 'Super-test.'},
  {label: 'sending numbers', text: '0123456789'},
];

const unicodeTests = [
  {label: 'should be able to send \'-\' in unicode text', text: 'परीक्षा-परीक्षण'},
  {label: 'should be able to send \'&\' in text', text: 'Fish & chips'},
  {label: 'should be able to send \'&\' in unicode text', text: 'Mīna & chips'},
  {label: 'should be able to send roman characters with diacritics', text: 'Áé Œ ù ḍ'},
  {label: 'should be able to send a \'u\' with an umlaut', text: 'ü'},
];

const languageTests = [
  {label: 'should be able to send Tamil', text: 'சோதனை'},
  {label: 'should be able to send Gujarati', text: 'પરીક્ષણ'},
  {label: 'should be able to send Chinese', text: '测试'},
  {label: 'should be able to send Russian', text: 'тестирование'},
  {label: 'should be able to send Arabic', text: 'تجريب'},
  {label: 'should be able to send Hebrew', text: 'בדיקות'},
];

describe('keyboard', function () {
  describe('ascii', function () {
    let driver: Browser;
    before(async function () {
      driver = await initSession(defaultAsciiCaps);

      if (!process.env.CI) {
        // sometimes the default ime is not what we are using
        const engines = await driver.availableIMEEngines();
        let selectedEngine = engines?.[0];
        for (const engine of engines || []) {
          // it seems that the latin ime has `android.inputmethod` in its package name
          if (engine.indexOf('android.inputmethod') !== -1) {
            selectedEngine = engine;
          }
        }
        if (selectedEngine) {
          await (driver as any).activateIME(selectedEngine);
        }
      }

      await driver.startActivity(defaultAsciiCaps.alwaysMatch?.['appium:appPackage'] as string, defaultAsciiCaps.alwaysMatch?.['appium:appActivity'] as string);
      try {
        const okBtn = await driver.$('id=android:id/button1');
        console.log('\n\nFound alert. Trying to dismiss'); // eslint-disable-line
        await okBtn.click();
        await ensureUnlocked(driver);
        await driver.startActivity(defaultAsciiCaps.alwaysMatch?.['appium:appPackage'] as string, defaultAsciiCaps.alwaysMatch?.['appium:appActivity'] as string);
      } catch {
        // ignore
      }
    });
    after(async function () {
      await deleteSession();
    });

    beforeEach(async function () {
      await ensureUnlocked(driver);
    });

    describe('editing a text field', function () {
      let els: Awaited<ReturnType<Browser['$$']>>;
      beforeEach(async function () {
        await driver.startActivity(defaultAsciiCaps.alwaysMatch?.['appium:appPackage'] as string, defaultAsciiCaps.alwaysMatch?.['appium:appActivity'] as string);
        const elsResult = await retryInterval(10, 1000, async function () {
          const elsPromise = driver.$$(EDITTEXT_CLASS);
          const elsArray = await elsPromise;
          const length = await elsArray.length;
          expect(length).to.be.at.least(1);
          return elsArray;
        });
        if (!elsResult) {
          throw new Error('Elements not found after retries');
        }
        els = elsResult;
      });

      for (const test of tests) {
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
        // this test is flakey
        this.retries(4);

        // there is currently no way to directly assert anything about the contents
        // of a password field, since there is no way to access the contents
        const password = 'super-duper password';
        const passwordTextField = els[1];
        const passwordOutput = await driver.$('id=io.appium.android.apis:id/edit1Text');
        const elementId = await passwordTextField.elementId;
        await driver.elementSendKeys(elementId, password);
        await waitForText(passwordOutput, password);
        await passwordTextField.clearValue();
        await waitForText(passwordOutput, '');
      });

      it('should be able to type in length-limited field', async function () {
        const charactersToType = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const adb = new ADB();
        const apiLevelStr = await adb.getApiLevel();
        const apiLevel = parseInt(String(apiLevelStr), 10);
        if (apiLevel < 24 || (process.env.CI && apiLevel < 28)) {
          // below Android 7.0 (API level 24) typing too many characters in a
          // length-limited field will either throw a NullPointerException or
          // crash the app
          // also can be flakey in CI for SDK < 28
          return this.skip();
        }
        const el = els[3];
        await el.setValue(charactersToType);

        // expect first 11 characters (limit of the field) to be in the field
        const text = await el.getText();
        expect(text).to.eql('0123456789a');
      });
    });

    describe('sending a key event', function () {
      before(async function () {
        await driver.startActivity(PACKAGE, KEYEVENT_ACTIVITY);
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
    const adb = new ADB();
    let initialIME: string | null | undefined;
    let driver: Browser;
    before(async function () {
      // save the initial ime so we can make sure it is restored
      if (adb) {
        initialIME = await adb.defaultIME();
        expect(initialIME).to.not.eql('io.appium.settings/.UnicodeIME');
      }

      driver = await initSession(defaultUnicodeCaps);
    });
    after(async function () {
      await deleteSession();

      // make sure the IME has been restored
      if (adb) {
        const ime = await adb.defaultIME();
        expect(ime).to.eql(initialIME);
        expect(ime).to.not.eql('io.appium.settings/.UnicodeIME');
      }
    });

    beforeEach(async function () {
      await ensureUnlocked(driver);
    });

    describe('editing a text field', function () {
      beforeEach(async function () {
        await driver.startActivity(defaultUnicodeCaps.alwaysMatch?.['appium:appPackage'] as string, defaultUnicodeCaps.alwaysMatch?.['appium:appActivity'] as string);
      });

      for (const testSet of [tests, unicodeTests, languageTests]) {
        for (const test of testSet) {
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
        await driver.startActivity(PACKAGE, KEYEVENT_ACTIVITY);
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

