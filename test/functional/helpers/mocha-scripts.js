/**
 * This script needs to be run before other e2e mocha scripts
 *
 * This script starts the server or if it's TestObject, runs the tests on TO server
 */
import { startServer, DEFAULT_PORT } from '../../..';


if (!process.env.CLOUD) {
  let server;
  before(async function () {
    server = await startServer(DEFAULT_PORT, 'localhost');
  });
  after(async function () {
    if (server) {
      await server.close();
    }
  });
  after(async function () {
    try {
      await server.close();
    } catch (ign) {}
  });
}
