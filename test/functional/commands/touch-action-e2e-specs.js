import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import wd from 'wd';
import { APIDEMOS_CAPS } from '../desired';
import { initDriver } from '../helpers/session';
import { isArmEmu } from '../helpers/helpers';


chai.should();
chai.use(chaiAsPromised);

describe('apidemo - touch', function () {

  async function assertElementPresent (driver, present = true, text = 'Abertam') {
    let els = await driver.elementsByXPath(`//*[@text='${text}']`);
    els.should.be.an.instanceof(Array);
    els.should.have.length(present ? 1 : 0);
  }

  describe('multi-actions', function () {
    let driver;
    before(async function () {
      driver = await initDriver(Object.assign({}, APIDEMOS_CAPS, {
        appPackage: 'io.appium.android.apis',
        appActivity: '.view.SplitTouchView',
      }));
    });
    after(async function () {
      await driver.quit();
    });

    it('should scroll two different lists', async function () {
      let [leftEl, rightEl] = await driver.elementsByClassName('android.widget.ListView');

      const leftGesture = new wd.TouchAction()
        .press({element: leftEl})
        .moveTo({element: leftEl, x: 10, y: 0})
        .moveTo({element: leftEl, x: 10, y: -75})
        .moveTo({element: leftEl, x: 10, y: -150});

      const rightGesture = new wd.TouchAction()
        .press({element: rightEl})
        .moveTo({element: rightEl, x: 10, y: 0})
        .moveTo({element: rightEl, x: 10, y: -75})
        .moveTo({element: rightEl, x: 10, y: -150});

      const multiAction = new wd.MultiAction();
      multiAction.add(leftGesture, rightGesture);

      await driver.performMultiAction(multiAction);
    });
  });

  describe('swipe-action', function () {
    let driver;
    before(async function () {
      driver = await initDriver(Object.assign({}, APIDEMOS_CAPS, {
        appPackage: 'io.appium.android.apis',
        appActivity: '.view.List1',
      }));
    });
    after(async function () {
      await driver.quit();
    });

    it('should swipe', async function () {
      await assertElementPresent(driver, true);
      const action = new wd.TouchAction();
      let el = await driver.elementByXPath("//*[@text='Abertam']");
      action.press({element: el})
        .wait(300)
        .moveTo({element: el, x: 0, y: -1500})
        .release();
      await driver.performTouchAction(action);
      await assertElementPresent(driver, false);
    });
  });

  describe('mobile: scrollBackTo', function () {
    let driver;
    before(async function () {
      if (await isArmEmu()) {
        // on slower emus like arm emus, this test fails due to
        // https://github.com/appium/appium/issues/9328, so quarantine until
        // that is fixed
        this.skip();
      }
      driver = await initDriver(Object.assign({}, APIDEMOS_CAPS, {
        appPackage: 'io.appium.android.apis',
        appActivity: '.view.List1',
      }));
    });
    after(async function () {
      if (driver) {
        await driver.quit();
      }
    });

    it('should scroll to an element', async function () {
      const cheeseForScroll = 'Abertam';
      // first find the scrolling container
      let scrollableContainer = await driver.elementByXPath("//*[@scrollable='true']");
      // then find the element we will scroll back to
      let scrollToEl = await driver.elementByAndroidUIAutomator(`new UiSelector().text("${cheeseForScroll}")`);
      // verify the element exists, then use a touchaction to scroll it out of
      // view
      await assertElementPresent(driver, true);
      const action = new wd.TouchAction();
      action.press({element: scrollToEl})
        .wait(300)
        .moveTo({element: scrollToEl, x: 0, y: -1500})
        .release();
      await driver.performTouchAction(action);
      // verify the element no longer exists
      await assertElementPresent(driver, false, cheeseForScroll);
      // finally, use scrollBackTo to intelligently scroll back to a point
      // where the element is visible, and verify the result
      let isFound = await driver.execute("mobile: scrollBackTo", {
        elementId: scrollableContainer.value,
        elementToId: scrollToEl.value,
      });
      isFound.should.be.true;
      await assertElementPresent(driver, true, cheeseForScroll);
    });
  });
});
