import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidUiautomator2Driver from '../../../..';
import { APIDEMOS_CAPS } from '../../desired';


chai.should();
chai.use(chaiAsPromised);

describe('apidemo - touch - multi-actions', function () {
  let driver;
  before(async () => {
    driver = new AndroidUiautomator2Driver();
    await driver.createSession(Object.assign({}, APIDEMOS_CAPS, {appActivity: '.view.SplitTouchView'}));
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
