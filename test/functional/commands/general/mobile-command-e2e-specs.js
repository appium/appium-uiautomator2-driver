import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';

chai.should();
chai.use(chaiAsPromised);

describe('mobile: shell', function () {
  let driver;
  before(async function () {
    driver = await initDriver(APIDEMOS_CAPS);
  });
  after(async function () {
    await driver.quit();
  });
  it('should call execute command without proxy error, but require relaxed security flag', async function () {
    try {
      await driver.execute('mobile: shell', {command: 'echo', args: ['hello']});
    } catch (e) {
      e.message.should.match(/Original error: Appium server must have relaxed security flag set in order to run any shell commands/);
    }
  });
});
