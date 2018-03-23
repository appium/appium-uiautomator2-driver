import findCmds from './find';
import generalCmds from './general';
import touchCmds from './touch';
import elementCmds from './element';
import actionsCmds from './actions';
import networkCmds from './network';
import viewportCmds from './viewport';
import screenshotCmds from './screenshot';
import clipboardCmds from './clipboard';

let commands = {};
Object.assign(
  commands,
  findCmds,
  generalCmds,
  touchCmds,
  actionsCmds,
  elementCmds,
  networkCmds,
  viewportCmds,
  screenshotCmds,
  clipboardCmds,
  // add other command types here
);

export default commands;

