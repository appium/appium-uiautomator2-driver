// transpile:main

import { asyncify } from 'asyncbox';
import * as driver from './lib/driver';
import * as server from './lib/server';


const { AndroidUiautomator2Driver } = driver;
const { startServer } = server;

export const DEFAULT_HOST = 'localhost';
export const DEFAULT_PORT = 4884;

async function main () {
  const getArgValue = (argName) => {
    const argIndex = process.argv.indexOf(argName);
    return argIndex > 0 ? process.argv[argIndex + 1] : null;
  };
  const port = parseInt(getArgValue('--port'), 10) || DEFAULT_PORT;
  const host = getArgValue('--host') || DEFAULT_HOST;
  return await startServer(port, host);
}

if (require.main === module) {
  asyncify(main);
}

export { AndroidUiautomator2Driver, startServer };
export default AndroidUiautomator2Driver;
