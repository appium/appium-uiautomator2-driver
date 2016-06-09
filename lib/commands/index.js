
import generalCmds from './general';
import touchCmds from './touch';
import elementCmds from './element';

let commands = {};
Object.assign(
  commands,
  generalCmds,
  touchCmds,
  elementCmds
  // add other command types here
);

export default commands;
