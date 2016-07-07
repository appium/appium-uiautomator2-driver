import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidUiautomator2Driver from '../../..';
import ADB from 'appium-adb';


chai.should();
chai.use(chaiAsPromised);

describe('Touch', () => {
  let adb = new ADB();
  let driver = new AndroidUiautomator2Driver();
  driver.adb = adb;

  describe('#parseTouch', () => {
    describe('given a touch sequence with absolute coordinates', () => {
      it('should use offsets for moveTo', async () => {
        // let driver = new AndroidDriver({foo: 'bar'});
        let actions = [
          {action: 'press', options: {x: 100, y: 101}},
          {action: 'moveTo', options: {x: 50, y: 51}},
          {action: 'wait', options: {ms: 5000}},
          {action: 'moveTo', options: {x: -40, y: -41}},
          {action: 'release', options: {}}
        ];
        let touchStates = await driver.parseTouch(actions, false);
        touchStates.length.should.equal(5);
        let parsedActions = [
          {action: 'press', x: 100, y: 101},
          {action: 'moveTo', x: 150, y: 152},
          {action: 'wait', x: 150, y: 152},
          {action: 'moveTo', x: 110, y: 111},
          {action: 'release'}
        ];
        let index = 0;
        for (let state of touchStates) {
          state.action.should.equal(parsedActions[index].action);
          if (actions[index].action !== 'release') {
            state.options.x.should.equal(parsedActions[index].x);
            state.options.y.should.equal(parsedActions[index].y);
          }
          index++;
        }
      });
    });
  });
});
