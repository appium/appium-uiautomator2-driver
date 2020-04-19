import logger from '../logger';

let commands = {};

commands.getScreenshot = async function () {
  if (this.mjpegStream) {
    const data = await this.mjpegStream.lastChunkPNGBase64();
    if (data) {
      return data;
    }
    logger.warn('Tried to get screenshot from active MJPEG stream, but there ' +
                'was no data yet. Falling back to regular screenshot methods.');
  }
  return await this.uiautomator2.jwproxy.command('/screenshot', 'GET');
};

export default commands;
