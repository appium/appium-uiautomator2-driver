import log from './logger';
import { server as baseServer, routeConfiguringFunction as makeRouter } from 'appium-base-driver';
import AndroidUiautomator2Driver from './driver';


async function startServer (port = 4884, host = 'localhost') {
  let d = new AndroidUiautomator2Driver({port, host});
  let routeConfiguringFunction = makeRouter(d);
  let server = baseServer({routeConfiguringFunction, port, hostname: host});
  log.info(`Android Uiautomator2 server listening on http://${host}:${port}`);
  d.server = server;
  return await server;
}

export { startServer };
export default startServer;
