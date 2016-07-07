import findCmds from './find';
import generalCmds from './general';
import touchCmds from './touch';
import elementCmds from './element';

let commands = {};
Object.assign(
  commands,
  findCmds,
  generalCmds,
  touchCmds,
  elementCmds
  // add other command types here
);

export default commands;
