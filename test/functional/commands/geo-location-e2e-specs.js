import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { retryInterval } from 'asyncbox';
import { GPS_DEMO_CAPS } from '../desired';
import { initDriver } from '../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe("geo-location", function () {
  let driver;
  before(async function () {
    driver = await initDriver(GPS_DEMO_CAPS);
  });
  after(async function () {
    await driver.quit();
  });

  it('should set geo location', async function () {
    let getText = async () => {
      const textViews = await driver.elementsByClassName('android.widget.TextView');
      return await textViews[1].text();
    };

    let latitude = '27.17';
    let longitude = '78.04';

    let text = await getText();
    text.should.not.include(`Latitude: ${latitude}`);
    text.should.not.include(`Longitude: ${longitude}`);

    await driver.setGeoLocation(latitude, longitude);

    // wait for the text to change
    await retryInterval(6, 1000, async () => {
      if (await getText() === 'GPS Tutorial') {
        throw new Error('Location not set yet. Retry.');
      }
    });

    text = await getText();
    text.should.include(`Latitude: ${latitude}`);
    text.should.include(`Longitude: ${longitude}`);
  });
});
