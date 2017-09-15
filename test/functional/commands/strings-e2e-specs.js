import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../desired';
import { initDriver } from '../helpers/session';
import _ from 'lodash';


chai.should();
chai.use(chaiAsPromised);

describe('strings', function () {
  let driver;

  describe('specific language', function () {
    before(async () => {
      driver = await initDriver(APIDEMOS_CAPS);
    });
    after(async function () {
      await driver.deleteSession();
    });

    it('should return app strings', async function () {
      let strings = await driver.getStrings('en');
      strings.hello_world.should.equal('<b>Hello, <i>World!</i></b>');
    });

    it('should return app strings for different language', async function () {
      let strings = await driver.getStrings('fr');
      strings.hello_world.should.equal('<b>Bonjour, <i>Monde!</i></b>');
    });
  });

  describe('device language', function () {
    afterEach(async function () {
      await driver.deleteSession();
    });

    it('should return app strings with default locale/language', async function () {
      driver = await initDriver(APIDEMOS_CAPS);

      let strings = await driver.getStrings();
      strings.hello_world.should.equal('<b>Hello, <i>World!</i></b>');
    });
    it('should return app strings when language/locale set', async function () {
      driver = await initDriver(_.defaults({
        language: 'fr',
        locale: 'CA',
      }, APIDEMOS_CAPS));

      let strings = await driver.getStrings();
      strings.hello_world.should.equal('<b>Bonjour, <i>Monde!</i></b>');
    });
  });
});
