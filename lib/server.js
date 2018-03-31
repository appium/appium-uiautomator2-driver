import log from './logger';
import { server as baseServer, routeConfiguringFunction } from 'appium-base-driver';
import AndroidUiautomator2Driver from './driver';


async function startServer (port=4884, host='localhost') {
  let d = new AndroidUiautomator2Driver({port, host});
  let router = routeConfiguringFunction(d);
  let server = baseServer(router, port, host);
  log.info(`Android Uiautomator2 server listening on http://${host}:${port}`);
  d.server = server;
  return await server;
}

export default startServer;