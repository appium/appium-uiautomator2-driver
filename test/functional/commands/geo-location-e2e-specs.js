import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { retryInterval } from 'asyncbox';
import { GPS_DEMO_CAPS } from '../desired';
import { initSession, deleteSession } from '../helpers/session';
import B from 'bluebird';


chai.should();
chai.use(chaiAsPromised);

describe('geo-location -', function () {
  let driver;
  beforeEach(async function () {
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
    const continueButtons = await driver.elementsById('com.android.permissioncontroller:id/continue_button');
    if (continueButtons.length > 0) {
      await continueButtons[0].click();
    }

    // Get rid of the modal window saying that the app was built for an old version
    await B.delay(1000);
    const okButtons = await driver.elementsById('android:id/button1');
    if (okButtons.length > 0) {
      await okButtons[0].click();
    }

    // Get the text in the app that tells us the latitude and logitude
    const getText = async function () {
      return await retryInterval(10, 1000, async function () {
        const textViews = await driver.elementsByClassName('android.widget.TextView');
        textViews.length.should.be.at.least(2);
        return await textViews[1].text();
      });
    };

    const latitude = getRandomInt(-90, 90);
    const longitude = getRandomInt(-180, 180);

    let text = await getText();
    text.should.not.include(`Latitude: ${latitude}`);
    text.should.not.include(`Longitude: ${longitude}`);

    await driver.setGeoLocation(latitude, longitude);

    // wait for the text to change
    await retryInterval(10, 1000, async () => {
      if (await getText() === 'GPS Tutorial') {
        throw new Error('Location not set yet. Retry.');
      }
    });

    await retryInterval(30, 1000, async function () {
      text = await getText();
      text.should.include(`Latitude: ${latitude}`);
      text.should.include(`Longitude: ${longitude}`);
    });
  });
});
