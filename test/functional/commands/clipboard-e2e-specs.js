import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { initDriver } from '../helpers/session';
import { APIDEMOS_CAPS } from '../desired';


chai.should();
chai.use(chaiAsPromised);

describe('clipboard -', function () {
  let driver;
  before(async function () {
    driver = await initDriver(APIDEMOS_CAPS);
  });
  after(async function () {
    await driver.quit();
  });

  it('should set and get clipboard content', async function () {
    const text = 'Appium';
    await driver.execute('mobile: setClipboard', {content: text});
    (await driver.execute('mobile: getClipboard')).content.should.eql(text);
  });
});
