import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import ADB from 'appium-adb';
import AndroidUiautomator2Driver from '../../..';

let driver;
let sandbox = sinon.sandbox.create();
chai.should();
chai.use(chaiAsPromised);
let scrollableElementId;

describe('scrollable element', () => {
  driver = new AndroidUiautomator2Driver();
  driver.adb = new ADB();

  it('Try to find scrollable element.', async () => {
    sandbox.stub(driver, 'doFindElementOrEls').returns({id:'elem1-scroll'});
    let params = {multiple: false};
    let element = driver.doFindElementOrEls(params);
    element.should.not.equal(null);
    scrollableElementId = element.id;
    scrollableElementId.should.equal('elem1-scroll');
  });

  let firstElementId;
  it('Try to find first element in scrollable element', () => {
    sandbox.stub(driver, 'getFirstVisible').returns({id:'elem2-first'});
    let element = driver.getFirstVisible(scrollableElementId);
    element.should.not.equal(null);
    element.id.should.equal('elem2-first');
    firstElementId = element.id;
  });

  it('Try to scroll to first element ', () => {
    sandbox.stub(driver, 'scrollToElement').returns(true);
    let isVisible = driver.scrollToElement(firstElementId);
    isVisible.should.equal(true);
  });
});
