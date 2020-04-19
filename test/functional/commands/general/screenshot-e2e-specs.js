import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { mjpeg } from 'appium-support';
import { APIDEMOS_CAPS } from '../../desired';
import { initSession, deleteSession } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

const MJPEG_SERVER_PORT = 8589;
const MJPEG_SERVER_URL = `http://localhost:${MJPEG_SERVER_PORT}`;

describe('screenshot - mjpeg server', function () {
  let driver, mjpegServer;

  before(async function () {
    mjpegServer = mjpeg.initMJpegServer(MJPEG_SERVER_PORT);
    const caps = {...APIDEMOS_CAPS, mjpegScreenshotUrl: MJPEG_SERVER_URL};
    driver = await initSession(caps);
  });
  after(async function () {
    await deleteSession();
    mjpegServer.close();
  });
  it('should get the screenshot via an mjpeg server if requested', async function () {
    const img = await driver.takeScreenshot();
    img.indexOf('iVBOR').should.eql(0);
    img.length.should.be.above(400);
  });
});
