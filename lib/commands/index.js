import findCmds from './find';
import generalCmds from './general';
import touchCmds from './touch';
import elementCmds from './element';
import actionsCmds from './actions';
import viewportCmds from './viewport';
import screenshotCmds from './screenshot';

let commands = {};
Object.assign(
  commands,
  findCmds,
  generalCmds,
  touchCmds,
  actionsCmds,
  elementCmds,
  viewportCmds,
  screenshotCmds,
  // add other command types here
);

export default commands;

