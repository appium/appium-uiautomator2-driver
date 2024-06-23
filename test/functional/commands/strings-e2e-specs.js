import { APIDEMOS_CAPS, amendCapabilities } from '../desired';
import { initSession, deleteSession } from '../helpers/session';


describe('strings', function () {
  let driver;
  let chai;

  before(async function () {
    chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');

    chai.should();
    chai.use(chaiAsPromised.default);
  });

  describe('specific language', function () {
    before(async function () {
      driver = await initSession(APIDEMOS_CAPS);
    });
    after(async function () {
      await deleteSession();
    });

    it('should return app strings', async function () {
      let strings = await driver.getStrings('en');
      strings.hello_world.should.equal('Hello, World!');
    });

    it('should return app strings for different language', async function () {
      let strings = await driver.getStrings('fr');
      strings.hello_world.should.equal('Bonjour, Monde!');
    });
  });

  describe('device language', function () {
    afterEach(async function () {
      await deleteSession();
    });

    it('should return app strings with default locale/language', async function () {
      const caps = amendCapabilities(APIDEMOS_CAPS, {
        'appium:language': 'en',
        'appium:locale': 'US',
      });
      driver = await initSession(APIDEMOS_CAPS, caps);

      let strings = await driver.getStrings();
      strings.hello_world.should.equal('Hello, World!');
    });
  });
});
