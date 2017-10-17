// transpile:main

import yargs from 'yargs';
import { asyncify } from 'asyncbox';
import AndroidUiautomator2Driver from './lib/driver';
import startServer from './lib/server';


export const DEFAULT_HOST = "localhost";
export const DEFAULT_PORT = process.env.TESTOBJECT_E2E_TESTS ? 4723 : 4884;

async function main () {
  let port = yargs.argv.port || DEFAULT_PORT;
  let host = yargs.argv.host || yargs.argv.address || DEFAULT_HOST;
  return await startServer(port, host);
}

if (require.main === module) {
  asyncify(main);
}

export { AndroidUiautomator2Driver, startServer };
export default AndroidUiautomator2Driver;

