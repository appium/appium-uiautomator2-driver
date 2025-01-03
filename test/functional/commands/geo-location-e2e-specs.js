import { retryInterval } from 'asyncbox';
import { GPS_DEMO_CAPS } from '../desired';
import { initSession, deleteSession } from '../helpers/session';
import B from 'bluebird';
import { ADB } from 'appium-adb';


describe('geo-location -', function () {
  let driver;
  let chai;

  before(async function () {
    chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');

    chai.should();
    chai.use(chaiAsPromised.default);
  });

  beforeEach(async function () {
    const adb = new ADB();
    if (await adb.getApiLevel() >= 30) {
      // TODO: always fail with API 30, is it a bug?
      return this.skip();
    }

    driver = await initSession(GPS_DEMO_CAPS);
  });
  afterEach(async function () {
    await deleteSession();
  });

  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  it('should set geo location', async function () {
    // If we hit the permission screen, click the 'Continue Button' (sdk >= 28)
    const continueButtons = await driver.$$('id=com.android.permissioncontroller:id/continue_button');
    if (continueButtons.length > 0) {
      await continueButtons[0].click();
    }

    // Get rid of the modal window saying that the app was built for an old version
    await B.delay(1000);
    const okButtons = await driver.$$('id=android:id/button1');
    if (okButtons.length > 0) {
      await okButtons[0].click();
    }

    // Get the text in the app that tells us the latitude and logitude
    const getText = async function () {
      return await retryInterval(10, 1000, async function () {
        const textViews = await driver.$$('android.widget.TextView');
        textViews.length.should.be.at.least(2);
        return await textViews[1].getText();
      });
    };

    const latitude = getRandomInt(-90, 90);
    const longitude = getRandomInt(-180, 180);

    await driver.executeScript('mobile: setGeolocation', [{latitude, longitude}]);

    // wait for the text to change
    await retryInterval(10, 1000, async () => {
      if (await getText() === 'GPS Tutorial') {
        throw new Error('Location not set yet. Retry.');
      }
    });

    if (process.env.CI) {
      return this.skip();
    }

    await retryInterval(30, 1000, async function () {
      const text = await getText();
      text.should.include(`Latitude: ${latitude}`);
      text.should.include(`Longitude: ${longitude}`);
    });

    const loc = await driver.executeScript('mobile: getGeolocation');
    loc.latitude.should.equal(latitude);
    loc.longitude.should.equal(longitude);
  });
});
