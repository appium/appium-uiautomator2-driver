import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import _ from 'lodash';
import sampleApps from 'sample-apps';
import AndroidUiautomator2Driver from '../../..';

chai.should();
chai.use(chaiAsPromised);

const EDITTEXT_CLASS = 'android.widget.EditText';

const PACKAGE = 'io.appium.android.apis';
const TEXTFIELD_ACTIVITY = '.view.TextFields';

let defaultAsciiCaps = {
  app: sampleApps('ApiDemos-debug'),
  deviceName: 'Android',
  platformName: 'Android',
  newCommandTimeout: 90,
  appPackage: PACKAGE,
  appActivity: TEXTFIELD_ACTIVITY
};

let defaultUnicodeCaps = _.defaults({
  unicodeKeyboard: true,
  resetKeyboard: true
}, defaultAsciiCaps);

function deSamsungify (text) {
  // For samsung S5 text is appended with ". Editing."
  return text.replace(". Editing.", "");
}

async function runTextEditTest (driver, testText, keys = false) {
  let el = _.last(await driver.findElOrEls('class name', EDITTEXT_CLASS, true));
  el = el.ELEMENT;
  await driver.clear(el);

  if (keys) {
    await driver.keys([testText]);
  } else {
    await driver.setValue(testText, el);
  }

  let text = await driver.getText(el);
  deSamsungify(text).should.be.equal(testText);

  return el;
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

describe('keyboard', () => {
  describe('ascii', () => {
    let driver;
    before(async () => {
      driver = new AndroidUiautomator2Driver();
      await driver.createSession(defaultAsciiCaps);

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
    after(async () => {
      await driver.deleteSession();
    });


    describe('editing a text field', () => {
      before(async () => {
        await driver.startActivity(PACKAGE, TEXTFIELD_ACTIVITY);
      });

      for (let test of tests) {
        describe(test.label, () => {
          it('should work with setValue', async () => {
            await runTextEditTest(driver, test.text);
          });
          it('should work with keys', async () => {
            await runTextEditTest(driver, test.text, true);
          });
        });
      }

      it('should be able to clear a password field', async () => {
        // there is currently no way to assert anything about the contents
        // of a password field, since there is no way to access the contents
        // but this should, at the very least, not fail
        let els = await driver.findElOrEls('class name', EDITTEXT_CLASS, true);
        let el = els[1].ELEMENT;

        await driver.setValue('super-duper password', el);
        await driver.clear(el);
      });
    });

    describe('unicode', () => {
      let driver;
      before(async () => {
        driver = new AndroidUiautomator2Driver();
        await driver.createSession(defaultUnicodeCaps);
      });
      after(async () => {
        await driver.deleteSession();
      });

      describe('editing a text field', () => {
        before(async () => {
          await driver.startActivity(PACKAGE, TEXTFIELD_ACTIVITY);
        });

        for (let testSet of [tests, unicodeTests, languageTests]) {
          for (let test of testSet) {
            describe(test.label, () => {
              it('should work with setValue', async () => {
                await runTextEditTest(driver, test.text);
              });
              it('should work with keys', async () => {
                await runTextEditTest(driver, test.text, true);
              });
            });
          }
        }
      });
    });
  });
});
