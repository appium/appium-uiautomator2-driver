// transpile:main

import yargs from 'yargs';
import { asyncify } from 'asyncbox';
import * as driver from './lib/driver';
import * as server from './lib/server';


const { AndroidUiautomator2Driver } = driver;
const { startServer } = server;

export const DEFAULT_HOST = 'localhost';
export const DEFAULT_PORT = 4884;

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
