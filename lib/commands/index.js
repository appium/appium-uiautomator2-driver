import alertCmds from './alert';
import findCmds from './find';
import generalCmds from './general';
import touchCmds from './touch';
import elementCmds from './element';
import actionsCmds from './actions';
import viewportCmds from './viewport';
import screenshotCmds from './screenshot';
import batteryCmds from './battery';
import gesturesCmds from './gestures';
import appsCmds from './apps';

let commands = {};
Object.assign(
  commands,
  alertCmds,
  findCmds,
  generalCmds,
  touchCmds,
  actionsCmds,
  elementCmds,
  viewportCmds,
  screenshotCmds,
  batteryCmds,
  gesturesCmds,
  appsCmds
  // add other command types here
);

export default commands;

