import findCmds from './find';
import generalCmds from './general';
import touchCmds from './touch';
import elementCmds from './element';
import actionsCmds from './actions';
import networkCmds from './network';
import viewportCmds from './viewport';

let commands = {};
Object.assign(
  commands,
  findCmds,
  generalCmds,
  touchCmds,
  actionsCmds,
  elementCmds,
  networkCmds,
  viewportCmds
  // add other command types here
);

export default commands;

