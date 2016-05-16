import log from './logger';
import { server as baseServer, routeConfiguringFunction } from 'appium-base-driver';
import AndroidUiautomator2Driver from './driver';


async function startServer (port, host) {
  let d = new AndroidUiautomator2Driver({port, host});
  let router = routeConfiguringFunction(d);
  let server = baseServer(router, port, host);
  log.info(`Android Uiautomator2 server listening on http://${host}:${port}`);
  return await server;
}

export default startServer;
