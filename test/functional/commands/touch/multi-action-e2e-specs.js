import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidUiautomator2Driver from '../../../..';
import sampleApps from 'sample-apps';

chai.should();
chai.use(chaiAsPromised);

let driver;
let defaultCaps = {
  app: sampleApps('ApiDemos-debug'),
  deviceName: 'Android',
  platformName: 'Android',
  appActivity: '.view.SplitTouchView'
};

describe('apidemo - touch - multi-actions', function () {
  before(async () => {
    driver = new AndroidUiautomator2Driver();
    await driver.createSession(defaultCaps);
  });
  after(async () => {
    await driver.deleteSession();
  });
  it('should scroll two different lists', async () => {
    let lists = await driver.findElOrEls('class name', 'android.widget.ListView', true);
    let leftList = lists[0].ELEMENT;
    let rightList = lists[1].ELEMENT;
    let leftGestures = [
      {action: 'press', options: {element: leftList}},
      {action: 'moveTo', options: {element: leftList, x: 10, y: 0}},
      {action: 'moveTo', options: {element: leftList, x: 10, y: -75}},
      {action: 'moveTo', options: {element: leftList, x: 10, y: -150}}
    ];
    let rightGestures = [
      {action: 'press', options: {element: rightList}},
      {action: 'moveTo', options: {element: rightList, x: 10, y: 0}},
      {action: 'moveTo', options: {element: rightList, x: 10, y: -75}},
      {action: 'moveTo', options: {element: rightList, x: 10, y: -150}}
    ];
    await driver.performMultiAction([leftGestures, rightGestures]);
  });
});
