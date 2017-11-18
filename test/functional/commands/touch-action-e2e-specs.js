import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import wd from 'wd';
import { APIDEMOS_CAPS } from '../desired';
import { initDriver } from '../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe('apidemo - touch', function () {
  describe('multi-actions', function () {
    let driver;
    before(async () => {
      driver = await initDriver(Object.assign({}, APIDEMOS_CAPS, {
        appPackage: 'io.appium.android.apis',
        appActivity: '.view.SplitTouchView',
      }));
    });
    after(async () => {
      await driver.quit();
    });

    it('should scroll two different lists', async () => {
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
    before(async () => {
      driver = await initDriver(Object.assign({}, APIDEMOS_CAPS, {
        appPackage: 'io.appium.android.apis',
        appActivity: '.view.List1',
      }));
    });
    after(async () => {
      await driver.quit();
    });

    async function assertElement (driver, present = true) {
      let els = await driver.elementsByXPath("//*[@text='Abertam']");
      els.should.be.an.instanceof(Array);
      els.should.have.length(present ? 1 : 0);
    }

    it('should swipe', async () => {
      await assertElement(driver, true);
      const action = new wd.TouchAction();
      let el = await driver.elementByXPath("//*[@text='Abertam']");
      action.press({element: el})
        .wait(300)
        .moveTo({element: el, x: 0, y: -1500})
        .release();
      await driver.performTouchAction(action);
      await assertElement(driver, false);
    });
  });
});
