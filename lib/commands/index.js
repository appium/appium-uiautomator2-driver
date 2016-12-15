import findCmds from './find';
import generalCmds from './general';
import touchCmds from './touch';
import elementCmds from './element';
import actionsCmds from './actions';
import networkCmds from './network';

let commands = {};
Object.assign(
  commands,
  findCmds,
  generalCmds,
  touchCmds,
  actionsCmds,
  elementCmds,
  networkCmds
  // add other command types here
);

export default commands;

