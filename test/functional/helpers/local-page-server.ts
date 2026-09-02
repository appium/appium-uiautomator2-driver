import fs from 'node:fs/promises';
import http from 'node:http';

import type {ADB} from 'appium-adb';

import {getFreePort} from './ports.js';

export type LocalPageServer = {
  url: string;
  close: () => Promise<void>;
};

/**
 * Serves a single static HTML file on 127.0.0.1 and makes it reachable from the
 * Android device under test at the same port via `adb reverse`, so tests do not
 * depend on an external web page being online.
 */
export async function startLocalPageServer(adb: ADB, filePath: string): Promise<LocalPageServer> {
  const content = await fs.readFile(filePath);
  const port = await getFreePort();

  const server = http.createServer((_req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.end(content);
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve());
  });

  await adb.reversePort(port, port);

  return {
    url: `http://127.0.0.1:${port}/`,
    close: async () => {
      try {
        await adb.removePortReverse(port);
      } catch {
        // ignore
      }
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    },
  };
}
